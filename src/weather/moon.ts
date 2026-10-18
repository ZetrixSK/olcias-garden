/** Length of a lunar month, new moon to new moon, in days. */
export const SYNODIC_DAYS = 29.530588853;
/** A known new moon: 6 January 2000, 18:14 UTC. */
const NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);
const DAY = 86_400_000;

/** Where the moon is in its month: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter. */
export function moonPhase(t: number): number {
  const days = (t - NEW_MOON) / DAY;
  const p = (days / SYNODIC_DAYS) % 1;
  return p < 0 ? p + 1 : p;
}

/** How much of the disc is lit, 0 to 1. */
export const moonLit = (phase: number) => (1 - Math.cos(2 * Math.PI * phase)) / 2;

/**
 * The lit part of a moon of radius r centred on (0,0), as seen from the northern hemisphere:
 * waxing lights the right-hand side, waning the left. Null when nothing at all is lit.
 */
export function moonPath(r: number, phase: number): string | null {
  const lit = moonLit(phase);
  if (lit < 0.015) return null;
  const f = (n: number) => n.toFixed(2);
  if (lit > 0.985) return `M0,${f(-r)} A${f(r)},${f(r)} 0 1 1 0,${f(r)} A${f(r)},${f(r)} 0 1 1 0,${f(-r)} Z`;
  const waxing = phase < 0.5;
  // the terminator is half an ellipse; it bulges towards the lit side while a crescent, away from it once gibbous
  const rx = r * Math.abs(Math.cos(2 * Math.PI * phase));
  const gibbous = lit > 0.5;
  const outer = waxing ? 1 : 0;
  const inner = waxing === gibbous ? 1 : 0;
  return `M0,${f(-r)} A${f(r)},${f(r)} 0 0 ${outer} 0,${f(r)} A${f(rx)},${f(r)} 0 0 ${inner} 0,${f(-r)} Z`;
}

const NAMES = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'];

export function moonName(phase: number): string {
  return NAMES[Math.round(phase * 8) % 8]!;
}
