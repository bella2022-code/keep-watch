/**
 * Sound · Web Audio API
 *
 * Placeholder synthesized sounds until real audio assets are made.
 * Completion sound is a soft wood "clack" followed by a low bell tail.
 *
 * Real audio will use sample files in Phase 2.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  return audioCtx;
}

/** Master volume multiplier from settings (0..1) */
let masterVolume = 0.6;

export function setMasterVolume(v: number) {
  masterVolume = Math.max(0, Math.min(1, v));
}

/** Brief wood-like clack: triangle wave with sharp envelope. */
export function playClack() {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.3 * masterVolume, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    // Audio context might not be allowed; fail silently
  }
}

/** Soft low bell tail: sine sweep that decays slowly. */
export function playBellTail() {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15 * masterVolume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1.0);
  } catch (e) {
    // ignore
  }
}

/** Full completion audio sequence (clack + bell tail). */
export function playCompletionSound() {
  playClack();
  // Bell starts 100ms after clack for a smoother feel
  setTimeout(playBellTail, 100);
}
