import type { Headline } from '../types';

const l = (pl: string, en: string) => ({ pl, en });

/**
 * The papers' first four days, the same for everyone. Redaktor Bogdan Borsuk, a serious badger
 * from the city, moves to Bratkowo and starts the Kurier; the same morning the bees, having heard
 * a rumour that somebody was starting a paper, start their own, Brzęczyk. For two days neither
 * knows much about the other. On the third the bees find the Kurier and can't resist a little dig;
 * on the fourth the Kurier answers, calmly, and from then on they don't much like each other.
 * After these, the usual run begins.
 */
export const INTRO: Headline[] = [
  {
    id: 'intro-0',
    kicker: l('Numer pierwszy', 'Issue one'),
    title: l('Dzień dobry, Bratkowo. Oto Wasza gazeta', 'Good morning, Bratkowo. Here is your newspaper'),
    sub: l('Słowo od redaktora naczelnego, który właśnie się wprowadził.', 'A word from the editor-in-chief, who has just moved in.'),
    body: [
      l('Nazywam się Bogdan Borsuk. Przez trzydzieści lat pisałem w dużej gazecie w dużym mieście nad Odrą, gdzie nikt nikogo nie znał, a wiadomości były głośne i szybkie.', 'My name is Bogdan Borsuk. For thirty years I wrote for a big paper in a big city on the Oder, where nobody knew anybody and the news was loud and fast.'),
      l('W zeszłym tygodniu przyjechałem do Bratkowa z jedną walizką, maszyną do pisania i postanowieniem: tutaj będę pisał o rzeczach małych. O tym, co kwitnie, kto zapukał i dlaczego zegar na ratuszu wskazuje 4:17.', 'Last week I came to Bratkowo with one suitcase, a typewriter and a resolution: here I will write about small things. What is in flower, who knocked, and why the town hall clock says 4:17.'),
      l('Redakcja mieści się pod wierzbą przy stawie. Drzwi są zawsze otwarte, bo ich nie ma. Listy, plotki i ciasto przyjmuję codziennie.', 'The office is under the willow by the pond. The door is always open, as there isn’t one. Letters, gossip and cake are welcome daily.'),
      l('Kurier Bratkowski będzie wychodził codziennie o świcie. Obiecuję fakty, porządek i ani jednego wykrzyknika bez potrzeby.', 'The Kurier Bratkowski will come out every day at dawn. I promise facts, order, and not one exclamation mark without good reason.'),
    ],
    art: 'jezyk',
    caption: l('Redaktor Borsuk w nowej redakcji. Maszyna do pisania przyjechała pierwsza.', 'Editor Borsuk in the new office. The typewriter arrived first.'),
    vox: {
      q: l('Zapytaliśmy: co sądzicie o gazecie w Bratkowie?', 'We asked: what do you think of a newspaper in Bratkowo?'),
      a: [
        { who: l('Pani Jadzia', 'Mrs Jadzia'), say: l('Wreszcie! Zrobię redaktorowi szalik. Wygląda na zmarzniętego.', 'At last! I’ll knit the editor a scarf. He looks cold.') },
        { who: l('Pan Jeżyk', 'Pan Jeżyk'), say: l('Czy będą ogłoszenia? Mam nasiona do sprzedania.', 'Will there be adverts? I’ve seeds to sell.') },
        { who: l('Atrament', 'Atrament'), say: l('Papier jest ciepły. Położę się na nim.', 'Paper is warm. I’ll lie on it.') },
      ],
    },
    bee: {
      title: l('MAMY GAZETĘ! Ul zakłada Brzęczyk!', 'WE HAVE A NEWSPAPER! The hive starts Brzęczyk!'),
      body: [
        l('Wczoraj wieczorem po ulu przeszła plotka: ktoś w Bratkowie zakłada gazetę! Kto? Nie wiadomo. Gdzie? Nie wiadomo. Kiedy? CHYBA JUŻ!', 'Last night a rumour went round the hive: somebody in Bratkowo is starting a newspaper! Who? Nobody knows. Where? Nobody knows. When? MAYBE ALREADY!'),
        l('Jedno wiedziałyśmy na pewno. Pszczoły zawsze wiedzą pierwsze. Odwiedzamy każdy kwiat, każdy ogród i każdy parapet. Słyszymy WSZYSTKO. Nie pozwolimy, żeby ktoś wydrukował wiadomości z Bratkowa przed nami!', 'One thing we knew for certain. Bees always know first. We visit every flower, every garden and every windowsill. We hear EVERYTHING. We will not let anyone print Bratkowo’s news before us!'),
        l('Do rana ul miał redakcję, jeden ołówek i nazwę. Tak powstał Brzęczyk! Redaktor naczelna: Trzmielina. Honorowy członek redakcji: Jingleton. Czytelnicy: wszyscy. Bzz!', 'By morning the hive had a newsroom, one pencil and a name. And so Brzęczyk was born! Editor-in-chief: Trzmielina. Honorary member of staff: Jingleton. Readers: everyone. Bzz!'),
      ],
      art: 'jingleton',
      caption: l('Trzmielina, redaktor naczelna, o świcie. Nie spała ani minuty. Wygląda świetnie.', 'Trzmielina, editor-in-chief, at dawn. Didn’t sleep a wink. Looks fabulous.'),
    },
  },
  {
    id: 'intro-1',
    kicker: l('Z życia redakcji', 'From the office'),
    title: l('Pierwszy dzień redakcji. Mieszkańcy przynieśli trzy ciasta i jeden szalik', 'The office’s first day. The town brought three cakes and a scarf'),
    sub: l('Redaktor Borsuk: „W mieście nikt nigdy nie przyniósł mi ciasta”.', 'Editor Borsuk: “In the city nobody ever brought me cake.”'),
    body: [
      l('Wczoraj pod wierzbę przy stawie przyszło pół miasteczka. Pani Jadzia przyniosła sernik i szalik w paski, Pan Jeżyk torebkę nasion „na dobry początek”, a Rechotka zapytała, czy gazeta jest wodoodporna.', 'Yesterday half the town came to the willow by the pond. Mrs Jadzia brought cheesecake and a striped scarf, Pan Jeżyk a packet of seeds “for a good start”, and Rechotka asked whether the paper was waterproof.'),
      l('Redaktor Borsuk podziękował każdemu z osobna i wszystko zanotował. Szalik nosi od wczoraj. Twierdzi, że „z obowiązku”, ale nie zdejmuje go nawet przy maszynie do pisania.', 'Editor Borsuk thanked everyone in turn and noted it all down. He has worn the scarf since yesterday. He says it’s “out of duty”, but keeps it on even at the typewriter.'),
      l('Jedynym gościem, który nic nie przyniósł, był Atrament. Zasnął na stosie papieru i został do wieczora. Redakcja uznała go za maskotkę.', 'The only visitor who brought nothing was Atrament. He fell asleep on the paper stack and stayed until evening. The office has declared him its mascot.'),
    ],
    art: 'jadzia',
    caption: l('Pani Jadzia z sernikiem powitalnym. Redaktor w tle, już w szaliku.', 'Mrs Jadzia with the welcome cheesecake. The editor behind, already in the scarf.'),
    bee: {
      title: l('PIERWSZY DZIEŃ W REDAKCJI! Czterysta reporterek, jeden ołówek!', 'FIRST DAY IN THE NEWSROOM! Four hundred reporters, one pencil!'),
      body: [
        l('Wczoraj w redakcji Brzęczyka pracowało czterysta pszczół naraz. Ołówek był jeden. Kolejka do ołówka sięgała do lawendy i z powrotem!', 'Yesterday four hundred bees worked in the Brzęczyk newsroom at once. There was one pencil. The queue for the pencil reached the lavender and back!'),
        l('Mimo to zebrałyśmy tysiąc dwieście plotek, w tym trzy prawdziwe. REKORD! Najlepsze drukujemy już od jutra. Najgorsze też.', 'Even so, we gathered one thousand two hundred bits of gossip, three of them true. A RECORD! We start printing the best ones tomorrow. The worst ones too.'),
        l('Jingleton jako honorowy członek redakcji przeciął wstęgę. Wstęgą była stokrotka. Zjadł ją. Wzruszające!', 'Jingleton, as honorary member of staff, cut the ribbon. The ribbon was a daisy. He ate it. Moving!'),
      ],
      art: 'jingleton',
      caption: l('Redakcja Brzęczyka w pełnym składzie. No, prawie. Reszta stoi w kolejce do ołówka.', 'The Brzęczyk newsroom, nearly all of it. The rest are queuing for the pencil.'),
    },
  },
  {
    id: 'intro-2',
    kicker: l('Listy', 'Letters'),
    title: l('Pierwsze listy do redakcji. Najkrótszy ma jedno słowo', 'The first letters to the editor. The shortest is one word long'),
    sub: l('Czternaście listów w trzy dni. Redakcja odpowiada na wszystkie.', 'Fourteen letters in three days. The office answers them all.'),
    body: [
      l('Pod wierzbą przybywa listów. Rechotka pyta, czy Kurier można czytać w deszczu. Pan listonosz pyta, czy listy do redakcji ma doręczać, skoro redakcja nie ma drzwi. Atrament przysłał kartkę z odciskiem łapy i niczym więcej.', 'Letters are piling up under the willow. Rechotka asks whether the Kurier can be read in the rain. The postman asks whether he should deliver letters to an office with no door. Atrament sent a card with a paw print on it and nothing else.'),
      l('Najkrótszy list przyszedł z koszyka między psami przy oknie. Składa się z jednego słowa: „Czekam”. Podpisał Milton. Redakcja nie wie, na co, ale życzy powodzenia.', 'The shortest letter came from the basket between the dogs at the window. It is one word: “Waiting.” Signed, Milton. The office doesn’t know what for, but wishes him luck.'),
      l('Odpowiedzi drukujemy w rubryce „Listy do redakcji”. Prosimy pisać wyraźnie. Zwłaszcza łapą.', 'Replies appear under “Letters to the editor”. Please write clearly. Especially with a paw.'),
    ],
    art: 'jezyk',
    caption: l('Redaktor Borsuk nad pierwszymi listami. Odpisuje na maszynie, każdemu osobno.', 'Editor Borsuk with the first letters. He types every reply himself.'),
    jab: l('Kurier pisze o czternastu listach na całą stronę. My dostałyśmy sto czterdzieści i zmieściłyśmy je w jednym brzęknięciu. Tylko mówimy.', 'The Kurier spends a whole page on fourteen letters. We got a hundred and forty and fit them in one buzz. Just saying.'),
    bee: {
      title: l('JEST DRUGA GAZETA?! Plotka była prawdziwa!', 'THERE’S ANOTHER PAPER?! The rumour was true!'),
      body: [
        l('Szok w ulu! Wczoraj zwiadowczyni przyniosła z sadu coś szarego i szeleszczącego. To GAZETA. Nazywa się Kurier Bratkowski i wydaje ją jakiś borsuk spod wierzby.', 'Shock in the hive! Yesterday a scout brought something grey and rustling back from the orchard. It is a NEWSPAPER. It is called the Kurier Bratkowski, and some badger under the willow puts it out.'),
        l('Przeczytałyśmy ją. Całą. Zajęło to pół dnia. Dużo słów, dużo przecinków, ani jednego wykrzyknika. Ciekawe, czy redaktor kiedykolwiek się dziwi.', 'We read it. All of it. It took half a day. Lots of words, lots of commas, not one exclamation mark. We wonder whether the editor is ever surprised by anything.'),
        l('Bez urazy, Kurierze! Witamy w Bratkowie! Pszczoły i tak wiedzą wszystko pierwsze. Bzz.', 'No offence, Kurier! Welcome to Bratkowo! The bees still know everything first. Bzz.'),
      ],
      art: 'jingleton',
      caption: l('Zwiadowczyni z Kurierem. Gazeta jest większa od niej. Dźwigała ją przez cały sad.', 'The scout with the Kurier. The paper is bigger than she is. She carried it across the whole orchard.'),
      retort: l('Uprzejmie informujemy, że Kurier nie stosuje wykrzykników, bo wiadomości nie trzeba wykrzykiwać. Wystarczy je sprawdzić.', 'We kindly point out that the Kurier does not use exclamation marks, because news does not need shouting. It needs checking.'),
    },
  },
  {
    id: 'intro-3',
    kicker: l('Komentarz redaktora', 'Editor’s note'),
    title: l('O konkurencji. Krótko', 'On the competition. Briefly'),
    sub: l('Redaktor Borsuk odpowiada na pytania o bzyczące pisemko.', 'Editor Borsuk answers questions about a certain buzzing rag.'),
    body: [
      l('Od wczoraj mieszkańcy pytają mnie o Brzęczyka. Odpowiadam uprzejmie: nie czytam. Gazeta, która ma więcej wykrzykników niż zdań, nie jest gazetą, tylko okrzykiem.', 'Since yesterday people have asked me about Brzęczyk. I reply politely: I don’t read it. A paper with more exclamation marks than sentences is not a paper, but a shout.'),
      l('Kurier Bratkowski będzie pisał dalej, jak obiecał: rzetelnie, spokojnie i o tym, co ważne. Z dobrymi wiadomościami z ogrodu przy oknie na czele.', 'The Kurier Bratkowski will go on as promised: reliably, calmly, and about what matters. With good news from the garden at the window first.'),
      l('PS. Wczorajszy numer Brzęczyka zawierał trzy błędy ortograficzne. Nie żebym liczył.', 'PS. Yesterday’s Brzęczyk contained three spelling mistakes. Not that I counted.'),
    ],
    art: 'jezyk',
    caption: l('Redaktor przy pracy. Na biurku, przypadkiem, najnowszy Brzęczyk.', 'The editor at work. On the desk, by chance, the latest Brzęczyk.'),
    jab: l('Borsuk „nie czyta” Brzęczyka, ale policzył nam błędy. TRZY. Ktoś tu czyta bardzo uważnie, Panie Redaktorze!', 'Borsuk “doesn’t read” Brzęczyk, but he counted our mistakes. THREE. Somebody reads very closely, Mr Editor!'),
    bee: {
      title: l('MAMY ZDJĘCIE! Borsuk czyta Brzęczyk!', 'WE HAVE A PHOTO! Borsuk reads Brzęczyk!'),
      body: [
        l('„Nie czytam”, mówi Redaktor. A kto wczoraj o 6:12 stał pod ulem z naszą gazetą w łapach i chichotał nad horoskopem? Nasza fotoreporterka ma dowody.', '“I don’t read it,” says the Editor. Then who stood by the hive at 6.12 yesterday with our paper in his paws, giggling at the horoscope? Our photographer has the evidence.'),
        l('Panie Borsuku, nie ma się czego wstydzić. Brzęczyk czytają wszyscy. Nawet ci, którzy mówią, że nie. ZWŁASZCZA ci.', 'Mr Borsuk, there’s no shame in it. Everyone reads Brzęczyk. Even those who say they don’t. ESPECIALLY those.'),
      ],
      art: 'jingleton',
      caption: l('Dowód rzeczowy numer jeden. Redaktor i Brzęczyk, o świcie.', 'Exhibit A. The editor and Brzęczyk, at dawn.'),
      retort: l('Redaktor Borsuk stał pod ulem, bo czekał na listonosza. Gazeta, którą trzymał, przyleciała sama.', 'Editor Borsuk was by the hive because he was waiting for the postman. The paper in his paws flew there by itself.'),
    },
  },
];

/** On the very first morning there's no yesterday yet. */
export const FIRST_GARDEN_LINE = l('Od jutra piszemy tu, co wydarzyło się wczoraj w Twoim ogrodzie. Redakcja już nie może się doczekać.', 'From tomorrow, this is where we write what happened in your garden the day before. The editors can’t wait.');

/** Until this many days in, the two papers don't yet know about each other. */
export const STRANGERS_DAYS = 2;

/** Whether a piece of the Kurier mentions Brzęczyk, or a piece of Brzęczyk the Kurier: such pieces wait until the papers have met. */
const said = (t: { pl: string; en: string } | undefined, re: RegExp) => !!t && re.test(`${t.pl} ${t.en}`);
export const mentionsBees = (...t: Array<{ pl: string; en: string } | undefined>) => t.some((x) => said(x, /Brzęczyk|bzycząc|buzzing/i));
export const mentionsKurier = (...t: Array<{ pl: string; en: string } | undefined>) => t.some((x) => said(x, /Kurier/i));
