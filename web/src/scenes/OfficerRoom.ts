/**
 * Officer Room Scene · Placeholder
 *
 * Quiet "off-duty office" — wood plank floor, white walls, central door,
 * corner potted plant (the world's "breathing color"), warm desk lamp.
 *
 * Spec: docs/02-characters-companions.md (final stage)
 *   Atmosphere: peaceful, not military. The contrast that makes Officer's
 *   gentle supervision land.
 */

import { COLORS } from '../core/colors';
import { NATIVE_WIDTH, NATIVE_HEIGHT } from '../core/canvas';
import { getCurrentPalette } from '../core/theme';

const FLOOR_Y = 200;

/** Pure silhouette for the reveal. */
export function drawOfficerRoomSilhouette(
  ctx: CanvasRenderingContext2D,
  alpha = 1
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = '#15161E';
  ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

  // Door silhouette (centered)
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(210, 70, 60, FLOOR_Y - 70);
  ctx.fillRect(208, 68, 64, 2);

  // Floor seam
  ctx.fillRect(0, FLOOR_Y, NATIVE_WIDTH, 2);

  // Plant pot silhouette
  ctx.fillRect(60, FLOOR_Y - 24, 16, 22);

  // Lamp silhouette
  ctx.fillRect(390, FLOOR_Y - 32, 20, 30);

  ctx.restore();
}

export function drawOfficerRoom(ctx: CanvasRenderingContext2D, timeMs: number) {
  const palette = getCurrentPalette();

  // Wall (white-ish warm)
  ctx.fillStyle = palette.roomWall;
  ctx.fillRect(0, 0, NATIVE_WIDTH, FLOOR_Y);

  // Subtle wall texture (very faint horizontal lines)
  ctx.fillStyle = 'rgba(168, 148, 120, 0.08)';
  for (let y = 30; y < FLOOR_Y; y += 40) {
    ctx.fillRect(0, y, NATIVE_WIDTH, 1);
  }

  // Wood floor (warm planks)
  ctx.fillStyle = palette.roomFloor;
  ctx.fillRect(0, FLOOR_Y, NATIVE_WIDTH, NATIVE_HEIGHT - FLOOR_Y);

  // Plank lines (32px wide × 8px tall pattern from spec)
  ctx.fillStyle = 'rgba(58, 47, 42, 0.4)';
  for (let y = FLOOR_Y + 16; y < NATIVE_HEIGHT; y += 24) {
    ctx.fillRect(0, y, NATIVE_WIDTH, 1);
  }
  ctx.fillStyle = 'rgba(58, 47, 42, 0.25)';
  for (let x = 32; x < NATIVE_WIDTH; x += 64) {
    ctx.fillRect(x, FLOOR_Y, 1, NATIVE_HEIGHT - FLOOR_Y);
  }

  // Wall-floor seam (deep shadow)
  ctx.fillStyle = palette.roomSeam;
  ctx.fillRect(0, FLOOR_Y - 1, NATIVE_WIDTH, 1);
  ctx.fillStyle = palette.roomSeam;
  ctx.fillRect(0, FLOOR_Y + 1, NATIVE_WIDTH, 1);

  // ===== DOOR (centered) =====
  const doorX = 210;
  const doorY = 70;
  const doorW = 60;
  const doorH = FLOOR_Y - doorY;

  // Door body
  ctx.fillStyle = '#F4EFE6';
  ctx.fillRect(doorX, doorY, doorW, doorH);
  // Door frame
  ctx.fillStyle = '#A89478';
  ctx.fillRect(doorX - 3, doorY - 3, doorW + 6, 3);
  ctx.fillRect(doorX - 3, doorY, 3, doorH);
  ctx.fillRect(doorX + doorW, doorY, 3, doorH);
  // Door frame outline
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(doorX - 3, doorY - 3, doorW + 6, 1);
  ctx.fillRect(doorX, doorY, doorW, 1);
  // Door panels (3 horizontal panel lines)
  ctx.fillStyle = 'rgba(122, 116, 128, 0.4)';
  ctx.fillRect(doorX + 5, doorY + 25, doorW - 10, 1);
  ctx.fillRect(doorX + 5, doorY + 60, doorW - 10, 1);
  ctx.fillRect(doorX + 5, doorY + 95, doorW - 10, 1);
  // Doorknob
  ctx.fillStyle = '#D4A574';
  ctx.fillRect(doorX + doorW - 10, doorY + 70, 2, 2);

  // ===== POTTED PLANT (corner) =====
  const potX = 60;
  const potY = FLOOR_Y - 24;
  // Pot
  ctx.fillStyle = '#8B5E3C';
  ctx.fillRect(potX, potY + 16, 16, 8);
  ctx.fillStyle = '#6B4528';
  ctx.fillRect(potX, potY + 16, 16, 2);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(potX, potY + 23, 16, 1);
  // Plant leaves (animated sway)
  ctx.fillStyle = COLORS.green;
  const sway = Math.sin(timeMs / 1500) * 1;
  const swayInt = Math.round(sway);
  // Main stem clusters
  ctx.fillRect(potX + 4 + swayInt, potY + 8, 2, 8);
  ctx.fillRect(potX + 10 - swayInt, potY + 10, 2, 6);
  ctx.fillRect(potX + 7, potY + 5, 2, 11);
  // Leaves
  ctx.fillRect(potX + 2 + swayInt, potY + 10, 4, 2);
  ctx.fillRect(potX + 10 - swayInt, potY + 7, 4, 2);
  ctx.fillRect(potX + 5, potY + 3, 4, 2);
  // Highlight tips
  ctx.fillStyle = '#9FB987';
  ctx.fillRect(potX + 5, potY + 3, 1, 1);
  ctx.fillRect(potX + 8, potY + 3, 1, 1);

  // ===== DESK LAMP (right side) =====
  const lampX = 390;
  const lampBaseY = FLOOR_Y - 4;
  // Base
  ctx.fillStyle = '#3A4530';
  ctx.fillRect(lampX, lampBaseY, 20, 4);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(lampX, lampBaseY, 20, 1);
  // Stem
  ctx.fillStyle = '#5A6878';
  ctx.fillRect(lampX + 9, lampBaseY - 16, 2, 16);
  // Shade
  ctx.fillStyle = '#D4A574';
  ctx.fillRect(lampX + 4, lampBaseY - 26, 12, 10);
  ctx.fillStyle = '#A07840';
  ctx.fillRect(lampX + 4, lampBaseY - 26, 12, 1);
  // Inner glow (yellow bulb visible)
  ctx.fillStyle = '#F4EFE6';
  ctx.fillRect(lampX + 7, lampBaseY - 19, 6, 2);

  // Warm light glow halo (animated breathing per spec)
  const breath = (Math.sin(timeMs / 6000) + 1) / 2; // 30s breathing
  const glowAlpha = 0.15 + breath * 0.08;
  const glowGrad = ctx.createRadialGradient(
    lampX + 10,
    lampBaseY - 18,
    4,
    lampX + 10,
    lampBaseY - 18,
    80
  );
  glowGrad.addColorStop(0, `rgba(244, 200, 130, ${glowAlpha})`);
  glowGrad.addColorStop(1, 'rgba(244, 200, 130, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(lampX - 60, lampBaseY - 80, 140, 100);

  // Clipboard hanging by the door (per spec)
  const clipX = doorX + doorW + 10;
  const clipY = doorY + 30;
  ctx.fillStyle = '#A89478';
  ctx.fillRect(clipX, clipY, 14, 18);
  ctx.fillStyle = '#8B7858';
  ctx.fillRect(clipX, clipY, 14, 2);
  ctx.fillStyle = COLORS.black;
  ctx.fillRect(clipX, clipY, 14, 1);
  ctx.fillRect(clipX, clipY + 17, 14, 1);
  // Hanging nail
  ctx.fillStyle = '#7A8290';
  ctx.fillRect(clipX + 6, clipY - 2, 2, 2);
}

export function drawOfficerRoomRevealFill(
  ctx: CanvasRenderingContext2D,
  timeMs: number,
  progress: number
) {
  drawOfficerRoomSilhouette(ctx, 1);
  if (progress <= 0) return;

  const cx = NATIVE_WIDTH / 2;
  const cy = NATIVE_HEIGHT / 2;
  const maxR = Math.hypot(NATIVE_WIDTH, NATIVE_HEIGHT) / 2 + 20;
  const r = maxR * progress;

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();
  drawOfficerRoom(ctx, timeMs);
  ctx.restore();
}
