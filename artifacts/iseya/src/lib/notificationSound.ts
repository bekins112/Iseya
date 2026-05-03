let ctx: AudioContext | null = null;
let unlocked = false;
let lastPlayed = 0;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    try {
      ctx = new Ctor();
    } catch {
      return null;
    }
  }
  return ctx;
}

function attachUnlockListeners() {
  if (typeof window === "undefined" || unlocked) return;
  const unlock = () => {
    const c = getCtx();
    if (c && c.state === "suspended") c.resume().catch(() => {});
    unlocked = true;
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
    window.removeEventListener("touchstart", unlock);
  };
  window.addEventListener("pointerdown", unlock, { once: true });
  window.addEventListener("keydown", unlock, { once: true });
  window.addEventListener("touchstart", unlock, { once: true });
}

attachUnlockListeners();

/**
 * Play a soft two-tone notification chime. No-op if the user has not
 * interacted with the page yet (browser autoplay rules) or if WebAudio
 * is unavailable. Throttled to once every 600ms.
 */
export function playNotificationSound(opts?: { volume?: number }): void {
  const now = Date.now();
  if (now - lastPlayed < 600) return;
  lastPlayed = now;

  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") {
    c.resume().catch(() => {});
    if (c.state === "suspended") return;
  }

  const volume = Math.min(0.4, Math.max(0, opts?.volume ?? 0.18));
  const t0 = c.currentTime;

  const tone = (freq: number, start: number, dur: number) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, t0 + start);
    gain.gain.linearRampToValueAtTime(volume, t0 + start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + start + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0 + start);
    osc.stop(t0 + start + dur + 0.02);
  };

  tone(880, 0, 0.18);
  tone(1320, 0.12, 0.22);
}
