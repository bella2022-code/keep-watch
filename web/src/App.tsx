import { useEffect, useRef, useState } from 'react';
import {
  setupPixelCanvas,
  resizeCanvas,
  getAutoScale,
  NATIVE_WIDTH,
  NATIVE_HEIGHT,
} from './core/canvas';
import { drawMouseCage, drawWheel, drawBowl } from './scenes/MouseCage';
import {
  drawMouse,
  drawMouseWalking,
  drawMouseWaving,
  drawHalo,
  type MouseState,
} from './characters/Mouse';
import {
  drawCard,
  drawCompletionCard,
  drawFocusModeClock,
  drawModeToggle,
  getCardRect,
  getFoldCornerRect,
  getPomodoroZones,
  getModeToggleRects,
} from './characters/Card';
import { drawBubble } from './characters/Bubble';
import { drawPixelText } from './core/pixelFont';
import { tickCompanions, drawCompanions, isWheelInUse } from './characters/MouseCompanion';
import { useTimerStore } from './store/timerStore';
import { useHintsStore } from './store/hintsStore';
import { useUserStateStore, formatHM, type SceneName } from './store/userStateStore';
import { useSettingsStore } from './store/settingsStore';
import { pickMouseMessage, type CardMessage } from './store/messages';
import {
  COMPLETION_TOTAL_MS,
  getCompletionPhase,
  getMouseX,
  getMouseWalkFrame,
} from './core/completionSequence';
import { REVEAL_TOTAL_MS, getRevealPhase } from './core/revealSequence';
import {
  drawFishTank,
  drawFishTankSilhouette,
  drawFishTankRevealFill,
  drawFishCompanions,
} from './scenes/FishTank';
import {
  drawGoldfishSwimming,
  drawGoldfishIdle,
  drawGoldfishFacingCamera,
} from './characters/Goldfish';
import {
  drawAstronautSpace,
  drawAstronautSpaceSilhouette,
  drawAstronautSpaceRevealFill,
  drawTardigrade,
} from './scenes/AstronautSpace';
import {
  drawAstronautDrifting,
  drawAstronautFacingCamera,
} from './characters/Astronaut';
import {
  drawOfficerRoom,
  drawOfficerRoomSilhouette,
  drawOfficerRoomRevealFill,
} from './scenes/OfficerRoom';
import {
  drawOfficerIdle,
  drawOfficerWalking,
  drawOfficerFacingCamera,
  drawOfficerSalute,
} from './characters/Officer';
import { drawRainyPond } from './scenes/RainyPond';
import { drawFrogIdle } from './characters/Frog';
import { playCompletionSound, playClack } from './core/sound';
import { applyTint, resolveTint } from './core/tint';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(performance.now());
  const rafRef = useRef<number>(0);
  const manualScaleRef = useRef<number>(0);
  const [scaleToast, setScaleToast] = useState<{ value: number; until: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [devTrayOpen, setDevTrayOpen] = useState(false);

  // Reactive subscriptions for the stats overlay
  const todaySec = useUserStateStore((s) => s.today.seconds);
  const totalSec = useUserStateStore((s) => s.total_focus_seconds);
  const totalDays = useUserStateStore((s) => s.total_focus_days);

  // Reactive timer phase + pause state (for pause UI)
  const phaseSub = useTimerStore((s) => s.phase);
  const pausedAtSub = useTimerStore((s) => s.pausedAt);
  const isPaused = pausedAtSub > 0;
  const currentSceneSel = useUserStateStore((s) => s.currentScene);
  const unlocks = useUserStateStore((s) => s.unlocks);
  const volume = useSettingsStore((s) => s.volume);
  const muted = useSettingsStore((s) => s.muted);
  const theme = useSettingsStore((s) => s.theme);

  // Pause / resume timer when sidebar opens / closes during focus
  useEffect(() => {
    if (sidebarOpen) {
      useTimerStore.getState().pause();
    } else {
      useTimerStore.getState().resume();
    }
  }, [sidebarOpen]);

  // Close sidebar on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sidebarOpen]);

  const mouseStateRef = useRef<MouseState>({
    x: Math.floor(NATIVE_WIDTH / 2),
    y: 232,
  });
  const cardStateRef = useRef({
    centerX: Math.floor(NATIVE_WIDTH / 2),
    centerY: 232 - 50,
  });

  // Completion sequence state
  const completionDirRef = useRef<1 | -1>(1);
  const completionMessageRef = useRef<CardMessage | null>(null);
  const completionSoundPlayedRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { ctx } = setupPixelCanvas(canvas);
    const applyScale = () => resizeCanvas(canvas, manualScaleRef.current || undefined);
    let currentScale = applyScale();

    const showScaleToast = (s: number) => {
      setScaleToast({ value: s, until: performance.now() + 1500 });
    };

    const onResize = () => {
      currentScale = applyScale();
    };
    window.addEventListener('resize', onResize);

    function eventToCanvas(e: { clientX: number; clientY: number }) {
      const rect = canvas!.getBoundingClientRect();
      return {
        cx: (e.clientX - rect.left) / currentScale,
        cy: (e.clientY - rect.top) / currentScale,
      };
    }

    function hitCard(cx: number, cy: number) {
      const { x, y, w, h } = getCardRect(cardStateRef.current);
      return cx >= x - 4 && cx <= x + w + 4 && cy >= y - 4 && cy <= y + h + 4;
    }

    function hitFoldCorner(cx: number, cy: number) {
      const r = getFoldCornerRect(cardStateRef.current);
      // Generous hit pad of 3px around the 7×7 corner
      return (
        cx >= r.x - 3 &&
        cx <= r.x + r.w + 3 &&
        cy >= r.y - 3 &&
        cy <= r.y + r.h + 3
      );
    }

    /** Returns 'timer' / 'pomo' / null based on which mode toggle was hit. */
    function hitModeToggle(cx: number, cy: number): 'timer' | 'pomo' | null {
      const r = getModeToggleRects(cardStateRef.current);
      const inside = (zone: { x: number; y: number; w: number; h: number }) =>
        cx >= zone.x - 3 && cx <= zone.x + zone.w + 3 &&
        cy >= zone.y - 3 && cy <= zone.y + zone.h + 3;
      if (inside(r.timer)) return 'timer';
      if (inside(r.pomo)) return 'pomo';
      return null;
    }

    /** Which Pomodoro zone is the point in? Returns null if outside the card. */
    function hitPomodoroZone(
      cx: number,
      cy: number
    ): 'cycles' | 'work' | 'rest' | null {
      const z = getPomodoroZones(cardStateRef.current);
      if (cx >= z.cycles.x && cx < z.cycles.x + z.cycles.w) {
        if (cy >= z.cycles.y && cy < z.cycles.y + z.cycles.h) return 'cycles';
        if (cy >= z.work.y && cy < z.work.y + z.work.h) {
          if (cx < z.rest.x) return 'work';
          return 'rest';
        }
      }
      return null;
    }

    function hitMouse(cx: number, cy: number) {
      const m = mouseStateRef.current;
      return cx >= m.x - 18 && cx <= m.x + 18 && cy >= m.y - 28 && cy <= m.y + 4;
    }

    const onWheel = (e: WheelEvent) => {
      const { cx, cy } = eventToCanvas(e);
      if (!hitCard(cx, cy)) return;
      e.preventDefault();
      const direction = e.deltaY < 0 ? 1 : -1;
      // In Pomodoro mode, scrolling on a specific zone switches focus first,
      // so the user's scroll always adjusts what they're aiming at.
      const ts = useTimerStore.getState();
      if (ts.mode === 'pomodoro') {
        const zone = hitPomodoroZone(cx, cy);
        if (zone) ts.setPomodoroFocus(zone);
      }
      ts.adjustMinutes(direction);
      useHintsStore.getState().dismissTimeHint();
    };

    const onClick = (e: MouseEvent) => {
      const { cx, cy } = eventToCanvas(e);
      const ts = useTimerStore.getState();
      const phase = ts.phase;
      if (phase === 'idle') {
        // Mode toggle clicks (TIMER / POMO labels below the card)
        const toggleHit = hitModeToggle(cx, cy);
        if (toggleHit) {
          if (
            (toggleHit === 'timer' && ts.mode !== 'timer') ||
            (toggleHit === 'pomo' && ts.mode !== 'pomodoro')
          ) {
            ts.flipMode();
          }
          return;
        }
        // Fold-corner takes precedence over the broader card area
        if (hitFoldCorner(cx, cy)) {
          ts.flipMode();
        } else if (ts.mode === 'pomodoro' && hitCard(cx, cy)) {
          // Pomodoro mode: click on a card zone selects which setting to adjust
          const zone = hitPomodoroZone(cx, cy);
          if (zone) ts.setPomodoroFocus(zone);
        } else if (hitMouse(cx, cy)) {
          // Click on Mouse → start
          ts.start();
          useHintsStore.getState().dismissStartHint();
        } else if (ts.mode === 'timer' && hitCard(cx, cy)) {
          // Timer mode: clicking the card also starts
          ts.start();
          useHintsStore.getState().dismissStartHint();
        }
      } else if (phase === 'focusing') {
        // Click during focus toggles pause/resume
        const s = useTimerStore.getState();
        if (s.pausedAt > 0) {
          s.resume();
        } else {
          s.pause();
        }
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const isPlus =
        e.key === '+' || e.key === '=' || e.code === 'Equal' || e.code === 'NumpadAdd';
      const isMinus =
        e.key === '-' || e.key === '_' || e.code === 'Minus' || e.code === 'NumpadSubtract';
      const isZero = e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0';

      if (isPlus) {
        e.preventDefault();
        const base = manualScaleRef.current || getAutoScale();
        manualScaleRef.current = base + 0.25;
        currentScale = applyScale();
        showScaleToast(currentScale);
        return;
      }
      if (isMinus) {
        e.preventDefault();
        const base = manualScaleRef.current || getAutoScale();
        manualScaleRef.current = Math.max(0.25, base - 0.25);
        currentScale = applyScale();
        showScaleToast(currentScale);
        return;
      }
      if (isZero) {
        e.preventDefault();
        manualScaleRef.current = 0;
        currentScale = applyScale();
        showScaleToast(currentScale);
        return;
      }

      const phase = useTimerStore.getState().phase;
      if (phase === 'idle') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          useTimerStore.getState().adjustMinutes(1);
          useHintsStore.getState().dismissTimeHint();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          useTimerStore.getState().adjustMinutes(-1);
          useHintsStore.getState().dismissTimeHint();
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          useTimerStore.getState().start();
          useHintsStore.getState().dismissStartHint();
        }
      } else if (phase === 'focusing') {
        if (e.key === 'Escape') {
          e.preventDefault();
          useTimerStore.getState().cancel();
        }
      }
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);
    window.addEventListener('keydown', onKeyDown);

    const render = () => {
      const now = performance.now();
      const t = now - startTimeRef.current;

      useTimerStore.getState().tick(now);
      tickCompanions(now);

      const ts = useTimerStore.getState();
      const {
        phase,
        setMinutes,
        remainingMs,
        sessionTotalMs,
        completionStartedAt,
        revealStartedAt,
        revealCharacter,
        mode,
        workMinutes,
        restMinutes,
        totalCycles,
        flipProgress,
        currentSegment,
        currentCycle,
        pomodoroFocus,
      } = ts;

      // Background + scene props for non-reveal phases only
      const currentScene = useUserStateStore.getState().currentScene;
      if (phase !== 'revealing') {
        if (currentScene === 'mouse_cage') {
          drawMouseCage(ctx);
          drawBowl(ctx);
          drawWheel(ctx, now, isWheelInUse());
          drawCompanions(ctx);
        } else if (currentScene === 'fish_tank') {
          drawFishTank(ctx, now);
          drawFishCompanions(ctx, now);
        } else if (currentScene === 'astronaut_space') {
          drawAstronautSpace(ctx, now);
          drawTardigrade(ctx, now);
        } else if (currentScene === 'officer_room') {
          drawOfficerRoom(ctx, now);
        } else if (currentScene === 'rainy_pond') {
          drawRainyPond(ctx, now);
        }
      }

      if (phase === 'idle') {
        // Reset completion state when we go back to idle
        completionMessageRef.current = null;
        completionSoundPlayedRef.current = false;

        if (currentScene === 'mouse_cage') {
          drawHalo(ctx, mouseStateRef.current, t);
          drawMouse(ctx, mouseStateRef.current, t);
          drawCard(ctx, cardStateRef.current, {
            mode,
            minutes: setMinutes,
            workMinutes,
            restMinutes,
            totalCycles,
            flipProgress,
            pomodoroFocus,
          });
          // Mode toggle below the card
          drawModeToggle(ctx, cardStateRef.current, mode);
        } else if (currentScene === 'fish_tank') {
          drawGoldfishIdle(ctx, { x: 240, y: 140 }, t, true);
        } else if (currentScene === 'astronaut_space') {
          drawAstronautDrifting(ctx, { x: 240, y: 150 }, t, true);
        } else if (currentScene === 'officer_room') {
          drawOfficerIdle(ctx, { x: 240, y: 200 }, t, true);
        } else if (currentScene === 'rainy_pond') {
          drawFrogIdle(ctx, { x: 240, y: 185 }, t, true);
        }

        const hintAlpha = Math.min(1, Math.max(0, (t - 2000) / 800));
        const { timeHintDismissed, startHintDismissed } = useHintsStore.getState();
        if (hintAlpha > 0) {
          if (!timeHintDismissed) {
            const cardRect = getCardRect(cardStateRef.current);
            drawBubble(ctx, 'scroll or arrows', {
              anchorX: cardRect.x + cardRect.w / 2,
              anchorY: cardRect.y,
              side: 'above',
              alpha: hintAlpha * 0.85,
            });
          }
          if (!startHintDismissed) {
            drawBubble(ctx, 'tap or enter', {
              anchorX: mouseStateRef.current.x + 20,
              anchorY: mouseStateRef.current.y - 12,
              side: 'right',
              alpha: hintAlpha * 0.85,
            });
          }
        }
      } else if (phase === 'focusing') {
        drawFocusModeClock(ctx, remainingMs, sessionTotalMs);

        // Pomodoro: show current segment + cycle indicator at top-right
        if (mode === 'pomodoro') {
          const label =
            currentSegment === 'work'
              ? `WORK ${currentCycle}/${totalCycles}`
              : `REST ${currentCycle}/${totalCycles}`;
          ctx.globalAlpha = 0.5;
          drawPixelText(
            ctx,
            label.replace(/\D/g, ''), // just the numerals fit pixel font; show "N/M"
            NATIVE_WIDTH - 32,
            NATIVE_HEIGHT - 25,
            currentSegment === 'work' ? '#F4EFE6' : '#7B9268',
            1
          );
          ctx.globalAlpha = 1;
        }

        const focusElapsed = now - useTimerStore.getState().startedAt;
        const hintAlpha = Math.max(0, 1 - focusElapsed / 4000);
        if (hintAlpha > 0.1) {
          drawBubble(ctx, 'esc to cancel', {
            anchorX: NATIVE_WIDTH - 60,
            anchorY: NATIVE_HEIGHT - 16,
            side: 'above',
            alpha: hintAlpha * 0.6,
          });
        }
      } else if (phase === 'completing') {
        // Initialize completion sequence on first frame
        if (completionMessageRef.current === null) {
          completionMessageRef.current = pickMouseMessage(setMinutes);
          completionDirRef.current = Math.random() < 0.5 ? 1 : -1;
        }

        const elapsed = now - completionStartedAt;
        const { phase: cPhase, progress } = getCompletionPhase(elapsed);
        const dir = completionDirRef.current;

        const mouseX = getMouseX(
          Math.floor(NATIVE_WIDTH / 2),
          dir,
          cPhase,
          progress
        );
        const mouseState: MouseState = { x: mouseX, y: 232 };

        // Fade out focus UI
        if (cPhase === 'fadeout') {
          ctx.globalAlpha = 1 - progress;
          drawFocusModeClock(ctx, 0, sessionTotalMs || 1);
          ctx.globalAlpha = 1;
        }

        // Walking in/out: animated walk frames
        if (cPhase === 'walking-in' || cPhase === 'walking-out') {
          const walkFrame = getMouseWalkFrame(cPhase, elapsed);
          const facingRight = cPhase === 'walking-in' ? dir === 1 : dir === 1;
          drawMouseWalking(ctx, mouseState, walkFrame, facingRight);
        } else if (cPhase === 'pause-before-card') {
          drawMouse(ctx, mouseState, t);
        } else if (cPhase === 'card-rising') {
          drawMouse(ctx, mouseState, t);
          // Card rises with eased scale
          const eased = 1 - Math.pow(1 - progress, 2);
          drawCompletionCard(
            ctx,
            { centerX: mouseX, centerY: 232 - 40 },
            completionMessageRef.current?.text ?? '',
            { scale: eased, alpha: eased }
          );
          // Play sound at the start of rising
          if (!completionSoundPlayedRef.current) {
            completionSoundPlayedRef.current = true;
            playCompletionSound();
          }
        } else if (cPhase === 'card-displayed') {
          drawMouse(ctx, mouseState, t);
          drawCompletionCard(
            ctx,
            { centerX: mouseX, centerY: 232 - 40 },
            completionMessageRef.current?.text ?? '',
            { scale: 1, alpha: 1 }
          );
        } else if (cPhase === 'card-lowering-wave') {
          // Card fades out as Mouse waves
          const cardAlpha = 1 - progress;
          drawCompletionCard(
            ctx,
            { centerX: mouseX, centerY: 232 - 40 },
            completionMessageRef.current?.text ?? '',
            { scale: 1, alpha: cardAlpha }
          );
          drawMouseWaving(ctx, mouseState, elapsed * 1000);
        } else if (cPhase === 'empty') {
          // Scene is empty
        }

        // Auto-return to idle when sequence completes
        if (elapsed >= COMPLETION_TOTAL_MS) {
          useTimerStore.getState().complete();
        }
      } else if (phase === 'revealing') {
        // Reset completion state when entering reveal
        completionMessageRef.current = null;
        completionSoundPlayedRef.current = false;

        const elapsed = now - revealStartedAt;
        const { phase: rPhase, progress } = getRevealPhase(elapsed);
        const targetX = Math.floor(NATIVE_WIDTH / 2);

        // Character-specific config
        const isGoldfish = revealCharacter === 'goldfish';
        const isAstronaut = revealCharacter === 'astronaut';
        const isOfficer = revealCharacter === 'officer';
        const charDir: 1 | -1 = 1;
        const charY = isGoldfish ? 140 : isAstronaut ? 150 : 200;
        const startX = charDir === 1 ? -20 : NATIVE_WIDTH + 20;
        const cardText = isGoldfish
          ? '*blub*'
          : isAstronaut
          ? 'Ground, this is Astro.'
          : isOfficer
          ? 'Reporting in.'
          : '...';
        const cardBackText = isOfficer ? "I've been watching." : '';

        // Scene drawing functions for this character
        const drawSilhouette = isAstronaut
          ? drawAstronautSpaceSilhouette
          : isOfficer
          ? drawOfficerRoomSilhouette
          : drawFishTankSilhouette;
        const drawColored = isAstronaut
          ? drawAstronautSpace
          : isOfficer
          ? drawOfficerRoom
          : drawFishTank;
        const drawRevealFill = isAstronaut
          ? drawAstronautSpaceRevealFill
          : isOfficer
          ? drawOfficerRoomRevealFill
          : drawFishTankRevealFill;

        // Character draw helpers
        const drawCharEnter = (x: number) => {
          if (isAstronaut) {
            drawAstronautDrifting(ctx, { x, y: charY }, elapsed, charDir === 1);
          } else if (isOfficer) {
            drawOfficerWalking(ctx, { x, y: charY }, elapsed, charDir === 1);
          } else {
            drawGoldfishSwimming(ctx, { x, y: charY }, elapsed, charDir === 1);
          }
        };
        const drawCharIdle = () => {
          if (isAstronaut) {
            drawAstronautDrifting(ctx, { x: targetX, y: charY }, elapsed, charDir === 1);
          } else if (isOfficer) {
            drawOfficerIdle(ctx, { x: targetX, y: charY }, elapsed, charDir === 1);
          } else {
            drawGoldfishIdle(ctx, { x: targetX, y: charY }, elapsed, charDir === 1);
          }
        };
        const drawCharFront = () => {
          if (isAstronaut) {
            drawAstronautFacingCamera(ctx, { x: targetX, y: charY }, elapsed);
          } else if (isOfficer) {
            drawOfficerFacingCamera(ctx, { x: targetX, y: charY }, elapsed);
          } else {
            drawGoldfishFacingCamera(ctx, { x: targetX, y: charY }, elapsed);
          }
        };

        if (rPhase === 'fade-out') {
          // Old scene fading to black
          drawMouseCage(ctx);
          drawBowl(ctx);
          drawWheel(ctx, now, false);
          drawCompanions(ctx);
          ctx.fillStyle = `rgba(21, 22, 30, ${progress})`;
          ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
        } else if (rPhase === 'silhouette') {
          ctx.fillStyle = '#15161E';
          ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
          drawSilhouette(ctx, progress);
        } else if (rPhase === 'goldfish-enter') {
          drawSilhouette(ctx, 1);
          const eased = 1 - Math.pow(1 - progress, 2);
          const x = Math.round(startX + (targetX - startX) * eased);
          drawCharEnter(x);
        } else if (rPhase === 'goldfish-pause') {
          drawSilhouette(ctx, 1);
          if (progress < 0.5) {
            drawCharIdle();
          } else {
            drawCharFront();
          }
        } else if (rPhase === 'card-rise') {
          drawSilhouette(ctx, 1);
          drawCharFront();
          const eased = 1 - Math.pow(1 - progress, 2);
          drawCompletionCard(
            ctx,
            { centerX: targetX, centerY: isOfficer ? charY - 50 : charY - 28 },
            cardText,
            { scale: eased, alpha: eased }
          );
          if (!completionSoundPlayedRef.current) {
            completionSoundPlayedRef.current = true;
            playClack();
          }
        } else if (rPhase === 'card-display') {
          drawSilhouette(ctx, 1);
          drawCharFront();
          const cardCY = isOfficer ? charY - 50 : charY - 32;

          if (isOfficer) {
            // Officer's signature card-flip ritual
            // Timeline within card-display: 0-0.35 front, 0.35-0.65 flip, 0.65-1 back
            if (progress < 0.35) {
              drawCompletionCard(
                ctx,
                { centerX: targetX, centerY: cardCY },
                cardText,
                { scale: 1, alpha: 1 }
              );
            } else if (progress < 0.65) {
              // Flip animation — squash card horizontally
              const flipP = (progress - 0.35) / 0.3;
              const widthFactor = Math.abs(Math.cos(flipP * Math.PI));
              const showBack = flipP >= 0.5;
              ctx.save();
              ctx.translate(targetX, cardCY);
              ctx.scale(Math.max(0.05, widthFactor), 1);
              ctx.translate(-targetX, -cardCY);
              if (showBack) {
                // Show blank back card (heart will appear after flip)
                drawCompletionCard(
                  ctx,
                  { centerX: targetX, centerY: cardCY },
                  ' ',
                  { scale: 1, alpha: 1 }
                );
              } else {
                drawCompletionCard(
                  ctx,
                  { centerX: targetX, centerY: cardCY },
                  cardText,
                  { scale: 1, alpha: 1 }
                );
              }
              ctx.restore();
              if (showBack && !completionSoundPlayedRef.current) {
                completionSoundPlayedRef.current = true;
                playClack();
              }
            } else {
              // Back of card — empty card with BIG pink heart centered
              drawCompletionCard(
                ctx,
                { centerX: targetX, centerY: cardCY },
                ' ',
                { scale: 1, alpha: 1 }
              );
              // Big centered pink heart (9 wide × 8 tall)
              drawBigHeart(ctx, targetX, cardCY);
            }
          } else {
            drawCompletionCard(
              ctx,
              { centerX: targetX, centerY: cardCY },
              cardText,
              { scale: 1, alpha: 1 }
            );
          }
        } else if (rPhase === 'scene-fill') {
          drawRevealFill(ctx, elapsed, progress);
          drawCharFront();
          drawCompletionCard(
            ctx,
            { centerX: targetX, centerY: isOfficer ? charY - 50 : charY - 28 },
            cardText,
            { scale: 1, alpha: 1 - progress * 0.5 }
          );
        } else if (rPhase === 'hold') {
          drawColored(ctx, elapsed);
          drawCharIdle();
        } else if (rPhase === 'return') {
          drawColored(ctx, elapsed);
          drawCharIdle();
          ctx.fillStyle = `rgba(21, 22, 30, ${progress})`;
          ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
        }

        if (elapsed >= REVEAL_TOTAL_MS) {
          useTimerStore.getState().finishReveal();
        }
      }

      // ===== Time-of-day tint overlay (applied last, over everything) =====
      // Theme color shifts happen at scene/character render time, not here.
      if (phase !== 'revealing') {
        const bgMode = useSettingsStore.getState().backgroundMode;
        const tint = resolveTint(bgMode);
        applyTint(ctx, tint);
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  useEffect(() => {
    if (!scaleToast) return;
    const remaining = scaleToast.until - performance.now();
    if (remaining <= 0) {
      setScaleToast(null);
      return;
    }
    const timer = setTimeout(() => setScaleToast(null), remaining);
    return () => clearTimeout(timer);
  }, [scaleToast]);

  const zoomIn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base = manualScaleRef.current || getAutoScale();
    manualScaleRef.current = base + 0.25;
    const s = resizeCanvas(canvas, manualScaleRef.current || undefined);
    setScaleToast({ value: s, until: performance.now() + 1500 });
  };

  const zoomOut = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base = manualScaleRef.current || getAutoScale();
    manualScaleRef.current = Math.max(0.25, base - 0.25);
    const s = resizeCanvas(canvas, manualScaleRef.current || undefined);
    setScaleToast({ value: s, until: performance.now() + 1500 });
  };

  const zoomReset = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    manualScaleRef.current = 0;
    const s = resizeCanvas(canvas);
    setScaleToast({ value: s, until: performance.now() + 1500 });
  };

  // Show paused state when user explicitly paused (not when sidebar caused pause)
  const showPausedOverlay =
    isPaused && !sidebarOpen && phaseSub === 'focusing';

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-kw-black overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className={`block cursor-pointer transition-all duration-300 ${
          showPausedOverlay ? 'blur-[2px] brightness-75' : ''
        }`}
        aria-label="Keep Watch — Mouse Cage scene"
      />

      {/* Pause + Stop buttons — visible during focus mode */}
      {phaseSub === 'focusing' && !sidebarOpen && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          <button
            onClick={() => {
              const s = useTimerStore.getState();
              if (s.pausedAt > 0) s.resume();
              else s.pause();
            }}
            className="w-10 h-10 flex items-center justify-center bg-kw-black/60 hover:bg-kw-black/80 border border-kw-white/30 rounded-full text-kw-white text-lg"
            aria-label={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? '▶' : '⏸'}
          </button>
          <button
            onClick={() => useTimerStore.getState().cancel()}
            className="w-10 h-10 flex items-center justify-center bg-kw-black/60 hover:bg-kw-pink/40 border border-kw-white/30 hover:border-kw-pink/60 rounded-full text-kw-white text-sm"
            aria-label="Stop"
          >
            ■
          </button>
        </div>
      )}

      {/* Paused overlay — foggy text overlay (companions still tick behind the blur) */}
      {showPausedOverlay && (
        <div
          onClick={() => useTimerStore.getState().resume()}
          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
        >
          <div
            className="bg-kw-black/40 backdrop-blur-sm px-8 py-6 rounded-lg text-kw-white font-mono text-center border border-kw-white/15"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-3xl tracking-[0.3em] mb-5">PAUSED</div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => useTimerStore.getState().resume()}
                className="px-4 py-2 bg-kw-black/40 hover:bg-kw-black/60 border border-kw-white/30 rounded text-sm cursor-pointer"
              >
                ▶ Resume
              </button>
              <button
                onClick={() => useTimerStore.getState().cancel()}
                className="px-4 py-2 bg-kw-black/40 hover:bg-kw-pink/40 border border-kw-white/30 hover:border-kw-pink/60 rounded text-sm cursor-pointer"
              >
                ■ Stop
              </button>
            </div>
            <div className="text-[10px] text-kw-white/40 mt-4 tracking-wider">
              or tap outside to resume
            </div>
          </div>
        </div>
      )}
      {scaleToast && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-kw-black/70 text-kw-white text-xs font-mono rounded pointer-events-none">
          {scaleToast.value}× {manualScaleRef.current === 0 ? '(auto)' : '(manual)'}
        </div>
      )}

      {/* Stats overlay — minimal, top-center, low contrast */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 text-kw-white/40 text-[10px] font-mono pointer-events-none select-none whitespace-nowrap">
        Today {formatHM(todaySec)} · Total {formatHM(totalSec)} · Days {totalDays}
      </div>
      <div className="absolute bottom-3 right-3 flex gap-1 font-mono text-sm">
        <button
          onClick={zoomOut}
          className="w-8 h-8 bg-kw-black/60 text-kw-white border border-kw-white/20 hover:bg-kw-black/80 rounded"
          aria-label="Zoom out"
        >
          −
        </button>
        <button
          onClick={zoomReset}
          className="px-2 h-8 bg-kw-black/60 text-kw-white border border-kw-white/20 hover:bg-kw-black/80 rounded text-xs"
          aria-label="Reset zoom"
        >
          ⟲
        </button>
        <button
          onClick={zoomIn}
          className="w-8 h-8 bg-kw-black/60 text-kw-white border border-kw-white/20 hover:bg-kw-black/80 rounded"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>
      <div className="absolute bottom-2 left-2 text-kw-white/30 text-[10px] font-mono pointer-events-none select-none">
        + / − zoom · 0 reset
      </div>

      {/* Hamburger menu — opens sidebar */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="absolute top-4 left-4 w-9 h-9 flex flex-col justify-center items-center gap-1 bg-kw-black/60 hover:bg-kw-black/80 border border-kw-white/20 rounded"
        aria-label="Open menu"
      >
        <span className="block w-5 h-[2px] bg-kw-white" />
        <span className="block w-5 h-[2px] bg-kw-white" />
        <span className="block w-5 h-[2px] bg-kw-white" />
      </button>

      {/* Sidebar + backdrop */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentScene={currentSceneSel}
        unlocks={unlocks}
        volume={volume}
        muted={muted}
        theme={theme}
        todaySec={todaySec}
        totalSec={totalSec}
        totalDays={totalDays}
      />

      {/* Dev tray — collapsed by default */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 right-16 flex flex-col items-end gap-1">
          <button
            onClick={() => setDevTrayOpen((v) => !v)}
            className="px-2 h-7 bg-kw-black/60 text-kw-white/60 text-[10px] font-mono rounded border border-kw-white/10 hover:bg-kw-black/80"
            aria-label="Toggle dev tools"
          >
            {devTrayOpen ? '✕ dev' : '⚙ dev'}
          </button>
          {devTrayOpen && (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => useTimerStore.getState().startDebug(6)}
                className="px-3 py-1 bg-kw-pink/40 text-kw-white text-xs font-mono rounded border border-kw-pink/60 hover:bg-kw-pink/60"
              >
                ▶ 6s test
              </button>
              <button
                onClick={() => useTimerStore.getState().startReveal('goldfish')}
                className="px-3 py-1 bg-kw-water/50 text-kw-white text-xs font-mono rounded border border-kw-water/70 hover:bg-kw-water/70"
              >
                🐠 reveal
              </button>
              <button
                onClick={() => useTimerStore.getState().startReveal('astronaut')}
                className="px-3 py-1 bg-kw-space/70 text-kw-white text-xs font-mono rounded border border-kw-white/30 hover:bg-kw-space/90"
              >
                🚀 reveal
              </button>
              <button
                onClick={() => useTimerStore.getState().startReveal('officer')}
                className="px-3 py-1 bg-kw-green/40 text-kw-white text-xs font-mono rounded border border-kw-green/60 hover:bg-kw-green/60"
              >
                🪖 reveal
              </button>
              {/* Manual unlock all (for previewing all scenes immediately) */}
              <button
                onClick={() => {
                  const s = useUserStateStore.getState();
                  s.unlockCharacter('goldfish');
                  s.unlockCharacter('astronaut');
                  s.unlockCharacter('officer');
                }}
                className="px-3 py-1 bg-kw-green/30 text-kw-white text-[10px] font-mono rounded border border-kw-green/50 hover:bg-kw-green/50"
              >
                🔓 unlock all
              </button>
              {/* Manual relock for testing "first unlock" flow */}
              <button
                onClick={() => {
                  const s = useUserStateStore.getState();
                  s.relockCharacter('goldfish');
                  s.relockCharacter('astronaut');
                  s.relockCharacter('officer');
                }}
                className="px-3 py-1 bg-kw-black/60 text-kw-white/70 text-[10px] font-mono rounded border border-kw-white/20 hover:bg-kw-black/80"
              >
                🔒 lock all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Draws a big pink pixel heart centered on (cx, cy).
 * Shape: 9 wide × 8 tall classic pixel heart.
 */
function drawBigHeart(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  const pink = '#E89BAA';
  const darkPink = '#C4798B';
  const highlight = '#F4D8DE';

  // Pattern (0 = empty, 1 = main pink, 2 = highlight, 3 = dark outline)
  const pattern = [
    [0, 3, 3, 0, 0, 0, 3, 3, 0],
    [3, 2, 1, 3, 0, 3, 1, 1, 3],
    [3, 2, 1, 1, 3, 1, 1, 1, 3],
    [3, 1, 1, 1, 1, 1, 1, 1, 3],
    [0, 3, 1, 1, 1, 1, 1, 3, 0],
    [0, 0, 3, 1, 1, 1, 3, 0, 0],
    [0, 0, 0, 3, 1, 3, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0, 0],
  ];

  const heartW = 9;
  const heartH = 8;
  const startX = Math.round(cx - heartW / 2);
  const startY = Math.round(cy - heartH / 2);

  for (let row = 0; row < heartH; row++) {
    for (let col = 0; col < heartW; col++) {
      const v = pattern[row][col];
      if (v === 0) continue;
      ctx.fillStyle = v === 1 ? pink : v === 2 ? highlight : darkPink;
      ctx.fillRect(startX + col, startY + row, 1, 1);
    }
  }
}

/* ============================================================
 * Sidebar component
 * ============================================================ */

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  currentScene: SceneName;
  unlocks: {
    mouse: { unlocked: boolean };
    goldfish: { unlocked: boolean };
    astronaut: { unlocked: boolean };
    officer: { unlocked: boolean };
  };
  volume: number;
  muted: boolean;
  theme: string;
  todaySec: number;
  totalSec: number;
  totalDays: number;
}

function Sidebar({
  open,
  onClose,
  currentScene,
  unlocks,
  volume,
  muted,
  theme,
  todaySec,
  totalSec,
  totalDays,
}: SidebarProps) {
  const setCurrentScene = useUserStateStore((s) => s.setCurrentScene);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const toggleMute = useSettingsStore((s) => s.toggleMute);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const backgroundMode = useSettingsStore((s) => s.backgroundMode);
  const setBackgroundMode = useSettingsStore((s) => s.setBackgroundMode);

  const sceneOptions: { id: SceneName; label: string; unlocked: boolean; icon: string }[] = [
    { id: 'mouse_cage', label: 'Mouse Cage', unlocked: unlocks.mouse.unlocked, icon: '🐭' },
    { id: 'fish_tank', label: 'Fish Tank', unlocked: unlocks.goldfish.unlocked, icon: '🐠' },
    { id: 'astronaut_space', label: 'Astronaut Space', unlocked: unlocks.astronaut.unlocked, icon: '🚀' },
    { id: 'officer_room', label: 'Officer Room', unlocked: unlocks.officer.unlocked, icon: '🪖' },
    { id: 'rainy_pond', label: 'Rainy Pond', unlocked: true, icon: '🐸' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-kw-black/60 transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`absolute top-0 left-0 h-full w-[320px] max-w-[80%] bg-kw-wood/95 border-r border-kw-black/40 shadow-xl text-kw-white font-mono transition-transform duration-200 ease-out flex flex-col ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        <header className="px-5 pt-5 pb-3 border-b border-kw-black/30">
          <h1 className="text-lg tracking-widest font-bold">KEEP WATCH</h1>
          <p className="text-[10px] text-kw-white/60 mt-1">under quiet, gentle observation</p>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-xs">
          {/* SCENES */}
          <section>
            <h2 className="text-[10px] text-kw-white/50 tracking-wider mb-2">SCENE</h2>
            <div className="space-y-1">
              {sceneOptions.map((s) => (
                <button
                  key={s.id + s.label}
                  onClick={() => setCurrentScene(s.id)}
                  disabled={!s.unlocked}
                  className={`w-full text-left px-3 py-2 rounded flex items-center gap-2 transition-colors ${
                    currentScene === s.id
                      ? 'bg-kw-black/40 border border-kw-white/40'
                      : 'bg-kw-black/20 border border-transparent hover:bg-kw-black/30'
                  } ${!s.unlocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                  {!s.unlocked && <span className="ml-auto text-[10px]">locked</span>}
                </button>
              ))}
              {/* Slot 5 placeholder — shows after all 4 unlocked */}
              {unlocks.goldfish.unlocked &&
                unlocks.astronaut.unlocked &&
                unlocks.officer.unlocked && (
                  <div className="px-3 py-2 rounded bg-kw-black/10 border border-dashed border-kw-white/15 text-kw-white/30 text-[10px]">
                    ❓ ··· coming soon
                  </div>
                )}
            </div>
          </section>

          {/* BACKGROUND (time-of-day + mood overlays) */}
          <section>
            <h2 className="text-[10px] text-kw-white/50 tracking-wider mb-2">BACKGROUND</h2>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'auto', label: 'Auto', icon: '⟲' },
                  { id: 'morning', label: 'Morning', icon: '🌅' },
                  { id: 'day', label: 'Day', icon: '☀️' },
                  { id: 'dusk', label: 'Dusk', icon: '🌇' },
                  { id: 'night', label: 'Night', icon: '🌙' },
                  { id: 'deep_night', label: 'Deep', icon: '🌌' },
                  { id: 'warm', label: 'Warm', icon: '🔥' },
                  { id: 'cool', label: 'Cool', icon: '❄️' },
                  { id: 'sepia', label: 'Sepia', icon: '📜' },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setBackgroundMode(p.id)}
                  className={`px-2 py-1.5 rounded border transition-colors text-[10px] ${
                    backgroundMode === p.id
                      ? 'bg-kw-black/50 border-kw-white/40'
                      : 'bg-kw-black/15 border-transparent hover:bg-kw-black/30'
                  }`}
                >
                  <div className="text-sm leading-none">{p.icon}</div>
                  <div className="mt-0.5">{p.label}</div>
                </button>
              ))}
            </div>
          </section>

          {/* VOLUME */}
          <section>
            <h2 className="text-[10px] text-kw-white/50 tracking-wider mb-2">VOLUME</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="w-7 h-7 flex items-center justify-center rounded bg-kw-black/30 hover:bg-kw-black/50 border border-kw-white/20"
                aria-label="Mute"
              >
                {muted || volume === 0 ? '🔇' : '🔊'}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={muted ? 0 : volume}
                onChange={(e) => setVolume(parseInt(e.target.value, 10))}
                className="flex-1 accent-kw-pink"
              />
              <span className="w-8 text-right text-[10px] text-kw-white/60">
                {muted ? 0 : volume}
              </span>
            </div>
          </section>

          {/* THEME — hand-curated color palettes */}
          <section>
            <h2 className="text-[10px] text-kw-white/50 tracking-wider mb-2">THEME · color palette</h2>
            <div className="grid grid-cols-2 gap-1">
              {(
                [
                  { id: 'classic',    label: 'Classic',    swatches: ['#F4EFE6', '#8B5E3C', '#7AAFBF'] },
                  { id: 'cheese_sky', label: 'Cheese Sky', swatches: ['#F4D86C', '#5B9BD5', '#F4F0D8'] },
                  { id: 'mint_choco', label: 'Mint Choco', swatches: ['#B8E0C8', '#3A2018', '#8AD0AA'] },
                  { id: 'sakura',     label: 'Sakura',     swatches: ['#F8C8D8', '#A86878', '#E0B0BC'] },
                ] as const
              ).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`px-2 py-2 rounded border transition-colors ${
                    theme === t.id
                      ? 'bg-kw-black/40 border-kw-white/40'
                      : 'bg-kw-black/15 border-transparent hover:bg-kw-black/30'
                  }`}
                >
                  <div className="flex gap-0.5 mb-1.5 justify-center">
                    {t.swatches.map((c, i) => (
                      <span
                        key={i}
                        className="block w-3 h-3 rounded-sm border border-kw-black/30"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="text-[10px] text-center">{t.label}</div>
                </button>
              ))}
            </div>
          </section>

          {/* STATS */}
          <section>
            <h2 className="text-[10px] text-kw-white/50 tracking-wider mb-2">STATS</h2>
            <div className="space-y-1 text-[11px] leading-relaxed">
              <div className="flex justify-between"><span className="text-kw-white/60">Today</span><span>{formatHM(todaySec)}</span></div>
              <div className="flex justify-between"><span className="text-kw-white/60">Total</span><span>{formatHM(totalSec)}</span></div>
              <div className="flex justify-between"><span className="text-kw-white/60">Days</span><span>{totalDays}</span></div>
            </div>
          </section>
        </div>

        <footer className="px-5 py-3 border-t border-kw-black/30 text-[10px] text-kw-white/40">
          <p>✍ ABOUT · <span className="opacity-60">soon</span></p>
        </footer>
      </aside>
    </>
  );
}

export default App;
