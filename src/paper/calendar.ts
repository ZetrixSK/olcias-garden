import { moonPhase, SYNODIC_DAYS } from '../weather/moon';

/**
 * The paper's calendar: Polish name days, holidays and customs, the moon, and the meteor showers.
 * Everything is worked out from the date alone, so it needs no internet.
 */

const DAY = 86_400_000;

/**
 * Whose name day it is, as the Polish calendars print it (in the genitive: "imieniny Marcina").
 * The two or three names most people know for each day.
 */
const NAME_DAYS: string[][] = [
  // January
  ['Mieczysława, Mieszka', 'Izydora, Bazylego, Grzegorza', 'Danuty, Genowefy, Daniela', 'Anieli, Eugeniusza, Tytusa', 'Hanny, Szymona, Edwarda',
    'Kacpra, Melchiora, Baltazara', 'Juliana, Lucjana, Rajmunda', 'Seweryna, Mścisława, Juliana', 'Adriana, Marcelego, Juliana', 'Wilhelma, Agatona, Jana',
    'Matyldy, Honoraty', 'Benedykta, Arkadiusza, Czesławy', 'Bogumiły, Weroniki, Hilarego', 'Feliksa, Niny, Hilarego', 'Pawła, Arnolda, Izydora',
    'Marcelego, Włodzimierza, Waldemara', 'Antoniego, Rościsława, Jana', 'Piotra, Małgorzaty', 'Henryka, Mariusza, Marty', 'Fabiana, Sebastiana',
    'Agnieszki, Jarosława', 'Anastazego, Wincentego', 'Rajmunda, Klemensa, Ildefonsa', 'Felicji, Tymoteusza, Franciszka', 'Pawła, Miłosza',
    'Tytusa, Tymoteusza, Pauli', 'Anieli, Przybysława, Jerzego', 'Tomasza, Walerego, Radomira', 'Zdzisława, Franciszka, Józefa', 'Macieja, Marcina, Martyny',
    'Jana, Marceli, Ludwiki'],
  // February
  ['Brygidy, Ignacego, Seweryna', 'Marii, Mirosława', 'Błażeja, Oskara', 'Andrzeja, Joanny, Weroniki', 'Agaty, Adelajdy, Izydora',
    'Doroty, Bogdana, Pawła', 'Ryszarda, Romualda, Teodora', 'Hieronima, Sebastiana, Ziemowita', 'Apolonii, Eryka, Cyryla', 'Elwiry, Jacka, Scholastyki',
    'Lucjana, Olgierda, Grzegorza', 'Eulalii, Radosława, Modesta', 'Grzegorza, Katarzyny', 'Walentego, Metodego, Cyryla', 'Faustyna, Jowity, Georginy',
    'Danuty, Julianny, Daniela', 'Aleksego, Łukasza, Zbigniewa', 'Szymona, Konstancji, Flawiana', 'Arnolda, Konrada, Marceli', 'Leona, Ludmiły, Lechosława',
    'Eleonory, Fortunata, Roberta', 'Małgorzaty, Marty, Nikifora', 'Romany, Damiana, Polikarpa', 'Macieja, Bogusza, Sergiusza', 'Wiktora, Cezarego, Wiktoryna',
    'Mirosława, Aleksandra', 'Gabriela, Anastazji, Leandra', 'Romana, Ludomira, Lecha', 'Lutosława, Romana, Oswalda'],
  // March
  ['Albina, Antoniny, Radosława', 'Heleny, Halszki, Pawła', 'Kunegundy, Maryny, Tycjana', 'Kazimierza, Łucji, Adriana', 'Adriana, Fryderyka, Teofila',
    'Róży, Wiktora, Jordana', 'Tomasza, Felicyty, Perpetui', 'Beaty, Jana, Wincentego', 'Franciszki, Katarzyny, Dominika', 'Cypriana, Marcela, Aleksandra',
    'Benedykta, Konstantego, Ludosława', 'Grzegorza, Bernarda, Józefiny', 'Bożeny, Krystyny, Marka', 'Leona, Matyldy, Łazarza', 'Klemensa, Ludwiki, Longina',
    'Izabeli, Hiacynta, Oktawii', 'Patryka, Zbigniewa, Gertrudy', 'Cyryla, Edwarda, Aleksandra', 'Józefa, Bogdana', 'Klaudii, Eufemii, Maurycego',
    'Lubomira, Benedykta', 'Katarzyny, Bogusława', 'Pelagii, Feliksa, Oktawiana', 'Marka, Gabriela, Katarzyny', 'Marii, Wieńczysława, Ireneusza',
    'Larysy, Teodora, Emanuela', 'Lidii, Ernesta, Ruperta', 'Anieli, Sykstusa, Jana', 'Wiktoryny, Helmuta, Eustachego', 'Anieli, Leonarda, Amelii',
    'Beniamina, Balbiny, Kornelii'],
  // April
  ['Grażyny, Ireny, Hugona', 'Władysława, Franciszka, Teodozji', 'Ryszarda, Pankracego, Ingi', 'Izydora, Wacława, Benedykta', 'Ireny, Wincentego',
    'Izoldy, Celestyna, Diogenesa', 'Rufina, Celestyna, Jana', 'Cezaryny, Dionizego, Julii', 'Marii, Dobrosławy, Heliodora', 'Michała, Makarego, Daniela',
    'Filipa, Leona, Stanisława', 'Zenona, Juliusza, Wiktora', 'Przemysława, Idy, Marcina', 'Bereniki, Waleriana, Justyny', 'Ludwiny, Wacławy, Anastazji',
    'Kseni, Cecylii, Bernadety', 'Rudolfa, Roberta, Aniceta', 'Bogusławy, Apoloniusza, Gościsława', 'Adolfa, Tymona, Leona', 'Czesława, Agnieszki, Mariana',
    'Bartosza, Feliksa, Anzelma', 'Kai, Leonii, Łukasza', 'Wojciecha, Jerzego, Idziego', 'Grzegorza, Aleksandra, Horacego', 'Marka, Jarosława, Wasyla',
    'Marii, Marzeny, Klaudiusza', 'Zyty, Teofila, Felicji', 'Piotra, Walerii, Witalisa', 'Rity, Katarzyny, Bogusława', 'Mariana, Katarzyny, Lilli'],
  // May
  ['Józefa, Jeremiasza, Filipa', 'Zygmunta, Atanazego, Anatola', 'Marii, Antoniny, Aleksandra', 'Moniki, Floriana, Władysława', 'Ireny, Waldemara, Pelagii',
    'Filipa, Judyty, Jakuba', 'Gizeli, Ludmiły, Benedykta', 'Stanisława, Wiktora', 'Bożydara, Grzegorza, Karoliny', 'Antoniny, Izydora, Jana',
    'Igi, Miry, Franciszka', 'Pankracego, Dominika, Achillesa', 'Serwacego, Roberta, Glorii', 'Bonifacego, Dobiesława, Macieja', 'Zofii, Nadziei, Izydora',
    'Andrzeja, Jędrzeja, Szymona', 'Brunona, Sławomira, Paschalisa', 'Feliksa, Aleksandry, Eryka', 'Iwa, Piotra, Celestyna', 'Bernardyna, Bazylego, Aleksandra',
    'Wiktora, Kryspina, Tymoteusza', 'Heleny, Wiesławy, Ryty', 'Iwony, Michała, Emilii', 'Joanny, Zuzanny, Mileny', 'Grzegorza, Urbana, Magdy',
    'Filipa, Pauliny', 'Augustyna, Juliana, Magdaleny', 'Jaromira, Augustyna, Wilhelma', 'Magdaleny, Bogumiły, Urszuli', 'Ferdynanda, Feliksa, Joanny',
    'Anieli, Petroneli, Kamili'],
  // June
  ['Jakuba, Konrada, Justyna', 'Marianny, Erazma, Marcelina', 'Leszka, Tamary, Karola', 'Franciszka, Karola, Kwiryny', 'Walerii, Bonifacego, Waltera',
    'Norberta, Laurentego, Bogumiła', 'Roberta, Wiesława', 'Medarda, Maksyma, Seweryna', 'Felicjana, Pelagii, Anny', 'Bogumiła, Małgorzaty, Diany',
    'Barnaby, Radomiła, Feliksa', 'Janiny, Onufrego, Jana', 'Lucjana, Antoniego', 'Bazylego, Elizy, Walerego', 'Wita, Jolanty',
    'Aliny, Justyny, Anety', 'Laury, Alberta, Adolfa', 'Elżbiety, Marka, Pauli', 'Gerwazego, Protazego, Romualda', 'Bogny, Rafała, Florentyny',
    'Alicji, Alojzego, Rudolfa', 'Pauliny, Tomasza, Jana', 'Wandy, Zenona, Józefa', 'Jana, Danuty, Janiny', 'Łucji, Wilhelma, Prospera',
    'Jana, Pawła, Jeremiasza', 'Maryli, Władysława, Cyryla', 'Leona, Ireneusza, Pawła', 'Piotra, Pawła', 'Emilii, Lucyny'],
  // July
  ['Haliny, Mariana, Ottona', 'Marii, Urbana, Jagody', 'Jacka, Anatola, Tomasza', 'Odona, Malwiny, Elżbiety', 'Antoniego, Karoliny, Wilhelminy',
    'Dominiki, Teresy, Gotarda', 'Cyryla, Estery, Metodego', 'Elżbiety, Adrianny, Kiliana', 'Weroniki, Lukrecji, Zenona', 'Amelii, Witalisa, Filipa',
    'Olgi, Kaliny, Benedykta', 'Jana, Brunona, Weroniki', 'Henryka, Ernesta, Małgorzaty', 'Kamila, Bonawentury, Marcelego', 'Henryka, Włodzimierza, Dawida',
    'Marii, Eustachego, Benedykta', 'Aleksego, Bogdana, Andrzeja', 'Kamila, Szymona, Arnolda', 'Wincentego, Wodzisława, Aurelii', 'Czesława, Hieronima, Małgorzaty',
    'Daniela, Andrzeja, Wiktora', 'Magdaleny, Bolesławy, Wawrzyńca', 'Bogny, Apolinarego, Brygidy', 'Kingi, Krystyny', 'Jakuba, Krzysztofa, Walentyny',
    'Anny, Grażyny, Mirosławy', 'Natalii, Lilii, Aurelii', 'Wiktora, Innocentego, Marceli', 'Marty, Olafa, Beatrycze', 'Julity, Ludmiły, Piotra',
    'Ignacego, Heleny, Lubomira'],
  // August
  ['Piotra, Justyny, Juliana', 'Gustawa, Euzebiusza, Alfonsa', 'Lidii, Augusta, Nikodema', 'Dominika, Jana, Mariana', 'Marii, Oswalda, Karoliny',
    'Sławy, Jakuba, Stefana', 'Kajetana, Doroty, Donata', 'Cypriana, Dominika, Emiliana', 'Romana, Edyty', 'Wawrzyńca, Bogdany, Borysa',
    'Klary, Zuzanny, Lukrecji', 'Klary, Lecha, Hilarii', 'Hipolita, Diany, Kasjana', 'Alfreda, Euzebiusza, Maksymiliana', 'Marii, Napoleona, Stefana',
    'Rocha, Stefana, Joachima', 'Jacka, Mirona, Anity', 'Heleny, Ilony, Bronisława', 'Jana, Bolesława, Ludwika', 'Bernarda, Sobiesława, Samuela',
    'Joanny, Kazimiery, Piusa', 'Cezarego, Tymoteusza, Marii', 'Filipa, Apolinarego, Róży', 'Bartłomieja, Jerzego, Michaliny', 'Ludwika, Luizy, Józefa',
    'Marii, Zefiryna, Joanny', 'Józefa, Moniki, Cezarego', 'Augustyna, Patrycji', 'Jana, Sabiny, Racibora', 'Róży, Szczęsnego, Feliksa',
    'Rajmunda, Ramony, Izabeli'],
  // September
  ['Bronisławy, Idziego, Bronisza', 'Juliana, Stefana, Wilhelma', 'Izabeli, Szymona, Grzegorza', 'Rozalii, Idy, Lilianny', 'Doroty, Wawrzyńca, Teodora',
    'Beaty, Eugenii, Zachariasza', 'Reginy, Melchiora, Domosława', 'Marii, Adrianny, Serafiny', 'Piotra, Sergiusza, Augusty', 'Łukasza, Mikołaja, Aldony',
    'Jacka, Prota, Dagny', 'Marii, Gwidona, Radzimira', 'Eugenii, Aurelii, Jana', 'Bernarda, Roksany, Cypriana', 'Marii, Albina, Nikodema',
    'Edyty, Kornela, Cypriana', 'Franciszka, Lamberta, Roberta', 'Ireny, Józefa, Stefanii', 'Januarego, Konstancji, Teodora', 'Filipiny, Eustachego, Faustyny',
    'Hipolita, Jonasza, Mateusza', 'Tomasza, Maurycego, Joachima', 'Bogusława, Tekli, Liwiusza', 'Gerarda, Teodora, Tomira', 'Aurelii, Władysława, Kleofasa',
    'Justyny, Cypriana, Euzebiusza', 'Damiana, Amadeusza, Wincentego', 'Wacława, Libuszy, Marka', 'Michała, Gabriela, Rafała', 'Wery, Honoriusza, Hieronima'],
  // October
  ['Danuty, Remigiusza, Teresy', 'Teofila, Dionizego, Sławomira', 'Teresy, Heliodora, Jana', 'Rozalii, Edwina, Franciszka', 'Placyda, Apolinarego, Faustyny',
    'Artura, Brunona, Fryderyka', 'Marii, Marka, Mirelli', 'Pelagii, Brygidy, Walerii', 'Arnolda, Dionizego, Wincentego', 'Pauliny, Franciszka, Daniela',
    'Aldony, Brunona, Emila', 'Eustachego, Maksymiliana, Edwina', 'Geralda, Edwarda, Teofila', 'Kaliksta, Fortunaty, Alana', 'Teresy, Jadwigi, Tekli',
    'Gawła, Ambrożego, Jadwigi', 'Małgorzaty, Wiktora, Ignacego', 'Łukasza, Juliana', 'Piotra, Ziemowita, Pawła', 'Ireny, Jana, Kleopatry',
    'Urszuli, Hilarego, Celiny', 'Filipa, Halki, Salomei', 'Seweryna, Igi, Jana', 'Marcina, Rafała, Antoniego', 'Darii, Kryspina, Wilhelminy',
    'Lucjana, Ewarysta, Damiana', 'Iwony, Sabiny', 'Szymona, Tadeusza, Judy', 'Wioletty, Narcyza, Euzebii', 'Zenobii, Przemysława, Alfonsa',
    'Urbana, Wolfganga, Krzysztofa'],
  // November
  ['Seweryny, Konrada, Wiktoryny', 'Bohdany, Tobiasza', 'Huberta, Sylwii, Marcina', 'Karola, Olgierda, Emeryka', 'Elżbiety, Sławomira, Dominika',
    'Feliksa, Leonarda, Ziemowita', 'Antoniego, Florentyny, Ernesta', 'Seweryna, Bogdana, Wiktora', 'Ursyna, Teodora, Aleksandra', 'Leny, Andrzeja, Leona',
    'Marcina, Bartłomieja, Prota', 'Renaty, Witolda, Jozafata', 'Stanisława, Mikołaja, Arkadiusza', 'Emila, Serafina, Rogera', 'Alberta, Leopolda, Artura',
    'Gertrudy, Edmunda, Marii', 'Salomei, Grzegorza, Elżbiety', 'Romana, Klaudyny, Karoliny', 'Elżbiety, Seweryny', 'Feliksa, Edmunda, Anatola',
    'Janusza, Marii, Konrada', 'Cecylii, Marka', 'Klemensa, Adeli, Felicyty', 'Flory, Emmy, Jana', 'Katarzyny, Erazma',
    'Delfiny, Konrada, Sylwestra', 'Waleriana, Wirgiliusza', 'Lesława, Zdzisława, Stefana', 'Błażeja, Saturnina', 'Andrzeja, Justyny'],
  // December
  ['Natalii, Blanki, Edmunda', 'Balbiny, Bibianny, Pauliny', 'Franciszka, Ksawerego, Kasjana', 'Barbary, Krystiana', 'Sabiny, Krystyny, Kryspiny',
    'Mikołaja, Jaremy, Emiliana', 'Ambrożego, Marcina, Agaty', 'Marii, Wirginiusza, Romaryka', 'Wiesława, Leokadii, Joanny', 'Julii, Danieli, Bogdana',
    'Damazego, Waldemara, Daniela', 'Dagmary, Aleksandra, Ady', 'Łucji, Otylii', 'Alfreda, Izydora, Zoriana', 'Niny, Celiny, Ireneusza',
    'Albiny, Adelajdy, Zdzisławy', 'Olimpii, Łazarza, Floriana', 'Gracjana, Bogusława, Wilibalda', 'Gabrieli, Dariusza, Urbana', 'Bogumiły, Dominika, Zefiryna',
    'Tomasza, Tomisława, Seweryny', 'Zenona, Honoraty, Franciszki', 'Wiktorii, Sławomiry, Jana', 'Adama, Ewy, Eweliny', 'Anastazji, Eugenii',
    'Szczepana, Stefana, Dionizego', 'Jana, Żanety, Fabioli', 'Teofili, Godzisława', 'Dawida, Tomasza, Dominika', 'Sabiny, Rainera, Eugeniusza',
    'Sylwestra, Melanii, Mariusza'],
];

/** Whose name day it is on this date (Polish, in the genitive). */
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
