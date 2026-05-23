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
  getCardRect,
} from './characters/Card';
import { drawBubble } from './characters/Bubble';
import { tickCompanions, drawCompanions, isWheelInUse } from './characters/MouseCompanion';
import { useTimerStore } from './store/timerStore';
import { useHintsStore } from './store/hintsStore';
import { useUserStateStore, formatHM } from './store/userStateStore';
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
} from './scenes/FishTank';
import {
  drawGoldfishSwimming,
  drawGoldfishIdle,
  drawGoldfishFacingCamera,
  type GoldfishState,
} from './characters/Goldfish';
import { playCompletionSound, playClack } from './core/sound';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(performance.now());
  const rafRef = useRef<number>(0);
  const manualScaleRef = useRef<number>(0);
  const [scaleToast, setScaleToast] = useState<{ value: number; until: number } | null>(null);

  // Reactive subscriptions for the stats overlay
  const todaySec = useUserStateStore((s) => s.today.seconds);
  const totalSec = useUserStateStore((s) => s.total_focus_seconds);
  const totalDays = useUserStateStore((s) => s.total_focus_days);

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

    function hitMouse(cx: number, cy: number) {
      const m = mouseStateRef.current;
      return cx >= m.x - 18 && cx <= m.x + 18 && cy >= m.y - 28 && cy <= m.y + 4;
    }

    const onWheel = (e: WheelEvent) => {
      const { cx, cy } = eventToCanvas(e);
      if (!hitCard(cx, cy)) return;
      e.preventDefault();
      const direction = e.deltaY < 0 ? 1 : -1;
      useTimerStore.getState().adjustMinutes(direction);
      useHintsStore.getState().dismissTimeHint();
    };

    const onClick = (e: MouseEvent) => {
      const { cx, cy } = eventToCanvas(e);
      const phase = useTimerStore.getState().phase;
      if (phase === 'idle' && hitMouse(cx, cy)) {
        useTimerStore.getState().start();
        useHintsStore.getState().dismissStartHint();
      } else if (phase === 'focusing') {
        useTimerStore.getState().cancel();
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

      const {
        phase,
        setMinutes,
        remainingMs,
        sessionTotalMs,
        completionStartedAt,
        revealStartedAt,
        revealCharacter,
      } = useTimerStore.getState();

      // Background + scene props for non-reveal phases only
      if (phase !== 'revealing') {
        drawMouseCage(ctx);
        drawBowl(ctx);
        drawWheel(ctx, now, isWheelInUse());
        drawCompanions(ctx);
      }

      if (phase === 'idle') {
        // Reset completion state when we go back to idle
        completionMessageRef.current = null;
        completionSoundPlayedRef.current = false;

        drawHalo(ctx, mouseStateRef.current, t);
        drawMouse(ctx, mouseStateRef.current, t);
        drawCard(ctx, cardStateRef.current, setMinutes);

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

        // Goldfish swims in from random side
        const goldfishDir: 1 | -1 = 1;
        const targetX = Math.floor(NATIVE_WIDTH / 2);
        const startX = goldfishDir === 1 ? -20 : NATIVE_WIDTH + 20;
        const goldfishY = 140;

        if (rPhase === 'fade-out') {
          // Mouse Cage fading to black
          drawMouseCage(ctx);
          drawBowl(ctx);
          drawWheel(ctx, now, false);
          drawCompanions(ctx);
          ctx.fillStyle = `rgba(21, 22, 30, ${progress})`;
          ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
        } else if (rPhase === 'silhouette') {
          // Fish Tank silhouette fades in
          ctx.fillStyle = '#15161E';
          ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
          drawFishTankSilhouette(ctx, progress);
        } else if (rPhase === 'goldfish-enter') {
          drawFishTankSilhouette(ctx, 1);
          // Goldfish swims from edge to center
          const eased = 1 - Math.pow(1 - progress, 2);
          const x = Math.round(startX + (targetX - startX) * eased);
          drawGoldfishSwimming(
            ctx,
            { x, y: goldfishY },
            elapsed,
            goldfishDir === 1
          );
        } else if (rPhase === 'goldfish-pause') {
          drawFishTankSilhouette(ctx, 1);
          // Side view first, then turns to face camera at 60% progress
          if (progress < 0.5) {
            drawGoldfishIdle(
              ctx,
              { x: targetX, y: goldfishY },
              elapsed,
              true
            );
          } else {
            drawGoldfishFacingCamera(
              ctx,
              { x: targetX, y: goldfishY },
              elapsed
            );
          }
        } else if (rPhase === 'card-rise') {
          drawFishTankSilhouette(ctx, 1);
          drawGoldfishFacingCamera(
            ctx,
            { x: targetX, y: goldfishY },
            elapsed
          );
          // Card rises above Goldfish
          const eased = 1 - Math.pow(1 - progress, 2);
          drawCompletionCard(
            ctx,
            { centerX: targetX, centerY: goldfishY - 24 },
            '*blub*',
            { scale: eased, alpha: eased }
          );
          if (!completionSoundPlayedRef.current) {
            completionSoundPlayedRef.current = true;
            playClack();
          }
        } else if (rPhase === 'card-display') {
          drawFishTankSilhouette(ctx, 1);
          drawGoldfishFacingCamera(
            ctx,
            { x: targetX, y: goldfishY },
            elapsed
          );
          drawCompletionCard(
            ctx,
            { centerX: targetX, centerY: goldfishY - 24 },
            '*blub*',
            { scale: 1, alpha: 1 }
          );
        } else if (rPhase === 'scene-fill') {
          // Colors radiate outward
          drawFishTankRevealFill(ctx, elapsed, progress);
          // Goldfish stays facing camera during fill
          drawGoldfishFacingCamera(
            ctx,
            { x: targetX, y: goldfishY },
            elapsed
          );
          drawCompletionCard(
            ctx,
            { centerX: targetX, centerY: goldfishY - 24 },
            '*blub*',
            { scale: 1, alpha: 1 - progress * 0.5 }
          );
        } else if (rPhase === 'hold') {
          drawFishTank(ctx, elapsed);
          drawGoldfishIdle(
            ctx,
            { x: targetX, y: goldfishY },
            elapsed,
            true
          );
        } else if (rPhase === 'return') {
          // Fade back to Mouse Cage
          drawFishTank(ctx, elapsed);
          drawGoldfishIdle(
            ctx,
            { x: targetX, y: goldfishY },
            elapsed,
            true
          );
          ctx.fillStyle = `rgba(21, 22, 30, ${progress})`;
          ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);
        }

        // Auto-finish when sequence completes
        if (elapsed >= REVEAL_TOTAL_MS) {
          useTimerStore.getState().finishReveal();
        }
      }

      // Hide unused vars warning
      void revealCharacter;

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

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-kw-black overflow-hidden relative">
      <canvas
        ref={canvasRef}
        className="block cursor-pointer"
        aria-label="Keep Watch — Mouse Cage scene"
      />
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

      {/* Debug-only: triggers for quick testing */}
      {import.meta.env.DEV && (
        <div className="absolute top-4 left-4 flex gap-1">
          <button
            onClick={() => useTimerStore.getState().startDebug(6)}
            className="px-3 py-1 bg-kw-pink/40 text-kw-white text-xs font-mono rounded border border-kw-pink/60 hover:bg-kw-pink/60"
            aria-label="Debug: start 6-second test"
          >
            ▶ 6s test
          </button>
          <button
            onClick={() => {
              useUserStateStore.getState().relockCharacter('goldfish');
              useTimerStore.getState().startReveal('goldfish');
            }}
            className="px-3 py-1 bg-kw-water/50 text-kw-white text-xs font-mono rounded border border-kw-water/70 hover:bg-kw-water/70"
            aria-label="Debug: replay Goldfish reveal"
          >
            🐠 reveal
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
