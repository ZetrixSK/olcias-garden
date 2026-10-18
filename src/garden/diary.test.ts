import { describe, expect, it } from 'vitest';
import { dateOfKey, dayKey, monthGrid, parseDiary } from './diary';
import { deleteDiaryEntry, parseSave, saveDiaryEntry, starterGarden } from './state';

const NOW = new Date(2026, 9, 18, 21, 30).getTime();

describe('her diary', () => {
  it('keys days by the local date', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(dateOfKey('2026-10-18').getDate()).toBe(18);
  });

  it('keeps one page a day, with its mood and words, through a save', () => {
    let g = saveDiaryEntry(starterGarden(NOW), '2026-10-18', 'happy', 'Planted a pumpkin. Bajzel tried to eat the seeds.', NOW);
    g = saveDiaryEntry(g, '2026-10-17', 'sleepy', '', NOW);
    g = saveDiaryEntry(g, '2026-10-18', 'love', 'Changed my mind about today.', NOW + 1000);
    expect(Object.keys(g.diary).sort()).toEqual(['2026-10-17', '2026-10-18']);
    expect(g.diary['2026-10-18']).toMatchObject({ mood: 'love', text: 'Changed my mind about today.' });
    const back = parseSave(JSON.parse(JSON.stringify(g)), NOW)!;
    expect(back.diary).toEqual(g.diary);
  });

  it('takes a page out when it is deleted, or saved with nothing on it', () => {
    let g = saveDiaryEntry(starterGarden(NOW), '2026-10-18', 'sad', 'hm', NOW);
    expect(saveDiaryEntry(g, '2026-10-18', null, '   ', NOW).diary).toEqual({});
    g = deleteDiaryEntry(g, '2026-10-18');
    expect(g.diary).toEqual({});
  });

  it('drops damaged pages and keeps the rest', () => {
    const diary = parseDiary({
      '2026-10-18': { mood: 'calm', text: 'ok', savedAt: 1 },
      '2026-10-17': { mood: 'furious', text: 'still kept for the words' },
      '2026-10-16': { mood: 'nope' },
      'yesterday': { mood: 'happy', text: 'x' },
      '2026-10-15': 'junk',
    });
    expect(Object.keys(diary).sort()).toEqual(['2026-10-17', '2026-10-18']);
    expect(diary['2026-10-17']!.mood).toBeNull();
    expect(parseDiary(null)).toEqual({});
  });

  it('lays a month out in weeks starting on Monday', () => {
    const october = monthGrid(2026, 9);
    // 1 October 2026 is a Thursday
    expect(october[0]!.slice(0, 3)).toEqual([null, null, null]);
    expect(october[0]![3]!.getDate()).toBe(1);
    expect(october.flat().filter(Boolean)).toHaveLength(31);
    expect(october.every((w) => w.length === 7)).toBe(true);
  });
});
