/**
 * Astronaut Character · Professional EVA placeholder
 *
 * Inspired by clean pixel-art reference:
 *   - Oval helmet, dark visor dominates the face, sparkle highlights
 *   - White suit with light-blue cooling tubes crossing the chest
 *   - Belt with pouches at waist
 *   - Chest harness with multi-colored indicators
 *   - Backpack with vent slits and antenna
 *
 * Floats in zero-G with subtle bob.
 */

const SUIT = '#F4EFE6';
const SUIT_SHADE = '#C8CCD4';
const SUIT_DEEP = '#9296A0';
const TUBE = '#7AAFBF';
const TUBE_SHADE = '#4F8090';
const VISOR = '#15161E';
const VISOR_SHEEN = '#5A6878';
const TRIM = '#7A8290';
const TRIM_DARK = '#3F4856';
const ACCENT_RED = '#C44536';
const ACCENT_ORANGE = '#D4A574';
const ACCENT_GREEN = '#7B9268';
const BELT = '#A89478';
const BELT_DARK = '#7D5A3D';
const OUTLINE = '#2A2128';
const HIGHLIGHT = '#F4EFE6';

export interface AstronautState {
  x: number;
  y: number;
}

export function drawAstronautDrifting(
  ctx: CanvasRenderingContext2D,
  state: AstronautState,
  timeMs: number,
  facingRight: boolean
) {
  const bobY = Math.round(Math.sin(timeMs / 700) * 2);
  drawAstronautSide(ctx, state.x, state.y + bobY, facingRight);
}

/** SIDE view. Oval helmet, cooling tubes, belt. */
function drawAstronautSide(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  facingRight: boolean
) {
  // ===== HELMET (oval, 10w x 12h) =====
  const helmetCx = cx;
  const helmetCy = cy - 16;
  ctx.fillStyle = SUIT;
  fillOval(ctx, helmetCx, helmetCy, 5, 6);

  // Visor — large dark area covering most of the helmet front
  ctx.fillStyle = VISOR;
  if (facingRight) {
    ctx.fillRect(helmetCx - 1, helmetCy - 3, 6, 7);
    ctx.fillRect(helmetCx - 2, helmetCy - 2, 7, 5);
  } else {
    ctx.fillRect(helmetCx - 5, helmetCy - 3, 6, 7);
    ctx.fillRect(helmetCx - 5, helmetCy - 2, 7, 5);
  }

  // Visor sparkle — diagonal sweep
  ctx.fillStyle = VISOR_SHEEN;
  if (facingRight) {
    ctx.fillRect(helmetCx + 3, helmetCy - 2, 1, 2);
    ctx.fillRect(helmetCx + 2, helmetCy - 1, 1, 1);
  } else {
    ctx.fillRect(helmetCx - 4, helmetCy - 2, 1, 2);
    ctx.fillRect(helmetCx - 3, helmetCy - 1, 1, 1);
  }
  ctx.fillStyle = HIGHLIGHT;
  if (facingRight) {
    ctx.fillRect(helmetCx + 3, helmetCy - 2, 1, 1);
  } else {
    ctx.fillRect(helmetCx - 4, helmetCy - 2, 1, 1);
  }

  // Helmet rim outline (oval stroke)
  ctx.fillStyle = OUTLINE;
  strokeOval(ctx, helmetCx, helmetCy, 5, 6);

  // Tiny antenna with red light
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(helmetCx + (facingRight ? -1 : 0), helmetCy - 8, 1, 2);
  ctx.fillStyle = ACCENT_RED;
  ctx.fillRect(helmetCx + (facingRight ? -1 : 0), helmetCy - 9, 1, 1);

  // ===== NECK COLLAR =====
  ctx.fillStyle = TRIM;
  ctx.fillRect(cx - 4, cy - 9, 8, 2);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 4, cy - 9, 8, 1);
  ctx.fillRect(cx - 4, cy - 7, 8, 1);

  // ===== TORSO (14w x 10h) =====
  const bodyX = cx - 7;
  const bodyY = cy - 7;
  const bodyW = 14;
  const bodyH = 10;
  ctx.fillStyle = SUIT;
  ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

  // Soft side shading
  ctx.fillStyle = SUIT_SHADE;
  if (facingRight) {
    ctx.fillRect(bodyX, bodyY + 1, 2, bodyH - 2);
  } else {
    ctx.fillRect(bodyX + bodyW - 2, bodyY + 1, 2, bodyH - 2);
  }

  // Cooling tubes — light blue diagonal lines crossing chest
  ctx.fillStyle = TUBE;
  if (facingRight) {
    ctx.fillRect(bodyX + 3, bodyY + 1, 1, 4);
    ctx.fillRect(bodyX + 4, bodyY + 4, 1, 1);
    ctx.fillRect(bodyX + 5, bodyY + 5, 1, 1);
    ctx.fillRect(bodyX + 6, bodyY + 6, 1, 1);
    ctx.fillRect(bodyX + 7, bodyY + 6, 4, 1);
  } else {
    ctx.fillRect(bodyX + bodyW - 4, bodyY + 1, 1, 4);
    ctx.fillRect(bodyX + bodyW - 5, bodyY + 4, 1, 1);
    ctx.fillRect(bodyX + bodyW - 6, bodyY + 5, 1, 1);
    ctx.fillRect(bodyX + bodyW - 7, bodyY + 6, 1, 1);
    ctx.fillRect(bodyX + bodyW - 11, bodyY + 6, 4, 1);
  }
  // Tube shadow
  ctx.fillStyle = TUBE_SHADE;
  if (facingRight) {
    ctx.fillRect(bodyX + 3, bodyY + 5, 1, 1);
    ctx.fillRect(bodyX + 10, bodyY + 7, 1, 1);
  } else {
    ctx.fillRect(bodyX + bodyW - 4, bodyY + 5, 1, 1);
    ctx.fillRect(bodyX + bodyW - 11, bodyY + 7, 1, 1);
  }

  // Chest control panel (small rectangle on opposite side from cooling tube)
  const panelX = facingRight ? bodyX + 8 : bodyX + 3;
  const panelY = bodyY + 2;
  ctx.fillStyle = TRIM_DARK;
  ctx.fillRect(panelX, panelY, 3, 3);
  ctx.fillStyle = ACCENT_GREEN;
  ctx.fillRect(panelX, panelY, 1, 1);
  ctx.fillStyle = ACCENT_ORANGE;
  ctx.fillRect(panelX + 2, panelY, 1, 1);
  ctx.fillStyle = ACCENT_RED;
  ctx.fillRect(panelX + 1, panelY + 2, 1, 1);

  // Torso outline
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX, bodyY, bodyW, 1);
  ctx.fillRect(bodyX, bodyY + bodyH - 1, bodyW, 1);
  ctx.fillRect(bodyX, bodyY, 1, bodyH);
  ctx.fillRect(bodyX + bodyW - 1, bodyY, 1, bodyH);

  // ===== BELT (tan + buckle) =====
  const beltY = cy + 3;
  ctx.fillStyle = BELT;
  ctx.fillRect(bodyX, beltY, bodyW, 2);
  ctx.fillStyle = BELT_DARK;
  ctx.fillRect(bodyX, beltY + 1, bodyW, 1);
  // Buckle
  ctx.fillStyle = ACCENT_ORANGE;
  ctx.fillRect(cx - 1, beltY, 2, 2);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX, beltY, bodyW, 1);
  ctx.fillRect(bodyX, beltY + 2, bodyW, 1);
  // Small pouch on facing side
  ctx.fillStyle = BELT_DARK;
  if (facingRight) {
    ctx.fillRect(bodyX + bodyW - 4, beltY + 2, 3, 2);
  } else {
    ctx.fillRect(bodyX + 1, beltY + 2, 3, 2);
  }
  ctx.fillStyle = OUTLINE;
  if (facingRight) {
    ctx.fillRect(bodyX + bodyW - 4, beltY + 2, 3, 1);
    ctx.fillRect(bodyX + bodyW - 4, beltY + 4, 3, 1);
  } else {
    ctx.fillRect(bodyX + 1, beltY + 2, 3, 1);
    ctx.fillRect(bodyX + 1, beltY + 4, 3, 1);
  }

  // ===== BACKPACK (PLSS) =====
  const packX = facingRight ? bodyX - 3 : bodyX + bodyW;
  ctx.fillStyle = SUIT_DEEP;
  ctx.fillRect(packX, bodyY + 1, 3, bodyH - 2);
  // Vents
  ctx.fillStyle = TRIM_DARK;
  ctx.fillRect(packX + 1, bodyY + 3, 1, 1);
  ctx.fillRect(packX + 1, bodyY + 5, 1, 1);
  ctx.fillRect(packX + 1, bodyY + 7, 1, 1);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(packX, bodyY + 1, 1, bodyH - 2);
  ctx.fillRect(packX + 2, bodyY + 1, 1, bodyH - 2);

  // Life-support cable
  ctx.fillStyle = OUTLINE;
  if (facingRight) {
    ctx.fillRect(helmetCx - 5, helmetCy + 4, 1, 1);
    ctx.fillRect(helmetCx - 6, helmetCy + 5, 1, 1);
    ctx.fillRect(helmetCx - 7, helmetCy + 6, 1, 1);
  } else {
    ctx.fillRect(helmetCx + 5, helmetCy + 4, 1, 1);
    ctx.fillRect(helmetCx + 6, helmetCy + 5, 1, 1);
    ctx.fillRect(helmetCx + 7, helmetCy + 6, 1, 1);
  }

  // ===== ARMS =====
  ctx.fillStyle = SUIT;
  ctx.fillRect(bodyX - 1, bodyY + 4, 2, 4);
  ctx.fillRect(bodyX + bodyW - 1, bodyY + 4, 2, 4);
  // Glove cuffs
  ctx.fillStyle = TUBE;
  ctx.fillRect(bodyX - 1, bodyY + 7, 2, 1);
  ctx.fillRect(bodyX + bodyW - 1, bodyY + 7, 2, 1);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX - 1, bodyY + 4, 1, 4);
  ctx.fillRect(bodyX + bodyW, bodyY + 4, 1, 4);

  // ===== LEGS =====
  const legY = beltY + 3;
  ctx.fillStyle = SUIT;
  ctx.fillRect(bodyX + 2, legY, 4, 5);
  ctx.fillRect(bodyX + bodyW - 6, legY, 4, 5);
  // Knee detail
  ctx.fillStyle = SUIT_SHADE;
  ctx.fillRect(bodyX + 2, legY + 2, 4, 1);
  ctx.fillRect(bodyX + bodyW - 6, legY + 2, 4, 1);
  // Boot tops
  ctx.fillStyle = TUBE;
  ctx.fillRect(bodyX + 2, legY + 4, 4, 1);
  ctx.fillRect(bodyX + bodyW - 6, legY + 4, 4, 1);
  // Boots dark
  ctx.fillStyle = TRIM_DARK;
  ctx.fillRect(bodyX + 2, legY + 5, 4, 1);
  ctx.fillRect(bodyX + bodyW - 6, legY + 5, 4, 1);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX + 2, legY, 1, 6);
  ctx.fillRect(bodyX + 5, legY, 1, 6);
  ctx.fillRect(bodyX + bodyW - 6, legY, 1, 6);
  ctx.fillRect(bodyX + bodyW - 3, legY, 1, 6);
}

/** FRONT view — full detail showcase. */
export function drawAstronautFacingCamera(
  ctx: CanvasRenderingContext2D,
  state: AstronautState,
  timeMs: number
) {
  const bobY = Math.round(Math.sin(timeMs / 800) * 2);
  const cx = state.x;
  const cy = state.y + bobY;

  // ===== HELMET (oval, 14w x 16h) =====
  const helmetCy = cy - 16;
  ctx.fillStyle = SUIT;
  fillOval(ctx, cx, helmetCy, 7, 8);

  // Visor — huge dark plate
  ctx.fillStyle = VISOR;
  ctx.fillRect(cx - 5, helmetCy - 4, 10, 9);
  ctx.fillRect(cx - 6, helmetCy - 3, 12, 7);
  ctx.fillRect(cx - 4, helmetCy - 5, 8, 1);
  ctx.fillRect(cx - 4, helmetCy + 5, 8, 1);

  // Visor sheen — diagonal sweep across top-left
  ctx.fillStyle = VISOR_SHEEN;
  ctx.fillRect(cx - 5, helmetCy - 3, 1, 3);
  ctx.fillRect(cx - 4, helmetCy - 2, 1, 2);
  ctx.fillRect(cx - 3, helmetCy - 1, 1, 1);
  // Bright sparkle
  ctx.fillStyle = HIGHLIGHT;
  ctx.fillRect(cx - 5, helmetCy - 3, 1, 1);
  ctx.fillRect(cx - 4, helmetCy - 2, 1, 1);

  // Helmet outline
  ctx.fillStyle = OUTLINE;
  strokeOval(ctx, cx, helmetCy, 7, 8);

  // Two small antennas
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 4, helmetCy - 9, 1, 2);
  ctx.fillRect(cx + 3, helmetCy - 9, 1, 2);
  ctx.fillStyle = ACCENT_RED;
  ctx.fillRect(cx - 4, helmetCy - 10, 1, 1);
  ctx.fillRect(cx + 3, helmetCy - 10, 1, 1);

  // ===== NECK COLLAR =====
  ctx.fillStyle = TRIM;
  ctx.fillRect(cx - 5, cy - 9, 10, 2);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 5, cy - 9, 10, 1);
  ctx.fillRect(cx - 5, cy - 7, 10, 1);

  // ===== TORSO (16w x 12h) =====
  const bodyX = cx - 8;
  const bodyY = cy - 7;
  const bodyW = 16;
  const bodyH = 12;
  ctx.fillStyle = SUIT;
  ctx.fillRect(bodyX, bodyY, bodyW, bodyH);

  // Side shading
  ctx.fillStyle = SUIT_SHADE;
  ctx.fillRect(bodyX, bodyY + 1, 2, bodyH - 2);
  ctx.fillRect(bodyX + bodyW - 2, bodyY + 1, 2, bodyH - 2);

  // ===== COOLING TUBES (light blue, crossing X pattern on chest) =====
  ctx.fillStyle = TUBE;
  // Left-shoulder to right-hip diagonal
  ctx.fillRect(bodyX + 3, bodyY + 1, 1, 1);
  ctx.fillRect(bodyX + 4, bodyY + 2, 1, 1);
  ctx.fillRect(bodyX + 5, bodyY + 3, 1, 1);
  ctx.fillRect(bodyX + 6, bodyY + 4, 1, 1);
  ctx.fillRect(bodyX + 7, bodyY + 5, 2, 1);
  ctx.fillRect(bodyX + 9, bodyY + 6, 1, 1);
  ctx.fillRect(bodyX + 10, bodyY + 7, 1, 1);
  ctx.fillRect(bodyX + 11, bodyY + 8, 1, 1);
  // Right-shoulder to left-hip diagonal
  ctx.fillRect(bodyX + bodyW - 4, bodyY + 1, 1, 1);
  ctx.fillRect(bodyX + bodyW - 5, bodyY + 2, 1, 1);
  ctx.fillRect(bodyX + bodyW - 6, bodyY + 3, 1, 1);
  ctx.fillRect(bodyX + bodyW - 7, bodyY + 4, 1, 1);
  ctx.fillRect(bodyX + bodyW - 12, bodyY + 7, 1, 1);
  ctx.fillRect(bodyX + bodyW - 13, bodyY + 8, 1, 1);

  // Cooling tube shadows
  ctx.fillStyle = TUBE_SHADE;
  ctx.fillRect(bodyX + 7, bodyY + 6, 2, 1);
  ctx.fillRect(bodyX + bodyW - 12, bodyY + 6, 1, 1);

  // ===== CHEST PANEL (centered, where tubes cross) =====
  const panelX = bodyX + 6;
  const panelY = bodyY + 4;
  const panelW = 4;
  const panelH = 3;
  ctx.fillStyle = TRIM_DARK;
  ctx.fillRect(panelX, panelY, panelW, panelH);
  // Indicator lights
  ctx.fillStyle = ACCENT_GREEN;
  ctx.fillRect(panelX, panelY, 1, 1);
  ctx.fillStyle = ACCENT_ORANGE;
  ctx.fillRect(panelX + 2, panelY, 1, 1);
  ctx.fillStyle = ACCENT_RED;
  ctx.fillRect(panelX + 1, panelY + 2, 1, 1);
  ctx.fillStyle = HIGHLIGHT;
  ctx.fillRect(panelX + 3, panelY + 2, 1, 1);

  // ===== TORSO OUTLINE =====
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX, bodyY, bodyW, 1);
  ctx.fillRect(bodyX, bodyY + bodyH - 1, bodyW, 1);
  ctx.fillRect(bodyX, bodyY, 1, bodyH);
  ctx.fillRect(bodyX + bodyW - 1, bodyY, 1, bodyH);

  // ===== BELT (tan with central buckle + side pouches) =====
  const beltY = bodyY + bodyH;
  ctx.fillStyle = BELT;
  ctx.fillRect(bodyX, beltY, bodyW, 3);
  ctx.fillStyle = BELT_DARK;
  ctx.fillRect(bodyX, beltY + 2, bodyW, 1);
  // Buckle
  ctx.fillStyle = ACCENT_ORANGE;
  ctx.fillRect(cx - 1, beltY, 2, 3);
  ctx.fillStyle = HIGHLIGHT;
  ctx.fillRect(cx - 1, beltY, 1, 1);
  // Outline
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX, beltY, bodyW, 1);
  ctx.fillRect(bodyX, beltY + 3, bodyW, 1);
  // Pouches on each side of belt
  ctx.fillStyle = BELT_DARK;
  ctx.fillRect(bodyX + 1, beltY + 3, 3, 3);
  ctx.fillRect(bodyX + bodyW - 4, beltY + 3, 3, 3);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX + 1, beltY + 3, 3, 1);
  ctx.fillRect(bodyX + 1, beltY + 6, 3, 1);
  ctx.fillRect(bodyX + 1, beltY + 3, 1, 4);
  ctx.fillRect(bodyX + 3, beltY + 3, 1, 4);
  ctx.fillRect(bodyX + bodyW - 4, beltY + 3, 3, 1);
  ctx.fillRect(bodyX + bodyW - 4, beltY + 6, 3, 1);
  ctx.fillRect(bodyX + bodyW - 4, beltY + 3, 1, 4);
  ctx.fillRect(bodyX + bodyW - 2, beltY + 3, 1, 4);

  // ===== ARMS =====
  ctx.fillStyle = SUIT;
  ctx.fillRect(bodyX - 3, bodyY + 4, 3, 6);
  ctx.fillRect(bodyX + bodyW, bodyY + 4, 3, 6);
  // Glove cuffs (blue ring like cooling system)
  ctx.fillStyle = TUBE;
  ctx.fillRect(bodyX - 3, bodyY + 8, 3, 1);
  ctx.fillRect(bodyX + bodyW, bodyY + 8, 3, 1);
  // Gloves (slightly darker)
  ctx.fillStyle = SUIT_SHADE;
  ctx.fillRect(bodyX - 3, bodyY + 9, 3, 2);
  ctx.fillRect(bodyX + bodyW, bodyY + 9, 3, 2);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX - 3, bodyY + 4, 1, 7);
  ctx.fillRect(bodyX - 3, bodyY + 10, 3, 1);
  ctx.fillRect(bodyX + bodyW + 2, bodyY + 4, 1, 7);
  ctx.fillRect(bodyX + bodyW, bodyY + 10, 3, 1);

  // ===== LEGS / BOOTS =====
  const legY = beltY + 6;
  ctx.fillStyle = SUIT;
  ctx.fillRect(bodyX + 2, legY, 4, 4);
  ctx.fillRect(bodyX + bodyW - 6, legY, 4, 4);
  // Boot tops
  ctx.fillStyle = TUBE;
  ctx.fillRect(bodyX + 2, legY + 3, 4, 1);
  ctx.fillRect(bodyX + bodyW - 6, legY + 3, 4, 1);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX + 2, legY, 1, 4);
  ctx.fillRect(bodyX + 5, legY, 1, 4);
  ctx.fillRect(bodyX + bodyW - 6, legY, 1, 4);
  ctx.fillRect(bodyX + bodyW - 3, legY, 1, 4);

  // ===== BACKPACK PEEKING (behind shoulders) =====
  ctx.fillStyle = SUIT_DEEP;
  ctx.fillRect(bodyX + 1, bodyY - 1, 4, 1);
  ctx.fillRect(bodyX + bodyW - 5, bodyY - 1, 4, 1);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX + 1, bodyY - 1, 4, 1);
  ctx.fillRect(bodyX + bodyW - 5, bodyY - 1, 4, 1);
}

/** Filled oval using rectangles (no antialiasing). */
function fillOval(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) {
  for (let dy = -ry; dy <= ry; dy++) {
    // ellipse equation: (x/rx)^2 + (y/ry)^2 = 1
    const widthFraction = Math.sqrt(1 - (dy * dy) / (ry * ry));
    const w = Math.round(rx * widthFraction);
    ctx.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
  }
}

function strokeOval(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number
) {
  // Draw oval outline using stroke-like effect (compare scan widths)
  let prevW = -1;
  for (let dy = -ry - 1; dy <= ry + 1; dy++) {
    const widthFraction =
      dy * dy >= ry * ry ? 0 : Math.sqrt(1 - (dy * dy) / (ry * ry));
    const w = Math.round(rx * widthFraction);
    if (w === 0 && prevW === 0) {
      prevW = w;
      continue;
    }
    if (prevW < 0) {
      // first row
      ctx.fillRect(cx - w, cy + dy, w * 2 + 1, 1);
    } else if (w > prevW) {
      // expanding row — fill new edges
      ctx.fillRect(cx - w, cy + dy, w - prevW + 1, 1);
      ctx.fillRect(cx + prevW, cy + dy, w - prevW + 1, 1);
    } else if (w < prevW) {
      // shrinking row — close previous row's overhang
      ctx.fillRect(cx - prevW, cy + dy - 1, prevW - w + 1, 1);
      ctx.fillRect(cx + w, cy + dy - 1, prevW - w + 1, 1);
    } else {
      // same row — outline at sides
      ctx.fillRect(cx - w, cy + dy, 1, 1);
      ctx.fillRect(cx + w, cy + dy, 1, 1);
    }
    prevW = w;
  }
}
