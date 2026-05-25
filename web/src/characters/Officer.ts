/**
 * Officer Character · Placeholder (enlarged)
 *
 * Military uniform with deliberately relaxed body language — the
 * "soft watch" contrast that anchors the whole product.
 *
 * Per spec docs/02-characters-companions.md §2.1:
 *   Idle pose: hand on hip, head tilted
 *   NEVER attention pose, NEVER stiff salute as idle
 *   Pink heart on the back of the card during the signature flip
 */

const UNIFORM = '#5C6B4F';
const UNIFORM_SHADE = '#4A5640';
const UNIFORM_HIGHLIGHT = '#778A65';
const CAP = '#3A4530';
const CAP_BRIM = '#2A2128';
const BADGE = '#D4A574';
const BADGE_DEEP = '#A07B40';
const SKIN = '#F4D8C0';
const SKIN_SHADE = '#D9B89E';
const HAIR = '#3A2820';
const BOOTS = '#2A2128';
const BOOT_SHINE = '#4A4248';
const BELT = '#3A2820';
const BELT_BUCKLE = '#D4A574';
const OUTLINE = '#2A2128';

// === Enlarged dimensions (~30% bigger than v1) ===
const HEAD_W = 10;
const HEAD_H = 11; // total head height including cap
const BODY_W = 18;
const BODY_H = 14;
const BELT_H = 3;
const PANTS_H = 6;
const BOOTS_H = 4;
// Total character height = HEAD_H + BODY_H + BELT_H + PANTS_H + BOOTS_H = 38

const FRONT_HEAD_W = 12;
const FRONT_HEAD_H = 13;
const FRONT_BODY_W = 22;
const FRONT_BODY_H = 16;
const FRONT_BELT_H = 3;
const FRONT_PANTS_H = 7;
const FRONT_BOOTS_H = 5;

export interface OfficerState {
  x: number;
  y: number;
}

export function drawOfficerIdle(
  ctx: CanvasRenderingContext2D,
  state: OfficerState,
  timeMs: number,
  facingRight: boolean
) {
  const breath = Math.sin(timeMs / 900) > 0 ? 1 : 0;
  drawOfficerSide(ctx, state.x, state.y, facingRight, breath, false);
}

export function drawOfficerWalking(
  ctx: CanvasRenderingContext2D,
  state: OfficerState,
  timeMs: number,
  facingRight: boolean
) {
  const walkFrame = Math.floor(timeMs / 200) % 4;
  const bob = walkFrame === 1 || walkFrame === 3 ? -1 : 0;
  drawOfficerSide(ctx, state.x, state.y + bob, facingRight, 0, true, walkFrame);
}

export function drawOfficerSalute(
  ctx: CanvasRenderingContext2D,
  state: OfficerState,
  facingRight: boolean
) {
  drawOfficerSide(ctx, state.x, state.y, facingRight, 0, false);
  // Add saluting arm — diagonal arm going up to brow
  const cx = state.x;
  const bodyY = state.y - BODY_H - BELT_H - PANTS_H - BOOTS_H;
  ctx.fillStyle = UNIFORM;
  if (facingRight) {
    ctx.fillRect(cx + 7, bodyY + 1, 2, 3);
    ctx.fillRect(cx + 8, bodyY - 2, 2, 3);
    ctx.fillRect(cx + 9, bodyY - 4, 2, 2);
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx + 10, bodyY - 5, 2, 1);
  } else {
    ctx.fillRect(cx - 9, bodyY + 1, 2, 3);
    ctx.fillRect(cx - 10, bodyY - 2, 2, 3);
    ctx.fillRect(cx - 11, bodyY - 4, 2, 2);
    ctx.fillStyle = SKIN;
    ctx.fillRect(cx - 12, bodyY - 5, 2, 1);
  }
}

function drawOfficerSide(
  ctx: CanvasRenderingContext2D,
  cx: number,
  feetY: number,
  facingRight: boolean,
  breath: number,
  walking: boolean,
  walkFrame: number = 0
) {
  // Bottom-up: boots → pants → belt → body → head
  const bootsTop = feetY - BOOTS_H;
  const pantsTop = bootsTop - PANTS_H;
  const beltTop = pantsTop - BELT_H;
  const bodyTop = beltTop - BODY_H + breath;
  const headBottom = bodyTop;
  const headTop = headBottom - HEAD_H;

  // ============ HEAD ============
  const headX = cx - HEAD_W / 2;
  // Skin face area (below cap)
  ctx.fillStyle = SKIN;
  ctx.fillRect(headX, headTop + 4, HEAD_W, HEAD_H - 4);
  ctx.fillRect(headX + 1, headTop + 3, HEAD_W - 2, HEAD_H - 3);

  // Hair sliver on back of head
  ctx.fillStyle = HAIR;
  if (facingRight) {
    ctx.fillRect(headX, headTop + 4, 1, 4);
  } else {
    ctx.fillRect(headX + HEAD_W - 1, headTop + 4, 1, 4);
  }

  // Skin shading on back side
  ctx.fillStyle = SKIN_SHADE;
  if (facingRight) {
    ctx.fillRect(headX, headTop + 5, 1, 4);
  } else {
    ctx.fillRect(headX + HEAD_W - 1, headTop + 5, 1, 4);
  }

  // Cap (deep olive) — sits on top of head
  ctx.fillStyle = CAP;
  ctx.fillRect(headX, headTop, HEAD_W, 3);
  ctx.fillRect(headX - 1, headTop + 1, HEAD_W + 2, 2);

  // Cap brim (extends forward on facing side)
  ctx.fillStyle = CAP_BRIM;
  if (facingRight) {
    ctx.fillRect(headX + 3, headTop + 3, HEAD_W, 1);
  } else {
    ctx.fillRect(headX - 1, headTop + 3, HEAD_W, 1);
  }

  // Cap badge (centered, gold)
  ctx.fillStyle = BADGE;
  ctx.fillRect(cx - 1, headTop, 2, 2);
  ctx.fillStyle = BADGE_DEEP;
  ctx.fillRect(cx, headTop + 1, 1, 1);

  // Cap outline
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(headX, headTop, HEAD_W, 1);
  ctx.fillRect(headX - 1, headTop + 1, 1, 2);
  ctx.fillRect(headX + HEAD_W, headTop + 1, 1, 2);

  // Face features — eye + half-lid + small smile
  ctx.fillStyle = OUTLINE;
  if (facingRight) {
    ctx.fillRect(headX + 6, headTop + 5, 1, 2); // eye (2px tall for visibility)
    ctx.fillRect(headX + 7, headTop + 8, 2, 1); // mouth
    ctx.fillRect(headX + 5, headTop + 5, 1, 1); // brow / half-lid
  } else {
    ctx.fillRect(headX + 3, headTop + 5, 1, 2);
    ctx.fillRect(headX + 1, headTop + 8, 2, 1);
    ctx.fillRect(headX + 4, headTop + 5, 1, 1);
  }

  // Cheek blush
  ctx.fillStyle = 'rgba(232, 155, 170, 0.5)';
  if (facingRight) {
    ctx.fillRect(headX + 8, headTop + 7, 1, 1);
  } else {
    ctx.fillRect(headX + 1, headTop + 7, 1, 1);
  }

  // ============ NECK ============
  ctx.fillStyle = SKIN;
  ctx.fillRect(cx - 2, headTop + HEAD_H, 4, 1);

  // ============ TORSO ============
  const bodyX = cx - BODY_W / 2;
  ctx.fillStyle = UNIFORM;
  ctx.fillRect(bodyX, bodyTop, BODY_W, BODY_H);

  // Subtle shading
  ctx.fillStyle = UNIFORM_SHADE;
  if (facingRight) {
    ctx.fillRect(bodyX, bodyTop + 1, 2, BODY_H - 2);
  } else {
    ctx.fillRect(bodyX + BODY_W - 2, bodyTop + 1, 2, BODY_H - 2);
  }

  // Highlight on facing side
  ctx.fillStyle = UNIFORM_HIGHLIGHT;
  if (facingRight) {
    ctx.fillRect(bodyX + BODY_W - 1, bodyTop + 1, 1, BODY_H - 2);
  } else {
    ctx.fillRect(bodyX, bodyTop + 1, 1, BODY_H - 2);
  }

  // Chest insignia (badge on front of uniform)
  ctx.fillStyle = BADGE;
  ctx.fillRect(bodyX + 3, bodyTop + 3, 3, 3);
  ctx.fillStyle = BADGE_DEEP;
  ctx.fillRect(bodyX + 3, bodyTop + 5, 3, 1);

  // Chest pocket flap
  ctx.fillStyle = UNIFORM_SHADE;
  ctx.fillRect(bodyX + 9, bodyTop + 3, 6, 3);
  ctx.fillStyle = BADGE;
  ctx.fillRect(bodyX + 13, bodyTop + 4, 1, 1);

  // Vertical button row (down middle)
  ctx.fillStyle = BADGE;
  ctx.fillRect(bodyX + 8, bodyTop + 4, 1, 1);
  ctx.fillRect(bodyX + 8, bodyTop + 8, 1, 1);
  ctx.fillRect(bodyX + 8, bodyTop + 12, 1, 1);

  // Outline
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX, bodyTop, BODY_W, 1);
  ctx.fillRect(bodyX, bodyTop + BODY_H - 1, BODY_W, 1);
  ctx.fillRect(bodyX, bodyTop, 1, BODY_H);
  ctx.fillRect(bodyX + BODY_W - 1, bodyTop, 1, BODY_H);

  // ============ BELT ============
  ctx.fillStyle = BELT;
  ctx.fillRect(bodyX, beltTop, BODY_W, BELT_H);
  ctx.fillStyle = BELT_BUCKLE;
  ctx.fillRect(cx - 1, beltTop, 2, BELT_H);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX, beltTop, BODY_W, 1);
  ctx.fillRect(bodyX, beltTop + BELT_H - 1, BODY_W, 1);

  // ============ PANTS ============
  ctx.fillStyle = UNIFORM;
  ctx.fillRect(bodyX + 1, pantsTop, BODY_W - 2, PANTS_H);
  // Side shading
  ctx.fillStyle = UNIFORM_SHADE;
  if (facingRight) {
    ctx.fillRect(bodyX + 1, pantsTop, 1, PANTS_H);
  } else {
    ctx.fillRect(bodyX + BODY_W - 2, pantsTop, 1, PANTS_H);
  }
  // Inseam line
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx, pantsTop, 1, PANTS_H);
  ctx.fillRect(bodyX + 1, pantsTop, 1, PANTS_H);
  ctx.fillRect(bodyX + BODY_W - 2, pantsTop, 1, PANTS_H);

  // ============ BOOTS ============
  ctx.fillStyle = BOOTS;
  if (walking) {
    if (walkFrame === 0 || walkFrame === 2) {
      ctx.fillRect(bodyX + 2, bootsTop, 4, BOOTS_H);
      ctx.fillRect(bodyX + BODY_W - 6, bootsTop, 4, BOOTS_H);
    } else if (walkFrame === 1) {
      ctx.fillRect(bodyX + 1, bootsTop, 4, BOOTS_H);
      ctx.fillRect(bodyX + BODY_W - 5, bootsTop, 4, BOOTS_H);
    } else {
      ctx.fillRect(bodyX + 3, bootsTop, 4, BOOTS_H);
      ctx.fillRect(bodyX + BODY_W - 7, bootsTop, 4, BOOTS_H);
    }
  } else {
    ctx.fillRect(bodyX + 2, bootsTop, 4, BOOTS_H);
    ctx.fillRect(bodyX + BODY_W - 6, bootsTop, 4, BOOTS_H);
  }
  // Boot shine
  ctx.fillStyle = BOOT_SHINE;
  ctx.fillRect(bodyX + 2, bootsTop, 4, 1);
  ctx.fillRect(bodyX + BODY_W - 6, bootsTop, 4, 1);

  // ============ ARMS ============
  ctx.fillStyle = UNIFORM;
  if (!walking) {
    // Hand-on-hip pose
    if (facingRight) {
      // Front arm — down then bent at hip
      ctx.fillRect(bodyX + BODY_W, bodyTop + 3, 2, 5);
      ctx.fillRect(bodyX + BODY_W - 1, bodyTop + 8, 2, 3);
      ctx.fillStyle = SKIN;
      ctx.fillRect(bodyX + BODY_W - 2, bodyTop + 10, 1, 1);
      // Back arm straight down
      ctx.fillStyle = UNIFORM;
      ctx.fillRect(bodyX - 1, bodyTop + 3, 2, BODY_H - 4);
      ctx.fillStyle = SKIN;
      ctx.fillRect(bodyX - 1, bodyTop + BODY_H - 1, 2, 1);
    } else {
      ctx.fillRect(bodyX - 2, bodyTop + 3, 2, 5);
      ctx.fillRect(bodyX - 1, bodyTop + 8, 2, 3);
      ctx.fillStyle = SKIN;
      ctx.fillRect(bodyX + 1, bodyTop + 10, 1, 1);
      ctx.fillStyle = UNIFORM;
      ctx.fillRect(bodyX + BODY_W - 1, bodyTop + 3, 2, BODY_H - 4);
      ctx.fillStyle = SKIN;
      ctx.fillRect(bodyX + BODY_W - 1, bodyTop + BODY_H - 1, 2, 1);
    }
  } else {
    const swing = walkFrame === 1 ? 1 : walkFrame === 3 ? -1 : 0;
    if (facingRight) {
      ctx.fillRect(bodyX + BODY_W - 1, bodyTop + 3, 2, 8 + swing);
      ctx.fillRect(bodyX - 1, bodyTop + 3, 2, 8 - swing);
      ctx.fillStyle = SKIN;
      ctx.fillRect(bodyX + BODY_W - 1, bodyTop + 11 + swing, 2, 1);
      ctx.fillRect(bodyX - 1, bodyTop + 11 - swing, 2, 1);
    } else {
      ctx.fillRect(bodyX - 1, bodyTop + 3, 2, 8 + swing);
      ctx.fillRect(bodyX + BODY_W - 1, bodyTop + 3, 2, 8 - swing);
      ctx.fillStyle = SKIN;
      ctx.fillRect(bodyX - 1, bodyTop + 11 + swing, 2, 1);
      ctx.fillRect(bodyX + BODY_W - 1, bodyTop + 11 - swing, 2, 1);
    }
  }
}

/** FRONT view — Officer facing camera. */
export function drawOfficerFacingCamera(
  ctx: CanvasRenderingContext2D,
  state: OfficerState,
  timeMs: number
) {
  const breath = Math.sin(timeMs / 900) > 0 ? 1 : 0;
  const cx = state.x;
  const feetY = state.y;

  // Layout from bottom up
  const bootsTop = feetY - FRONT_BOOTS_H;
  const pantsTop = bootsTop - FRONT_PANTS_H;
  const beltTop = pantsTop - FRONT_BELT_H;
  const bodyTop = beltTop - FRONT_BODY_H + breath;
  const headBottom = bodyTop - 1; // small gap for neck
  const headTop = headBottom - FRONT_HEAD_H;

  const headX = cx - FRONT_HEAD_W / 2;
  const bodyX = cx - FRONT_BODY_W / 2;

  // ============ HEAD ============
  ctx.fillStyle = SKIN;
  ctx.fillRect(headX, headTop + 4, FRONT_HEAD_W, FRONT_HEAD_H - 4);
  ctx.fillRect(headX + 1, headTop + 3, FRONT_HEAD_W - 2, FRONT_HEAD_H - 3);

  // Side shading on edges
  ctx.fillStyle = SKIN_SHADE;
  ctx.fillRect(headX, headTop + 5, 1, FRONT_HEAD_H - 6);
  ctx.fillRect(headX + FRONT_HEAD_W - 1, headTop + 5, 1, FRONT_HEAD_H - 6);

  // Cap (full width)
  ctx.fillStyle = CAP;
  ctx.fillRect(headX, headTop, FRONT_HEAD_W, 3);
  ctx.fillRect(headX - 1, headTop + 1, FRONT_HEAD_W + 2, 2);

  // Cap brim (across)
  ctx.fillStyle = CAP_BRIM;
  ctx.fillRect(headX - 1, headTop + 3, FRONT_HEAD_W + 2, 1);

  // Cap badge (centered)
  ctx.fillStyle = BADGE;
  ctx.fillRect(cx - 1, headTop, 2, 2);
  ctx.fillStyle = BADGE_DEEP;
  ctx.fillRect(cx, headTop + 1, 1, 1);

  // Cap outline
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(headX, headTop, FRONT_HEAD_W, 1);
  ctx.fillRect(headX - 1, headTop + 1, 1, 2);
  ctx.fillRect(headX + FRONT_HEAD_W, headTop + 1, 1, 2);

  // Eyes — half-lid lines (relaxed)
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 4, headTop + 6, 2, 1);
  ctx.fillRect(cx + 2, headTop + 6, 2, 1);
  // Eye dots underneath the lid line for a "looking at you" feel
  ctx.fillRect(cx - 3, headTop + 7, 1, 1);
  ctx.fillRect(cx + 2, headTop + 7, 1, 1);

  // Mouth — faint smile
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(cx - 1, headTop + 9, 2, 1);
  ctx.fillRect(cx - 2, headTop + 10, 1, 1);
  ctx.fillRect(cx + 1, headTop + 10, 1, 1);

  // Cheek blush both sides
  ctx.fillStyle = 'rgba(232, 155, 170, 0.5)';
  ctx.fillRect(cx - 5, headTop + 8, 1, 1);
  ctx.fillRect(cx + 4, headTop + 8, 1, 1);

  // ============ NECK ============
  ctx.fillStyle = SKIN;
  ctx.fillRect(cx - 2, headBottom, 4, 1);

  // ============ TORSO ============
  ctx.fillStyle = UNIFORM;
  ctx.fillRect(bodyX, bodyTop, FRONT_BODY_W, FRONT_BODY_H);
  // Side shading
  ctx.fillStyle = UNIFORM_SHADE;
  ctx.fillRect(bodyX, bodyTop + 1, 2, FRONT_BODY_H - 2);
  ctx.fillRect(bodyX + FRONT_BODY_W - 2, bodyTop + 1, 2, FRONT_BODY_H - 2);
  // Highlight
  ctx.fillStyle = UNIFORM_HIGHLIGHT;
  ctx.fillRect(bodyX + 2, bodyTop + 1, 1, FRONT_BODY_H - 2);

  // Center button row
  ctx.fillStyle = BADGE;
  ctx.fillRect(cx, bodyTop + 2, 1, 1);
  ctx.fillRect(cx, bodyTop + 6, 1, 1);
  ctx.fillRect(cx, bodyTop + 10, 1, 1);
  ctx.fillRect(cx, bodyTop + 14, 1, 1);

  // Chest pockets (symmetric)
  ctx.fillStyle = UNIFORM_SHADE;
  ctx.fillRect(bodyX + 4, bodyTop + 3, 5, 3);
  ctx.fillRect(bodyX + FRONT_BODY_W - 9, bodyTop + 3, 5, 3);
  ctx.fillStyle = BADGE;
  ctx.fillRect(bodyX + 7, bodyTop + 4, 1, 1);
  ctx.fillRect(bodyX + FRONT_BODY_W - 6, bodyTop + 4, 1, 1);

  // Epaulettes (3 gold stripes each shoulder)
  ctx.fillStyle = BADGE;
  ctx.fillRect(bodyX + 1, bodyTop + 1, 4, 1);
  ctx.fillRect(bodyX + FRONT_BODY_W - 5, bodyTop + 1, 4, 1);

  // Outline
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX, bodyTop, FRONT_BODY_W, 1);
  ctx.fillRect(bodyX, bodyTop + FRONT_BODY_H - 1, FRONT_BODY_W, 1);
  ctx.fillRect(bodyX, bodyTop, 1, FRONT_BODY_H);
  ctx.fillRect(bodyX + FRONT_BODY_W - 1, bodyTop, 1, FRONT_BODY_H);

  // ============ BELT ============
  ctx.fillStyle = BELT;
  ctx.fillRect(bodyX, beltTop, FRONT_BODY_W, FRONT_BELT_H);
  ctx.fillStyle = BELT_BUCKLE;
  ctx.fillRect(cx - 1, beltTop, 2, FRONT_BELT_H);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX, beltTop, FRONT_BODY_W, 1);
  ctx.fillRect(bodyX, beltTop + FRONT_BELT_H - 1, FRONT_BODY_W, 1);

  // ============ PANTS ============
  ctx.fillStyle = UNIFORM;
  ctx.fillRect(bodyX + 1, pantsTop, FRONT_BODY_W - 2, FRONT_PANTS_H);
  ctx.fillStyle = UNIFORM_SHADE;
  ctx.fillRect(bodyX + 1, pantsTop, 1, FRONT_PANTS_H);
  ctx.fillRect(bodyX + FRONT_BODY_W - 2, pantsTop, 1, FRONT_PANTS_H);
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX + 1, pantsTop, 1, FRONT_PANTS_H);
  ctx.fillRect(bodyX + FRONT_BODY_W - 2, pantsTop, 1, FRONT_PANTS_H);
  ctx.fillRect(cx, pantsTop, 1, FRONT_PANTS_H);

  // ============ BOOTS ============
  ctx.fillStyle = BOOTS;
  ctx.fillRect(bodyX + 3, bootsTop, 5, FRONT_BOOTS_H);
  ctx.fillRect(bodyX + FRONT_BODY_W - 8, bootsTop, 5, FRONT_BOOTS_H);
  ctx.fillStyle = BOOT_SHINE;
  ctx.fillRect(bodyX + 3, bootsTop, 5, 1);
  ctx.fillRect(bodyX + FRONT_BODY_W - 8, bootsTop, 5, 1);

  // ============ ARMS ============
  ctx.fillStyle = UNIFORM;
  // Left arm — hand on hip
  ctx.fillRect(bodyX - 2, bodyTop + 3, 2, 5);
  ctx.fillRect(bodyX - 1, bodyTop + 8, 2, 3);
  ctx.fillStyle = SKIN;
  ctx.fillRect(bodyX, bodyTop + 11, 2, 1);
  // Right arm — straight down
  ctx.fillStyle = UNIFORM;
  ctx.fillRect(bodyX + FRONT_BODY_W, bodyTop + 3, 2, 8);
  ctx.fillStyle = SKIN;
  ctx.fillRect(bodyX + FRONT_BODY_W, bodyTop + 11, 2, 1);

  // Arm outlines
  ctx.fillStyle = OUTLINE;
  ctx.fillRect(bodyX - 2, bodyTop + 3, 1, 8);
  ctx.fillRect(bodyX + FRONT_BODY_W + 1, bodyTop + 3, 1, 8);
}
