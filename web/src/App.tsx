import { useEffect, useRef } from 'react';
import {
  setupPixelCanvas,
  resizeCanvas,
  NATIVE_WIDTH,
  NATIVE_HEIGHT,
} from './core/canvas';
import { drawMouseCage } from './scenes/MouseCage';
import { drawMouse, drawHalo, type MouseState } from './characters/Mouse';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(performance.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { ctx } = setupPixelCanvas(canvas);
    resizeCanvas(canvas);

    const mouseState: MouseState = {
      x: Math.floor(NATIVE_WIDTH / 2),
      y: Math.floor(NATIVE_HEIGHT * 0.85), // feet at ~85% down
    };

    const onResize = () => resizeCanvas(canvas);
    window.addEventListener('resize', onResize);

    const render = () => {
      const t = performance.now() - startTimeRef.current;

      // 1. Scene background
      drawMouseCage(ctx);

      // 2. Halo behind character (interactive indicator)
      drawHalo(ctx, mouseState, t);

      // 3. Character
      drawMouse(ctx, mouseState, t);

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-kw-black">
      <canvas
        ref={canvasRef}
        className="block"
        aria-label="Keep Watch — Mouse Cage scene"
      />
    </div>
  );
}

export default App;
