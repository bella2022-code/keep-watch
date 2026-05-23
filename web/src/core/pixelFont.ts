/**
 * Pixel font — small handcrafted bitmap for digits and a colon.
 *
 * Each glyph is 4 columns × 7 rows. 1 = pixel on, 0 = pixel off.
 * Sufficient for displaying time like "25:00".
 *
 * Real product would load a proper pixel font file; this is the placeholder.
 */

type Glyph = number[][];

const G: Record<string, Glyph> = {
  '0': [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  '1': [
    [0, 1, 1, 0],
    [1, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [1, 1, 1, 1],
  ],
  '2': [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 1],
  ],
  '3': [
    [1, 1, 1, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 1, 1, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 1, 1, 0],
  ],
  '4': [
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [1, 0, 1, 0],
    [1, 0, 1, 0],
    [1, 1, 1, 1],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
  ],
  '5': [
    [1, 1, 1, 1],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  '6': [
    [0, 1, 1, 0],
    [1, 0, 0, 0],
    [1, 0, 0, 0],
    [1, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  '7': [
    [1, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 0, 0],
  ],
  '8': [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  '9': [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 1],
    [0, 0, 0, 1],
    [0, 0, 0, 1],
    [0, 1, 1, 0],
  ],
  ':': [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0],
  ],
};

const GLYPH_W = 4;
const GLYPH_H = 7;
const SPACING = 1;

/**
 * Draws a text string of digits/colons at the given canvas pixel position.
 * `scale` lets each glyph pixel be drawn as scale × scale pixels.
 * `color` is any CSS color string.
 *
 * Returns the total width drawn (in canvas pixels).
 */
export function drawPixelText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  scale = 1
): number {
  ctx.fillStyle = color;
  let cursorX = x;

  for (const ch of text) {
    const glyph = G[ch];
    if (!glyph) {
      cursorX += (GLYPH_W + SPACING) * scale;
      continue;
    }
    for (let row = 0; row < GLYPH_H; row++) {
      for (let col = 0; col < GLYPH_W; col++) {
        if (glyph[row][col]) {
          ctx.fillRect(
            cursorX + col * scale,
            y + row * scale,
            scale,
            scale
          );
        }
      }
    }
    cursorX += (GLYPH_W + SPACING) * scale;
  }

  return cursorX - x;
}

export function measurePixelText(text: string, scale = 1): { w: number; h: number } {
  return {
    w: text.length * (GLYPH_W + SPACING) * scale - SPACING * scale,
    h: GLYPH_H * scale,
  };
}
