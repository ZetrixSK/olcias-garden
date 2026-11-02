import type { TraitKind } from '../garden/traits';

/** What each trait is called, and what it means, in English and Polish. */
export const TRAIT_WORDS: Record<TraitKind, { name: [string, string]; about: [string, string] }> = {
  enchanted: {
    name: ['Enchanted', 'Czar księżyca'],
    about: ['A full moon cast a spell: it shimmers, and glows softly at night.', 'Pełnia rzuciła czar: lśni, a nocą delikatnie świeci.'],
  },
  dewy: {
    name: ['Dewy', 'Rosa'],
    about: ['Rain left its dew on the leaves: it glistens, and grows a little quicker.', 'Deszcz zostawił rosę na liściach: lśni i rośnie trochę szybciej.'],
  },
  sunkissed: {
    name: ['Sun-kissed', 'Pocałunek słońca'],
    about: ['A sunny day left a golden glow: it grows quicker.', 'Słoneczny dzień zostawił złoty blask: rośnie szybciej.'],
  },
  frosted: {
    name: ['Frosted', 'Szron'],
    about: ['A winter night left frost on its petals, and it never melts.', 'Zimowa noc zostawiła szron na płatkach. I już nie topnieje.'],
  },
  willowy: {
    name: ['Willowy', 'Kołysanka'],
    about: ['A grey, breezy day: now it sways long and slow, like a willow.', 'Szary, wietrzny dzień: teraz kołysze się długo i powoli, jak wierzba.'],
  },
};
