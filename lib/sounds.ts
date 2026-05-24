// Sound effects system using Web Audio API
// No external dependencies — generates tones programmatically

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.15) {
  const ctx = getAudioCtx();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

function playSequence(notes: Array<{ freq: number; delay: number; duration: number; type?: OscillatorType }>, volume = 0.12) {
  notes.forEach(({ freq, delay, duration, type }) => {
    setTimeout(() => playTone(freq, duration, type || 'sine', volume), delay);
  });
}

export const sounds = {
  click: () => playTone(800, 0.08, 'sine', 0.08),

  win: () => playSequence([
    { freq: 523, delay: 0, duration: 0.15 },
    { freq: 659, delay: 100, duration: 0.15 },
    { freq: 784, delay: 200, duration: 0.25 },
  ]),

  lose: () => playSequence([
    { freq: 400, delay: 0, duration: 0.2, type: 'triangle' },
    { freq: 300, delay: 150, duration: 0.3, type: 'triangle' },
  ], 0.1),

  spin: () => playTone(600, 0.05, 'square', 0.06),

  levelUp: () => playSequence([
    { freq: 440, delay: 0, duration: 0.1 },
    { freq: 554, delay: 80, duration: 0.1 },
    { freq: 659, delay: 160, duration: 0.1 },
    { freq: 880, delay: 240, duration: 0.3 },
  ]),

  notification: () => playSequence([
    { freq: 880, delay: 0, duration: 0.1, type: 'sine' },
    { freq: 1100, delay: 80, duration: 0.15, type: 'sine' },
  ], 0.08),

  purchase: () => playSequence([
    { freq: 523, delay: 0, duration: 0.08 },
    { freq: 784, delay: 60, duration: 0.08 },
    { freq: 1047, delay: 120, duration: 0.2 },
  ]),

  error: () => playTone(220, 0.3, 'sawtooth', 0.08),
};

// Global mute control
let muted = false;

export function setSoundMuted(m: boolean) {
  muted = m;
  if (typeof window !== 'undefined') {
    localStorage.setItem('shit-sound-muted', m ? '1' : '0');
  }
}

export function isSoundMuted(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('shit-sound-muted');
    if (stored !== null) muted = stored === '1';
  }
  return muted;
}

// Wrapped sounds that respect mute
export const sfx = new Proxy(sounds, {
  get(target, prop: keyof typeof sounds) {
    return () => {
      if (!isSoundMuted()) {
        target[prop]();
      }
    };
  },
});
