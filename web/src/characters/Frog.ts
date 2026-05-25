/**
 * Frog Character · v4 (full rewrite)
 *
 * Design principle: the FACE is a clearly distinct area between the eyes.
 * The mouth is on that face area, at the SAME LEVEL as the eye pupils.
 * Body is a soft hump shape below the head.
 *
 * Layout:
 *
 *   .  E E  .  .  .  E E  .       eye bulges (top)
 *   E E . E E E E E . E E         eye whites + face seam
 *   E W P E F F F E W P E         pupils + face area (M = mouth row)
 *   .  E E E F M F E E E .        mouth on face
 *   . B B B B B B B B B B .       body row 1
 *   B B B B B B B B B B B         body widest
 *   B B B B B B B B B B B
 *   B B b b b b b b B B B         belly hint
 *   . B B b b b b b B B .
 *   . . B B B B B B . .           bottom taper
 *   . . F F . . F F . .           front feet
 */

const BODY = '#6B8B57';
const BODY_DARK = '#4A6038';
const BELLY = '#B8CFA0';
const EYE_WHITE = '#F4EFE6';
const PUPIL = '#2A2128';
const MOUTH = '#2A2128';
const THROAT = '#D8A574';
const OUTLINE = '#3A4530';
const CHEEK = 'rgba(232, 155, 170, 0.45)';

export interface FrogState {
  x: number;
  y: number;
}

export function drawFrogIdle(
  ctx: CanvasRenderingContext2D,
  state: FrogState,
  timeMs: number,
  facingRight: boolean
) {
  const blinkCycle = timeMs % 3500;
  const blinking = blinkCycle < 120;
  const croakCycle = timeMs % 6000;
  const croaking = croakCycle > 5400;
  drawFrog(ctx, state.x, state.y, facingRight, blinking, croaking);
}

function drawFrog(
  ctx: CanvasRenderingContext2D,
  cx: number,
  feetY: number,
  facingRight: boolean,
  blinking: boolean,
  croaking: boolean
) {
  // Vertical layout (from feetY upward):
  //   feetY .. feetY-1 : feet line
  //   feetY-9 .. feetY-1 : body (9 rows)
  //   feetY-13 .. feetY-9 : head face area (4 rows including eye level)
  //   feetY-15 .. feetY-13 : eye bulges peak (2 rows)
  // So head is at the top, body below.

  const bodyTop = feetY - 9;
  const headTop = feetY - 13;
  const bulgeTop = feetY - 15;

  // ===== DROP SHADOW =====
  ctx.fillStyle = 'rgba(42, 33, 40, 0.3)';
  ctx.fillRect(cx - 10, feetY, 21, 1);

  // ===== HEAD AREA =====
  // One continuous face block (so the gap between eyes is filled, giving
  // the mouth a surface to sit on). The "bulges" are just small crowns
  // extending above the block — visual illusion of separate bulges comes
  // from the eye whites/pupils drawn inside.
  const headW = 14;
  const headX = cx - headW / 2;

  const leftBulgeX = headX + 1;          // x = cx-6
  const rightBulgeX = headX + headW - 5; // x = cx+2
  const bulgeW = 4;

  // Continuous head/face block (includes bulge level + face below)
  ctx.fillStyle = BODY;
  ctx.fillRect(headX, bulgeTop, headW, headTop + 4 - bulgeTop);

  // Bulge crown rows (extending above the block)
  ctx.fillRect(leftBulgeX + 1, bulgeTop - 1, 2, 1);
  ctx.fillRect(rightBulgeX + 1, bulgeTop - 1, 2, 1);

  // ===== BODY HUMP =====
  // Body widths from top to bottom
  const bodyShape = [11, 12, 12, 12, 12, 11, 10, 9, 7];
  for (let row = 0; row < bodyShape.length; row++) {
    const half = bodyShape[row];
    ctx.fillRect(cx - half, bodyTop + row, half * 2 + 1, 1);
  }

  // ===== BELLY (lighter front, lower portion of body) =====
  ctx.fillStyle = BELLY;
  if (croaking) {
    // Puffed belly
    for (let row = 3; row < bodyShape.length - 1; row++) {
      const half = bodyShape[row] - 1;
      ctx.fillRect(cx - half, bodyTop + row, half * 2 + 1, 1);
    }
  } else {
    ctx.fillRect(cx - 6, bodyTop + 5, 13, 1);
    ctx.fillRect(cx - 5, bodyTop + 6, 11, 1);
    ctx.fillRect(cx - 4, bodyTop + 7, 9, 1);
  }

  // ===== OUTLINE =====
  ctx.fillStyle = OUTLINE;
  // Eye bulge crowns
  ctx.fillRect(leftBulgeX + 1, bulgeTop - 2, 2, 1);
  ctx.fillRect(rightBulgeX + 1, bulgeTop - 2, 2, 1);
  // Bulge corners (where crown meets the head block)
  ctx.fillRect(leftBulgeX, bulgeTop - 1, 1, 1);
  ctx.fillRect(leftBulgeX + bulgeW - 1, bulgeTop - 1, 1, 1);
  ctx.fillRect(rightBulgeX, bulgeTop - 1, 1, 1);
  ctx.fillRect(rightBulgeX + bulgeW - 1, bulgeTop - 1, 1, 1);

  // Top edge of head block — fills the gap between bulges + outer sides
  const gapStart = leftBulgeX + bulgeW; // cx-2
  const gapEnd = rightBulgeX - 1;       // cx+1
  ctx.fillRect(gapStart, bulgeTop - 1, gapEnd - gapStart + 1, 1);
  ctx.fillRect(headX, bulgeTop - 1, leftBulgeX - headX, 1);
  ctx.fillRect(rightBulgeX + bulgeW, bulgeTop - 1, headX + headW - rightBulgeX - bulgeW, 1);

  // Head left/right edges (spans bulge level + face level)
  ctx.fillRect(headX - 1, bulgeTop, 1, headTop + 4 - bulgeTop);
  ctx.fillRect(headX + headW, bulgeTop, 1, headTop + 4 - bulgeTop);

  // Body outline
  for (let row = 0; row < bodyShape.length; row++) {
    const half = bodyShape[row];
    ctx.fillRect(cx - half - 1, bodyTop + row, 1, 1);
    ctx.fillRect(cx + half + 1, bodyTop + row, 1, 1);
  }
  // Bottom outline
  const lastHalf = bodyShape[bodyShape.length - 1];
  ctx.fillRect(cx - lastHalf, bodyTop + bodyShape.length, lastHalf * 2 + 1, 1);

  // ===== EYES (inside bulges) =====
  // Eye whites 2×2 centered in each bulge (bulge is 4×2 + 1 crown = effectively 5×3 visible)
  if (blinking) {
    ctx.fillStyle = PUPIL;
    ctx.fillRect(leftBulgeX + 1, bulgeTop + 1, 2, 1);
    ctx.fillRect(rightBulgeX + 1, bulgeTop + 1, 2, 1);
  } else {
    ctx.fillStyle = EYE_WHITE;
    ctx.fillRect(leftBulgeX + 1, bulgeTop, 2, 2);
    ctx.fillRect(rightBulgeX + 1, bulgeTop, 2, 2);
    ctx.fillStyle = PUPIL;
    const dx = facingRight ? 1 : 0;
    ctx.fillRect(leftBulgeX + 1 + dx, bulgeTop, 1, 2);
    ctx.fillRect(rightBulgeX + 1 + dx, bulgeTop, 1, 2);
  }

  // ===== MOUTH — BETWEEN THE EYES, AT EYE LEVEL =====
  // Eyes whites span y = bulgeTop to bulgeTop+1.
  // Place mouth horizontal line on the FACE BLOCK between the eyes,
  // at the same vertical position as the bottom of the eye whites.
  ctx.fillStyle = MOUTH;
  // Main mouth line — between the two eyes, on the gap (x = cx-1 to cx+1)
  ctx.fillRect(cx - 1, bulgeTop + 1, 3, 1);
  // Smile corners curling UP — one row above mouth, just at the edges of the gap
  ctx.fillRect(cx - 2, bulgeTop, 1, 1);
  ctx.fillRect(cx + 2, bulgeTop, 1, 1);

  // ===== CHEEK BLUSH =====
  ctx.fillStyle = CHEEK;
  ctx.fillRect(headX, headTop + 2, 1, 1);
  ctx.fillRect(headX + headW - 1, headTop + 2, 1, 1);

  // ===== THROAT (croak only) =====
  if (croaking) {
    ctx.fillStyle = THROAT;
    ctx.fillRect(cx - 4, feetY - 2, 8, 3);
    ctx.fillRect(cx - 3, feetY + 1, 6, 1);
    ctx.fillStyle = OUTLINE;
    ctx.fillRect(cx - 5, feetY - 1, 1, 2);
    ctx.fillRect(cx + 4, feetY - 1, 1, 2);
    ctx.fillRect(cx - 4, feetY + 1, 8, 1);
    ctx.fillRect(cx - 3, feetY + 2, 6, 1);
  }

  // ===== FRONT FEET =====
  ctx.fillStyle = BODY;
  ctx.fillRect(cx - 9, feetY - 1, 3, 2);
  ctx.fillRect(cx + 6, feetY - 1, 3, 2);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 10, feetY - 1, 1, 2);
  ctx.fillRect(cx + 9, feetY - 1, 1, 2);
  ctx.fillRect(cx - 9, feetY + 1, 3, 1);
  ctx.fillRect(cx + 6, feetY + 1, 3, 1);
  ctx.fillStyle = BODY_DARK;
  ctx.fillRect(cx - 8, feetY, 1, 1);
  ctx.fillRect(cx + 7, feetY, 1, 1);
}
