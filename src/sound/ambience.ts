import type { Layer, Mix } from './mix';

/**
 * The room's sounds, made as they play rather than from recordings: rain and wind are shaped
 * noise, the raindrops, birds, crickets and candle crackles are small sounds scheduled at random,
 * so nothing ever loops audibly.
 */

/** How loud each sound is at full strength, before the mix. */
const LEVEL: Record<Layer, number> = { rain: 0.9, wind: 0.45, birds: 0.7, crickets: 0.55, crackle: 0.75 };
/** Small sounds are scheduled this far ahead, so a busy moment on the phone doesn't leave a gap. */
const LOOKAHEAD = 0.8;

type Events = 'drops' | 'birds' | 'crickets-l' | 'crickets-r' | 'crackle';
const LAYER_OF: Record<Events, Layer> = { drops: 'rain', birds: 'birds', 'crickets-l': 'crickets', 'crickets-r': 'crickets', crackle: 'crackle' };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

/** The small sounds of touching things: a button, watering, the candle, paper, soil. */
export const EFFECTS = ['tap', 'water', 'light', 'blow', 'page', 'soil'] as const;
export type Effect = (typeof EFFECTS)[number];

/**
 * A stretch of noise that loops without a seam: its tail is blended into its head (and then left
 * off), so the join is neither a click nor a dip in the sound.
 */
function noise(ctx: AudioContext, seconds: number, brown: boolean): AudioBuffer {
  const fade = Math.floor(ctx.sampleRate * 0.25);
  const len = Math.floor(ctx.sampleRate * seconds);
  const raw = new Float32Array(len + fade);
  let last = 0;
  for (let i = 0; i < raw.length; i++) {
    const white = Math.random() * 2 - 1;
    if (brown) {
      last = (last + 0.02 * white) / 1.02;
      raw[i] = last * 3.5;
    } else raw[i] = white;
  }
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  d.set(raw.subarray(0, len));
  // equal-power blend keeps the loudness steady through the join
  for (let i = 0; i < fade; i++) {
    const k = i / fade;
    d[i] = raw[i]! * Math.sin((k * Math.PI) / 2) + raw[len + i]! * Math.cos((k * Math.PI) / 2);
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
  /** Taps and touches go straight out, not through the room's fades. */
  private fx: GainNode;

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
    this.fx = this.ctx.createGain();
    this.fx.gain.value = 0.7;
    this.fx.connect(this.ctx.destination);
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
    lfo(0.031, 0.18, swell.gain);
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

  /** A burst of noise shaped by a filter and an envelope of [time, level] points, for effects. */
  private hush(at: number, type: BiquadFilterType, freq: number, Q: number, env: Array<[number, number]>, sweepTo?: number) {
    const src = this.ctx.createBufferSource();
    src.buffer = this.white;
    const f = this.filter(type, freq, Q);
    const end = env[env.length - 1]![0];
    if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, at + end);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, at);
    for (const [t, v] of env) g.gain.linearRampToValueAtTime(v, at + t);
    src.connect(f).connect(g).connect(this.fx);
    src.start(at, rand(0, 1), end + 0.05);
  }

  private fxNote(at: number, f0: number, f1: number, len: number, peak: number) {
    const o = this.ctx.createOscillator();
    o.frequency.setValueAtTime(f0, at);
    o.frequency.exponentialRampToValueAtTime(f1, at + len);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(peak, at + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(g).connect(this.fx);
    o.start(at);
    o.stop(at + len + 0.02);
  }

  /** Plays the sound of something she touched. */
  effect(kind: Effect) {
    if (!this.playing || this.ctx.state !== 'running') return;
    const at = this.ctx.currentTime + 0.005;
    switch (kind) {
      case 'tap': {
        // a soft wooden tock, never quite the same twice
        const p = rand(0.94, 1.06);
        this.fxNote(at, 560 * p, 400 * p, 0.07, 0.13);
        this.hush(at, 'bandpass', 2600 * p, 1.2, [[0.002, 0.05], [0.014, 0]]);
        break;
      }
      case 'water': {
        // a pour, gurgling a little, then the last drops
        const src = this.ctx.createBufferSource();
        src.buffer = this.white;
        const f = this.filter('bandpass', 900, 1.4);
        for (let t = 0; t < 1.2; t += 0.07) f.frequency.setValueAtTime(rand(650, 1500), at + t);
        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0, at);
        g.gain.linearRampToValueAtTime(0.16, at + 0.18);
        g.gain.setValueAtTime(0.16, at + 0.95);
        g.gain.linearRampToValueAtTime(0, at + 1.35);
        src.connect(f).connect(g).connect(this.fx);
        src.start(at, 0, 1.4);
        for (let i = 0; i < 9; i++) {
          const t = at + rand(0.25, 1.7);
          this.fxNote(t, rand(1300, 2200), rand(2400, 3400), 0.05, rand(0.03, 0.07));
        }
        break;
      }
      case 'light':
        // the strike of a match, then the flame taking
        this.hush(at, 'highpass', 2200, 0.7, [[0.004, 0.22], [0.05, 0.08], [0.13, 0]]);
        this.hush(at + 0.08, 'lowpass', 900, 0.7, [[0.12, 0.1], [0.6, 0]]);
        break;
      case 'blow':
        // a soft breath
        this.hush(at, 'lowpass', 1100, 0.6, [[0.12, 0.2], [0.3, 0.12], [0.55, 0]], 380);
        break;
      case 'page':
        // paper: a few quick rustles
        for (let i = 0; i < 7; i++) {
          const t = i * rand(0.03, 0.055);
          this.hush(at + t, 'bandpass', rand(3000, 6000), 0.9, [[0.004, rand(0.03, 0.07)], [0.04, 0]]);
        }
        break;
      case 'soil':
        // a pot set down, a little earth
        this.fxNote(at, 150, 70, 0.18, 0.22);
        this.hush(at, 'lowpass', 600, 0.7, [[0.01, 0.08], [0.16, 0]]);
        break;
    }
  }

  private schedule = () => {
    const now = this.ctx.currentTime;
    for (const kind of Object.keys(this.next) as Events[]) {
      // fell behind (the phone was busy): carry on straight away rather than leave a gap
      if (this.next[kind] < now) this.next[kind] = now + 0.02;
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
    this.timer ??= window.setInterval(this.schedule, 120);
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
