import type { Rarity, SeedItem } from '../garden/market';
import type { words } from '../i18n';
import { RIBBON_NAMES, say } from './visitorWords';
import { VASE_NAMES } from './Bouquets';

type W = ReturnType<typeof words>;
type Line = readonly [string, string, string?];
const pick = (w: W, lines: readonly Line[], n: number) => say(w, lines[Math.abs(n) % lines.length]!);

export const RARITY_NAME: Record<Rarity, [string, string]> = {
  common: ['Common', 'Zwykłe'],
  uncommon: ['Uncommon', 'Niezwykłe'],
  rare: ['Rare', 'Rzadkie'],
  veryrare: ['Very rare', 'Bardzo rzadkie'],
  legendary: ['Legendary', 'Legendarne'],
};

export const TRINKET_NAME: Record<string, [string, string]> = {
  mushroom: ['Toadstool charm', 'Muchomorek'],
  moon: ['Sleepy moon', 'Śpiący księżyc'],
  cherries: ['Cherries', 'Wisienki'],
  key: ['Old key', 'Stary kluczyk'],
  star: ['Little star', 'Gwiazdeczka'],
  padlock: ['Heart padlock', 'Kłódka w serce'],
  bat: ['Little bat', 'Nietoperek'],
  cauldron: ['Bubbling cauldron', 'Bulgoczący kociołek'],
  pansy: ['Bratek charm', 'Bratek na łańcuszku'],
  bee: ['Little Jingleton', 'Mały Jingleton'],
  hat: ['Witch’s hat', 'Kapelusz czarownicy'],
  crystal: ['Lilac crystal', 'Liliowy kryształ'],
  snail: ['Pink snail', 'Różowy ślimak'],
  candles: ['Three candles', 'Trzy świeczki'],
  teapot: ['Polka-dot teapot', 'Czajniczek w kropki'],
  toadstool: ['Toadstool cottage', 'Domek w muchomorze'],
  geode: ['Geode', 'Geoda'],
  sleepybat: ['Sleepy bat', 'Śpiący nietoperz'],
  hourglass: ['Hourglass', 'Klepsydra'],
  piorun: ['Tiny Piorun', 'Malutki Piorun'],
  bajzel: ['Tiny Bajzel', 'Malutki Bajzel'],
  musicbox: ['Music box', 'Pozytywka'],
  snowglobe: ['Snow globe', 'Śnieżna kula'],
  moonlamp: ['Moon lamp', 'Lampka-księżyc'],
  milton: ['Milton', 'Milton'],
};

/** A few words about each, for its card and the box. */
export const TRINKET_ABOUT: Record<string, Line> = {
  mushroom: ['For luck.', 'Na szczęście.'],
  moon: ['Fast asleep.', 'Śpi smacznie.'],
  cherries: ['Two, never one.', 'Zawsze dwie.'],
  key: ['Opens something.', 'Coś otwiera.'],
  star: ['Fell from the sky.', 'Spadła z nieba.'],
  padlock: ['Key lost on purpose.', 'Kluczyk zgubiony specjalnie.'],
  bat: ['Right way up, for once.', 'Dla odmiany głową do góry.'],
  cauldron: ['Bubbles a little.', 'Trochę bulgocze.'],
  pansy: ['Never needs watering.', 'Nie trzeba podlewać.'],
  bee: ['He wanted to come too.', 'Też chciał wisieć.'],
  hat: ['A little too big.', 'Trochę za duży.'],
  crystal: ['Catches the light.', 'Łapie światło.'],
  snail: ['In no hurry.', 'Nigdzie się nie spieszy.'],
  candles: ['They never burn down.', 'Nigdy się nie wypalają.'],
  teapot: ['Tea, any minute.', 'Zaraz będzie herbata.'],
  toadstool: ['Knock gently.', 'Pukaj delikatnie.'],
  geode: ['A night sky inside.', 'W środku nocne niebo.'],
  sleepybat: ['Do not wake.', 'Nie budzić.'],
  hourglass: ['As slow as you like.', 'Tak wolno, jak chcesz.'],
  piorun: ['Just as handsome.', 'Tak samo przystojny.'],
  bajzel: ['Pocket-sized.', 'Kieszonkowy.'],
  musicbox: ['Tap it for a tune.', 'Stuknij, a zagra.'],
  snowglobe: ['Tap it for snow.', 'Stuknij, a spadnie śnieg.'],
  moonlamp: ['Glows when it’s dark.', 'Świeci po zmroku.'],
  milton: ['He looks after you.', 'Opiekuje się Tobą.'],
};

/** What a seed packet is, in words. */
export function seedName(w: W, item: SeedItem): string {
  switch (item.kind) {
    case 'species':
      return w.flower(item.species);
    case 'pansy':
      return item.design.name;
    case 'ribbon':
      return w.t(`${RIBBON_NAMES[item.color]?.[0] ?? ''} ribbon`, `Wstążka: ${RIBBON_NAMES[item.color]?.[1].toLowerCase() ?? ''}`);
    case 'vase':
      return w.t(...VASE_NAMES[item.vase]);
  }
}

export function seedAbout(w: W, item: SeedItem): string {
  switch (item.kind) {
    case 'species':
      return w.t('A new flower to plant.', 'Nowy kwiat do sadzenia.');
    case 'pansy':
      return item.design.pattern ? w.t('Three seeds. Only from the market.', 'Trzy nasiona. Tylko z targu.') : w.t('Three seeds.', 'Trzy nasiona.');
    case 'ribbon':
      return w.t('For bouquets.', 'Do bukietów.');
    case 'vase':
      return w.t('For bouquets.', 'Do bukietów.');
  }
}

const JEZYK_HELLO: Line[] = [
  ['Good morning! Fresh seeds today, have a look.', 'Dzień dobry! Dziś świeże nasionka, proszę się rozejrzeć.'],
  ['Ah, my favourite customer! What’ll it be?', 'O, moja ulubiona klientka! Co podać?', 'O, mój ulubiony klient! Co podać?'],
  ['Hello, hello! I’ve put the best ones at the front.', 'Dzień dobry, dzień dobry! Najlepsze położyłem z przodu.'],
  ['Mind the spines. The seeds don’t prickle, I promise.', 'Uwaga na kolce. Nasionka nie kłują, obiecuję.'],
];
const JEZYK_THANKS: Line[] = [
  ['Lovely choice! May it serve you well.', 'Świetny wybór! Niech dobrze służy.'],
  ['Wrapped and done. Come again tomorrow!', 'Zapakowane. Zapraszam jutro!'],
  ['Ooh, those are good ones. Look after them.', 'Och, to dobre nasionka. Dbaj o nie.'],
];
const JEZYK_SHORT: Line[] = [
  ['Ah, a few petals short. It’ll keep, no rush.', 'Och, brakuje kilku płatków. Odłożę, nie ma pośpiechu.'],
  ['Not quite enough petals yet. Bring me a few more another day.', 'Jeszcze trochę za mało płatków. Wróć innego dnia.'],
];
const JEZYK_ASLEEP: Line[] = [
  ['Pan Jeżyk is curled up asleep. The stall opens in the morning.', 'Pan Jeżyk śpi zwinięty w kulkę. Stragan otwiera się rano.'],
  ['Shh. Pan Jeżyk is snoring very quietly. Come back when it’s light.', 'Ćśś. Pan Jeżyk cichutko chrapie. Wróć, kiedy będzie jasno.'],
];
const JEZYK_EMPTY: Line = ['All sold! There’ll be more tomorrow.', 'Wszystko sprzedane! Jutro będzie więcej.'];

const CMA_HELLO: Line[] = [
  ['Good evening, dear. The cards are face down; turn over any you like.', 'Dobry wieczór, kochanie. Karty leżą zakryte. Odwróć, które chcesz.'],
  ['Ah, you came. I saved these just for you.', 'Ach, przyszłaś. Te odłożyłam specjalnie dla Ciebie.', 'Ach, przyszedłeś. Te odłożyłam specjalnie dla Ciebie.'],
  ['Mm… the moon said you’d come by tonight.', 'Mm… księżyc mówił, że dziś zajrzysz.'],
];
const CMA_THANKS: Line[] = [
  ['It suits you. It knew it would.', 'Pasuje do Ciebie. Ono to wiedziało.'],
  ['Mind it, dear. Little things like that remember who loves them.', 'Dbaj o nie. Takie drobiazgi pamiętają, kto je kocha.'],
  ['Another for your collection. Come back next weekend.', 'Kolejny do kolekcji. Zajrzyj w następny weekend.'],
];
const CMA_SHORT: Line = ['Not enough petals tonight. It will wait for you.', 'Dziś za mało płatków. Ono na Ciebie poczeka.'];
const CMA_DONE: Line = ['That’s all I have this weekend. Sleep well, dear.', 'To wszystko na ten weekend. Śpij dobrze, kochanie.'];
export const CMA_MILTON: Line = [
  'Oh, this one… he isn’t for sale. I think he wants to go with you.',
  'Och, ten tutaj… nie jest na sprzedaż. Chyba chce iść z Tobą.',
];

export const jezykHello = (w: W, n: number) => pick(w, JEZYK_HELLO, n);
export const jezykThanks = (w: W, n: number) => pick(w, JEZYK_THANKS, n);
export const jezykShort = (w: W, n: number) => pick(w, JEZYK_SHORT, n);
export const jezykAsleep = (w: W, n: number) => pick(w, JEZYK_ASLEEP, n);
export const jezykEmpty = (w: W) => say(w, JEZYK_EMPTY);
export const cmaHello = (w: W, n: number) => pick(w, CMA_HELLO, n);
export const cmaThanks = (w: W, n: number) => pick(w, CMA_THANKS, n);
export const cmaShort = (w: W) => say(w, CMA_SHORT);
export const cmaDone = (w: W) => say(w, CMA_DONE);

/** What Milton has to say when she taps him. He's an egg, so not much, but he means all of it. */
const MILTON_SAYS: Line[] = [
  ['Milton is keeping watch.', 'Milton czuwa.'],
  ['(Milton wobbles happily.)', '(Milton kiwa się z zadowolenia.)'],
  ['I’m here.', 'Jestem tu.'],
  ['Everything will be all right. — Milton', 'Wszystko będzie dobrze. Milton'],
  ['Milton is proud of you.', 'Milton jest z Ciebie dumny.'],
  ['Milton says: drink some water.', 'Milton mówi: napij się wody.'],
  ['No rush, says Milton.', 'Bez pośpiechu, mówi Milton.'],
  ['Milton is looking after you.', 'Milton się Tobą opiekuje.'],
  ['(A tiny tap from inside.)', '(Ciche puknięcie od środka.)'],
  ['You’re doing well, says Milton.', 'Dobrze Ci idzie, mówi Milton.'],
  ['Have you eaten today? asks Milton.', 'Jadłaś dziś coś? pyta Milton.', 'Jadłeś dziś coś? pyta Milton.'],
];
export const miltonSays = (w: W, n: number) => pick(w, MILTON_SAYS, n);

