import { moonPhase, SYNODIC_DAYS } from '../weather/moon';

/**
 * The paper's calendar: Polish name days, holidays and customs, the moon, and the meteor showers.
 * Everything is worked out from the date alone, so it needs no internet.
 */

const DAY = 86_400_000;

/** Whose name day it is: the two or three names most people know for each day. */
const NAME_DAYS: string[][] = [
  // January
  ['Mieczysław, Mieszko', 'Izydor, Bazyli, Grzegorz', 'Danuta, Genowefa, Daniel', 'Aniela, Eugeniusz, Tytus', 'Hanna, Szymon, Edward',
    'Kacper, Melchior, Baltazar', 'Julian, Lucjan, Rajmund', 'Seweryn, Mścisław, Julian', 'Adrian, Marceli, Julian', 'Wilhelm, Agaton, Jan',
    'Matylda, Honorata', 'Benedykt, Arkadiusz, Czesława', 'Bogumiła, Weronika, Hilary', 'Feliks, Nina, Hilary', 'Paweł, Arnold, Izydor',
    'Marceli, Włodzimierz, Waldemar', 'Antoni, Rościsław, Jan', 'Piotr, Małgorzata', 'Henryk, Mariusz, Marta', 'Fabian, Sebastian',
    'Agnieszka, Jarosław', 'Anastazy, Wincenty', 'Rajmund, Klemens, Ildefons', 'Felicja, Tymoteusz, Franciszek', 'Paweł, Miłosz',
    'Tytus, Tymoteusz, Paula', 'Aniela, Przybysław, Jerzy', 'Tomasz, Walery, Radomir', 'Zdzisław, Franciszek, Józef', 'Maciej, Marcin, Martyna',
    'Jan, Marcela, Ludwika'],
  // February
  ['Brygida, Ignacy, Seweryn', 'Maria, Mirosław', 'Błażej, Oskar', 'Andrzej, Joanna, Weronika', 'Agata, Adelajda, Izydor',
    'Dorota, Bogdan, Paweł', 'Ryszard, Romuald, Teodor', 'Hieronim, Sebastian, Ziemowit', 'Apolonia, Eryk, Cyryl', 'Elwira, Jacek, Scholastyka',
    'Lucjan, Olgierd, Grzegorz', 'Eulalia, Radosław, Modest', 'Grzegorz, Katarzyna', 'Walenty, Metody, Cyryl', 'Faustyn, Jowita, Georgina',
    'Danuta, Julianna, Daniel', 'Aleksy, Łukasz, Zbigniew', 'Szymon, Konstancja, Flawian', 'Arnold, Konrad, Marcela', 'Leon, Ludmiła, Lechosław',
    'Eleonora, Fortunat, Robert', 'Małgorzata, Marta, Nikifor', 'Romana, Damian, Polikarp', 'Maciej, Bogusz, Sergiusz', 'Wiktor, Cezary, Wiktoryn',
    'Mirosław, Aleksander', 'Gabriel, Anastazja, Leander', 'Roman, Ludomir, Lech', 'Lutosław, Roman, Oswald'],
  // March
  ['Albin, Antonina, Radosław', 'Helena, Halszka, Paweł', 'Kunegunda, Maryna, Tycjan', 'Kazimierz, Łucja, Adrian', 'Adrian, Fryderyk, Teofil',
    'Róża, Wiktor, Jordan', 'Tomasz, Felicyta, Perpetua', 'Beata, Jan, Wincenty', 'Franciszka, Katarzyna, Dominik', 'Cyprian, Marcel, Aleksander',
    'Benedykt, Konstanty, Ludosław', 'Grzegorz, Bernard, Józefina', 'Bożena, Krystyna, Marek', 'Leon, Matylda, Łazarz', 'Klemens, Ludwika, Longin',
    'Izabela, Hiacynt, Oktawia', 'Patryk, Zbigniew, Gertruda', 'Cyryl, Edward, Aleksander', 'Józef, Bogdan', 'Klaudia, Eufemia, Maurycy',
    'Lubomir, Benedykt', 'Katarzyna, Bogusław', 'Pelagia, Feliks, Oktawian', 'Marek, Gabriel, Katarzyna', 'Maria, Wieńczysław, Ireneusz',
    'Larysa, Teodor, Emanuel', 'Lidia, Ernest, Rupert', 'Aniela, Sykstus, Jan', 'Wiktoryna, Helmut, Eustachy', 'Aniela, Leonard, Amelia',
    'Beniamin, Balbina, Kornelia'],
  // April
  ['Grażyna, Irena, Hugo', 'Władysław, Franciszek, Teodozja', 'Ryszard, Pankracy, Inga', 'Izydor, Wacław, Benedykt', 'Irena, Wincenty',
    'Izolda, Celestyn, Diogenes', 'Rufin, Celestyn, Jan', 'Cezaryna, Dionizy, Julia', 'Maria, Dobrosława, Heliodor', 'Michał, Makary, Daniel',
    'Filip, Leon, Stanisław', 'Zenon, Juliusz, Wiktor', 'Przemysław, Ida, Marcin', 'Berenika, Walerian, Justyna', 'Ludwina, Wacława, Anastazja',
    'Ksenia, Cecylia, Bernadeta', 'Rudolf, Robert, Anicet', 'Bogusława, Apoloniusz, Gościsław', 'Adolf, Tymon, Leon', 'Czesław, Agnieszka, Marian',
    'Bartosz, Feliks, Anzelm', 'Kaja, Leonia, Łukasz', 'Wojciech, Jerzy, Idzi', 'Grzegorz, Aleksander, Horacy', 'Marek, Jarosław, Wasyl',
    'Maria, Marzena, Klaudiusz', 'Zyta, Teofil, Felicja', 'Piotr, Waleria, Witalis', 'Rita, Katarzyna, Bogusław', 'Marian, Katarzyna, Lilla'],
  // May
  ['Józef, Jeremiasz, Filip', 'Zygmunt, Atanazy, Anatol', 'Maria, Antonina, Aleksander', 'Monika, Florian, Władysław', 'Irena, Waldemar, Pelagia',
    'Filip, Judyta, Jakub', 'Gizela, Ludmiła, Benedykt', 'Stanisław, Wiktor', 'Bożydar, Grzegorz, Karolina', 'Antonina, Izydor, Jan',
    'Iga, Mira, Franciszek', 'Pankracy, Dominik, Achilles', 'Serwacy, Robert, Gloria', 'Bonifacy, Dobiesław, Maciej', 'Zofia, Nadzieja, Izydor',
    'Andrzej, Jędrzej, Szymon', 'Bruno, Sławomir, Paschalis', 'Feliks, Aleksandra, Eryk', 'Iwo, Piotr, Celestyn', 'Bernardyn, Bazyli, Aleksander',
    'Wiktor, Kryspin, Tymoteusz', 'Helena, Wiesława, Ryta', 'Iwona, Michał, Emilia', 'Joanna, Zuzanna, Milena', 'Grzegorz, Urban, Magda',
    'Filip, Paulina', 'Augustyn, Julian, Magdalena', 'Jaromir, Augustyn, Wilhelm', 'Magdalena, Bogumiła, Urszula', 'Ferdynand, Feliks, Joanna',
    'Aniela, Petronela, Kamila'],
  // June
  ['Jakub, Konrad, Justyn', 'Marianna, Erazm, Marcelin', 'Leszek, Tamara, Karol', 'Franciszek, Karol, Kwiryna', 'Waleria, Bonifacy, Walter',
    'Norbert, Laurenty, Bogumił', 'Robert, Wiesław', 'Medard, Maksym, Seweryn', 'Felicjan, Pelagia, Anna', 'Bogumił, Małgorzata, Diana',
    'Barnaba, Radomił, Feliks', 'Janina, Onufry, Jan', 'Lucjan, Antoni', 'Bazyli, Eliza, Walery', 'Wit, Jolanta',
    'Alina, Justyna, Aneta', 'Laura, Albert, Adolf', 'Elżbieta, Marek, Paula', 'Gerwazy, Protazy, Romuald', 'Bogna, Rafał, Florentyna',
    'Alicja, Alojzy, Rudolf', 'Paulina, Tomasz, Jan', 'Wanda, Zenon, Józef', 'Jan, Danuta, Janina', 'Łucja, Wilhelm, Prosper',
    'Jan, Paweł, Jeremiasz', 'Maryla, Władysław, Cyryl', 'Leon, Ireneusz, Paweł', 'Piotr, Paweł', 'Emilia, Lucyna'],
  // July
  ['Halina, Marian, Otto', 'Maria, Urban, Jagoda', 'Jacek, Anatol, Tomasz', 'Odo, Malwina, Elżbieta', 'Antoni, Karolina, Wilhelmina',
    'Dominika, Teresa, Gotard', 'Cyryl, Estera, Metody', 'Elżbieta, Adrianna, Kilian', 'Weronika, Lukrecja, Zenon', 'Amelia, Witalis, Filip',
    'Olga, Kalina, Benedykt', 'Jan, Bruno, Weronika', 'Henryk, Ernest, Małgorzata', 'Kamil, Bonawentura, Marceli', 'Henryk, Włodzimierz, Dawid',
    'Maria, Eustachy, Benedykt', 'Aleksy, Bogdan, Andrzej', 'Kamil, Szymon, Arnold', 'Wincenty, Wodzisław, Aurelia', 'Czesław, Hieronim, Małgorzata',
    'Daniel, Andrzej, Wiktor', 'Magdalena, Bolesława, Wawrzyniec', 'Bogna, Apolinary, Brygida', 'Kinga, Krystyna', 'Jakub, Krzysztof, Walentyna',
    'Anna, Grażyna, Mirosława', 'Natalia, Lilia, Aurelia', 'Wiktor, Innocenty, Marcela', 'Marta, Olaf, Beatrycze', 'Julita, Ludmiła, Piotr',
    'Ignacy, Helena, Lubomir'],
  // August
  ['Piotr, Justyna, Julian', 'Gustaw, Euzebiusz, Alfons', 'Lidia, August, Nikodem', 'Dominik, Jan, Marian', 'Maria, Oswald, Karolina',
    'Sława, Jakub, Stefan', 'Kajetan, Dorota, Donat', 'Cyprian, Dominik, Emilian', 'Roman, Edyta', 'Wawrzyniec, Bogdana, Borys',
    'Klara, Zuzanna, Lukrecja', 'Klara, Lech, Hilaria', 'Hipolit, Diana, Kasjan', 'Alfred, Euzebiusz, Maksymilian', 'Maria, Napoleon, Stefan',
    'Roch, Stefan, Joachim', 'Jacek, Miron, Anita', 'Helena, Ilona, Bronisław', 'Jan, Bolesław, Ludwik', 'Bernard, Sobiesław, Samuel',
    'Joanna, Kazimiera, Pius', 'Cezary, Tymoteusz, Maria', 'Filip, Apolinary, Róża', 'Bartłomiej, Jerzy, Michalina', 'Ludwik, Luiza, Józef',
    'Maria, Zefiryn, Joanna', 'Józef, Monika, Cezary', 'Augustyn, Patrycja', 'Jan, Sabina, Racibor', 'Róża, Szczęsny, Feliks',
    'Rajmund, Ramona, Izabela'],
  // September
  ['Bronisława, Idzi, Bronisz', 'Julian, Stefan, Wilhelm', 'Izabela, Szymon, Grzegorz', 'Rozalia, Ida, Lilianna', 'Dorota, Wawrzyniec, Teodor',
    'Beata, Eugenia, Zachariasz', 'Regina, Melchior, Domosław', 'Maria, Adrianna, Serafina', 'Piotr, Sergiusz, Augusta', 'Łukasz, Mikołaj, Aldona',
    'Jacek, Prot, Dagna', 'Maria, Gwidon, Radzimir', 'Eugenia, Aurelia, Jan', 'Bernard, Roksana, Cyprian', 'Maria, Albin, Nikodem',
    'Edyta, Kornel, Cyprian', 'Franciszek, Lambert, Robert', 'Irena, Józef, Stefania', 'Januariusz, Konstancja, Teodor', 'Filipina, Eustachy, Faustyna',
    'Hipolit, Jonasz, Mateusz', 'Tomasz, Maurycy, Joachim', 'Bogusław, Tekla, Liwiusz', 'Gerard, Teodor, Tomir', 'Aurelia, Władysław, Kleofas',
    'Justyna, Cyprian, Euzebiusz', 'Damian, Amadeusz, Wincenty', 'Wacław, Libusza, Marek', 'Michał, Gabriel, Rafał', 'Wera, Honoriusz, Hieronim'],
  // October
  ['Danuta, Remigiusz, Teresa', 'Teofil, Dionizy, Sławomir', 'Teresa, Heliodor, Jan', 'Rozalia, Edwin, Franciszek', 'Placyd, Apolinary, Faustyna',
    'Artur, Bruno, Fryderyk', 'Maria, Marek, Mirella', 'Pelagia, Brygida, Waleria', 'Arnold, Dionizy, Wincenty', 'Paulina, Franciszek, Daniel',
    'Aldona, Bruno, Emil', 'Eustachy, Maksymilian, Edwin', 'Gerald, Edward, Teofil', 'Kalikst, Fortunata, Alan', 'Teresa, Jadwiga, Tekla',
    'Gaweł, Ambroży, Jadwiga', 'Małgorzata, Wiktor, Ignacy', 'Łukasz, Julian', 'Piotr, Ziemowit, Paweł', 'Irena, Jan, Kleopatra',
    'Urszula, Hilary, Celina', 'Filip, Halka, Salomea', 'Seweryn, Iga, Jan', 'Marcin, Rafał, Antoni', 'Daria, Kryspin, Wilhelmina',
    'Lucjan, Ewaryst, Damian', 'Iwona, Sabina', 'Szymon, Tadeusz, Juda', 'Wioletta, Narcyz, Euzebia', 'Zenobia, Przemysław, Alfons',
    'Urban, Wolfgang, Krzysztof'],
  // November
  ['Seweryna, Konrad, Wiktoryna', 'Bohdana, Tobiasz', 'Hubert, Sylwia, Marcin', 'Karol, Olgierd, Emeryk', 'Elżbieta, Sławomir, Dominik',
    'Feliks, Leonard, Ziemowit', 'Antoni, Florentyna, Ernest', 'Seweryn, Bogdan, Wiktor', 'Ursyn, Teodor, Aleksander', 'Lena, Andrzej, Leon',
    'Marcin, Bartłomiej, Prot', 'Renata, Witold, Jozafat', 'Stanisław, Mikołaj, Arkadiusz', 'Emil, Serafin, Roger', 'Albert, Leopold, Artur',
    'Gertruda, Edmund, Maria', 'Salomea, Grzegorz, Elżbieta', 'Roman, Klaudyna, Karolina', 'Elżbieta, Seweryna', 'Feliks, Edmund, Anatol',
    'Janusz, Maria, Konrad', 'Cecylia, Marek', 'Klemens, Adela, Felicyta', 'Flora, Emma, Jan', 'Katarzyna, Erazm',
    'Delfina, Konrad, Sylwester', 'Walerian, Wirgiliusz', 'Lesław, Zdzisław, Stefan', 'Błażej, Saturnin', 'Andrzej, Justyna'],
  // December
  ['Natalia, Blanka, Edmund', 'Balbina, Bibianna, Paulina', 'Franciszek, Ksawery, Kasjan', 'Barbara, Krystian', 'Sabina, Krystyna, Kryspina',
    'Mikołaj, Jarema, Emilian', 'Ambroży, Marcin, Agata', 'Maria, Wirginiusz, Romaryk', 'Wiesław, Leokadia, Joanna', 'Julia, Daniela, Bogdan',
    'Damazy, Waldemar, Daniel', 'Dagmara, Aleksander, Ada', 'Łucja, Otylia', 'Alfred, Izydor, Zorian', 'Nina, Celina, Ireneusz',
    'Albina, Adelajda, Zdzisława', 'Olimpia, Łazarz, Florian', 'Gracjan, Bogusław, Wilibald', 'Gabriela, Dariusz, Urban', 'Bogumiła, Dominik, Zefiryn',
    'Tomasz, Tomisław, Seweryna', 'Zenon, Honorata, Franciszka', 'Wiktoria, Sławomira, Jan', 'Adam, Ewa, Ewelina', 'Anastazja, Eugenia',
    'Szczepan, Stefan, Dionizy', 'Jan, Żaneta, Fabiola', 'Teofila, Godzisław', 'Dawid, Tomasz, Dominik', 'Sabina, Rainer, Eugeniusz',
    'Sylwester, Melania, Mariusz'],
];

/** Whose name day it is on this date. */
export function nameDays(d: Date): string {
  return NAME_DAYS[d.getMonth()]?.[d.getDate() - 1] ?? '';
}

/** How many name days the table holds, to check it covers every day of a leap year. */
export const nameDayCount = () => NAME_DAYS.reduce((n, m) => n + m.length, 0);

export type L = { pl: string; en: string };

/** Easter Sunday (Gregorian), as month (0-based) and day. */
export function easter(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return { month, day };
}

export type Holiday = { name: L; /** a Polish custom worth a countdown */ big: boolean };

const FIXED: Array<[number, number, Holiday]> = [
  [0, 1, { name: { pl: 'Nowy Rok', en: "New Year's Day" }, big: true }],
  [0, 6, { name: { pl: 'Trzech Króli', en: 'Epiphany (Three Kings)' }, big: false }],
  [0, 21, { name: { pl: 'Dzień Babci', en: "Grandmothers' Day in Poland" }, big: false }],
  [0, 22, { name: { pl: 'Dzień Dziadka', en: "Grandfathers' Day in Poland" }, big: false }],
  [1, 14, { name: { pl: 'walentynki', en: "Valentine's Day" }, big: true }],
  [2, 8, { name: { pl: 'Dzień Kobiet', en: "Women's Day" }, big: false }],
  [2, 21, { name: { pl: 'pierwszy dzień wiosny', en: 'the first day of spring' }, big: true }],
  [3, 1, { name: { pl: 'prima aprilis', en: "April Fools' Day" }, big: false }],
  [4, 1, { name: { pl: 'Święto Pracy', en: 'Labour Day' }, big: false }],
  [4, 3, { name: { pl: 'Święto Konstytucji 3 Maja', en: 'Constitution Day' }, big: false }],
  [4, 26, { name: { pl: 'Dzień Matki', en: "Mother's Day in Poland" }, big: true }],
  [5, 1, { name: { pl: 'Dzień Dziecka', en: "Children's Day" }, big: false }],
  [5, 23, { name: { pl: 'Dzień Ojca', en: "Father's Day in Poland" }, big: false }],
  [5, 24, { name: { pl: 'noc kupały', en: 'Midsummer (Noc Kupały)' }, big: true }],
  [7, 15, { name: { pl: 'Matki Boskiej Zielnej, dzień ziół i bukietów', en: 'Assumption Day, when Poles bless bunches of herbs' }, big: false }],
  [8, 30, { name: { pl: 'Dzień Chłopaka', en: "Boys' Day in Poland" }, big: false }],
  [9, 31, { name: { pl: 'Halloween', en: 'Halloween' }, big: true }],
  [10, 1, { name: { pl: 'Wszystkich Świętych', en: "All Saints' Day" }, big: false }],
  [10, 2, { name: { pl: 'Zaduszki', en: "All Souls' Day" }, big: false }],
  [10, 11, { name: { pl: 'Narodowe Święto Niepodległości', en: 'Polish Independence Day' }, big: false }],
  [10, 29, { name: { pl: 'andrzejki, wieczór wróżb i lania wosku', en: 'Andrzejki, the evening of fortune-telling with wax' }, big: true }],
  [11, 4, { name: { pl: 'Barbórka', en: "St Barbara's Day" }, big: false }],
  [11, 6, { name: { pl: 'mikołajki', en: "St Nicholas' Day" }, big: true }],
  [11, 24, { name: { pl: 'Wigilia', en: 'Christmas Eve (Wigilia)' }, big: true }],
  [11, 25, { name: { pl: 'Boże Narodzenie', en: 'Christmas Day' }, big: false }],
  [11, 26, { name: { pl: 'drugi dzień świąt', en: 'Boxing Day' }, big: false }],
  [11, 31, { name: { pl: 'Sylwester', en: "New Year's Eve" }, big: true }],
];

const ymd = (d: Date) => [d.getFullYear(), d.getMonth(), d.getDate()] as const;
const atNoon = (y: number, m: number, day: number) => new Date(y, m, day, 12);

/** The days that move with Easter, for one year. */
function movable(year: number): Array<[number, number, Holiday]> {
  const e = easter(year);
  const base = atNoon(year, e.month, e.day);
  const shift = (n: number, h: Holiday): [number, number, Holiday] => {
    const d = new Date(base.getTime() + n * DAY);
    return [d.getMonth(), d.getDate(), h];
  };
  return [
    shift(-52, { name: { pl: 'tłusty czwartek', en: 'Fat Thursday (pączki day)' }, big: true }),
    shift(-46, { name: { pl: 'Popielec', en: 'Ash Wednesday' }, big: false }),
    shift(0, { name: { pl: 'Wielkanoc', en: 'Easter Sunday' }, big: true }),
    shift(1, { name: { pl: 'lany poniedziałek', en: 'Easter Monday (Śmigus-dyngus)' }, big: false }),
    shift(49, { name: { pl: 'Zielone Świątki', en: 'Pentecost' }, big: false }),
    shift(60, { name: { pl: 'Boże Ciało', en: 'Corpus Christi' }, big: false }),
  ];
}

/** What's celebrated in Poland on this date, if anything. */
export function holidaysOn(d: Date): Holiday[] {
  const [y, m, day] = ymd(d);
  return [...FIXED, ...movable(y)].filter(([hm, hd]) => hm === m && hd === day).map(([, , h]) => h);
}

/** The next big day after this one, within `within` days: what it is and how many days away. */
export function nextBigDay(d: Date, within = 40): { holiday: Holiday; days: number } | null {
  for (let i = 1; i <= within; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, 12);
    const big = holidaysOn(day).find((h) => h.big);
    if (big) return { holiday: big, days: i };
  }
  return null;
}

/**
 * The year's meteor showers, by the evening their best night begins (month 0-based, day): the
 * night of the 13th into the 14th of December is the Geminids'.
 */
export const SHOWERS: Array<{ month: number; day: number; name: L; perHour: number }> = [
  { month: 0, day: 3, name: { pl: 'Kwadrantydy', en: 'the Quadrantids' }, perHour: 80 },
  { month: 3, day: 22, name: { pl: 'Lirydy', en: 'the Lyrids' }, perHour: 18 },
  { month: 4, day: 5, name: { pl: 'Eta Akwarydy', en: 'the Eta Aquariids' }, perHour: 10 },
  { month: 7, day: 12, name: { pl: 'Perseidy', en: 'the Perseids' }, perHour: 100 },
  { month: 9, day: 8, name: { pl: 'Drakonidy', en: 'the Draconids' }, perHour: 10 },
  { month: 9, day: 21, name: { pl: 'Orionidy', en: 'the Orionids' }, perHour: 20 },
  { month: 10, day: 17, name: { pl: 'Leonidy', en: 'the Leonids' }, perHour: 15 },
  { month: 11, day: 13, name: { pl: 'Geminidy', en: 'the Geminids' }, perHour: 120 },
  { month: 11, day: 22, name: { pl: 'Ursydy', en: 'the Ursids' }, perHour: 10 },
];

/** The evening a night belongs to: after midnight, it's still the night of the day before. */
export function eveningOf(t: number): Date {
  const d = new Date(t);
  if (d.getHours() < 12) d.setDate(d.getDate() - 1);
  return d;
}

/** Whether tonight is a meteor shower's best night (the garden gets shooting stars then). */
export function showerTonight(t: number): (typeof SHOWERS)[number] | null {
  const e = eveningOf(t);
  return SHOWERS.find((s) => s.month === e.getMonth() && s.day === e.getDate()) ?? null;
}

/** The next shower's best night, starting from today's evening, within `within` days. */
export function nextShower(d: Date, within = 45): { shower: (typeof SHOWERS)[number]; days: number; date: Date } | null {
  for (let i = 0; i <= within; i++) {
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i, 20);
    const s = SHOWERS.find((x) => x.month === day.getMonth() && x.day === day.getDate());
    if (s) return { shower: s, days: i, date: day };
  }
  return null;
}

/** The moon's phase in words. */
export function moonWords(t: number): L {
  const p = moonPhase(t);
  const i = Math.round(p * 8) % 8;
  return [
    { pl: 'nów, księżyca prawie nie widać', en: 'new moon, hardly to be seen' },
    { pl: 'młody sierp, rośnie', en: 'a young crescent, growing' },
    { pl: 'pierwsza kwadra', en: 'first quarter' },
    { pl: 'prawie pełnia, rośnie', en: 'nearly full, still growing' },
    { pl: 'pełnia', en: 'full moon' },
    { pl: 'po pełni, maleje', en: 'past full, waning' },
    { pl: 'ostatnia kwadra', en: 'last quarter' },
    { pl: 'stary sierp, maleje', en: 'an old crescent, waning' },
  ][i]!;
}

/** The date of the next full moon (or new moon) from t, at least half a day ahead. */
export function nextMoon(t: number, which: 'full' | 'new'): Date {
  const target = which === 'full' ? 0.5 : 0;
  const p = moonPhase(t);
  let days = ((target - p + 1) % 1) * SYNODIC_DAYS;
  if (days < 0.5) days += SYNODIC_DAYS;
  return new Date(t + days * DAY);
}
