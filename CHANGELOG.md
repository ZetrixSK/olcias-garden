# Changelog

What changed in each version, for the developer. Olcia reads her own, shorter version in the app
under "What's new" (`src/changelog.ts`). Keep the version in `package.json` and the top entry of
`src/changelog.ts` the same; a test checks it.

## 1.1.0 · 2026-11-10

The morning papers.

- Two daily papers, from 10 November 2026 (the same issues for everyone, picked by date):
  Kurier Bratkowski (serious, two pages; founded by Redaktor Bogdan Borsuk) and Brzęczyk (the
  bees' tabloid, editor Trzmielina). Out at 5:00; on the floor and under "Gazety" in the menu.
  Polish first, with a PL/EN switch; an archive of the past week.
- Pre-written stories, serials, gossip, letters, horoscopes and still pictures for each story.
  The papers are strangers for two days, then rivals; they share a story 3–4 times a week.
- "Ze świata": real news (Szczecin first), written each dawn by Gemini in the `paper-world`
  edge function, checked by `world.ts`, read by phones through `paper_world()`. A plain note on
  days without it. "Z Bratkowa": the town in brief, pre-written, by season.
- "Wczoraj w Twoim ogrodzie": what happened in her garden yesterday, from a small event log in the
  save (`paper`). The admin can tape a note into a day's Kurier (`papernote`).
- Test pages /test-prewritten and /test-gemini (kept out of the offline cache).

## 1.0.0 · 2026-11-03

The first version.

- The garden: a window view and the shelves, with swiping between them. Plants grow from real time
  (including while the app is closed), with watering, moving, pots, names, and plants in the window.
- Seventeen kinds of flower, including night flowers, winter flowers and Halloween's pumpkin. Bratki
  and pots can be designed; designs can put seeds in a seed tin.
- Plant traits: now and then a plant changes overnight (enchanted, dewy, sun-kissed, frosted,
  willowy), answering to the weather the garden saw that day.
- Sky and weather: the time of day, real sunrise and sunset, live weather by location (optional),
  rain, clouds, snow, the moon's real phase, seasons outside, rare moments (shooting stars,
  northern lights, rainbows, visitors at the lake).
- The room: cozy, witchy or her own colours; curtains that open and close; a candle; two dogs,
  Piorun and Bajzel; a sign she can name; her own wallpaper, photo frame and drawings.
- Books: pressed flowers with notes, a diary with moods and "on this day", and Memories (photo
  albums with stamps, and paintings).
- The post: tags, bouquets, a letterbox, parcels; visiting other gardens with permissions she sets.
- The first visit: a welcome for Safari, the letter, choosing a tag, then the garden revealed.
- Backups to a file; three languages (Polish, English, English with Polish flower names).
- Works offline once installed; updates arrive quietly and switch over only while the app is in the
  background.
