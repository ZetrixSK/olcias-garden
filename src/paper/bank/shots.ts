import type { Shot } from '../PaperArt';
import type { L } from '../types';

const l = (pl: string, en: string) => ({ pl, en });

/**
 * The picture for each story, set up like a press photo. Keys: `h:` a Kurier front page, `hb:` the
 * bees' version of it, `b:` Brzęczyk's own story, `s:<serial>:<part>` a serial's part, `i:` the
 * first days' stories. The ground runs along y = 100 of a 240-wide frame.
 */
export const SHOTS: Record<string, Shot> = {
  // the Kurier's front pages
  'h:moon-gone': { set: 'hill', cast: [{ a: 'jezyk', x: 78, y: 4 }, { a: 'lantern', x: 106, y: 6 }, { a: 'moon', x: 182, y: 70, s: 1.3 }] },
  'h:pothole': { set: 'street', cast: [{ a: 'jezyk', x: 70 }, { a: 'hole', x: 150 }, { a: 'mole', x: 150, y: -2 }] },
  'h:pumpkin': { set: 'street', cast: [{ a: 'jadzia:happy', x: 48 }, { a: 'pumpkin', x: 128, s: 1.05 }, { a: 'listonosz:puzzled', x: 204 }] },
  'h:first-frost': { set: 'snow', cast: [{ a: 'rechotka', x: 92, y: 2 }, { a: 'jezyk-asleep', x: 176, y: 2 }] },
  'h:cat-council': { set: 'hall', cast: [{ a: 'desk', x: 80 }, { a: 'atrament', x: 80, y: 26, s: 0.8 }, { a: 'books', x: 114, y: 26 }, { a: 'stone-mayor', x: 34 }] },
  'h:moustache': { set: 'street', cast: [{ a: 'listonosz:happy', x: 110 }, { a: 'letter', x: 152 }, { a: 'diploma', x: 70 }] },
  'h:pink-pond': { set: 'pinkpond', cast: [{ a: 'wiedzmusia:puzzled', x: 64 }, { a: 'cauldron', x: 104 }, { a: 'rechotka:happy', x: 186 }] },
  'h:night-library': { set: 'attic', cast: [{ a: 'duszek', x: 78, y: 6 }, { a: 'books', x: 126 }, { a: 'candles', x: 156 }, { a: 'jezyk', x: 206, s: 0.85 }] },
  'h:clock': { set: 'street', cast: [{ a: 'clocktower', x: 84 }, { a: 'owl', x: 150 }, { a: 'jezyk', x: 202, s: 0.9 }] },
  'h:nuts': { set: 'orchard', cast: [{ a: 'squirrel', x: 72 }, { a: 'nuts', x: 120 }, { a: 'map', x: 172 }] },
  'h:crickets': { set: 'kitchen', cast: [{ a: 'jadzia:happy', x: 52 }, { a: 'cricket', x: 128, y: 28, s: 0.7 }, { a: 'cake', x: 176, y: 28 }, { a: 'notes', x: 140, y: 36 }] },
  'h:fog': { set: 'fog', cast: [{ a: 'listonosz:puzzled', x: 110 }, { a: 'letter', x: 156 }, { a: 'lamppost', x: 40 }] },
  'h:first-snow': { set: 'snow', cast: [{ a: 'dogs', x: 124, y: 2 }] },
  'h:socks': { set: 'room', cast: [{ a: 'dogs', x: 108 }, { a: 'socks', x: 212 }] },
  'h:polite': { set: 'hall', cast: [{ a: 'jadzia:happy', x: 50 }, { a: 'cake', x: 96 }, { a: 'diploma', x: 176 }, { a: 'atrament', x: 176, y: 18, s: 0.7 }] },
  'h:lamppost': { set: 'street', cast: [{ a: 'jadzia:delighted', x: 64 }, { a: 'lamppost-jumper', x: 120 }, { a: 'cma', x: 176, y: 8, s: 0.8 }] },
  'h:upside-down': { set: 'meadow', cast: [{ a: 'stall', x: 92 }, { a: 'seeds', x: 166 }, { a: 'mole', x: 206, s: 0.85 }] },
  'h:umbrella': { set: 'hall', cast: [{ a: 'rechotka:puzzled', x: 56 }, { a: 'clocktower', x: 128 }, { a: 'leaf', x: 140, y: 58, s: 0.7 }, { a: 'owl', x: 200 }] },
  'h:mayor-stone': { set: 'hall', cast: [{ a: 'atrament', x: 70 }, { a: 'stone-mayor', x: 134, s: 1.25 }, { a: 'flag', x: 196 }] },

  // the bees' versions
  'hb:moon-gone': { set: 'night', cast: [{ a: 'moon', x: 150, y: 72, s: 1.4 }, { a: 'cloud', x: 172, y: 58, s: 1.1 }, { a: 'trzmielina', x: 64, y: 22, s: 0.8 }, { a: 'camera', x: 92, y: 36 }] },
  'hb:pothole': { set: 'street', cast: [{ a: 'hole', x: 110 }, { a: 'mole', x: 110, y: -2 }, { a: 'map', x: 160 }, { a: 'trzmielina', x: 206, y: 40, s: 0.7 }] },
  'hb:pumpkin': { set: 'meadow', cast: [{ a: 'pumpkin', x: 112, s: 1.6 }, { a: 'trzmielina', x: 206, y: 46, s: 0.7 }] },
  'hb:first-frost': { set: 'hive', cast: [{ a: 'trzmielina', x: 96, y: 18 }, { a: 'honey', x: 154 }, { a: 'rechotka:happy', x: 204, s: 0.9 }] },
  'hb:cat-council': { set: 'hall', cast: [{ a: 'atrament', x: 104, s: 1.25 }, { a: 'trzmielina', x: 200, y: 40, s: 0.7 }] },
  'hb:moustache': { set: 'street', cast: [{ a: 'listonosz:delighted', x: 110, s: 1.25 }, { a: 'camera', x: 196, y: 30 }] },
  'hb:pink-pond': { set: 'pinkpond', cast: [{ a: 'trzmielina', x: 80, y: 36 }, { a: 'wiedzmusia:delighted', x: 172 }] },
  'hb:night-library': { set: 'night', cast: [{ a: 'duszek:puzzled', x: 110, y: 6 }, { a: 'trzmielina', x: 196, y: 36, s: 0.75 }] },
  'hb:clock': { set: 'night', cast: [{ a: 'owl', x: 116, s: 1.3 }, { a: 'nest', x: 170 }, { a: 'trzmielina', x: 56, y: 40, s: 0.7 }] },
  'hb:nuts': { set: 'orchard', cast: [{ a: 'squirrel', x: 70 }, { a: 'map', x: 120 }, { a: 'mole', x: 176 }] },
  'hb:crickets': { set: 'kitchen', cast: [{ a: 'cake', x: 120, y: 28, s: 1.4 }, { a: 'cricket', x: 164, y: 28, s: 0.7 }, { a: 'trzmielina', x: 60, y: 36, s: 0.7 }] },
  'hb:fog': { set: 'fog', cast: [{ a: 'trzmielina', x: 106, y: 30 }, { a: 'jadzia:puzzled', x: 176 }] },
  'hb:first-snow': { set: 'snow', cast: [{ a: 'dogs', x: 112, y: 2 }, { a: 'trzmielina', x: 210, y: 52, s: 0.65 }] },

  // Brzęczyk's own stories
  'b:dance-off': { set: 'hive', cast: [{ a: 'trzmielina', x: 64, y: 18 }, { a: 'jingleton:delighted', x: 150, y: 4 }, { a: 'notes', x: 196, y: 30 }] },
  'b:wasp-gang': { set: 'street', cast: [{ a: 'wasp', x: 80, y: 12 }, { a: 'wasp', x: 140, y: 26, flip: true }, { a: 'barrel', x: 110 }, { a: 'trzmielina', x: 210, y: 40, s: 0.7 }] },
  'b:honey-shortage': { set: 'hive', cast: [{ a: 'barrel', x: 56 }, { a: 'honey', x: 92 }, { a: 'jezyk-happy', x: 164 }] },
  'b:trzmielina-interview': { set: 'hive', cast: [{ a: 'trzmielina', x: 120, y: 18, s: 1.35 }, { a: 'newspaper', x: 190 }, { a: 'camera', x: 56 }] },
  'b:jingleton-hero': { set: 'meadow', cast: [{ a: 'plant:daisy', x: 52 }, { a: 'jingleton:happy', x: 120, y: 6 }, { a: 'ladybird', x: 168 }, { a: 'leaf', x: 200, s: 0.6 }] },
  'b:kurier-typo': { set: 'willow', cast: [{ a: 'borsuk', x: 118 }, { a: 'newspaper', x: 76 }, { a: 'trzmielina', x: 186, y: 44, s: 0.7 }] },
  'b:summer-meadow': { set: 'meadow', cast: [{ a: 'plant:daisy', x: 40 }, { a: 'plant:lavender', x: 90 }, { a: 'trzmielina', x: 146, y: 40 }, { a: 'plant:rose', x: 204 }] },
  'b:winter-ball': { set: 'hive', cast: [{ a: 'trzmielina', x: 92, y: 18 }, { a: 'jingleton:happy', x: 162, y: 6 }] },

  // the serials
  's:snail-race:1': { set: 'meadow', cast: [{ a: 'snail', x: 50 }, { a: 'snail', x: 92, s: 0.85 }, { a: 'snail', x: 134 }, { a: 'snail', x: 176, s: 0.9 }, { a: 'flag', x: 214 }] },
  's:snail-race:2': { set: 'meadow', cast: [{ a: 'beetle', x: 120 }, { a: 'snail', x: 112, y: 18, s: 0.8 }, { a: 'camera', x: 200, y: 6 }] },
  's:snail-race:3': { set: 'hall', cast: [{ a: 'owl', x: 52 }, { a: 'stone-mayor', x: 92 }, { a: 'snail', x: 140 }, { a: 'beetle', x: 196, s: 0.8 }] },
  's:snail-race:4': { set: 'meadow', cast: [{ a: 'beetle', x: 36, s: 0.8 }, { a: 'snail', x: 76 }, { a: 'snail', x: 114, s: 0.9 }, { a: 'flag', x: 160 }, { a: 'jezyk', x: 206, s: 0.8 }] },
  's:snail-race:5': { set: 'meadow', cast: [{ a: 'beetle', x: 52, s: 0.8 }, { a: 'snail', x: 104 }, { a: 'lettuce', x: 136 }, { a: 'snail', x: 170, flip: true }, { a: 'flag', x: 214 }] },
  's:moth-party:1': { set: 'night', cast: [{ a: 'cma', x: 104 }, { a: 'candles', x: 170 }] },
  's:moth-party:2': { set: 'street', cast: [{ a: 'jezyk', x: 104 }, { a: 'letter', x: 156 }, { a: 'seeds', x: 60 }] },
  's:moth-party:3': { set: 'night', cast: [{ a: 'candles', x: 52 }, { a: 'night-stall', x: 122 }, { a: 'lantern', x: 198 }] },
  's:moth-party:4': { set: 'street', cast: [{ a: 'hole', x: 60 }, { a: 'mole', x: 60, y: -2 }, { a: 'letter', x: 112 }, { a: 'jezyk-happy', x: 176 }] },
  's:lost-hat:1': { set: 'night', cast: [{ a: 'wiedzmusia:puzzled', x: 84 }, { a: 'broom', x: 140, y: 30 }, { a: 'hat', x: 194, y: 66 }] },
  's:lost-hat:2': { set: 'orchard', cast: [{ a: 'pumpkin', x: 116, s: 0.9 }, { a: 'hat', x: 118, y: 48 }, { a: 'crow', x: 196 }] },
  's:lost-hat:3': { set: 'night', cast: [{ a: 'wiedzmusia:puzzled', x: 64 }, { a: 'owl', x: 146, s: 1.2 }, { a: 'hat', x: 146, y: 46 }] },
  's:lost-hat:4': { set: 'night', cast: [{ a: 'jadzia:happy', x: 64 }, { a: 'owl-hat', x: 144, s: 1.2 }, { a: 'hat', x: 204 }] },
  's:bridge:1': { set: 'pond', cast: [{ a: 'bridge', x: 112 }, { a: 'rechotka:puzzled', x: 206 }] },
  's:bridge:2': { set: 'hall', cast: [{ a: 'rechotka', x: 54 }, { a: 'stone-mayor', x: 120 }, { a: 'owl', x: 186 }] },
  's:bridge:3': { set: 'pond', cast: [{ a: 'bridge', x: 120 }, { a: 'ants', x: 46 }, { a: 'ants', x: 194 }] },
  's:bridge:4': { set: 'pond', cast: [{ a: 'bridge', x: 112 }, { a: 'rechotka:happy', x: 112, y: 22, s: 0.75 }, { a: 'atrament', x: 210, s: 0.8 }] },
  's:windowsill:1': { set: 'room', cast: [{ a: 'plant:pansy', x: 56 }, { a: 'plant:tulip', x: 120 }, { a: 'plant:rose', x: 184 }] },
  's:windowsill:2': { set: 'room', cast: [{ a: 'jadzia', x: 56 }, { a: 'pumpkin', x: 140, s: 0.8 }, { a: 'duszek', x: 208, y: 6, s: 0.8 }] },
  's:windowsill:3': { set: 'hall', cast: [{ a: 'owl', x: 46 }, { a: 'jadzia', x: 98 }, { a: 'stone-mayor', x: 150 }, { a: 'trzmielina', x: 206, y: 40, s: 0.7 }] },
  's:windowsill:4': { set: 'room', cast: [{ a: 'plant:pansy', x: 30, s: 0.8 }, { a: 'dogs', x: 124 }, { a: 'plant:pansy', x: 214, s: 0.8 }] },
  's:windowsill:5': { set: 'room', cast: [{ a: 'plant:pansy', x: 60 }, { a: 'diploma', x: 120, y: 8, s: 1.3 }, { a: 'plant:pansy', x: 180 }] },
  's:hedgehog-sleep:1': { set: 'street', cast: [{ a: 'jezyk-asleep', x: 100 }, { a: 'seeds', x: 152 }, { a: 'kettle', x: 184 }] },
  's:hedgehog-sleep:2': { set: 'street', cast: [{ a: 'atrament', x: 56 }, { a: 'wiedzmusia', x: 122 }, { a: 'squirrel', x: 196 }] },
  's:hedgehog-sleep:3': { set: 'street', cast: [{ a: 'seeds', x: 36 }, { a: 'stall', x: 112 }, { a: 'squirrel', x: 196 }] },
  's:hedgehog-sleep:4': { set: 'street', cast: [{ a: 'jezyk-happy', x: 92 }, { a: 'squirrel', x: 156 }, { a: 'lantern', x: 204 }] },

  // the first days
  'i:0': { set: 'willow', cast: [{ a: 'newspaper', x: 34 }, { a: 'borsuk', x: 84 }, { a: 'desk', x: 150 }, { a: 'typewriter', x: 150, y: 26 }] },
  'ib:0': { set: 'hive', cast: [{ a: 'camera', x: 58 }, { a: 'trzmielina', x: 124, y: 18, s: 1.25 }, { a: 'newspaper', x: 196 }] },
  'i:1': { set: 'willow', cast: [{ a: 'borsuk', x: 66 }, { a: 'jadzia:happy', x: 124 }, { a: 'cake', x: 160 }, { a: 'jezyk', x: 200, s: 0.85 }] },
  'ib:1': { set: 'street', cast: [{ a: 'borsuk', x: 112, s: 1.1 }, { a: 'trzmielina', x: 196, y: 42, s: 0.7 }, { a: 'camera', x: 50 }] },
  'i:2': { set: 'willow', cast: [{ a: 'desk', x: 100 }, { a: 'typewriter', x: 100, y: 26 }, { a: 'borsuk', x: 150 }, { a: 'newspaper', x: 190 }] },
  'ib:2': { set: 'street', cast: [{ a: 'borsuk', x: 100 }, { a: 'newspaper', x: 128, y: 30 }, { a: 'trzmielina', x: 200, y: 42, s: 0.7 }] },
};

/** Brzęczyk's photo of the day, "Przyłapane!": caught in the act. */
export const PHOTOS: Array<{ shot: Shot; caption: L }> = [
  { shot: { set: 'night', cast: [{ a: 'night-stall', x: 100 }, { a: 'jezyk', x: 196, s: 0.9 }, { a: 'lantern', x: 222 }] }, caption: l('Pan Jeżyk przy straganie Pani Ćmy. Trzeci raz dziś. Przypadek?', 'Pan Jeżyk at Pani Ćma’s stall. Third time today. Coincidence?') },
  { shot: { set: 'street', cast: [{ a: 'bench', x: 120 }, { a: 'atrament', x: 120, y: 16, s: 0.8 }] }, caption: l('Radny Atrament w trakcie obrad.', 'Councillor Atrament, in session.') },
  { shot: { set: 'room', cast: [{ a: 'dogs', x: 110 }, { a: 'socks', x: 212 }] }, caption: l('Podejrzani. Skarpetki w tle.', 'The suspects. Socks in the background.') },
  { shot: { set: 'street', cast: [{ a: 'hole', x: 104 }, { a: 'mole', x: 104, y: -2 }, { a: 'map', x: 150 }] }, caption: l('Zenon z mapą. Metro? Metro.', 'Zenon with a map. Underground? Underground.') },
  { shot: { set: 'fog', cast: [{ a: 'duszek', x: 120, y: 6 }] }, caption: l('Duszek w dzień? Albo prześcieradło. Redakcja się kłóci.', 'Little Ghost by day? Or a sheet. The newsroom can’t agree.') },
  { shot: { set: 'pond', cast: [{ a: 'rechotka:happy', x: 110 }, { a: 'leaf', x: 140, y: 20, s: 0.8 }] }, caption: l('Rechotka i parasol. Tym razem trzyma mocno.', 'Rechotka and her umbrella. Holding on tight this time.') },
  { shot: { set: 'night', cast: [{ a: 'owl-hat', x: 120, s: 1.3 }] }, caption: l('Sowa wciąż nosi czapkę z pomponem. Nie zdejmuje.', 'The owl is still wearing the bobble hat. Won’t take it off.') },
  { shot: { set: 'street', cast: [{ a: 'borsuk', x: 110 }, { a: 'newspaper', x: 136, y: 30 }] }, caption: l('Redaktor Borsuk czyta Brzęczyk. Udaje, że nie.', 'Editor Borsuk reading Brzęczyk. Pretending not to.') },
  { shot: { set: 'room', cast: [{ a: 'listonosz:puzzled', x: 70 }, { a: 'dogs', x: 160 }] }, caption: l('Pan listonosz i psy z okna. Codzienne spotkanie, codzienne zaskoczenie.', 'The postman and the window dogs. A daily meeting, a daily surprise.') },
  { shot: { set: 'orchard', cast: [{ a: 'wiedzmusia:happy', x: 90 }, { a: 'cauldron', x: 140 }] }, caption: l('Coś różowego znowu się warzy. Staw drży.', 'Something pink is brewing again. The pond trembles.') },
  { shot: { set: 'orchard', cast: [{ a: 'squirrel', x: 100 }, { a: 'nuts', x: 150 }] }, caption: l('Halinka znalazła orzech. Jeden. Brawo.', 'Halinka found a nut. One. Well done.') },
  { shot: { set: 'room', cast: [{ a: 'milton', x: 120, s: 1.5 }] }, caption: l('Milton. Bez zmian.', 'Milton. No change.') },
  { shot: { set: 'meadow', cast: [{ a: 'plant:daisy', x: 80 }, { a: 'jingleton:happy', x: 150, y: 6 }] }, caption: l('Jingleton na stokrotkach. Dyżur.', 'Jingleton on the daisies. On duty.') },
  { shot: { set: 'street', cast: [{ a: 'lamppost-jumper', x: 104 }, { a: 'cma-happy', x: 160, y: 10, s: 0.8 }] }, caption: l('Pani Ćma przy latarni w swetrze. Ciepło jej.', 'Pani Ćma by the lamppost in its jumper. Nice and warm.') },
];
