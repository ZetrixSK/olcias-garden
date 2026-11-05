import { testGarden } from './garden/testGarden';
import { describe, expect, it } from 'vitest';
import { parseLang, plural, words } from './i18n';
import { elapsedText } from './ui/Clock';
import { whenText } from './ui/Sheets';
import { visitorNotice } from './ui/Visit';


const H = 3_600_000;
const NOW = new Date(2026, 9, 17, 10, 0).getTime();

describe('the three languages', () => {
  it('names flowers in Polish, in English, or Polish in an English garden', () => {
    expect(words('pl').flower('rose')).toBe('Róża');
    expect(words('en').flower('rose')).toBe('Rose');
    expect(words('mixed').flower('rose')).toBe('róża');
    expect(words('mixed').flowerSub('rose')).toBe('Rose');
    expect(words('pl').flowerSub('rose')).toBeNull();
    expect(words('en').marker('hellebore')).toBe('christmas rose');
    expect(words('mixed').marker('hellebore')).toBe('ciemiernik');
  });

  it('speaks English in the mixed garden, as before', () => {
    expect(words('mixed').t('Water', 'Podlej')).toBe('Water');
    expect(words('pl').t('Water', 'Podlej')).toBe('Podlej');
    expect(words('pl').mood('happy')).toBe('Szczęśliwa');
  });

  it('counts the Polish way', () => {
    expect([1, 2, 4, 5, 12, 13, 22, 25, 0].map((n) => plural(n, 'dzień', 'dni', 'dni'))).toEqual([
      'dzień', 'dni', 'dni', 'dni', 'dni', 'dni', 'dni', 'dni', 'dni',
    ]);
    expect([1, 2, 5, 12, 22, 104].map((n) => plural(n, 'roślina', 'rośliny', 'roślin'))).toEqual([
      'roślina', 'rośliny', 'roślin', 'roślin', 'rośliny', 'rośliny',
    ]);
  });

  it('says when things happen in Polish', () => {
    const pl = words('pl');
    expect(whenText(60_000, NOW, pl)).toBe('lada chwila');
    expect(whenText(24 * H, NOW, pl)).toBe('jutro rano');
    expect(whenText(72 * H, NOW, pl)).toBe('za jakieś 3 dni');
    expect(elapsedText(26 * H, pl)).toBe('1 dzień, 2 godz.');
    expect(elapsedText(26 * H)).toBe('1 day, 2 h');
  });

  it('keeps the garden as it was when the language is missing or unknown', () => {
    expect(parseLang(undefined)).toBe('mixed');
    expect(parseLang('de')).toBe('mixed');
    expect(parseLang('pl')).toBe('pl');
  });
});

describe('night flower names', () => {
  it('uses the full name everywhere but a short word on the seed marker', () => {
    const pl = words('pl');
    expect(pl.marker('batflower')).toBe('kwiat nietoperza');
    expect(pl.sign('batflower')).toBe('nietoperz');
    expect(pl.sign('moonflower')).toBe('księżyc');
    expect(pl.sign('pansy')).toBe('bratek');
    expect(words('en').sign('moonflower')).toBe('moonflower');
  });
});

describe('speaking to her, or to him', () => {
  it('talks to her unless the phone is set to him', () => {
    expect(words('pl').mood('tired')).toBe('Zmęczona');
    expect(words('pl', 'he').mood('tired')).toBe('Zmęczony');
    expect(words('pl').g('Wysyłałaś', 'Wysyłałeś')).toBe('Wysyłałaś');
    expect(words('pl', 'he').g('Wysyłałaś', 'Wysyłałeś')).toBe('Wysyłałeś');
    expect(words('en', 'he').mood('tired')).toBe('Tired');
  });

  it('says what a visitor did as they are: from their phone, or else the other one of the two', () => {
    const before = testGarden(NOW);
    const plant = before.plants[0]!.id;
    const notice = (who: unknown, me: 'she' | 'he') => visitorNotice({ from: 'kuba', kind: 'water', payload: { plant, who }, before }, words('pl', me))!.title;
    expect(notice('he', 'she')).toBe('#kuba wpadł z konewką');
    expect(notice('she', 'he')).toBe('#kuba wpadła z konewką');
    // an older phone didn't say: on her phone the visitor is him, on his it's her
    expect(notice(undefined, 'she')).toBe('#kuba wpadł z konewką');
    expect(notice(undefined, 'he')).toBe('#kuba wpadła z konewką');
  });
});
