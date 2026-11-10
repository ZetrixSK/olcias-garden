import type { Ad, L, Letter, Piece, Rumour, Vox } from '../types';

const l = (pl: string, en: string) => ({ pl, en });

/** The Kurier's "Plotki": one a day, on page 2. */
export const GOSSIP: Piece[] = [
  { title: l('Kto gra na flecie o świcie?', 'Who plays the flute at dawn?'), body: l('Od tygodnia o piątej rano nad stawem ktoś gra na flecie. Ładnie, ale o piątej. Podejrzenia padają na sowę, która kończy wtedy dyżur, i na Rechotkę, która zaprzecza zbyt szybko.', 'For a week now someone has played the flute by the pond at five in the morning. Nicely, but at five. Suspicion falls on the owl, who finishes her shift then, and on Rechotka, who denies it too quickly.') },
  { title: l('Pani Jadzia skończyła włóczkę', 'Mrs Jadzia has run out of wool'), body: l('Po raz pierwszy od trzydziestu lat. W sklepie zabrakło różowej, czarnej i każdej innej. Miasteczko wstrzymuje oddech: na czym teraz skończy się sweter dla ławki w parku?', 'For the first time in thirty years. The shop is out of pink, black and every other colour. The town holds its breath: what will become of the park bench’s jumper now?') },
  { title: l('Atrament widziany w dwóch miejscach naraz', 'Atrament seen in two places at once'), body: l('O 18:00 na parapecie Pani Jadzi i o 18:00 na dachu ratusza. Oba źródła są wiarygodne. Kot odmawia wyjaśnień i ziewa.', 'At 6 p.m. on Mrs Jadzia’s windowsill and at 6 p.m. on the town hall roof. Both sources are reliable. The cat declines to explain, and yawns.') },
  { title: l('Pan listonosz kupił nowy dzwonek do roweru', 'The postman has a new bicycle bell'), body: l('Dzwoni w tonacji G-dur i, jak mówi właściciel, „bardziej elegancko”. Psy z okna przy ogrodzie są innego zdania i dały temu wyraz.', 'It rings in G major and, says its owner, “more elegantly”. The dogs at the garden window disagree, and said so.') },
  { title: l('Duszek przestawił meble na strychu', 'Little Ghost has moved the attic furniture'), body: l('Hałas słychać było w całej uliczce. Duszek przeprasza i wyjaśnia, że „szafa sama się prosiła”. Sąsiedzi przyjmują przeprosiny i proszą o ciszę po północy.', 'The noise carried down the whole lane. Little Ghost apologises and explains that “the wardrobe was asking for it”. The neighbours accept, and request quiet after midnight.') },
  { title: l('Wiedźmusia zdała egzamin z miotły', 'Wiedźmusia has passed her broom test'), body: l('Za trzecim podejściem. Egzaminator, stara wrona, ocenił lot jako „pewny, ale krzywy”. Wiedźmusia mówi, że krzywo lata się szybciej.', 'At the third attempt. The examiner, an old crow, rated the flight “confident but crooked”. Wiedźmusia says crooked is faster.') },
  { title: l('Ktoś zostawia kwiaty pod drzwiami ratusza', 'Someone is leaving flowers at the town hall door'), body: l('Codziennie rano jeden kwiat, zawsze inny. Kamień, który jest burmistrzem, nie skomentował. Ale chyba się cieszy.', 'Every morning one flower, never the same. The stone who is mayor has not commented. But seems pleased.') },
  { title: l('Halinka otwiera kurs zapamiętywania', 'Halinka is starting a memory course'), body: l('Zajęcia odbędą się w czwartek. Albo w piątek. Halinka da znać, jak sobie przypomni.', 'Classes are on Thursday. Or Friday. Halinka will let us know when she remembers.') },
  { title: l('Rechotka śpiewa w deszczu', 'Rechotka sings in the rain'), body: l('Mieszkańcy pytają, czy to śpiew, czy rechot. Rechotka odpowiada, że to jedno i to samo, tylko z uczuciem.', 'Residents ask whether it’s singing or croaking. Rechotka says it’s the same thing, just with feeling.') },
  { title: l('Pani Ćma zamówiła większe skrzydła?', 'Has Pani Ćma ordered bigger wings?'), body: l('Plotka niepotwierdzona. Pani Ćma twierdzi, że ma takie same od zawsze, a lata wyżej, bo „ma powody”.', 'Unconfirmed rumour. Pani Ćma says hers are the same as ever, she just flies higher because she “has her reasons”.') },
  { title: l('Kret Zenon zaprosił gości na podwieczorek', 'Zenon the mole has invited guests to tea'), body: l('Przyszło dwoje. Trzecia osoba wpadła przez sufit. Zenon mówi, że to też się liczy.', 'Two came. A third fell in through the ceiling. Zenon says that counts too.') },
  { title: l('Pan Jeżyk nauczył się gwizdać', 'Pan Jeżyk has learnt to whistle'), body: l('Na razie jedną melodię i tylko pod nosem. Bywalcy straganu twierdzą, że to coś o latarni.', 'Just one tune so far, and only under his breath. Regulars say it’s something about a lantern.') },
  { title: l('Psy z okna mają nową piłkę', 'The window dogs have a new ball'), body: l('Zielono-żółtą. Stara zaginęła w niewyjaśnionych okolicznościach, podobnie jak skarpetki. Śledztwo trwa.', 'Green and yellow. The old one vanished in unexplained circumstances, like the socks. Investigation ongoing.') },
  { title: l('Sowa zamówiła okulary', 'The owl has ordered glasses'), body: l('Do czytania. Mówi, że coraz trudniej odróżnić w nocy Duszka od prześcieradła na sznurku.', 'For reading. She says it’s getting harder at night to tell Little Ghost from a sheet on the line.') },
  { title: l('Zimowe sanki wyjechały z piwnicy', 'The winter sledge is out of the cellar'), body: l('Pierwsza wypróbowała je Wiedźmusia. Mówi, że to jak miotła, tylko w dół.', 'Wiedźmusia tried it first. She says it’s like a broom, only downwards.'), when: { months: [11, 0, 1] } },
  { title: l('Kto zbiera kasztany?', 'Who’s collecting conkers?'), body: l('Pod kasztanowcem nie został ani jeden. Halinka twierdzi, że to nie ona, bo „kasztanów się nie je”. Ale je się chowa?', 'Not one left under the chestnut tree. Halinka says it wasn’t her, because “you don’t eat conkers”. But do you hide them?'), when: { months: [8, 9, 10] } },
  { title: l('Pierwsze bocianie gniazdo', 'The first stork’s nest'), body: l('Na kominie piekarni. Piekarz mówi, że nie ma nic przeciwko, dopóki nikt nie wypada do pieca.', 'On the bakery chimney. The baker doesn’t mind, so long as nobody falls into the oven.'), when: { months: [2, 3, 4] } },
  { title: l('Lody wróciły do budki nad stawem', 'Ice cream is back at the pond kiosk'), body: l('Najlepiej schodzą malinowe. Rechotka pyta, czy będą też o smaku komara. Nie będą.', 'Raspberry sells best. Rechotka asks whether there’ll be mosquito flavour. There won’t.'), when: { months: [5, 6, 7] } },
];

/** Small ads: two or three in each Kurier. */
export const ADS: Ad[] = [
  { kind: l('ZGUBIONO', 'LOST'), text: l('jeden kolec, okolice straganu. Znalazcę nagrodzę nasionkiem.', 'one spine, near the stall. Finder will be rewarded with a seed.'), sign: 'P. J.' },
  { kind: l('SPRZEDAM', 'FOR SALE'), text: l('kokon, mało używany, jeden właściciel.', 'cocoon, barely used, one owner.'), sign: 'M.' },
  { kind: l('SZUKAM', 'WANTED'), text: l('partnerki do tańca na sobotę. Mam sześć nóg, dużo umiem.', 'dance partner for Saturday. I have six legs, I know a lot of moves.'), sign: 'Konik Polny' },
  { kind: l('ODDAM', 'FREE'), text: l('skrzypienie, stare, z mostka. Dobre do nucenia.', 'a creak, old, from the bridge. Good for humming.'), sign: 'Rechotka' },
  { kind: l('KUPIĘ', 'WANTED'), text: l('kapelusz o rozmiar mniejszy. Ten jest dobry, ale ucieka.', 'a hat one size smaller. This one’s fine, it just keeps running off.'), sign: 'W.' },
  { kind: l('ZAMIENIĘ', 'SWAP'), text: l('jeden sweter na drutach na dwa słoiki konfitury. Sweter w kolorze malinowym.', 'one hand-knitted jumper for two jars of jam. Jumper in raspberry.'), sign: 'J.' },
  { kind: l('PRZYJMĘ', 'WANTED'), text: l('wszystkie stare prześcieradła. Nie pytajcie po co. Grzecznie dziękuję.', 'any old sheets. Don’t ask why. Thank you kindly.'), sign: 'D.' },
  { kind: l('USŁUGI', 'SERVICES'), text: l('nocne pilnowanie domu. Doświadczenie: trzydzieści lat. Śpię w dzień, nie przeszkadzać.', 'night-time house-sitting. Thirty years’ experience. I sleep by day, do not disturb.'), sign: 'Sowa' },
  { kind: l('ZGUBIONO', 'LOST'), text: l('mapę orzechów. Jeśli ktoś znajdzie, proszę jej nie czytać. I oddać.', 'map of nuts. If found, please don’t read it. And give it back.'), sign: 'Halinka' },
  { kind: l('SPRZEDAM', 'FOR SALE'), text: l('ziemię, bardzo dobrą, prosto spod domu. Ilość nieograniczona.', 'soil, excellent quality, straight from under my house. Unlimited supply.'), sign: 'Z.' },
  { kind: l('SZUKAM', 'WANTED'), text: l('ciepłego miejsca na zimę. Mam własny koc. Mruczę.', 'warm spot for the winter. I bring my own blanket. I purr.'), sign: 'A.' },
  { kind: l('NAUCZĘ', 'LESSONS'), text: l('gwizdania. Tylko jednej melodii, ale za to dobrze.', 'in whistling. Just one tune, but done properly.'), sign: 'P. J.' },
  { kind: l('ODDAM', 'FREE'), text: l('dobre rady. Dużo. Za darmo. Nawet jak nikt nie pyta.', 'good advice. Lots. Free. Even when nobody asks.'), sign: 'Kamień, burmistrz' },
  { kind: l('ZNALEZIONO', 'FOUND'), text: l('klucz od ratusza. Ten zaginiony od 2019. Odbiór w redakcji.', 'the town hall key. The one missing since 2019. Collect from the newsroom.'), sign: 'Redakcja' },
  { kind: l('POSZUKUJĘ', 'SEEKING'), text: l('kogoś, kto lubi słuchać o świetle. Długo. Do rana.', 'someone who likes hearing about light. At length. Until morning.'), sign: 'Ć.' },
  { kind: l('SPRZEDAM', 'FOR SALE'), text: l('dzwonek do roweru, stary, w tonacji F. Nowy dzwoni ładniej.', 'bicycle bell, old, in F. The new one rings nicer.'), sign: 'Listonosz' },
  { kind: l('KUPIĘ', 'WANTED'), text: l('liście grzybieni, dużo. Mam plan. Ratusz nie musi wiedzieć.', 'lily pads, lots. I have a plan. The town hall needn’t know.'), sign: 'R.' },
  { kind: l('PRZYJMĘ', 'WANTED'), text: l('każdy pyłek. Odbiór własny. Dziękujemy.', 'any pollen. We collect. Thank you.'), sign: 'Ul' },
  { kind: l('ODDAM', 'FREE'), text: l('sernik. Żartowałam. Sernika nie oddam nigdy.', 'cheesecake. Only joking. I’ll never give away cheesecake.'), sign: 'J.' },
  { kind: l('ZGUBIONO', 'LOST'), text: l('jedną skarpetkę. Lewą. Lepszą. Podejrzewam kogoś z czterema łapami.', 'one sock. The left. The better one. I suspect someone with four paws.'), sign: 'Mieszkaniec' },
];

/** "Listy do redakcji": one a day, with the editors' answer when there's room. */
export const LETTERS: Letter[] = [
  { text: l('Szanowna Redakcjo, siedzę w koszyku i czekam. Idzie mi świetnie.', 'Dear Editors, I sit in my basket and wait. It’s going very well.'), sign: l('Milton', 'Milton'), reply: l('Trzymamy kciuki, Panie Miltonie.', 'Fingers crossed, Mr Milton.') },
  { text: l('Szanowna Redakcjo, czemu w Kurierze jest tak mało o żabach? Żaby też czytają.', 'Dear Editors, why is there so little about frogs in the Kurier? Frogs read too.'), sign: l('Rechotka', 'Rechotka'), reply: l('Obiecujemy poprawę. Ten list jest o żabie, więc już jest lepiej.', 'We promise to do better. This letter is about a frog, so it’s already improving.') },
  { text: l('Szanowna Redakcjo, proszę o niepublikowanie godzin, kiedy śpię. Ludzie przychodzą wtedy specjalnie.', 'Dear Editors, please stop printing the hours I sleep. People come round specially.'), sign: l('Sowa', 'The owl'), reply: l('Przepraszamy. Od dziś piszemy, że pani nie śpi nigdy.', 'Our apologies. From now on we’ll say you never sleep.') },
  { text: l('Szanowna Redakcjo, czy ktoś widział mój dobry humor? Zostawiłem go wczoraj na ławce.', 'Dear Editors, has anyone seen my good mood? I left it on a bench yesterday.'), sign: l('Pan Jeżyk', 'Pan Jeżyk'), reply: l('Podobno widziano go przy latarni. Polecamy sprawdzić wieczorem.', 'It was reportedly seen near the lantern. We suggest checking this evening.') },
  { text: l('Szanowna Redakcjo, uprzejmie informuję, że nie jestem prześcieradłem. Proszę przekazać sowie.', 'Dear Editors, I wish to point out that I am not a sheet. Please tell the owl.'), sign: l('Duszek', 'Little Ghost'), reply: l('Przekazane. Sowa przeprasza i zamówiła okulary.', 'Passed on. The owl apologises and has ordered glasses.') },
  { text: l('Szanowna Redakcjo, ile swetrów to za dużo? Pytam dla koleżanki.', 'Dear Editors, how many jumpers is too many? Asking for a friend.'), sign: l('Pani Jadzia', 'Mrs Jadzia'), reply: l('Nie ma czegoś takiego jak za dużo swetrów. Koleżanka może spać spokojnie.', 'There’s no such thing as too many jumpers. Your friend can rest easy.') },
  { text: l('Szanowna Redakcjo, dlaczego kot jest w radzie, a ja nie? Ja przynajmniej nie śpię na posiedzeniach.', 'Dear Editors, why is a cat on the council and not me? At least I don’t sleep in meetings.'), sign: l('Kret Zenon', 'Zenon the mole'), reply: l('Proponujemy zgłosić się do następnych wyborów. Kamień też kiedyś zaczynał.', 'We suggest you stand in the next election. The stone started somewhere too.') },
  { text: l('Szanowna Redakcjo, bardzo dziękuję za wszystkie bukiety. Nie wiem, kto je przynosi, ale wiem, że ktoś o mnie myśli.', 'Dear Editors, thank you so much for all the bouquets. I don’t know who brings them, but I know someone is thinking of me.'), sign: l('Latarnia na rogu', 'The lamppost on the corner'), reply: l('Wiemy, kto. Nie powiemy. Ale ma na drutach dobrą rękę.', 'We know who. We won’t say. But she’s handy with knitting needles.') },
  { text: l('Szanowna Redakcjo, uprzejmie proszę Brzęczyk, żeby przestał pisać o metrze. Kopię tylko korytarz do spiżarni.', 'Dear Editors, I kindly ask Brzęczyk to stop writing about an underground. I’m only digging a corridor to my larder.'), sign: l('Kret Zenon', 'Zenon the mole'), reply: l('Przekazaliśmy. Brzęczyk odpowiedział: „spiżarnia to pierwsza stacja”.', 'We passed it on. Brzęczyk replied: “the larder is the first station”.') },
  { text: l('Szanowna Redakcjo, chciałabym podziękować za piękny ogród przy oknie. Zawsze się tam zatrzymuję w drodze do domu.', 'Dear Editors, I’d like to say thank you for the lovely garden at the window. I always stop there on my way home.'), sign: l('Pani Ćma', 'Pani Ćma'), reply: l('Przekazujemy podziękowania {właścicielce|właścicielowi} ogrodu. Na pewno się ucieszy.', 'Thanks passed on to the garden’s owner. {She|He}’ll be pleased.') },
  { text: l('Szanowna Redakcjo, czy można zamówić Kuriera w wersji wodoodpornej?', 'Dear Editors, can I get the Kurier in a waterproof edition?'), sign: l('Rechotka', 'Rechotka'), reply: l('Pracujemy nad tym. Na razie polecamy czytać szybko.', 'We’re working on it. For now we recommend reading fast.') },
  { text: l('Szanowna Redakcjo, ja tylko chciałem powiedzieć, że stokrotki są najlepsze. Dziękuję, to wszystko.', 'Dear Editors, I just wanted to say daisies are the best. Thank you, that’s all.'), sign: l('Jingleton', 'Jingleton'), reply: l('Odnotowane i całkowicie się zgadzamy.', 'Noted, and we agree entirely.') },
];

/** The Kurier's horoscope, always for Capricorn. */
export const HOROSCOPES: L[] = [
  l('Dobry dzień na herbatę i podlanie czegoś zielonego. Unikaj kałuż i ludzi, którzy mówią „a nie mówiłem”.', 'A good day for tea and watering something green. Avoid puddles, and people who say “told you so”.'),
  l('Gwiazdy sprzyjają porządkom. Nie musisz ich robić. Wystarczy, że o nich pomyślisz.', 'The stars favour tidying up. You don’t have to do it. Just thinking about it counts.'),
  l('Ktoś bliski przypomni sobie o Tobie dziś po południu. Może zadzwoni, może tylko się uśmiechnie.', 'Someone close will think of you this afternoon. They may call, or they may just smile.'),
  l('Dzień sprzyja cierpliwości. Coś, na co czekasz, rośnie, nawet jeśli tego nie widać.', 'A day for patience. Something you’re waiting for is growing, even if you can’t see it.'),
  l('Księżyc radzi wcześniej się położyć. Gwiazdy radzą przeczytać jeszcze jeden rozdział. Wybór należy do Ciebie.', 'The moon advises an early night. The stars advise one more chapter. Your call.'),
  l('Koziorożce są dziś uparte, ale w dobrym sensie. Dokończ to, co zaczęł{aś|eś}.', 'Capricorns are stubborn today, in a good way. Finish what you started.'),
  l('Planety mówią: nie bierz wszystkiego na siebie. Zostaw trochę dla psów, one też chcą pomóc.', 'The planets say: don’t take it all on yourself. Leave some for the dogs, they want to help too.'),
  l('Szczęśliwy kolor: różowy. Szczęśliwa godzina: 4:17, jak na zegarze ratusza.', 'Lucky colour: pink. Lucky time: 4:17, like the town hall clock.'),
  l('Dobry dzień na zmiany, choćby małe. Przestaw jedną doniczkę. Zobacz, co się stanie.', 'A good day for change, however small. Move one flowerpot. See what happens.'),
  l('Dziś warto powiedzieć komuś coś miłego. Najlepiej sobie.', 'Today is worth saying something kind to someone. Ideally yourself.'),
  l('Merkury nic dziś nie psuje. Rzadka okazja. Wykorzystaj.', 'Mercury isn’t breaking anything today. A rare chance. Use it.'),
  l('Gwiazdy przewidują spokojny dzień i jedną małą niespodziankę. Raczej słodką.', 'The stars foresee a quiet day and one small surprise. Probably a sweet one.'),
  l('Koziorożec dziś wie, czego chce. Reszta świata dowie się później.', 'Capricorn knows what {she|he} wants today. The rest of the world will find out later.'),
  l('Wieczorem dobrze zrobi Ci coś ciepłego: herbata, koc albo pies na kolanach.', 'Something warm will do you good this evening: tea, a blanket or a dog on your lap.'),
  l('Nie spiesz się. Kwiaty też się nie spieszą, a zawsze zdążą.', 'Don’t rush. Flowers don’t rush either, and they always make it.'),
  l('Dzień na drobne przyjemności. Nie trzeba ich szukać, same się znajdą.', 'A day for small pleasures. No need to look for them; they’ll find you.'),
];

/** The world column's stand-ins, for days without fresh news: the town on the season. */
export const STANDINS: Piece[] = [
  { title: l('Listopad w natarciu', 'November on the march'), body: l('Liście spadają szybciej, niż ktokolwiek zdąży je policzyć. Pan Jeżyk doliczył do czterystu dwunastu i poszedł na herbatę. Prognoza na resztę miesiąca: więcej liści, więcej herbaty.', 'Leaves are falling faster than anyone can count them. Pan Jeżyk reached four hundred and twelve and went for tea. Forecast for the rest of the month: more leaves, more tea.'), when: { months: [10] } },
  { title: l('Grudzień, czyli wszyscy pieką', 'December, when everyone bakes'), body: l('W całym kraju pachnie piernikami. W Bratkowie też, głównie od Pani Jadzi, która piecze od soboty i nie zamierza przestać.', 'The whole country smells of gingerbread. So does Bratkowo, mainly from Mrs Jadzia, who has been baking since Saturday and has no plans to stop.'), when: { months: [11] } },
  { title: l('Styczeń: nowy rok, stare kalosze', 'January: new year, old boots'), body: l('W całej Polsce postanowienia noworoczne. W Bratkowie najczęściej: „więcej spać” (Pan Jeżyk), „mniej spać” (sowa) i „znaleźć orzechy” (Halinka).', 'New Year’s resolutions all over Poland. In Bratkowo the most popular: “sleep more” (Pan Jeżyk), “sleep less” (the owl) and “find the nuts” (Halinka).'), when: { months: [0] } },
  { title: l('Luty: zima się nie poddaje', 'February: winter isn’t giving up'), body: l('Śnieg trzyma się dzielnie. Wiedźmusia twierdzi, że zna zaklęcie na wiosnę, ale „jeszcze nie ten moment”.', 'The snow is holding on bravely. Wiedźmusia claims she knows a spell for spring, but “it’s not time yet”.'), when: { months: [1] } },
  { title: l('Marzec: pierwsze przebiśniegi', 'March: the first snowdrops'), body: l('W ogródkach w całym kraju wychodzą pierwsze przebiśniegi. W Bratkowie jeden wyszedł spod kamienia, który jest burmistrzem. Burmistrz nie zgłasza zastrzeżeń.', 'Snowdrops are appearing in gardens across the country. In Bratkowo one came up from under the stone who is mayor. The mayor raises no objection.'), when: { months: [2] } },
  { title: l('Kwiecień plecień', 'April, both ways at once'), body: l('Rano słońce, w południe grad, wieczorem tęcza. Rechotka zabiera na spacer i parasol, i okulary przeciwsłoneczne, na wszelki wypadek.', 'Sun in the morning, hail at noon, a rainbow by evening. Rechotka takes both an umbrella and sunglasses on her walks, just in case.'), when: { months: [3] } },
  { title: l('Maj: wszystko kwitnie', 'May: everything’s in flower'), body: l('Bzy, kasztany, jabłonie. Pszczoły z Brzęczyka nie wydały dziś gazety, bo mają „ważniejsze sprawy”. Rozumiemy.', 'Lilac, chestnut, apple blossom. The bees at Brzęczyk didn’t put out a paper today, they have “more important things”. We understand.'), when: { months: [4] } },
  { title: l('Czerwiec: noce najkrótsze', 'June: the shortest nights'), body: l('Sowa ma najkrótszy dyżur w roku i najdłuższą drzemkę. Mówi, że to jej ulubiony miesiąc.', 'The owl has her shortest shift of the year and her longest nap. She says it’s her favourite month.'), when: { months: [5] } },
  { title: l('Lipiec: upał', 'July: heat'), body: l('W całej Polsce gorąco. W Bratkowie staw jest najpopularniejszym miejscem w miasteczku, a Rechotka pobiera opłatę za wejście: jeden komar.', 'Hot all over Poland. In Bratkowo the pond is the most popular spot in town, and Rechotka charges admission: one mosquito.'), when: { months: [6] } },
  { title: l('Sierpień: spadające gwiazdy', 'August: shooting stars'), body: l('W całym kraju ludzie leżą na kocach i patrzą w niebo. W Bratkowie też, a Pan Jeżyk liczy gwiazdy tak, jak liczy liście jesienią: do pierwszej drzemki.', 'People all over the country lie on blankets looking at the sky. In Bratkowo too, and Pan Jeżyk counts stars the way he counts leaves in autumn: until his first nap.'), when: { months: [7] } },
  { title: l('Wrzesień: grzybobranie', 'September: mushroom season'), body: l('Pół Polski w lesie z koszykami. W Bratkowie najwięcej grzybów znalazł kret Zenon, ale od spodu, więc się nie liczą.', 'Half of Poland is in the woods with baskets. In Bratkowo, Zenon the mole found the most mushrooms, but from underneath, so they don’t count.'), when: { months: [8] } },
  { title: l('Październik: złota jesień', 'October: golden autumn'), body: l('Liście żółte, czerwone i brązowe, a w Bratkowie także różowe, od kiedy Wiedźmusia kichnęła nad lasem. Wygląda to pięknie.', 'Leaves yellow, red and brown, and in Bratkowo also pink, ever since Wiedźmusia sneezed over the woods. It looks lovely.'), when: { months: [9] } },
];

/** What's said about what may happen in the garden: true or not, nobody knows. */
export const RUMOURS: Rumour[] = [
  { kurier: l('W noc pełni kwiaty podobno rosną szybciej. Redakcja sprawdzi.', 'On the night of the full moon, flowers supposedly grow faster. We’ll look into it.'), bee: l('Pełnia przyspiesza kwiaty! Wiemy, bo nie śpimy przy pełni. Za jasno.', 'The full moon speeds up flowers! We know, we can’t sleep at full moon. Too bright.') },
  { kurier: l('Ktoś widział wróżki w sadzie. Nikt nie wierzy. Prawie nikt.', 'Someone saw fairies in the orchard. Nobody believes it. Almost nobody.'), bee: l('Wróżki w sadzie! Mamy zdjęcie. Z palcem. Ale wróżki tam są!', 'Fairies in the orchard! We have a photo. With a finger in it. But the fairies are there!') },
  { kurier: l('Pan Jeżyk podobno szykuje nowe nasiona. Jakie, nie mówi.', 'Pan Jeżyk is said to be preparing new seeds. He won’t say which.'), bee: l('Jeżyk ma NOWE NASIONA. Widziałyśmy torebkę. Różową. Więcej nie wiemy, ale już się cieszymy.', 'Jeżyk has NEW SEEDS. We saw the packet. Pink. That’s all we know, but we’re already excited.') },
  { kurier: l('Mówi się, że Milton w końcu się wykluje. Mówi się tak od dawna.', 'Word is Milton will finally hatch. Word has been saying so for a long time.'), bee: l('Milton się wykluje! W tym roku! Albo w następnym! Zakłady przyjmujemy w ulu.', 'Milton will hatch! This year! Or next! Bets taken at the hive.') },
  { kurier: l('Podobno nocą przy oknie z bratkami przelatują świetliki. Zimą? Redakcja wątpi.', 'Fireflies are said to visit the pansy window at night. In winter? The editors doubt it.'), bee: l('Świetliki przy oknie z bratkami! Pewnie przyleciały poczytać. Zapraszamy, mamy światło.', 'Fireflies at the pansy window! Probably came to read. Welcome, we have the light on.') },
  { kurier: l('Plotka głosi, że ktoś z gości szykuje dla ogrodu prezent. Nie wiemy kto.', 'Rumour has it one of the visitors is preparing a gift for the garden. We don’t know who.'), bee: l('Ktoś szykuje prezent dla ogrodu! Podejrzewamy kogoś puchatego. Nie nas. Chyba.', 'Someone’s preparing a gift for the garden! We suspect someone fluffy. Not us. Probably.') },
  { kurier: l('Słychać, że nad sadem pojawi się w tym roku zorza. Astronomowie milczą.', 'There’s talk of northern lights over the orchard this year. Astronomers are silent.'), bee: l('ZORZA nad Bratkowem? Jeśli tak, to my zobaczymy pierwsze. My zawsze pierwsze.', 'NORTHERN LIGHTS over Bratkowo? If so, we’ll see them first. We’re always first.') },
  { kurier: l('Mówi się, że w ogrodzie przy oknie zakwitnie kiedyś czarna malwa. Kiedy, nie wiadomo.', 'It’s said a black hollyhock will one day bloom in the garden at the window. When, nobody knows.'), bee: l('Czarna malwa! Bardzo gotycka, bardzo piękna. Rezerwujemy pierwszy dyżur.', 'A black hollyhock! Very gothic, very beautiful. We’re booking the first shift.') },
];

/** A line under the weather in the strip: by sky, then by season. */
export const WEATHER_LINES: Record<'clear' | 'cloudy' | 'rain' | 'night', L[]> = {
  clear: [
    l('Słońce w dobrym humorze.', 'The sun is in a good mood.'),
    l('Dobry dzień na wietrzenie kwiatów.', 'A good day for airing the flowers.'),
    l('Atrament już zajął najlepsze miejsce na słońcu.', 'Atrament has already claimed the sunniest spot.'),
  ],
  cloudy: [
    l('Chmury, ale przyjazne.', 'Clouds, but friendly ones.'),
    l('Szaro, ale w środku ciepło.', 'Grey out, warm in.'),
    l('Niebo się zastanawia.', 'The sky is making up its mind.'),
  ],
  rain: [
    l('Rechotka w siódmym niebie.', 'Rechotka is in seventh heaven.'),
    l('Doniczki na parapecie się nie martwią.', 'The pots on the windowsill aren’t worried.'),
    l('Dzień na kocyk i herbatę.', 'A blanket-and-tea sort of day.'),
  ],
  night: [
    l('Sowa na dyżurze.', 'The owl is on duty.'),
    l('Pani Ćma zapala latarnie.', 'Pani Ćma is lighting the lanterns.'),
  ],
};

/** The general question of the day, for stories that don't come with one. */
export const VOX: Vox[] = [
  {
    q: l('Zapytaliśmy: co najbardziej lubisz w Bratkowie?', 'We asked: what do you like most about Bratkowo?'),
    a: [
      { who: l('Pani Jadzia', 'Mrs Jadzia'), say: l('Że wszyscy noszą moje swetry. Nawet ci, co nie chcą.', 'That everyone wears my jumpers. Even those who don’t want to.') },
      { who: l('Pan listonosz', 'The postman'), say: l('Że każdy otwiera drzwi z uśmiechem. Poza psami, one otwierają z hukiem.', 'That everyone opens the door with a smile. Except the dogs, they open it with a bang.') },
      { who: l('Atrament', 'Atrament'), say: l('Parapety.', 'The windowsills.') },
    ],
  },
  {
    q: l('Zapytaliśmy: jaki jest twój ulubiony kwiat?', 'We asked: what’s your favourite flower?'),
    a: [
      { who: l('Jingleton', 'Jingleton'), say: l('Stokrotka. Zawsze.', 'Daisy. Always.') },
      { who: l('Duszek', 'Little Ghost'), say: l('Kwiat księżyca. Kwitnie wtedy, kiedy ja wychodzę.', 'Moonflower. It blooms when I come out.') },
      { who: l('Wiedźmusia', 'Wiedźmusia'), say: l('Czarna malwa. Pasuje do kapelusza.', 'Black hollyhock. It goes with my hat.') },
    ],
  },
  {
    q: l('Zapytaliśmy: co jesz na śniadanie?', 'We asked: what do you have for breakfast?'),
    a: [
      { who: l('Rechotka', 'Rechotka'), say: l('Lepiej nie pytać.', 'Best not to ask.') },
      { who: l('Pan Jeżyk', 'Pan Jeżyk'), say: l('Jabłko i drzemkę.', 'An apple and a nap.') },
      { who: l('Milton', 'Milton'), say: l('Nic. Jestem jajkiem.', 'Nothing. I’m an egg.') },
    ],
  },
  {
    q: l('Zapytaliśmy: czego się boisz?', 'We asked: what are you afraid of?'),
    a: [
      { who: l('Duszek', 'Little Ghost'), say: l('Ludzi, którzy się mnie boją. To niezręczne.', 'People who are afraid of me. It’s awkward.') },
      { who: l('Pani Ćma', 'Pani Ćma'), say: l('Ciemności bez żadnej lampki.', 'Darkness without a single lamp.') },
      { who: l('Atrament', 'Atrament'), say: l('Odkurzacza. Tylko odkurzacza.', 'The hoover. Only the hoover.') },
    ],
  },
  {
    q: l('Zapytaliśmy: co robisz w deszczowy dzień?', 'We asked: what do you do on a rainy day?'),
    a: [
      { who: l('Rechotka', 'Rechotka'), say: l('Wszystko. To mój najlepszy dzień.', 'Everything. It’s my best day.') },
      { who: l('Pani Jadzia', 'Mrs Jadzia'), say: l('Robię na drutach i słucham, jak kapie.', 'Knit and listen to it drip.') },
      { who: l('Pan listonosz', 'The postman'), say: l('Jeżdżę. W pelerynie. Wąsy w woreczku.', 'Ride. In a cape. Moustache in a little bag.') },
    ],
  },
  {
    q: l('Zapytaliśmy: jak wygląda twój idealny wieczór?', 'We asked: what’s your perfect evening?'),
    a: [
      { who: l('Pan Jeżyk', 'Pan Jeżyk'), say: l('Herbata, ciepły stragan i jedna latarnia w oddali.', 'Tea, a warm stall and one lantern in the distance.') },
      { who: l('Wiedźmusia', 'Wiedźmusia'), say: l('Kociołek, księga i nic się nie przypala.', 'A cauldron, a spellbook and nothing burning.') },
      { who: l('Sowa', 'The owl'), say: l('Wieczór to dla mnie poranek. Kawa i dyżur.', 'Evening is my morning. Coffee and my shift.') },
    ],
  },
];
