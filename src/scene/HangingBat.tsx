import { useEffect, useState } from 'react';

const FUR = '#4a3b52';
const WING = '#2c2233';
const WING_HI = '#5a4866';

/**
 * A little bat hanging upside down, wings wrapped round it like a cloak. By day it sleeps; at
 * night it's awake and looking about. Tap it and it stretches its wings for a moment.
 * Hangs from (0,0): its feet hook over whatever it's drawn under.
 */
export function HangingBat({ x, y, s = 1, awake }: { x: number; y: number; s?: number; awake: boolean }) {
  const [stretch, setStretch] = useState(0);
  // the wings fold away again afterwards, also when animations are turned off
  useEffect(() => {
    if (!stretch) return;
    const t = window.setTimeout(() => setStretch(0), 1700);
    return () => window.clearTimeout(t);
  }, [stretch]);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="tappable" onClick={() => setStretch((n) => n + 1)}>
      <g className="bat-hang" style={{ transformOrigin: '0px 0px' }}>
        {/* toes hooked over the rod */}
        <path d="M-3,0 C-3.6,-2 -1.6,-2.6 -1.6,0.6 M3,0 C3.6,-2 1.6,-2.6 1.6,0.6" fill="none" stroke="#1d1621" strokeWidth="1" strokeLinecap="round" />
        <path d="M-1.8,0.4 L-2.2,4 M1.8,0.4 L2.2,4" stroke="#1d1621" strokeWidth="1.1" strokeLinecap="round" />

        {/* wings stretched out, only for a moment after a tap */}
        {stretch > 0 && (
          <g key={stretch} className="bat-stretch">
            <path
              className="ink-thin"
              fill={WING}
              d="M0,8 C-6,5 -14,4 -20,8 C-19,11 -20,15 -22,18 C-18,16 -15,17 -13,20 C-11,17 -8,17 -6,19 C-5,15 -3,12 0,12 Z"
            />
            <path
              className="ink-thin"
              fill={WING}
              d="M0,8 C6,5 14,4 20,8 C19,11 20,15 22,18 C18,16 15,17 13,20 C11,17 8,17 6,19 C5,15 3,12 0,12 Z"
            />
            <path d="M-2,9 L-18,9 M-4,10 L-13,17 M2,9 L18,9 M4,10 L13,17" stroke={WING_HI} strokeWidth="0.6" />
          </g>
        )}

        {/* the body, furry and round */}
        <ellipse className="ink" cx="0" cy="12" rx="6.4" ry="9" fill={FUR} />
        {/* folded wings, wrapped round like a cloak, scalloped where the fingers end */}
        <path
          className="ink-thin"
          fill={WING}
          d="M-1,4 C-6,4 -8.4,8 -8.4,13 C-8.4,17 -7,20 -5,22 C-5,20 -4,19.6 -3,20.4 C-3,19 -2,18.4 -1,19 Z"
        />
        <path
          className="ink-thin"
          fill={WING}
          d="M1,4 C6,4 8.4,8 8.4,13 C8.4,17 7,20 5,22 C5,20 4,19.6 3,20.4 C3,19 2,18.4 1,19 Z"
        />
        <path d="M-6.6,9 C-6.6,13 -6,16 -5,19 M6.6,9 C6.6,13 6,16 5,19" fill="none" stroke={WING_HI} strokeWidth="0.6" />

        {/* the head, at the bottom since it's upside down; ears point downwards */}
        <path className="ink-thin" fill={FUR} d="M-5,24 L-6.4,31 L-2.4,27 Z" />
        <path className="ink-thin" fill={FUR} d="M5,24 L6.4,31 L2.4,27 Z" />
        <path d="M-4.6,25.6 L-5.4,29 L-3.4,27 Z M4.6,25.6 L5.4,29 L3.4,27 Z" fill="#d88aa6" />
        <ellipse className="ink" cx="0" cy="23.4" rx="5.6" ry="5" fill={FUR} />
        {awake ? (
          <>
            <circle cx="-2.2" cy="24.4" r="1.25" fill="#f4e9f1" />
            <circle cx="2.2" cy="24.4" r="1.25" fill="#f4e9f1" />
            <circle cx="-2.2" cy="24.6" r="0.65" fill="#140c12" />
            <circle cx="2.2" cy="24.6" r="0.65" fill="#140c12" />
          </>
        ) : (
          <path d="M-3.2,24.2 Q-2.2,25.4 -1.2,24.2 M1.2,24.2 Q2.2,25.4 3.2,24.2" fill="none" stroke="#140c12" strokeWidth="0.7" strokeLinecap="round" />
        )}
        <ellipse cx="-3.8" cy="22.4" rx="1.1" ry="0.7" fill="#d88aa6" opacity="0.7" />
        <ellipse cx="3.8" cy="22.4" rx="1.1" ry="0.7" fill="#d88aa6" opacity="0.7" />
        {/* a little smile, upside down so it reads as one, and a tiny fang */}
        <path d="M-1.4,21 Q0,20 1.4,21" fill="none" stroke="#140c12" strokeWidth="0.6" strokeLinecap="round" />
        <path d="M0.6,20.6 L0.9,19.6 L1.2,20.7 Z" fill="#f7f3ea" />
      </g>
    </g>
  );
}
