import type { Shot } from '../PaperArt';
import type { L } from '../types';

const l = (pl: string, en: string) => ({ pl, en });

/**
 * The picture for each story, set up like a press photo: a place, who's there, what it's about,
 * and how they feel about it (the marks: zzz, hearts, sweat, !, ?). Keys: `h:` a Kurier front page,
 * `hb:` the bees' version of it, `b:` Brzęczyk's own story, `s:<serial>:<part>` a serial's part,
 * `i:`/`ib:` the first days. The ground runs along y = 100 of a 240-wide frame; `y` lifts a thing
 * off it (onto a table at 26, a raised sill at 36, into the air).
 */
export const SHOTS: Record<string, Shot> = {
  // the Kurier's front pages
  'h:moon-gone': { set: 'hill', cast: [{ a: 'jezyk', x: 70, y: 6 }, { a: 'lantern', x: 96, y: 8 }, { a: 'question', x: 84, y: 70 }, { a: 'owl', x: 150, y: 14, s: 0.8 }, { a: 'moon', x: 196, y: 74, s: 1.1 }, { a: 'firefly', x: 120, y: 20 }] },
  'h:pothole': { set: 'street', cast: [{ a: 'seeds', x: 34 }, { a: 'jezyk', x: 70 }, { a: 'anger', x: 88, y: 56 }, { a: 'hole', x: 150 }, { a: 'mole', x: 150 }, { a: 'sparkle', x: 170, y: 30 }, { a: 'bush', x: 220 }] },
  'h:pumpkin': { set: 'street', cast: [{ a: 'jadzia:delighted', x: 44 }, { a: 'hearts', x: 60, y: 68 }, { a: 'pumpkin', x: 126, s: 1.05 }, { a: 'listonosz:puzzled', x: 204 }, { a: 'sweat', x: 218, y: 60 }] },
  'h:first-frost': { set: 'snow', cast: [{ a: 'rechotka:happy', x: 78, y: 2 }, { a: 'sparkle', x: 104, y: 62 }, { a: 'jezyk-asleep', x: 168, y: 2 }, { a: 'zzz', x: 184, y: 52 }] },
  'h:cat-council': { set: 'hall', cast: [{ a: 'desk', x: 84 }, { a: 'teacup', x: 62, y: 26 }, { a: 'atrament', x: 88, y: 26, s: 0.8 }, { a: 'zzz', x: 104, y: 68 }, { a: 'books', x: 118, y: 26 }, { a: 'jezyk', x: 30, s: 0.8 }, { a: 'question', x: 40, y: 50 }] },
  'h:moustache': { set: 'street', cast: [{ a: 'diploma', x: 66 }, { a: 'listonosz:happy', x: 110 }, { a: 'sparkle', x: 122, y: 50 }, { a: 'letter', x: 152 }, { a: 'bush', x: 216 }] },
  'h:pink-pond': { set: 'pinkpond', cast: [{ a: 'wiedzmusia:puzzled', x: 58 }, { a: 'sweat', x: 72, y: 70 }, { a: 'cauldron', x: 96 }, { a: 'steam', x: 94, y: 22 }, { a: 'sparkle', x: 140, y: 18 }, { a: 'rechotka:happy', x: 186 }, { a: 'hearts', x: 200, y: 70 }] },
  'h:night-library': { set: 'attic', cast: [{ a: 'cobweb', x: 0, y: 100 }, { a: 'duszek:happy', x: 72, y: 6 }, { a: 'books', x: 118 }, { a: 'candles', x: 148 }, { a: 'teacup', x: 172 }, { a: 'jezyk-happy', x: 200, s: 0.85 }] },
  'h:clock': { set: 'street', cast: [{ a: 'clocktower', x: 84 }, { a: 'owl-asleep', x: 144, s: 0.9 }, { a: 'zzz', x: 156, y: 46 }, { a: 'jezyk', x: 202 }, { a: 'question', x: 216, y: 60 }] },
  'h:nuts': { set: 'orchard', cast: [{ a: 'squirrel', x: 70 }, { a: 'question', x: 86, y: 54 }, { a: 'nuts', x: 108 }, { a: 'map', x: 148 }, { a: 'basket', x: 196 }] },
  'h:crickets': { set: 'kitchen', cast: [{ a: 'jadzia:happy', x: 46 }, { a: 'cricket', x: 128, y: 28, s: 0.8 }, { a: 'notes', x: 146, y: 54 }, { a: 'cake', x: 180, y: 28 }, { a: 'atrament', x: 214, s: 0.7 }, { a: 'zzz', x: 226, y: 42 }] },
  'h:fog': { set: 'fog', cast: [{ a: 'lamppost', x: 40 }, { a: 'listonosz:puzzled', x: 112 }, { a: 'letter', x: 152 }] },
  'h:first-snow': { set: 'snow', cast: [{ a: 'dogs-out', x: 120, y: 0 }, { a: 'exclaim', x: 84, y: 44 }, { a: 'exclaim', x: 186, y: 60 }] },
  'h:socks': { set: 'room', cast: [{ a: 'dogs', x: 104, y: -10, s: 0.85 }, { a: 'socks', x: 204, y: -4 }, { a: 'question', x: 206, y: 24 }] },
  'h:polite': { set: 'hall', cast: [{ a: 'jadzia:happy', x: 44 }, { a: 'cake', x: 82 }, { a: 'diploma', x: 132 }, { a: 'atrament', x: 132, y: 18, s: 0.65 }, { a: 'sparkle', x: 150, y: 52 }, { a: 'jezyk', x: 212, s: 0.8 }] },
  'h:lamppost': { set: 'street', cast: [{ a: 'jadzia:delighted', x: 60 }, { a: 'hearts', x: 76, y: 66 }, { a: 'lamppost-jumper', x: 124 }, { a: 'sparkle', x: 132, y: 92 }, { a: 'cma-happy', x: 176, y: 12, s: 0.8 }] },
  'h:upside-down': { set: 'meadow', cast: [{ a: 'stall', x: 86 }, { a: 'seeds', x: 158 }, { a: 'hole', x: 206 }, { a: 'mole', x: 206 }, { a: 'question', x: 222, y: 30 }] },
  'h:umbrella': { set: 'hall', cast: [{ a: 'rechotka:puzzled', x: 50 }, { a: 'clocktower', x: 112 }, { a: 'leaf', x: 126, y: 60, s: 0.7 }, { a: 'motion', x: 108, y: 82 }] },
  'h:mayor-stone': { set: 'hall', cast: [{ a: 'atrament', x: 64 }, { a: 'anger', x: 80, y: 52 }, { a: 'stone-mayor', x: 128, s: 1.3 }, { a: 'sparkle', x: 148, y: 38 }] },

  // the bees' versions
  'hb:moon-gone': { set: 'night', cast: [{ a: 'moon', x: 150, y: 72, s: 1.4 }, { a: 'cloud', x: 172, y: 58, s: 1.1 }, { a: 'trzmielina-camera', x: 70, y: 24, s: 0.85 }, { a: 'exclaim', x: 50, y: 82 }] },
  'hb:pothole': { set: 'street', cast: [{ a: 'hole', x: 110 }, { a: 'mole', x: 110 }, { a: 'map', x: 150 }, { a: 'exclaim', x: 88, y: 40 }, { a: 'trzmielina-camera', x: 200, y: 40, s: 0.75 }] },
  'hb:pumpkin': { set: 'meadow', cast: [{ a: 'pumpkin', x: 112, s: 1.6 }, { a: 'trzmielina', x: 206, y: 46, s: 0.7 }, { a: 'hearts', x: 188, y: 86 }] },
  'hb:first-frost': { set: 'hive', cast: [{ a: 'trzmielina', x: 80, y: 18 }, { a: 'teacup', x: 148 }, { a: 'steam', x: 146, y: 12 }, { a: 'jingleton:happy', x: 192, y: 6, s: 0.9 }, { a: 'hearts', x: 122, y: 74 }] },
  'hb:cat-council': { set: 'hall', cast: [{ a: 'atrament', x: 100, s: 1.25 }, { a: 'zzz', x: 124, y: 70 }, { a: 'trzmielina-camera', x: 200, y: 40, s: 0.7 }] },
  'hb:moustache': { set: 'street', cast: [{ a: 'listonosz:delighted', x: 104, s: 1.25 }, { a: 'sparkle', x: 118, y: 66 }, { a: 'trzmielina-camera', x: 196, y: 40, s: 0.75 }] },
  'hb:pink-pond': { set: 'pinkpond', cast: [{ a: 'trzmielina', x: 80, y: 36 }, { a: 'hearts', x: 98, y: 82 }, { a: 'wiedzmusia:delighted', x: 170 }] },
  'hb:night-library': { set: 'night', cast: [{ a: 'duszek:puzzled', x: 110, y: 6 }, { a: 'trzmielina', x: 196, y: 36, s: 0.75 }] },
  'hb:clock': { set: 'night', cast: [{ a: 'owl-asleep', x: 116, s: 1.2 }, { a: 'zzz', x: 134, y: 58 }, { a: 'nest', x: 170 }, { a: 'trzmielina-camera', x: 56, y: 40, s: 0.7 }] },
  'hb:nuts': { set: 'orchard', cast: [{ a: 'squirrel', x: 70 }, { a: 'map', x: 116 }, { a: 'hole', x: 172 }, { a: 'mole', x: 172 }, { a: 'trzmielina-camera', x: 216, y: 56, s: 0.6 }] },
  'hb:crickets': { set: 'kitchen', cast: [{ a: 'trzmielina-camera', x: 56, y: 36, s: 0.7 }, { a: 'cake', x: 130, y: 28, s: 1.3 }, { a: 'cricket', x: 170, y: 28, s: 0.75 }, { a: 'sweat', x: 182, y: 66 }] },
  'hb:fog': { set: 'fog', cast: [{ a: 'trzmielina', x: 106, y: 30 }, { a: 'exclaim', x: 126, y: 82 }, { a: 'jadzia:puzzled', x: 176 }] },
  'hb:first-snow': { set: 'snow', cast: [{ a: 'dogs-out', x: 110, y: 0 }, { a: 'sparkle', x: 178, y: 44 }, { a: 'trzmielina', x: 210, y: 52, s: 0.65 }] },

  // Brzęczyk's own stories
  'b:dance-off': { set: 'hive', cast: [{ a: 'trzmielina', x: 64, y: 18 }, { a: 'motion', x: 130, y: 44 }, { a: 'jingleton:delighted', x: 150, y: 6 }, { a: 'notes', x: 190, y: 30 }, { a: 'sparkle', x: 176, y: 74 }] },
  'b:wasp-gang': { set: 'street', cast: [{ a: 'barrel', x: 112 }, { a: 'wasp', x: 82, y: 12 }, { a: 'wasp', x: 142, y: 26, flip: true }, { a: 'anger', x: 100, y: 58 }, { a: 'trzmielina-camera', x: 210, y: 44, s: 0.7 }] },
  'b:honey-shortage': { set: 'hive', cast: [{ a: 'barrel', x: 46 }, { a: 'barrel', x: 72, s: 0.9 }, { a: 'honey', x: 98 }, { a: 'jezyk-happy', x: 162 }, { a: 'hearts', x: 178, y: 58 }] },
  'b:trzmielina-interview': { set: 'hive', cast: [{ a: 'trzmielina', x: 88, y: 20, s: 1.3 }, { a: 'sparkle', x: 120, y: 88 }, { a: 'desk', x: 184 }, { a: 'newspaper', x: 174, y: 26 }, { a: 'camera', x: 198, y: 26 }] },
  'b:jingleton-hero': { set: 'meadow', cast: [{ a: 'plant:daisy', x: 50 }, { a: 'jingleton:happy', x: 116, y: 6 }, { a: 'hearts', x: 134, y: 64 }, { a: 'puddle', x: 170 }, { a: 'ladybird', x: 150 }] },
  'b:kurier-typo': { set: 'willow', cast: [{ a: 'newspaper', x: 84 }, { a: 'borsuk', x: 118 }, { a: 'sweat', x: 136, y: 72 }, { a: 'trzmielina-camera', x: 176, y: 42, s: 0.7 }, { a: 'exclaim', x: 160, y: 86 }] },
  'b:summer-meadow': { set: 'meadow', cast: [{ a: 'plant:daisy', x: 40 }, { a: 'plant:lavender', x: 88 }, { a: 'trzmielina', x: 144, y: 40 }, { a: 'hearts', x: 160, y: 86 }, { a: 'plant:rose', x: 204 }] },
  'b:winter-ball': { set: 'hive', cast: [{ a: 'trzmielina', x: 92, y: 18 }, { a: 'hearts', x: 128, y: 70 }, { a: 'jingleton:happy', x: 162, y: 6 }, { a: 'teacup', x: 210 }, { a: 'steam', x: 208, y: 12 }] },

  // the serials
  's:snail-race:1': { set: 'meadow', cast: [{ a: 'snail', x: 40 }, { a: 'snail', x: 80, s: 0.85 }, { a: 'snail', x: 120 }, { a: 'snail', x: 160, s: 0.9 }, { a: 'flag', x: 208 }, { a: 'sparkle', x: 124, y: 44 }] },
  's:snail-race:2': { set: 'meadow', cast: [{ a: 'beetle', x: 110, s: 1.3 }, { a: 'snail', x: 102, y: 22, s: 0.8 }, { a: 'hearts', x: 124, y: 52 }, { a: 'trzmielina-camera', x: 200, y: 34, s: 0.7 }] },
  's:snail-race:3': { set: 'hall', cast: [{ a: 'owl', x: 46 }, { a: 'stone-mayor', x: 88 }, { a: 'snail', x: 136 }, { a: 'question', x: 150, y: 34 }, { a: 'beetle', x: 196 }] },
  's:snail-race:4': { set: 'meadow', cast: [{ a: 'beetle', x: 34 }, { a: 'snail', x: 82 }, { a: 'motion', x: 66, y: 10 }, { a: 'snail', x: 120, s: 0.9 }, { a: 'flag', x: 160 }, { a: 'jezyk', x: 206, s: 0.8 }] },
  's:snail-race:5': { set: 'meadow', cast: [{ a: 'beetle', x: 48 }, { a: 'snail', x: 100 }, { a: 'lettuce', x: 134 }, { a: 'hearts', x: 134, y: 22 }, { a: 'snail', x: 168, flip: true }, { a: 'flag', x: 214 }] },
  's:moth-party:1': { set: 'night', cast: [{ a: 'cma', x: 100, y: 8 }, { a: 'candles', x: 168 }, { a: 'question', x: 196, y: 40 }, { a: 'sparkle', x: 184, y: 30 }] },
  's:moth-party:2': { set: 'street', cast: [{ a: 'seeds', x: 60 }, { a: 'jezyk', x: 104 }, { a: 'sweat', x: 120, y: 58 }, { a: 'letter', x: 156 }] },
  's:moth-party:3': { set: 'night', cast: [{ a: 'candles', x: 46 }, { a: 'notes', x: 64, y: 60 }, { a: 'night-stall', x: 124 }, { a: 'lantern', x: 200 }, { a: 'sparkle', x: 214, y: 50 }] },
  's:moth-party:4': { set: 'street', cast: [{ a: 'hole', x: 56 }, { a: 'mole', x: 56 }, { a: 'letter', x: 104 }, { a: 'jezyk-happy', x: 168 }, { a: 'hearts', x: 184, y: 60 }] },
  's:lost-hat:1': { set: 'night', cast: [{ a: 'wiedzmusia:puzzled', x: 74 }, { a: 'broom', x: 130, y: 22 }, { a: 'hat', x: 194, y: 64 }, { a: 'motion', x: 214, y: 78 }] },
  's:lost-hat:2': { set: 'orchard', cast: [{ a: 'pumpkin', x: 116, s: 0.9 }, { a: 'hat', x: 118, y: 48 }, { a: 'crow', x: 196 }, { a: 'question', x: 206, y: 36 }] },
  's:lost-hat:3': { set: 'night', cast: [{ a: 'wiedzmusia:puzzled', x: 64 }, { a: 'owl', x: 148, s: 1.1 }, { a: 'hat', x: 148, y: 54 }] },
  's:lost-hat:4': { set: 'night', cast: [{ a: 'jadzia:happy', x: 64 }, { a: 'owl-hat', x: 148, s: 1.1 }, { a: 'hearts', x: 170, y: 62 }, { a: 'hat', x: 212 }] },
  's:bridge:1': { set: 'pond', cast: [{ a: 'bridge', x: 112 }, { a: 'notes', x: 104, y: 30 }, { a: 'rechotka:puzzled', x: 206 }] },
  's:bridge:2': { set: 'hall', cast: [{ a: 'rechotka', x: 54 }, { a: 'stone-mayor', x: 116 }, { a: 'owl', x: 186 }, { a: 'question', x: 70, y: 72 }] },
  's:bridge:3': { set: 'pond', cast: [{ a: 'bridge', x: 120 }, { a: 'ants', x: 46 }, { a: 'ants', x: 194 }, { a: 'sweat', x: 214, y: 14 }] },
  's:bridge:4': { set: 'pond', cast: [{ a: 'bridge', x: 112 }, { a: 'bench', x: 112, y: 22, s: 0.6 }, { a: 'rechotka:happy', x: 112, y: 24, s: 0.75 }, { a: 'hearts', x: 128, y: 74 }, { a: 'atrament', x: 210, s: 0.8 }] },
  's:windowsill:1': { set: 'sill', cast: [{ a: 'pot:pansy', x: 84 }, { a: 'pot:tulip', x: 120 }, { a: 'pot:rose', x: 156 }] },
  's:windowsill:2': { set: 'sill', cast: [{ a: 'lace', x: 92 }, { a: 'pot:pansy', x: 92 }, { a: 'pumpkin', x: 150, s: 0.55 }] },
  's:windowsill:3': { set: 'hall', cast: [{ a: 'owl', x: 46 }, { a: 'jadzia', x: 96 }, { a: 'stone-mayor', x: 148 }, { a: 'trzmielina', x: 206, y: 40, s: 0.7 }, { a: 'exclaim', x: 222, y: 84 }] },
  's:windowsill:4': { set: 'roomsill', cast: [{ a: 'pot:pansy', x: 46, y: 44, s: 0.7 }, { a: 'pot:pansy', x: 76, y: 44, s: 0.7 }, { a: 'owl', x: 116, s: 0.8 }, { a: 'sparkle', x: 62, y: 92 }, { a: 'dogs', x: 186, y: -10, s: 0.75 }] },
  's:windowsill:5': { set: 'sill', cast: [{ a: 'pot:pansy', x: 84 }, { a: 'diploma', x: 120, s: 1.1 }, { a: 'pot:pansy', x: 156 }, { a: 'sparkle', x: 132, y: 30 }] },
  's:hedgehog-sleep:1': { set: 'street', cast: [{ a: 'jezyk-asleep', x: 100 }, { a: 'zzz', x: 116, y: 50 }, { a: 'seeds', x: 150 }, { a: 'kettle', x: 180 }, { a: 'steam', x: 184, y: 18 }] },
  's:hedgehog-sleep:2': { set: 'street', cast: [{ a: 'atrament', x: 54 }, { a: 'zzz', x: 68, y: 50 }, { a: 'wiedzmusia:happy', x: 120 }, { a: 'squirrel', x: 196 }] },
  's:hedgehog-sleep:3': { set: 'street', cast: [{ a: 'seeds', x: 34 }, { a: 'stall', x: 112 }, { a: 'squirrel', x: 196 }, { a: 'question', x: 210, y: 54 }] },
  's:hedgehog-sleep:4': { set: 'street', cast: [{ a: 'jezyk-happy', x: 92 }, { a: 'hearts', x: 106, y: 60 }, { a: 'squirrel', x: 156 }, { a: 'lantern', x: 204 }] },

  // the first days: two papers that don't yet know about each other, then do
  'i:0': { set: 'willow', cast: [{ a: 'newspaper', x: 66 }, { a: 'borsuk', x: 100 }, { a: 'desk', x: 152 }, { a: 'typewriter', x: 152, y: 26 }] },
  'ib:0': { set: 'hive', cast: [{ a: 'trzmielina', x: 82, y: 22, s: 1.25 }, { a: 'sparkle', x: 112, y: 86 }, { a: 'desk', x: 172 }, { a: 'camera', x: 160, y: 26 }, { a: 'newspaper-bee', x: 186, y: 26 }, { a: 'honey', x: 216 }] },
  'i:1': { set: 'willow', cast: [{ a: 'borsuk', x: 66 }, { a: 'hearts', x: 84, y: 70 }, { a: 'jadzia:happy', x: 112 }, { a: 'cake', x: 140 }, { a: 'jezyk', x: 178, s: 0.85 }] },
  'ib:1': { set: 'hive', cast: [{ a: 'trzmielina', x: 56, y: 26 }, { a: 'motion', x: 40, y: 50 }, { a: 'jingleton:happy', x: 116, y: 8, s: 0.9 }, { a: 'plant:daisy', x: 140, s: 0.7 }, { a: 'desk', x: 196 }, { a: 'newspaper-bee', x: 190, y: 26 }, { a: 'sweat', x: 76, y: 76 }] },
  'i:2': { set: 'willow', cast: [{ a: 'letters', x: 60 }, { a: 'borsuk', x: 96 }, { a: 'desk', x: 150 }, { a: 'typewriter', x: 142, y: 26 }, { a: 'letters', x: 168, y: 26 }] },
  'ib:2': { set: 'hive', cast: [{ a: 'motion', x: 46, y: 50 }, { a: 'trzmielina', x: 72, y: 46, s: 0.6 }, { a: 'newspaper', x: 76, y: 30, s: 1.5 }, { a: 'sweat', x: 86, y: 80 }, { a: 'trzmielina', x: 166, y: 24 }, { a: 'exclaim', x: 186, y: 86 }] },
  'i:3': { set: 'willow', cast: [{ a: 'desk', x: 88 }, { a: 'typewriter', x: 80, y: 26 }, { a: 'newspaper-bee', x: 106, y: 26 }, { a: 'borsuk', x: 140 }] },
  'ib:3': { set: 'street', cast: [{ a: 'borsuk-bee', x: 104, s: 1.05 }, { a: 'sweat', x: 124, y: 80 }, { a: 'trzmielina-camera', x: 200, y: 44, s: 0.75 }, { a: 'exclaim', x: 184, y: 84 }] },
};

/** Brzęczyk's photo of the day, "Przyłapane!": caught in the act. */
export const PHOTOS: Array<{ shot: Shot; caption: L }> = [
  { shot: { set: 'night', cast: [{ a: 'night-stall', x: 100 }, { a: 'jezyk', x: 196, s: 0.9 }, { a: 'hearts', x: 210, y: 56 }, { a: 'lantern', x: 224 }] }, caption: l('Pan Jeżyk przy straganie Pani Ćmy. Trzeci raz dziś. Przypadek?', 'Pan Jeżyk at Pani Ćma’s stall. Third time today. Coincidence?') },
  { shot: { set: 'street', cast: [{ a: 'bench', x: 120 }, { a: 'atrament', x: 120, y: 16, s: 0.8 }, { a: 'zzz', x: 136, y: 62 }] }, caption: l('Radny Atrament w trakcie obrad.', 'Councillor Atrament, in session.') },
  { shot: { set: 'room', cast: [{ a: 'dogs', x: 104, y: -10, s: 0.85 }, { a: 'socks', x: 204, y: -4 }, { a: 'sparkle', x: 218, y: 16 }] }, caption: l('Podejrzani. Skarpetki w tle.', 'The suspects. Socks in the background.') },
  { shot: { set: 'street', cast: [{ a: 'hole', x: 104 }, { a: 'mole', x: 104 }, { a: 'map', x: 150 }, { a: 'exclaim', x: 124, y: 34 }] }, caption: l('Zenon z mapą. Metro? Metro.', 'Zenon with a map. Underground? Underground.') },
  { shot: { set: 'fog', cast: [{ a: 'duszek', x: 120, y: 6 }] }, caption: l('Duszek w dzień? Albo prześcieradło. Redakcja się kłóci.', 'Little Ghost by day? Or a sheet. The newsroom can’t agree.') },
  { shot: { set: 'pond', cast: [{ a: 'rechotka:happy', x: 120 }, { a: 'hearts', x: 136, y: 72 }] }, caption: l('Rechotka i parasol. Tym razem trzyma mocno.', 'Rechotka and her umbrella. Holding on tight this time.') },
  { shot: { set: 'night', cast: [{ a: 'owl-hat', x: 120, s: 1.3 }] }, caption: l('Sowa wciąż nosi czapkę z pomponem. Nie zdejmuje.', 'The owl is still wearing the bobble hat. Won’t take it off.') },
  { shot: { set: 'street', cast: [{ a: 'borsuk-bee', x: 116, s: 1.1 }] }, caption: l('Redaktor Borsuk czyta Brzęczyk. Udaje, że nie.', 'Editor Borsuk reading Brzęczyk. Pretending not to.') },
  { shot: { set: 'room', cast: [{ a: 'listonosz:puzzled', x: 60 }, { a: 'sweat', x: 74, y: 60 }, { a: 'dogs', x: 164, y: -10, s: 0.85 }, { a: 'exclaim', x: 132, y: 36 }] }, caption: l('Pan listonosz i psy z okna. Codzienne spotkanie, codzienne zaskoczenie.', 'The postman and the window dogs. A daily meeting, a daily surprise.') },
  { shot: { set: 'orchard', cast: [{ a: 'wiedzmusia:happy', x: 90 }, { a: 'cauldron', x: 140 }, { a: 'steam', x: 138, y: 22 }] }, caption: l('Coś różowego znowu się warzy. Staw drży.', 'Something pink is brewing again. The pond trembles.') },
  { shot: { set: 'orchard', cast: [{ a: 'squirrel', x: 100 }, { a: 'sparkle', x: 116, y: 54 }, { a: 'basket', x: 150 }] }, caption: l('Halinka znalazła orzech. Jeden. Brawo.', 'Halinka found a nut. One. Well done.') },
  { shot: { set: 'room', cast: [{ a: 'milton', x: 120, s: 1.1 }, { a: 'zzz', x: 140, y: 40 }] }, caption: l('Milton. Bez zmian.', 'Milton. No change.') },
  { shot: { set: 'meadow', cast: [{ a: 'plant:daisy', x: 80 }, { a: 'jingleton:happy', x: 150, y: 6 }, { a: 'hearts', x: 168, y: 64 }] }, caption: l('Jingleton na stokrotkach. Dyżur.', 'Jingleton on the daisies. On duty.') },
  { shot: { set: 'street', cast: [{ a: 'lamppost-jumper', x: 104 }, { a: 'cma-happy', x: 160, y: 10, s: 0.8 }] }, caption: l('Pani Ćma przy latarni w swetrze. Ciepło jej.', 'Pani Ćma by the lamppost in its jumper. Nice and warm.') },
];
