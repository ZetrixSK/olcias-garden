/**
 * Whether the garden moves. By default it follows the phone: with "Reduce Motion" on, it keeps
 * still. She can choose to have it move anyway, from the menu. The choice is mirrored as a class on
 * the page (`still`), which the styles use instead of the media query, so it can be overridden.
 */
export type MotionPref = 'phone' | 'always';

let pref: MotionPref = 'phone';
const query = () => (typeof window !== 'undefined' ? window.matchMedia?.('(prefers-reduced-motion: reduce)') : undefined);

/** Whether to keep still right now. */
export const prefersStill = () => pref === 'phone' && (query()?.matches ?? false);

function apply() {
  if (typeof document !== 'undefined') document.documentElement.classList.toggle('still', prefersStill());
}

export function setMotion(p: MotionPref) {
  pref = p;
  apply();
}

/** Whether the phone itself asks for less motion (to say so in the menu). */
export const phoneAsksStill = () => query()?.matches ?? false;

query()?.addEventListener?.('change', apply);
apply();
