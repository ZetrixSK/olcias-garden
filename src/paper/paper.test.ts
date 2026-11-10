import { describe, expect, it } from 'vitest';
import { easter, holidaysOn, nameDayCount, nameDays, nextShower, showerTonight } from './calendar';
import { dayKeyOf, logEvent, NO_PAPER, paperDate, parsePaper, withNote, yesterdayWindow } from './log';
import { buildIssue, cycled, gardenLines, gendered, leadsFor, type Issue } from './issue';
import { checkWorld } from './world';
import { testGarden } from '../garden/testGarden';
import { parseSave, starterGarden } from '../garden/state';
import { applyAction } from '../remote/actions';
import { HEADLINES } from './bank/headlines';
import { SERIALS } from './bank/serials';

const noon = (y: number, m: number, d: number) => new Date(y, m, d, 12);

describe('the calendar', () => {
  it('has a name day for every day of a leap year', () => {
    expect(nameDayCount()).toBe(366);
    expect(nameDays(noon(2026, 10, 11))).toContain('Marcina');
    expect(nameDays(noon(2026, 11, 24))).toContain('Adama');
  });
  it('knows when Easter is', () => {
    expect(easter(2025)).toEqual({ month: 3, day: 20 });
    expect(easter(2026)).toEqual({ month: 3, day: 5 });
    expect(easter(2027)).toEqual({ month: 2, day: 28 });
  });
  it('knows the holidays, fixed and moving', () => {
    expect(holidaysOn(noon(2026, 10, 29)).map((h) => h.name.pl)[0]).toMatch(/andrzejki/);
    expect(holidaysOn(noon(2026, 1, 12)).map((h) => h.name.pl)).toContain('tłusty czwartek');
    expect(holidaysOn(noon(2026, 3, 7))).toEqual([]);
  });
  it('has the Geminids on the night of 13 December, past midnight too', () => {
    expect(showerTonight(new Date(2026, 11, 13, 22).getTime())?.name.pl).toBe('Geminidy');
    expect(showerTonight(new Date(2026, 11, 14, 2).getTime())?.name.pl).toBe('Geminidy');
    expect(showerTonight(new Date(2026, 11, 14, 22).getTime())).toBeNull();
    expect(nextShower(noon(2026, 10, 11))?.days).toBe(6);
  });
});

describe('the papers in her save', () => {
  it('starts empty, and an old save without papers loads with none', () => {
    expect(starterGarden(Date.now()).paper).toEqual(NO_PAPER);
    const old = JSON.parse(JSON.stringify(testGarden(Date.now()))) as Record<string, unknown>;
    delete old.paper;
    expect(parseSave(old)?.paper).toEqual(NO_PAPER);
  });
  it('reads what it can and drops the rest', () => {
    const p = parsePaper({
      log: [{ at: 5, kind: 'visit', who: 'jingleton', petals: 4 }, { at: 'x', kind: 'visit' }, { at: 6, kind: 'nonsense' }],
      notes: [{ id: 'a', day: '2026-11-12', text: '  hi  ' }, { id: 'b', day: 'tomorrow', text: 'no' }],
      read: '2026-11-10',
    });
    expect(p.log).toHaveLength(1);
    expect(p.notes).toEqual([{ id: 'a', day: '2026-11-12', text: 'hi' }]);
    expect(p.read).toBe('2026-11-10');
    expect(parsePaper('garbage')).toEqual(NO_PAPER);
  });
  it('keeps the save round trip', () => {
    const g = testGarden(Date.now());
    const withLog = { ...g, paper: logEvent(g.paper, { at: Date.now(), kind: 'post', from: 'daniel' }) };
    expect(parseSave(JSON.parse(JSON.stringify(withLog)))?.paper.log).toHaveLength(1);
  });
  it('forgets events after about a week', () => {
    const t = Date.now();
    let p = logEvent(NO_PAPER, { at: t - 20 * 86_400_000, kind: 'post', from: null });
    p = logEvent(p, { at: t, kind: 'post', from: null });
    expect(p.log).toHaveLength(1);
  });
  it('replaces a day’s note, and an empty note takes it out', () => {
    let p = withNote(NO_PAPER, { id: '1', day: '2026-11-12', text: 'one' });
    p = withNote(p, { id: '2', day: '2026-11-12', text: 'two' });
    expect(p.notes.map((n) => n.text)).toEqual(['two']);
    expect(withNote(p, { id: '3', day: '2026-11-12', text: '  ' }).notes).toEqual([]);
  });
});

describe('the day the papers belong to', () => {
  it('is yesterday until five in the morning', () => {
    expect(dayKeyOf(paperDate(new Date(2026, 10, 11, 4, 59).getTime()))).toBe('2026-11-10');
    expect(dayKeyOf(paperDate(new Date(2026, 10, 11, 5, 0).getTime()))).toBe('2026-11-11');
  });
  it('reports "yesterday" from 5:00 to 5:00', () => {
    const { from, to } = yesterdayWindow(noon(2026, 10, 11));
    expect(new Date(from).getDate()).toBe(10);
    expect(new Date(to).getHours()).toBe(5);
  });
});

const strings = (issue: Issue): string[] => {
  const out: string[] = [];
  const walk = (v: unknown) => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object' && !(v instanceof Date)) Object.values(v).forEach(walk);
  };
  walk(issue);
  return out;
};

describe('building an issue', () => {
  const g = testGarden(new Date(2026, 10, 1).getTime());
  const input = (day: Date, lang: 'pl' | 'en' | 'mixed' = 'pl', me: 'she' | 'he' = 'she') => ({ day, now: day.getTime(), garden: g, lang, me, weather: { sky: 'cloudy' as const, night: false }, world: null });

  it('is the same every time for the same day', () => {
    const a = buildIssue(input(noon(2026, 10, 20)));
    const b = buildIssue(input(noon(2026, 10, 20)));
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
  it('builds a year of papers in both languages, to her and to him, with every gender form filled in', () => {
    for (let i = -30; i < 400; i += 3) {
      for (const [lang, me] of [['pl', 'she'], ['pl', 'he'], ['en', 'she']] as const) {
        const issue = buildIssue(input(noon(2026, 10, 10 + i), lang, me));
        for (const s of strings(issue)) expect(s).not.toMatch(/\{[^}]*\|/);
        expect(issue.kurier.lead.title.length).toBeGreaterThan(5);
        expect(issue.kurier.garden.length).toBeGreaterThan(0);
        expect(issue.kurier.soon.length).toBeGreaterThan(0);
      }
    }
  });
  it('never brings a front page back within a week, even where one round ends and the next begins', () => {
    const seen: string[] = [];
    for (let i = 0; i < 300; i++) seen.push(leadsFor(noon(2026, 10, 10 + i)).kurier);
    for (let i = 0; i < seen.length; i++) for (let k = 1; k <= 6 && i + k < seen.length; k++) expect(seen[i + k]).not.toBe(seen[i]);
  });
  it('lets the bees lead with the Kurier’s story about three or four days a week', () => {
    let shared = 0;
    for (let i = 0; i < 70; i++) if (leadsFor(noon(2026, 10, 10 + i)).bee.shared) shared++;
    expect(shared / 10).toBeGreaterThanOrEqual(2);
    expect(shared / 10).toBeLessThanOrEqual(5);
  });
  it('fills the note’s place with an extra ad and the editors’ reply when there’s no note', () => {
    const day = noon(2026, 10, 20);
    const without = buildIssue(input(day));
    const withIt = buildIssue({ ...input(day), garden: { ...g, paper: withNote(g.paper, { id: 'n', day: '2026-11-20', text: 'Dzień dobry' }) } });
    expect(without.kurier.note).toBeNull();
    expect(without.kurier.ads).toHaveLength(3);
    expect(without.kurier.letter.reply).not.toBeNull();
    expect(withIt.kurier.note).toBe('Dzień dobry');
    expect(withIt.kurier.ads).toHaveLength(2);
    expect(withIt.kurier.letter.reply).toBeNull();
  });
  it('prints the news column when it came, and the stand-in when not', () => {
    const world = checkWorld({ items: [good('szczecin'), good('polska')] })!;
    expect(buildIssue({ ...input(noon(2026, 10, 20)), world }).kurier.world.fresh).toBe(true);
    expect(buildIssue(input(noon(2026, 10, 20))).kurier.world.fresh).toBe(false);
  });
  it('every serial episode has a recap, and every bee story a picture', () => {
    for (const s of SERIALS) for (const e of s.episodes) expect(e.recap.pl.length).toBeGreaterThan(5);
    for (const h of HEADLINES) expect(h.art).toBeTruthy();
  });
});

describe('yesterday in her garden', () => {
  it('says something gentle on a quiet day', () => {
    const g = starterGarden(new Date(2026, 9, 1).getTime());
    const lines = gardenLines({ ...g, plants: [] }, noon(2026, 10, 20), 'pl', 'she');
    expect(lines).toEqual(['Spokojny dzień. Ogród odpoczywał i rósł.']);
  });
  it('tells who came and what she did, in her words', () => {
    const day = noon(2026, 10, 20);
    const at = new Date(2026, 10, 19, 15).getTime();
    const g = testGarden(new Date(2026, 9, 1).getTime());
    const busy = {
      ...g,
      plants: g.plants.map((p, i) => (i === 0 ? { ...p, waterings: [at] } : p)),
      paper: logEvent(logEvent(g.paper, { at, kind: 'visit', who: 'jingleton', petals: 6 }), { at, kind: 'buy', what: 'species', ref: 'rose', name: null }),
    };
    const pl = gardenLines(busy, day, 'pl', 'she').join(' ');
    expect(pl).toContain('Jingleton dostał od Ciebie bukiet.');
    expect(pl).toContain('W słoiku przybyło 6 płatków.');
    expect(pl).toContain('kupiłaś: różę');
    expect(pl).toContain('Podlałaś kwiaty raz.');
    expect(gardenLines(busy, day, 'pl', 'he').join(' ')).toContain('Podlałeś');
  });
});

const good = (place: string) => ({
  place,
  title: { pl: 'Flagi na Wałach Chrobrego', en: 'Flags on the embankment' },
  body: { pl: 'Szczecin świętuje nad Odrą. Bratkowo zawiesiło flagę na najwyższym słoneczniku w okolicy.', en: 'Szczecin is celebrating by the Oder. Bratkowo hung a flag on the tallest sunflower around.' },
});

describe('the news column check', () => {
  it('takes two or three good items, Szczecin first', () => {
    const w = checkWorld({ items: [good('polska'), good('szczecin'), good('swiat'), good('polska')] });
    expect(w?.map((x) => x.place)).toEqual(['szczecin', 'polska', 'swiat']);
  });
  it('refuses grim news, links, odd places and too little', () => {
    const grim = { ...good('polska'), body: { pl: 'W wypadku zginęło wiele osób, a Bratkowo milczy w żałobie od samego rana.', en: 'Many were killed in a crash, and Bratkowo is silent in mourning since morning.' } };
    const link = { ...good('polska'), body: { pl: 'Więcej na https://example.com i jeszcze trochę tekstu, żeby było dość długie.', en: 'More at https://example.com and some more text so it is long enough.' } };
    expect(checkWorld({ items: [good('polska'), grim] })).toBeNull();
    expect(checkWorld({ items: [good('polska'), link] })).toBeNull();
    expect(checkWorld({ items: [good('polska'), { ...good('mars') }] })).toBeNull();
    expect(checkWorld('nothing')).toBeNull();
  });
  it('is the very same code on the server', () => {
    const files = import.meta.glob(['./world.ts', '../../supabase/functions/paper-world/world.ts'], { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    const [here, there] = [files['./world.ts'], files['../../supabase/functions/paper-world/world.ts']];
    expect(here).toBeTruthy();
    expect(there).toBe(here);
  });
});

describe('his note, sent from the admin page', () => {
  const t = new Date(2026, 10, 11, 10).getTime();
  it('goes into that day’s papers', () => {
    const { garden, outcome } = applyAction(testGarden(t), { id: 'a1', kind: 'papernote', payload: { day: '2026-11-12', text: 'Do jutra!' } }, t);
    expect(outcome.status).toBe('applied');
    expect(garden.paper.notes[0]).toMatchObject({ day: '2026-11-12', text: 'Do jutra!' });
  });
  it('is today’s when no day is given, and is refused for a day that’s gone', () => {
    expect(applyAction(testGarden(t), { id: 'a2', kind: 'papernote', payload: { text: 'Hej' } }, t).garden.paper.notes[0]?.day).toBe('2026-11-11');
    expect(applyAction(testGarden(t), { id: 'a3', kind: 'papernote', payload: { day: '2026-11-01', text: 'Za późno' } }, t).outcome.status).toBe('skipped');
  });
});

describe('the order things come in', () => {
  it('goes through the whole list before repeating', () => {
    const list = ['a', 'b', 'c', 'd', 'e'];
    const firstRound = Array.from({ length: 5 }, (_, i) => cycled(list, i, 'x'));
    expect(new Set(firstRound).size).toBe(5);
  });
  it('picks her form or his', () => {
    expect(gendered('Podlał{aś|eś}', 'she')).toBe('Podlałaś');
    expect(gendered('Podlał{aś|eś}', 'he')).toBe('Podlałeś');
  });
});
