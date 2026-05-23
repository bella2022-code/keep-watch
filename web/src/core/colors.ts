/**
 * Keep Watch · Global Color Anchors
 *
 * Source of truth: docs/01-visual-system.md
 * These colors are shared across all 4 scenes; theme packs only change scene backgrounds.
 */

export const COLORS = {
  // Global anchors
  black: '#2A2128', // Warm black — replaces pure black for outlines
  white: '#F4EFE6', // Warm white — replaces pure white for highlights
  grey: '#7A7480', // Neutral transition
  green: '#7B9268', // "Breathing color" — plants in every scene
  pink: '#E89BAA', // Officer accent + Mouse ear/nose

  // Warm Wood theme (default)
  wood: '#8B5E3C',
  water: '#5B8FA6',
  space: '#1B2233',
  room: '#A89478',

  // Mouse specific
  mouseBody: '#F4EFE6',
} as const;
