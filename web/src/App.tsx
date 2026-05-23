import { useEffect, useRef, useState } from 'react';
import {
  setupPixelCanvas,
  resizeCanvas,
  calcIntegerScale,
  NATIVE_WIDTH,
  NATIVE_HEIGHT,
} from './core/canvas';
import { drawMouseCage } from './scenes/MouseCage';
import { drawMouse, drawHalo, type MouseState } from './characters/Mouse';
import { drawCard, drawFocusModeClock, getCardRect } from './characters/Card';
import { drawBubble } from './characters/Bubble';
import { tickCompanions, drawCompanions } from './characters/MouseCompanion';
import { useTimerStore } from './store/timerStore';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(performance.now());
  const rafRef = useRef<number>(0);

  /** Manual scale override. 0 means "auto" (default). */
  const manualScaleRef = useRef<number>(0);
  /** Display indicator: shows current scale briefly when changed. */
  const [scaleToast, setScaleToast] = useState<{ value: number; until: number } | null>(null);

  const mouseStateRef = useRef<MouseState>({
    x: Math.floor(NATIVE_WIDTH / 2),
    y: 232,
  });
  const cardStateRef = useRef({
    centerX: Math.floor(NATIVE_WIDTH / 2),
    centerY: 232 - 38,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { ctx } = setupPixelCanvas(canvas);

    const applyScale = () => {
      const scale = resizeCanvas(canvas, manualScaleRef.current || undefined);
      return scale;
    };

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
      return cx >= m.x - 14 && cx <= m.x + 14 && cy >= m.y - 20 && cy <= m.y + 4;
    }

    const onWheel = (e: WheelEvent) => {
      const { cx, cy } = eventToCanvas(e);
      if (!hitCard(cx, cy)) return;
      e.preventDefault();
      const direction = e.deltaY < 0 ? 1 : -1;
      useTimerStore.getState().adjustMinutes(direction);
    };

    const onClick = (e: MouseEvent) => {
      const { cx, cy } = eventToCanvas(e);
      const phase = useTimerStore.getState().phase;
      if (phase === 'idle' && hitMouse(cx, cy)) {
        useTimerStore.getState().start();
      } else if (phase === 'focusing') {
        useTimerStore.getState().cancel();
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Zoom controls — check e.code (keyboard position) and e.key (character)
      // to be robust against IME / different layouts.
      const isPlus =
        e.key === '+' ||
        e.key === '=' ||
        e.code === 'Equal' ||
        e.code === 'NumpadAdd';
      const isMinus =
        e.key === '-' ||
        e.key === '_' ||
        e.code === 'Minus' ||
        e.code === 'NumpadSubtract';
      const isZero =
        e.key === '0' || e.code === 'Digit0' || e.code === 'Numpad0';

      if (isPlus) {
        e.preventDefault();
        const base =
          manualScaleRef.current ||
          calcIntegerScale(window.innerWidth, window.innerHeight);
        manualScaleRef.current = base + 0.25;
        currentScale = applyScale();
        showScaleToast(currentScale);
        return;
      }
      if (isMinus) {
        e.preventDefault();
        const base =
          manualScaleRef.current ||
          calcIntegerScale(window.innerWidth, window.innerHeight);
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

      // Timer controls
      const phase = useTimerStore.getState().phase;
      if (phase === 'idle') {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          useTimerStore.getState().adjustMinutes(1);
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          useTimerStore.getState().adjustMinutes(-1);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          useTimerStore.getState().start();
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

      const { phase, setMinutes, remainingMs } = useTimerStore.getState();

      drawMouseCage(ctx);
      drawCompanions(ctx);

      if (phase === 'idle') {
        drawHalo(ctx, mouseStateRef.current, t);
        drawMouse(ctx, mouseStateRef.current, t);
        drawCard(ctx, cardStateRef.current, setMinutes);

        const hintAlpha = Math.min(1, Math.max(0, (t - 2000) / 800));
        if (hintAlpha > 0) {
          const cardRect = getCardRect(cardStateRef.current);
          drawBubble(ctx, 'scroll or arrows', {
            anchorX: cardRect.x + cardRect.w / 2,
            anchorY: cardRect.y,
            side: 'above',
            alpha: hintAlpha * 0.85,
          });
          drawBubble(ctx, 'tap or enter', {
            anchorX: mouseStateRef.current.x + 14,
            anchorY: mouseStateRef.current.y - 10,
            side: 'right',
            alpha: hintAlpha * 0.85,
          });
        }
      } else if (phase === 'focusing') {
        const totalMs = setMinutes * 60 * 1000;
        drawFocusModeClock(ctx, remainingMs, totalMs);

        const hintAlpha = Math.max(0, 1 - t / 4000);
        if (hintAlpha > 0.1) {
          drawBubble(ctx, 'esc to cancel', {
            anchorX: NATIVE_WIDTH - 60,
            anchorY: NATIVE_HEIGHT - 16,
            side: 'above',
            alpha: hintAlpha * 0.6,
          });
        }
      } else if (phase === 'completing') {
        drawFocusModeClock(ctx, 0, setMinutes * 60 * 1000);
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

  // Hide toast after expiry
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
    const base =
      manualScaleRef.current ||
      calcIntegerScale(window.innerWidth, window.innerHeight);
    manualScaleRef.current = base + 1;
    const s = resizeCanvas(canvas, manualScaleRef.current || undefined);
    setScaleToast({ value: s, until: performance.now() + 1500 });
  };

  const zoomOut = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const base =
      manualScaleRef.current ||
      calcIntegerScale(window.innerWidth, window.innerHeight);
    manualScaleRef.current = Math.max(1, base - 1);
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

      {/* Zoom buttons — always visible, click-friendly fallback */}
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
    </div>
  );
}

export default App;
