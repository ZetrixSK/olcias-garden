import type { PansyDesign } from '../garden/designs';

/**
 * The bratki that come from the market and from visitors have names in both languages; her own
 * designs keep the name she gave them.
 */
const NAMES: Record<string, [string, string]> = {
  'market-malina': ['Raspberry mist', 'Malinowa mgła'],
  'market-maslo': ['Buttercup', 'Masełko'],
  'market-morze': ['Sea foam', 'Morska pianka'],
  'market-polnoc': ['Midnight', 'Północ'],
  'market-brzoskwinia': ['Little peach', 'Brzoskwinka'],
  'market-zloty': ['Golden edge', 'Złoty brzeg'],
  'market-piegi': ['Freckles', 'Piegusek'],
  'market-paski': ['Candy', 'Cukierek'],
  'market-gwiazda': ['Starry night', 'Gwiaździsta noc'],
  'visitor-duszek': ['Little Ghost', 'Duszek'],
  'visitor-listonosz': ['Stamp', 'Znaczek'],
};

/** A bratek's name in her language. */
export function designName(d: Pick<PansyDesign, 'id' | 'name'>, t: (en: string, pl: string) => string): string {
  const n = NAMES[d.id];
  return n ? t(...n) : d.name;
}
