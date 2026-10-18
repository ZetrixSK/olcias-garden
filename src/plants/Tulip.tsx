import type { Stage } from '../garden/species';
import { SeedMarker, Stem } from './common';

type TulipColors = { base: string; shade: string; hi: string; deep: string };

export const TULIP_PINK: TulipColors = { base: '#ea93ac', shade: '#cd6f8d', hi: '#f7c3d1', deep: '#b0557a' };
/** 'Queen of Night': the nearly black tulip. */
export const TULIP_NIGHT: TulipColors = { base: '#3e1a35', shade: '#2a1124', hi: '#74395f', deep: '#1c0a17' };

export const BLUE_LEAF = { base: '#84a68c', shade: '#678a71', hi: '#a9c5ad' };

export function TulipFlower({ x, y, rot, c, s = 1 }: { x: number; y: number; rot: number; c: TulipColors; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <path className="ink" fill={c.shade} d="M-9,-4 C-11,-18 -6,-31 0,-36 C6,-31 11,-18 9,-4 Z" />
      <path className="ink" fill={c.base} d="M1,1 C-9,2 -13,-7 -13,-17 C-13,-25 -9,-31 -5,-35 C-3,-26 1,-14 3,-1 Z" />
      <path d="M-10,-9 C-11,-18 -9,-26 -6,-31" fill="none" stroke={c.hi} strokeWidth="2" strokeLinecap="round" />
      <path className="ink" fill={c.base} d="M-1,1 C9,2 13,-7 13,-17 C13,-24 10,-30 6,-33 C3,-25 -1,-12 -2,-1 Z" />
      <path d="M3,-2 C6,-10 9,-18 10,-24 C12,-16 11,-6 6,-1 Z" fill={c.shade} opacity="0.7" />
      <path d="M-8,-1 C-4,2 4,2 8,-1 C5,-4 -5,-4 -8,-1 Z" fill={c.deep} opacity="0.55" />
    </g>
  );
}

/** The broad blue-green leaves, drawn behind (back) or in front of (front) the stems. */
function TulipLeaves({ part, s = 1 }: { part: 'back' | 'front'; s?: number }) {
  return (
    <g transform={`scale(${s})`}>
      {part === 'back' ? (
        <>
          <path className="ink" fill={BLUE_LEAF.base} d="M-3,0 C-20,-14 -28,-42 -24,-72 C-21,-56 -12,-32 4,-2 Z" />
          <path fill={BLUE_LEAF.shade} d="M-3,0 C-14,-20 -21,-44 -24,-72 C-21,-56 -12,-32 4,-2 Z" />
        </>
      ) : (
        <>
          <path className="ink" fill={BLUE_LEAF.base} d="M3,0 C20,-14 32,-38 39,-68 C27,-46 14,-24 -3,-2 Z" />
          <path fill={BLUE_LEAF.hi} d="M3,-3 C16,-18 28,-40 39,-68 C30,-44 18,-22 5,-6 Z" opacity="0.7" />
          <path className="ink" fill={BLUE_LEAF.base} d="M-5,0 C-11,-22 -8,-46 2,-62 C5,-60 6,-56 4,-54 C2,-40 5,-20 6,0 Z" />
          <path fill={BLUE_LEAF.shade} d="M-5,0 C-9,-20 -6,-42 2,-62 C-1,-46 -1,-22 1,0 Z" />
        </>
      )}
    </g>
  );
}

/** A closed bud, still mostly green with colour showing at the tip. */
function TulipBud({ x, y, rot, tip }: { x: number; y: number; rot: number; tip: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path className="ink" fill="#a9c093" d="M-6,0 C-8,-10 -5,-21 0,-26 C5,-21 8,-10 6,0 Z" />
      <path fill={tip} d="M-4.4,-13 C-3.4,-19 -1.4,-23.4 0,-25.6 C1.4,-23.4 3.4,-19 4.4,-13 C2,-15.4 -2,-15.4 -4.4,-13 Z" />
      <path d="M0,-2 C1,-9 1,-17 0,-24" fill="none" stroke="#86a372" strokeWidth="1" />
    </g>
  );
}

export function TulipPlant({ stage = 'bloom', label = 'tulipan' }: { stage?: Stage; label?: string }) {
  if (stage === 'seed') {
    return (
      <g>
        <path className="ink" fill="#c79e72" d="M-8,1 C-8,-5 -4,-10 0,-14 C4,-10 8,-5 8,1 Z" />
        <path d="M-3,-1 C-3,-6 -1.5,-10 0,-13 M3,-1 C3,-6 1.5,-10 0,-13" fill="none" stroke="#9a7550" strokeWidth="0.9" />
        <path className="ink-thin" fill="#8fb07a" d="M-1.4,-13 C-1.2,-18 1.2,-18 1.4,-13 Z" />
        <SeedMarker label={label} />
      </g>
    );
  }
  if (stage === 'seedling') {
    return (
      <g>
        <path className="ink" fill={BLUE_LEAF.base} d="M-2,0 C-10,-8 -12,-20 -8,-30 C-6,-20 -2,-10 3,-1 Z" />
        <path fill={BLUE_LEAF.shade} d="M-2,0 C-7,-10 -9,-20 -8,-30 C-6,-20 -2,-10 3,-1 Z" />
        <path className="ink" fill={BLUE_LEAF.base} d="M2,0 C10,-6 13,-16 11,-24 C7,-16 3,-8 -2,-1 Z" />
        <path fill={BLUE_LEAF.hi} d="M2,-2 C8,-8 11,-15 11,-24 C8,-15 5,-9 0,-3 Z" opacity="0.7" />
      </g>
    );
  }
  if (stage === 'bud') {
    return (
      <g>
        <TulipLeaves part="back" s={0.9} />
        <Stem d="M0,0 C1,-30 3,-60 4,-80" w={3} color="#7ca26b" />
        <Stem d="M5,0 C7,-22 12,-44 16,-58" w={2.6} color="#7ca26b" />
        <TulipBud x={4} y={-78} rot={2} tip={TULIP_NIGHT.base} />
        <TulipBud x={16} y={-56} rot={14} tip={TULIP_PINK.base} />
        <TulipLeaves part="front" s={0.9} />
      </g>
    );
  }
  return (
    <g>
      <TulipLeaves part="back" />
      <Stem d="M-6,0 C-8,-34 -13,-66 -15,-92" w={3} color="#7ca26b" />
      <Stem d="M1,0 C2,-40 5,-80 7,-110" w={3} color="#7ca26b" />
      <Stem d="M6,0 C8,-28 15,-56 21,-80" w={3} color="#7ca26b" />
      <TulipFlower x={-15} y={-90} rot={-7} c={TULIP_PINK} />
      <TulipFlower x={7} y={-108} rot={3} c={TULIP_NIGHT} s={1.05} />
      <TulipFlower x={21} y={-78} rot={13} c={TULIP_PINK} s={0.94} />
      <TulipLeaves part="front" />
    </g>
  );
}
