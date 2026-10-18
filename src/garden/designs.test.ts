import { describe, expect, it } from 'vitest';
import { parseDesigns, potShape, type PansyDesign, type PotDesign } from './designs';
import { addPlant, deleteDesign, parseSave, savePansyDesign, savePotDesign, setPot, setVariety, starterGarden, type GardenState } from './state';
import { pansyPalette, plantLook } from '../plants/looks';

const NOW = Date.UTC(2026, 9, 17);
const pot: PotDesign = { id: 'p1', shape: 'round', body: '#f2c4cf', pattern: 'hearts', patternColor: '#7c2141', rim: '#7c2141' };
const pansy: PansyDesign = { id: 'f1', name: 'Słoneczko', top: '#f3d36b', low: '#6b3fa0', face: 'whiskers', faceColor: '#241326', edge: null };

function designed() {
  let g: GardenState = { ...starterGarden(NOW), plants: [] };
  g = savePotDesign(savePansyDesign(g, pansy), pot);
  g = addPlant(g, 'row3-a', 'pansy', NOW, 'a', 'd:f1');
  return setPot(g, 'a', 'd:p1');
}

describe('her own designs', () => {
  it('keep their pot and colours through a save', () => {
    const g = designed();
    const back = parseSave(JSON.parse(JSON.stringify(g)), NOW)!;
    expect(back.designs).toEqual(g.designs);
    expect(back.plants[0]).toMatchObject({ pot: 'd:p1', variety: 'd:f1' });
  });

  it('are drawn from the design: its shape, and flowers in her colours', () => {
    const g = designed();
    const look = plantLook(g.plants[0]!, g.designs);
    expect(look.shape).toBe('round');
    expect(look.pot).toEqual(pot);
    expect(look.palette[0]).toMatchObject({ top: '#f3d36b', low: '#6b3fa0', whiskers: true });
    expect(look.label).toBe('Słoneczko');
    // the same design always gives the same palette, so drawings aren't redone for nothing
    expect(pansyPalette('d:f1', g.designs)).toBe(pansyPalette('d:f1', g.designs));
  });

  it('send plants back to their usual pot and colours when a design is thrown away', () => {
    let g = deleteDesign(designed(), 'pot', 'p1');
    expect(g.plants[0]!.pot).toBe('wide');
    g = deleteDesign(g, 'pansy', 'f1');
    expect(g.plants[0]!.variety).toBeNull();
    expect(g.designs).toEqual({ pansies: [], pots: [] });
  });

  it('only gives colours to bratki', () => {
    let g = addPlant(designed(), 'row3-b', 'tulip', NOW, 't', 'd:f1');
    g = setVariety(g, 't', 'd:f1');
    expect(g.plants.find((p) => p.id === 't')!.variety).toBeNull();
  });

  it('drop references to designs that no longer exist, and broken designs, when loading', () => {
    const g = designed();
    const raw = JSON.parse(JSON.stringify({ ...g, designs: { pansies: [], pots: [{ id: 'x', shape: 'bucket', body: 'red' }, 'junk'] } }));
    const back = parseSave(raw, NOW)!;
    expect(back.plants[0]).toMatchObject({ pot: 'wide', variety: null });
    expect(back.designs.pots).toEqual([{ id: 'x', shape: 'wide', body: '#2b2229', pattern: 'none', patternColor: '#e79ab4', rim: '#2b2229' }]);
  });

  it('read sensibly from anything', () => {
    expect(parseDesigns(undefined)).toEqual({ pansies: [], pots: [] });
    expect(potShape('d:missing', { pansies: [], pots: [] }, 'slim')).toBe('slim');
  });
});
