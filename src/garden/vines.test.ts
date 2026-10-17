import { describe, expect, it } from 'vitest';
import { chooseRoutes, pickMiddleDir } from './vines';

describe('vine routes', () => {
  it('arches side vines across when they are alone or paired', () => {
    expect(chooseRoutes(true, false, null)).toEqual({ 'sill-1': 'left-across' });
    expect(chooseRoutes(false, true, null)).toEqual({ 'sill-3': 'right-across' });
    expect(chooseRoutes(true, true, null)).toEqual({ 'sill-1': 'left-across', 'sill-3': 'right-across' });
  });

  it('keeps side vines across next to a middle vine going either way', () => {
    for (const dir of ['left', 'right'] as const) {
      expect(chooseRoutes(true, false, dir)['sill-1']).toBe('left-across');
      expect(chooseRoutes(false, true, dir)['sill-3']).toBe('right-across');
      expect(chooseRoutes(false, false, dir)).toEqual({ 'sill-2': `middle-${dir}` });
    }
  });

  it('with all three, sends the side the middle turns away from down the centre bar', () => {
    expect(chooseRoutes(true, true, 'right')).toEqual({ 'sill-1': 'left-middle', 'sill-2': 'middle-right', 'sill-3': 'right-across' });
    expect(chooseRoutes(true, true, 'left')).toEqual({ 'sill-1': 'left-across', 'sill-2': 'middle-left', 'sill-3': 'right-middle' });
  });

  it('has exactly 11 distinct layouts', () => {
    const layouts = new Set<string>();
    for (const left of [false, true])
      for (const right of [false, true])
        for (const middle of [null, 'left', 'right'] as const) {
          const r = chooseRoutes(left, right, middle);
          if (Object.keys(r).length) layouts.add(JSON.stringify(r));
        }
    expect(layouts.size).toBe(11);
  });

  it('turns a new middle vine towards the longer side, so the shorter one changes course', () => {
    expect(pickMiddleDir(0.9, 0.3, 0)).toBe('left');
    expect(pickMiddleDir(0.2, 0.6, 0.9)).toBe('right');
    expect(pickMiddleDir(null, 0.6, 0.2)).toBe('left');
    expect(pickMiddleDir(null, null, 0.7)).toBe('right');
  });
});
