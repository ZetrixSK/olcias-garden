import type { L } from './calendar';
import type { Season } from '../theme/seasons';

export type { L };

/**
 * The pictures the papers can print: the garden's own drawings (the market keepers, the visitors,
 * Milton, the dogs, a flower) and a few drawn just for the papers.
 */
export type ArtKey =
  | 'jezyk' | 'jezyk-happy' | 'jezyk-asleep' | 'cma' | 'cma-happy' | 'stall' | 'night-stall' | 'milton' | 'dogs'
  | 'jadzia' | 'atrament' | 'duszek' | 'rechotka' | 'listonosz' | 'wiedzmusia' | 'jingleton'
  | 'moon' | 'snail' | 'wasp' | 'mole' | 'owl' | 'squirrel' | 'cricket'
  | 'tulip' | 'rose' | 'pansy' | 'daisy' | 'lavender' | 'pumpkin' | 'snowdrop' | 'moonflower';

/** When a piece fits: only in some seasons, some months, or some weather. */
export type When = { seasons?: Season[]; months?: number[]; sky?: Array<'clear' | 'cloudy' | 'rain'> };

/** A few townsfolk answering the paper's question of the day. */
export type Vox = { q: L; a: Array<{ who: L; say: L }> };

/** The bees' version of a story, for Brzęczyk's front page. */
export type BeeLead = {
  title: L;
  body: L[];
  art: ArtKey;
  caption: L;
  /** What the Kurier says back the next day, on page 2 ("Sprostowanie"), if anything. */
  retort?: L;
};

/** The Kurier's front-page story. With `bee`, Brzęczyk covers the same story its own way. */
export type Headline = {
  id: string;
  kicker: L;
  title: L;
  sub: L;
  body: L[];
  art: ArtKey;
  caption: L;
  vox?: Vox;
  /** Brzęczyk's one-line correction of this story ("Kurier się myli!"). */
  jab?: L;
  bee?: BeeLead;
  when?: When;
};

/** Brzęczyk's own front-page story, on days the papers lead with different news. */
export type BeeStory = BeeLead & { id: string; when?: When };

/** One day of a story the town follows over several days. */
export type Episode = {
  title: L;
  body: L[];
  art?: ArtKey;
  /** Shown the next day as "In the last episode". */
  recap: L;
  /** How Brzęczyk tells today's part, in a line of gossip. */
  buzz?: L;
};

export type Serial = { id: string; name: L; episodes: Episode[] };

/** A short piece: the Kurier's gossip, a line from the hive, or the world column's stand-in. */
export type Piece = { title: L; body: L; when?: When };

export type Ad = { kind: L; text: L; sign: string };

export type Letter = { text: L; sign: L; reply: L };

/** Something said about the garden's future that may or may not come true. */
export type Rumour = { kurier: L; bee: L; when?: When };
