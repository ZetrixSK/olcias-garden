import type { Layer, Mix } from './mix';

/**
 * The room's sounds, made as they play rather than from recordings: rain and wind are shaped
 * noise, the raindrops, birds, crickets and candle crackles are small sounds scheduled at random,
 * so nothing ever loops audibly.
 */

/** How loud each sound is at full strength, before the mix. */
const LEVEL: Record<Layer, number> = { rain: 0.9, wind: 0.45, birds: 0.7, crickets: 0.55, crackle: 0.75 };
const LOOKAHEAD = 0.3;

type Events = 'drops' | 'birds' | 'crickets-l' | 'crickets-r' | 'crackle';
const LAYER_OF: Record<Events, Layer> = { drops: 'rain', birds: 'birds', 'crickets-l': 'crickets', 'crickets-r': 'crickets', crackle: 'crackle' };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function noise(ctx: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      d[i] = last * 3.5;
    } else d[i] = white;
  }
  // fade the ends together so the loop has no click
  const fade = Math.floor(ctx.sampleRate * 0.05);
  for (let i = 0; i < fade; i++) {
    const k = i / fade;
    d[i]! *= k;
    d[d.length - 1 - i]! *= k;
  }
  return buf;
}

export class Ambience {
  private ctx: AudioContext;
  private master: GainNode;
  private layers: Record<Layer, GainNode>;
  private mix: Mix = { rain: 0, wind: 0, birds: 0, crickets: 0, crackle: 0 };
  private next: Record<Events, number> = { drops: 0, birds: 0, 'crickets-l': 0, 'crickets-r': 0, crackle: 0 };
  private white: AudioBuffer;
  private timer: number | null = null;
  private playing = false;

  constructor() {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
    this.layers = {} as Record<Layer, GainNode>;
    for (const l of Object.keys(LEVEL) as Layer[]) {
      const g = this.ctx.createGain();
      g.gain.value = 0;
      g.connect(this.master);
      this.layers[l] = g;
    }
    this.white = noise(this.ctx, 2, false);
    const brown = noise(this.ctx, 6, true);
    this.rainBed(brown);
    this.windBed(brown);
  }

  private loop(buf: AudioBuffer, offset = 0): AudioBufferSourceNode {
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.start(0, offset);
    return src;
  }

  private filter(type: BiquadFilterType, frequency: number, Q = 0.7): BiquadFilterNode {
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = frequency;
    f.Q.value = Q;
    return f;
  }

  private gain(v: number): GainNode {
    const g = this.ctx.createGain();
    g.gain.value = v;
    return g;
  }

  /** A soft hiss of rain on the glass, over a low patter. */
  private rainBed(brown: AudioBuffer) {
    const hiss = this.loop(this.white);
    const hp = this.filter('highpass', 500);
    const lp = this.filter('lowpass', 4200);
    hiss.connect(hp).connect(lp).connect(this.gain(0.12)).connect(this.layers.rain);
    this.loop(brown, 1.3).connect(this.filter('lowpass', 650)).connect(this.gain(0.45)).connect(this.layers.rain);
  }

  /** A breeze that slowly rises and falls. */
  private windBed(brown: AudioBuffer) {
    const lp = this.filter('lowpass', 320);
    const swell = this.gain(0.55);
    this.loop(brown, 3.1).connect(lp).connect(swell).connect(this.layers.wind);
    const air = this.filter('bandpass', 900, 0.6);
    this.loop(this.white, 0.7).connect(air).connect(this.gain(0.025)).connect(swell);
    const lfo = (hz: number, depth: number, target: AudioParam) => {
      const o = this.ctx.createOscillator();
      o.frequency.value = hz;
      const d = this.gain(depth);
      o.connect(d).connect(target);
      o.start();
    };
    lfo(0.047, 160, lp.frequency);
    lfo(0.031, 0.3, swell.gain);
  }

  private pan(at: number, node: AudioNode, x: number): AudioNode {
    if (!this.ctx.createStereoPanner) return node;
    const p = this.ctx.createStereoPanner();
    p.pan.setValueAtTime(x, at);
    node.connect(p);
    return p;
  }

  /** A short burst of filtered noise: a raindrop on the glass, or a crackle of the wick. */
  private tick(at: number, layer: Layer, len: number, freq: number, Q: number, peak: number, x: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.white;
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(peak, at + 0.002);
    env.gain.exponentialRampToValueAtTime(0.0001, at + len);
    src.connect(this.filter('bandpass', freq, Q)).connect(env);
    this.pan(at, env, x).connect(this.layers[layer]);
    src.start(at, rand(0, 1.8), len + 0.02);
  }

  /** One whistled note that glides. */
  private note(at: number, layer: Layer, f0: number, f1: number, len: number, peak: number, x: number) {
    const o = this.ctx.createOscillator();
    o.type = 'sine';
    o.frequency.setValueAtTime(f0, at);
    o.frequency.exponentialRampToValueAtTime(f1, at + len);
    const env = this.ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(peak, at + Math.min(0.012, len / 3));
    env.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(env);
    this.pan(at, env, x).connect(this.layers[layer]);
    o.start(at);
    o.stop(at + len + 0.02);
  }

  /** Plays one event of a kind at `at`, and says how long until the next. */
  private play(kind: Events, at: number): number {
    const level = this.mix[LAYER_OF[kind]];
    switch (kind) {
      case 'drops':
        this.tick(at, 'rain', rand(0.008, 0.03), rand(1400, 5200), rand(2, 7), rand(0.04, 0.16), rand(-0.9, 0.9));
        return rand(0.02, 0.11);
      case 'crackle': {
        const peak = rand(0.012, 0.045);
        this.tick(at, 'crackle', rand(0.004, 0.012), rand(1600, 3600), 1.2, peak, 0.35);
        if (Math.random() < 0.18) this.tick(at + rand(0.02, 0.06), 'crackle', 0.006, rand(2000, 3200), 1.2, peak * 0.7, 0.35);
        return rand(0.18, 1.4);
      }
      case 'crickets-l':
      case 'crickets-r': {
        const x = kind === 'crickets-l' ? rand(-0.8, -0.3) : rand(0.3, 0.8);
        const f = kind === 'crickets-l' ? 4350 : 4620;
        const pulses = Math.random() < 0.5 ? 3 : 4;
        for (let i = 0; i < pulses; i++) this.note(at + i * 0.042, 'crickets', f, f * 0.985, 0.026, 0.02, x);
        return Math.random() < 0.08 ? rand(2, 5) : rand(0.5, 0.85);
      }
      case 'birds': {
        const x = rand(-0.8, 0.8);
        let t = at;
        if (Math.random() < 0.4) {
          // a slow two-note whistle
          const f = rand(2600, 3400);
          this.note(t, 'birds', f, f * 0.78, 0.26, 0.035, x);
          this.note(t + 0.36, 'birds', f * 1.05, f * 0.8, 0.22, 0.03, x);
        } else {
          // quick twitters
          const n = 2 + Math.floor(Math.random() * 5);
          const base = rand(3000, 4600);
          for (let i = 0; i < n; i++) {
            const len = rand(0.04, 0.09);
            const f = base * rand(0.85, 1.15);
            this.note(t, 'birds', f * 0.8, f * rand(1.1, 1.4), len, 0.03, x);
            t += len + rand(0.03, 0.1);
          }
        }
        return rand(2.5, 8) / Math.max(0.4, level);
      }
    }
  }

  private schedule = () => {
    const now = this.ctx.currentTime;
    for (const kind of Object.keys(this.next) as Events[]) {
      if (this.next[kind] < now) this.next[kind] = now + rand(0.05, 0.6);
      while (this.next[kind] < now + LOOKAHEAD) {
        const at = this.next[kind];
        this.next[kind] += this.mix[LAYER_OF[kind]] > 0.01 ? this.play(kind, at) : 0.5;
      }
    }
  };

  /** Sets what she hears; sounds fade in and out over a few seconds. */
  set(mix: Mix) {
    this.mix = mix;
    const t = this.ctx.currentTime;
    for (const l of Object.keys(LEVEL) as Layer[]) this.layers[l].gain.setTargetAtTime(mix[l] * LEVEL[l], t, 1.2);
  }

  /** Starts or resumes; on iPhone this only works from a tap, so it is called from taps too. */
  start() {
    if (this.ctx.state !== 'running') void this.ctx.resume().catch(() => undefined);
    if (this.playing) return;
    this.playing = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0.8, this.ctx.currentTime, 0.8);
    this.timer ??= window.setInterval(this.schedule, 80);
  }

  /** Fades out and goes quiet, so a closed or hidden garden uses no power for sound. */
  stop() {
    if (!this.playing) return;
    this.playing = false;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.25);
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    window.setTimeout(() => {
      if (!this.playing) void this.ctx.suspend().catch(() => undefined);
    }, 1200);
  }
}

let shared: Ambience | null = null;

/** The one sound engine, made on first use. On iPhone it should first be made from a tap. */
export function ambience(): Ambience | null {
  if (shared) return shared;
  try {
    // let her own music keep playing, and respect the ring/silent switch
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session) session.type = 'ambient';
    shared = new Ambience();
  } catch {
    return null;
  }
  return shared;
}

/** The engine if it has been made, without making it. */
export const ambienceIfMade = () => shared;
