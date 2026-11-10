import type { Headline } from '../types';

const l = (pl: string, en: string) => ({ pl, en });

/**
 * The first three days of the papers, the same for everyone whenever they start: Redaktor Bogdan
 * Borsuk, a serious badger from the big city, moves to Bratkowo and starts the Kurier; the same
 * morning the bees, not to be outdone, start Brzęczyk. After these, the usual run begins.
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
      q: l('Zapytaliśmy: co sądzicie o nowej gazecie?', 'We asked: what do you think of a newspaper?'),
      a: [
        { who: l('Pani Jadzia', 'Mrs Jadzia'), say: l('Wreszcie! Zrobię redaktorowi szalik. Wygląda na zmarzniętego.', 'At last! I’ll knit the editor a scarf. He looks cold.') },
        { who: l('Pan Jeżyk', 'Pan Jeżyk'), say: l('Czy będą ogłoszenia? Mam nasiona do sprzedania.', 'Will there be adverts? I’ve seeds to sell.') },
        { who: l('Atrament', 'Atrament'), say: l('Papier jest ciepły. Położę się na nim.', 'Paper is warm. I’ll lie on it.') },
      ],
    },
    jab: l('Kurier obiecuje „ani jednego wykrzyknika”. Nudy! My mamy ich dziś czterdzieści dwa! I to nie koniec!', 'The Kurier promises “not one exclamation mark”. How dull! We have forty-two today! And counting!'),
    bee: {
      title: l('MAMY GAZETĘ! I TO LEPSZĄ!', 'WE HAVE A NEWSPAPER! A BETTER ONE!'),
      body: [
        l('Dziś o świcie pod wierzbą zastukała maszyna do pisania. Jakiś Borsuk z miasta zakłada gazetę. O Bratkowie! Bez pytania ula!', 'At dawn today a typewriter started clacking under the willow. Some Borsuk from the city is starting a newspaper. About Bratkowo! Without asking the hive!'),
        l('Ul zebrał się na naradę i w osiem minut postanowił: skoro ktoś ma pisać o Bratkowie, to ktoś musi pisać PRAWDĘ. I szybko. I z wykrzyknikami.', 'The hive met and decided in eight minutes: if someone is going to write about Bratkowo, someone has to write the TRUTH. Fast. With exclamation marks.'),
        l('Tak powstał Brzęczyk. Redaktor naczelna: Trzmielina. Honorowy członek redakcji: Jingleton. Czytelnicy: wszyscy. Bzz!', 'And so Brzęczyk was born. Editor-in-chief: Trzmielina. Honorary member of staff: Jingleton. Readers: everyone. Bzz!'),
      ],
      art: 'jingleton',
      caption: l('Trzmielina, redaktor naczelna, pięć minut po założeniu gazety. Już zmęczona. Już szczęśliwa.', 'Trzmielina, editor-in-chief, five minutes after founding the paper. Already tired. Already happy.'),
      retort: l('Uprzejmie informujemy, że Kurier Bratkowski nie potrzebuje zgody ula, żeby wychodzić. Ale dziękujemy za zainteresowanie.', 'We kindly point out that the Kurier Bratkowski needs no permission from the hive to come out. But thank you for your interest.'),
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
    jab: l('Kurier dostał trzy ciasta! Brzęczyk nie dostał żadnego! To jest NIESPRAWIEDLIWOŚĆ i piszemy o tym na pierwszej stronie! No, na drugiej.', 'The Kurier got three cakes! Brzęczyk got none! This is an INJUSTICE and we’re putting it on the front page! Well, the second.'),
    bee: {
      title: l('KIM JEST BORSUK? Brzęczyk prowadzi śledztwo!', 'WHO IS BORSUK? Brzęczyk investigates!'),
      body: [
        l('Przyjechał z miasta. Nosi okulary. Mówi „uprzejmie informuję”. Kto tak mówi? Szpieg? Urzędnik? Gorzej: dziennikarz.', 'He came from the city. He wears glasses. He says “I kindly inform you”. Who talks like that? A spy? An official? Worse: a journalist.'),
        l('Nasze źródła ustaliły, że Borsuk pije herbatę bez cukru, wstaje o czwartej i ma w walizce słownik. GRUBY słownik.', 'Our sources have established that Borsuk drinks his tea without sugar, gets up at four and keeps a dictionary in his suitcase. A THICK dictionary.'),
        l('Jedno trzeba mu przyznać: szalik od Pani Jadzi nosi z godnością. Brzęczyk docenia. Ale obserwuje dalej.', 'One thing we must grant him: he wears Mrs Jadzia’s scarf with dignity. Brzęczyk approves. But will keep watching.'),
      ],
      art: 'jingleton',
      caption: l('Podejrzany Borsuk w drodze do redakcji. Słownik pod pachą (chyba).', 'Suspect Borsuk on his way to the office. Dictionary under his arm (probably).'),
      retort: l('Redaktor Borsuk nie jest szpiegiem. Słownik jest gruby, bo język polski jest bogaty. Herbatę pije, jak lubi.', 'Editor Borsuk is not a spy. The dictionary is thick because Polish is a rich language. He takes his tea as he likes.'),
    },
  },
  {
    id: 'intro-2',
    kicker: l('Komentarz redaktora', 'Editor’s note'),
    title: l('O konkurencji. Krótko', 'On the competition. Briefly'),
    sub: l('Redaktor Borsuk odpowiada na pytania o bzyczące pisemko.', 'Editor Borsuk answers questions about a certain buzzing rag.'),
    body: [
      l('Od dwóch dni mieszkańcy pytają mnie o Brzęczyka. Odpowiadam uprzejmie: nie czytam. Gazeta, która ma więcej wykrzykników niż zdań, nie jest gazetą, tylko okrzykiem.', 'For two days people have asked me about Brzęczyk. I reply politely: I don’t read it. A paper with more exclamation marks than sentences is not a paper, but a shout.'),
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

