import type { Serial } from '../types';

const l = (pl: string, en: string) => ({ pl, en });

/** Stories the town follows over several days, one part in each morning's Kurier. */
export const SERIALS: Serial[] = [
  {
    id: 'snail-race',
    name: l('Wielki Wyścig Ślimaków', 'The Great Snail Race'),
    episodes: [
      {
        title: l('Zapisy zamknięte. Startuje siedem ślimaków', 'Entries closed. Seven snails will race'),
        body: [
          l('Komitet organizacyjny Wielkiego Wyścigu Ślimaków zamknął wczoraj listę startową. Pobiec, a raczej popełznąć, ma siedmiu zawodników.', 'The Great Snail Race committee closed entries yesterday. Seven competitors will run, or rather crawl.'),
          l('Faworytem jest Bogumił, zwycięzca trzech ostatnich edycji, znany z aerodynamicznej muszli i braku poczucia humoru. Czarnym koniem może być debiutantka Ślimaczka Wanda, która „trenuje po nocach”.', 'The favourite is Bogumił, winner of the last three races, known for his aerodynamic shell and lack of humour. The dark horse may be newcomer Wanda, who “trains at night”.'),
          l('Trasa jak co roku: od studni do drugiej studni. Około trzech metrów. Start w sobotę o 10:00.', 'The course, as every year: from the well to the other well. About three metres. Start on Saturday at 10 a.m.'),
        ],
        art: 'snail',
        recap: l('zapisy zamknięte, startuje siedem ślimaków, faworytem jest Bogumił.', 'entries closed, seven snails will race, Bogumił is the favourite.'),
        buzz: l('Wyścig ślimaków? Pszczoła przeleciałaby tę trasę w sekundę. Ale kto by chciał. Kibicujemy Wandzie!', 'A snail race? A bee could fly that course in a second. Not that anyone would. Go Wanda!'),
      },
      {
        title: l('Faworyt przyłapany na grzbiecie żuka', 'Favourite caught riding a beetle'),
        body: [
          l('Bogumił, zwycięzca trzech ostatnich wyścigów, został wczoraj sfotografowany na treningu na grzbiecie żuka. — To był spacer towarzyski — tłumaczy jego trener.', 'Bogumił, winner of the last three races, was photographed in training yesterday riding on a beetle’s back. “It was a social stroll,” his trainer explains.'),
          l('Kibice są podzieleni. Połowa domaga się dyskwalifikacji, druga połowa pyta, gdzie można wynająć żuka. Sędziowie zbiorą się jutro.', 'Fans are divided. Half demand disqualification; the other half ask where they can hire a beetle. The judges meet tomorrow.'),
        ],
        art: 'snail',
        recap: l('faworyta Bogumiła przyłapano na grzbiecie żuka.', 'the favourite, Bogumił, was caught riding a beetle.'),
        buzz: l('Bogumił i żuk. To nie był żaden spacer towarzyski. To MIŁOŚĆ.', 'Bogumił and the beetle. That was no social stroll. That was LOVE.'),
      },
      {
        title: l('Sędziowie zdecydowali: Bogumił startuje, żuk idzie z tyłu', 'The judges have ruled: Bogumił races, the beetle walks behind'),
        body: [
          l('Po czterech godzinach obrad sędziowie dopuścili Bogumiła do startu. Warunek: żuk musi trzymać się co najmniej dwa ślimaki za nim i nie wolno mu dopingować „z bliska”.', 'After four hours of deliberation the judges let Bogumił race. On one condition: the beetle must stay at least two snails behind him and may not cheer “at close range”.'),
          l('Ślimaczka Wanda skomentowała decyzję krótko: — Niech jadą. Ja i tak będę pierwsza. Po czym schowała się do muszli na resztę wywiadu.', 'Wanda commented briefly: “Let them ride. I’ll be first anyway.” She then withdrew into her shell for the rest of the interview.'),
        ],
        art: 'snail',
        recap: l('sędziowie dopuścili Bogumiła do startu, ale żuk musi iść z tyłu.', 'the judges let Bogumił race, but the beetle has to walk behind.'),
        buzz: l('Werdykt w sprawie żuka zapadł po czterech godzinach. Pszczoły wydałyby go w cztery sekundy. Bzz, winny, następna sprawa.', 'The beetle verdict took four hours. Bees would have done it in four seconds. Bzz, guilty, next case.'),
      },
      {
        title: l('Wyścig ruszył! Po sześciu godzinach prowadzi Wanda', 'They’re off! After six hours, Wanda leads'),
        body: [
          l('W sobotę punktualnie o 10:00 Pan Jeżyk dał sygnał do startu, kichając w chusteczkę. Siedem ślimaków ruszyło z miejsca. Pięć w dobrą stronę.', 'On Saturday at 10 sharp, Pan Jeżyk started the race by sneezing into his handkerchief. Seven snails set off. Five in the right direction.'),
          l('Po sześciu godzinach prowadzi Wanda, o długość czułka przed Bogumiłem. Żuk zgodnie z regulaminem idzie z tyłu i nuci. Kibice rozłożyli koce, bo na metę nikt się nie spieszy.', 'After six hours Wanda leads Bogumił by an antenna. The beetle, as per the rules, walks behind, humming. Fans have spread their blankets; nobody is in a hurry for the finish.'),
        ],
        art: 'snail',
        recap: l('wyścig ruszył, po sześciu godzinach prowadziła Wanda.', 'the race began, and after six hours Wanda was in the lead.'),
        buzz: l('Relacja na żywo z wyścigu: nic się nie dzieje. Relacja na żywo z wyścigu: dalej nic. Wracamy jutro.', 'Live from the race: nothing’s happening. Live from the race: still nothing. Back tomorrow.'),
      },
      {
        title: l('Meta! Wygrał… liść sałaty', 'The finish! And the winner is… a lettuce leaf'),
        body: [
          l('We wtorek, w trzecim dniu wyścigu, tuż przed metą ktoś upuścił liść sałaty. Wszystkie siedem ślimaków zatrzymało się i nie ruszyło dalej.', 'On Tuesday, the third day of the race, someone dropped a lettuce leaf just before the finish. All seven snails stopped and went no further.'),
          l('Sędziowie po krótkiej naradzie przyznali zwycięstwo liściowi, który jako jedyny przekroczył linię mety (wiatr). Bogumił i Wanda podzielili się drugim miejscem i resztą liścia.', 'After a short conference the judges gave the race to the leaf, the only one to cross the line (wind). Bogumił and Wanda shared second place and the rest of the leaf.'),
          l('Żuk podobno płakał ze wzruszenia. Następny wyścig za rok. Albo dwa, zależy jak szybko.', 'The beetle is said to have wept with emotion. Next race in a year. Or two, depending how fast.'),
        ],
        art: 'snail',
        recap: l('wyścig wygrał liść sałaty, a Bogumił i Wanda podzielili się drugim miejscem.', 'a lettuce leaf won the race, and Bogumił and Wanda shared second place.'),
        buzz: l('Liść sałaty mistrzem! Brzęczyk przewidział to od początku. No, prawie. Nie sprawdzajcie.', 'A lettuce leaf is champion! Brzęczyk called it from the start. Well, nearly. Don’t check.'),
      },
    ],
  },
  {
    id: 'moth-party',
    name: l('Tajemnica Pani Ćmy', 'Pani Ćma’s Secret'),
    episodes: [
      {
        title: l('Pani Ćma kupiła dwadzieścia świeczek. Po co?', 'Pani Ćma has bought twenty candles. Why?'),
        body: [
          l('W poniedziałek widziano Panią Ćmę z koszykiem pełnym świeczek. Zapytana, po co jej tyle, odpowiedziała tylko: „Zobaczycie w piątek”.', 'On Monday Pani Ćma was seen with a basket full of candles. Asked why she needed so many, she said only: “You’ll see on Friday.”'),
          l('Redakcja nie wie, co o tym myśleć, i na wszelki wypadek prosi o ostrożność z ogniem.', 'The editors don’t know what to make of it, and ask everyone to be careful with fire, just in case.'),
        ],
        art: 'cma',
        recap: l('Pani Ćma kupiła dwadzieścia świeczek i zapowiedziała coś na piątek.', 'Pani Ćma bought twenty candles and promised something for Friday.'),
        buzz: l('Dwadzieścia świeczek! Kurier „prosi o ostrożność”. My mówimy: IMPREZA. Zaproszeń brak, ale kto by się przejmował.', 'Twenty candles! The Kurier “asks for caution”. We say: PARTY. No invitations yet, but who cares.'),
      },
      {
        title: l('Wyciekła lista gości. Brakuje na niej jednego nazwiska', 'The guest list has leaked. One name is missing'),
        body: [
          l('Do redakcji trafiła lista gości piątkowego wieczoru u Pani Ćmy. Są na niej wszyscy: Duszek, Atrament, Wiedźmusia, sowa, a nawet kamień, który jest burmistrzem.', 'The guest list for Pani Ćma’s Friday evening has reached the newsroom. Everyone is on it: Little Ghost, Atrament, Wiedźmusia, the owl, even the stone who is mayor.'),
          l('Wszyscy oprócz Pana Jeżyka. Pan Jeżyk twierdzi, że mu to obojętne, i od wczoraj trzy razy przestawiał torebki z nasionami, a raz westchnął.', 'Everyone except Pan Jeżyk. Pan Jeżyk says he doesn’t care, and since yesterday has rearranged his seed packets three times and sighed once.'),
        ],
        art: 'jezyk',
        recap: l('na liście gości Pani Ćmy zabrakło tylko Pana Jeżyka.', 'Pan Jeżyk was the only one missing from Pani Ćma’s guest list.'),
        buzz: l('Mamy listę gości! Ul też nie jest zaproszony, ale my jesteśmy przyzwyczajone. Jeżyku, trzymaj się.', 'We have the guest list! The hive isn’t invited either, but we’re used to it. Chin up, Jeżyk.'),
      },
      {
        title: l('Wieczór latarni. Taniec przy dwudziestu świeczkach', 'An evening of lanterns. Dancing by twenty candles'),
        body: [
          l('W piątek po zmroku nad straganem Pani Ćmy zapłonęło dwadzieścia świeczek. Goście tańczyli do rana, a sowa pierwszy raz od lat zeszła z dyżuru.', 'On Friday after dark, twenty candles were lit above Pani Ćma’s stall. Guests danced until morning, and the owl left her post for the first time in years.'),
          l('Najdłużej przy świecach tańczyła sama gospodyni. — Kocham światło — wyjaśniła. — To nie tajemnica. Tajemnica jest gdzie indziej.', 'The hostess herself danced longest by the candles. “I love light,” she explained. “That’s no secret. The secret is something else.”'),
        ],
        art: 'night-stall',
        recap: l('wieczór u Pani Ćmy się odbył, ale tajemnica została.', 'Pani Ćma’s evening took place, but the secret remained.'),
        buzz: l('Byłyśmy pod oknem. Było pięknie. Pan Jeżyk też stał pod oknem. Po drugiej stronie. Udawał, że nie stoi.', 'We were under the window. It was beautiful. Pan Jeżyk was under the window too. On the other side. Pretending he wasn’t.'),
      },
      {
        title: l('Rozwiązanie zagadki: zaproszenie wpadło do dziury Zenona', 'Mystery solved: the invitation fell into Zenon’s hole'),
        body: [
          l('Kret Zenon przyniósł wczoraj do redakcji pomięty list. Znalazł go na swoim stole w kuchni, pod dziurą przed straganem.', 'Yesterday Zenon the mole brought a crumpled letter to the newsroom. He’d found it on his kitchen table, under the hole outside the stall.'),
          l('Było to zaproszenie dla Pana Jeżyka, wypisane srebrnym atramentem i podpisane „Dla tego, kto zawsze zostawia mi światło na straganie”. Pan Jeżyk przeczytał je trzy razy i poszedł kupić świeczkę.', 'It was Pan Jeżyk’s invitation, written in silver ink and signed “For the one who always leaves a light on at his stall for me.” Pan Jeżyk read it three times and went to buy a candle.'),
        ],
        art: 'jezyk-happy',
        recap: l('zaproszenie dla Pana Jeżyka wpadło do dziury Zenona.', 'Pan Jeżyk’s invitation had fallen into Zenon’s hole.'),
        buzz: l('Jeżyk i Ćma?! Brzęczyk nie plotkuje. Brzęczyk tylko zauważa, że oba stragany stoją teraz bliżej siebie.', 'Jeżyk and Ćma?! Brzęczyk doesn’t gossip. Brzęczyk merely notes that the two stalls now stand closer together.'),
      },
    ],
  },
  {
    id: 'lost-hat',
    name: l('Kapelusz Wiedźmusi', 'Wiedźmusia’s Hat'),
    episodes: [
      {
        title: l('Wiedźmusia zgubiła kapelusz w locie', 'Wiedźmusia lost her hat mid-flight'),
        body: [
          l('Podczas wieczornego lotu nad sadem Wiedźmusi spadł z głowy kapelusz. Jest czarny, spiczasty i o rozmiar za duży, więc spadał od dawna.', 'During an evening flight over the orchard, Wiedźmusia’s hat fell off. It’s black, pointy and a size too big, so this was a long time coming.'),
          l('— Bez kapelusza nie umiem rzucić żadnego zaklęcia — mówi. — Dziś rano chciałam zagotować wodę i zrobiłam z czajnika żabę. Rechotka jest oburzona.', '“I can’t cast anything without my hat,” she says. “This morning I tried to boil water and turned the kettle into a frog. Rechotka is outraged.”'),
        ],
        art: 'wiedzmusia',
        recap: l('Wiedźmusia zgubiła kapelusz nad sadem.', 'Wiedźmusia lost her hat over the orchard.'),
        buzz: l('Czajnik zamieniony w żabę! Wywiad z czajnikiem w przyszłym numerze. Na razie rechocze.', 'Kettle turned into a frog! Interview with the kettle next issue. For now it just croaks.'),
      },
      {
        title: l('Kapelusz widziano na strachu na wróble i na dyni', 'The hat has been seen on a scarecrow and on a pumpkin'),
        body: [
          l('Do redakcji spływają zgłoszenia. Kapelusz widziano na strachu na wróble za sadem, potem na dyni Pani Jadzi, a potem na wronie, która twierdzi, że „zawsze taki miała”.', 'Reports are flooding in. The hat was seen on the scarecrow behind the orchard, then on Mrs Jadzia’s pumpkin, then on a crow who claims she “always had one like it”.'),
          l('Wiedźmusia przeszukała wszystkie trzy miejsca. Znalazła tylko słomę, czapeczkę na drutach i bardzo obrażoną wronę.', 'Wiedźmusia searched all three. She found only straw, a knitted hat and one very offended crow.'),
        ],
        art: 'pumpkin',
        recap: l('kapelusz widziano na strachu na wróble, dyni i wronie, ale go nie znaleziono.', 'the hat was spotted on a scarecrow, a pumpkin and a crow, but not found.'),
        buzz: l('Nasze pszczoły widziały kapelusz! Na sowie. Ale sowa śpi, a my się sów boimy. Ktoś musi to zrobić. Nie my.', 'Our bees have seen the hat! On the owl. But the owl is asleep and we’re scared of owls. Someone has to do it. Not us.'),
      },
      {
        title: l('Odnaleziony! Kapelusz nosi sowa i nie chce oddać', 'Found! The owl is wearing the hat and won’t give it back'),
        body: [
          l('Zagadka się wyjaśniła. Kapelusz od trzech nocy nosi sowa, stróż nocny miasteczka. — Wiatr mi go przyniósł — mówi. — I jest ciepły. Uszy mi nie marzną.', 'Mystery solved. For three nights the hat has been worn by the owl, the town’s night watchman. “The wind brought it,” she says. “And it’s warm. My ears don’t get cold.”'),
          l('Wiedźmusia prosiła, tłumaczyła i raz prawie się rozpłakała. Sowa obiecała przemyśleć sprawę w dzień, ale w dzień śpi.', 'Wiedźmusia asked, explained, and once almost cried. The owl promised to think it over during the day, but during the day she sleeps.'),
        ],
        art: 'owl',
        recap: l('kapelusz nosi sowa i nie chce go oddać, bo jest ciepły.', 'the owl is wearing the hat and won’t give it back, because it’s warm.'),
        buzz: l('Mówiłyśmy! Sowa! Brzęczyk wiedział pierwszy. Kurier dowiedział się z Brzęczyka. Tak to wygląda.', 'We told you! The owl! Brzęczyk knew first. The Kurier found out from Brzęczyk. That’s how it works.'),
      },
      {
        title: l('Pani Jadzia ratuje sytuację. Sowa ma nową czapkę', 'Mrs Jadzia saves the day. The owl has a new hat'),
        body: [
          l('Kiedy wydawało się, że sprawa utknęła, do akcji wkroczyła Pani Jadzia z drutami. W jedną noc zrobiła sowie czapkę z dziurkami na uszy i pomponem.', 'Just when the case seemed stuck, Mrs Jadzia stepped in with her needles. In one night she knitted the owl a hat with ear holes and a bobble.'),
          l('Sowa oddała kapelusz, a Wiedźmusia na pierwszą próbę zamieniła żabę z powrotem w czajnik. Rechotka przyjęła to z ulgą. Czajnik trochę tęskni.', 'The owl gave the hat back, and with her first try Wiedźmusia turned the frog back into a kettle. Rechotka was relieved. The kettle misses it a little.'),
        ],
        art: 'jadzia',
        recap: l('Pani Jadzia zrobiła sowie czapkę i kapelusz wrócił do Wiedźmusi.', 'Mrs Jadzia knitted the owl a hat, and Wiedźmusia got hers back.'),
        buzz: l('Sowa w czapce z pomponem! Zdjęcie tygodnia! Niestety zrobione w nocy, więc widać tylko pompon.', 'An owl in a bobble hat! Photo of the week! Sadly taken at night, so you can only see the bobble.'),
      },
    ],
  },
  {
    id: 'bridge',
    name: l('Mostek na stawie', 'The Bridge over the Pond'),
    episodes: [
      {
        title: l('Mostek na stawie skrzypi. Ratusz bada sprawę', 'The pond bridge creaks. The town hall investigates'),
        body: [
          l('Drewniany mostek nad stawem skrzypi od tygodnia. Według Rechotki skrzypi w tonacji d-moll, co jest „smutne, ale ładne”.', 'The wooden bridge over the pond has been creaking for a week. Rechotka says it creaks in D minor, which is “sad, but pretty”.'),
          l('Ratusz wysłał na miejsce komisję. Komisja przeszła po mostku dwa razy, mostek zaskrzypiał trzy razy, komisja napisała raport na dwanaście stron.', 'The town hall sent a committee. The committee crossed the bridge twice, the bridge creaked three times, and the committee wrote a twelve-page report.'),
        ],
        recap: l('mostek na stawie skrzypi, a ratusz napisał o tym raport.', 'the pond bridge creaks, and the town hall wrote a report about it.'),
        buzz: l('Dwanaście stron o skrzypieniu! Brzęczyk streszcza: skrzypi. Proszę.', 'Twelve pages about a creak! Brzęczyk summarises: it creaks. There.'),
      },
      {
        title: l('Rada się kłóci. Rechotka proponuje liście grzybieni', 'The council argues. Rechotka suggests water-lily pads'),
        body: [
          l('Na posiedzeniu rady padły trzy propozycje: naprawić mostek, zbudować nowy albo zostawić, bo skrzypienie „dodaje uroku”.', 'Three proposals were made at the council meeting: repair the bridge, build a new one, or leave it, because the creak “adds charm”.'),
          l('Czwartą zgłosiła z galerii Rechotka: zamiast mostka liście grzybieni, po których każdy może skakać. Wniosek upadł jednym głosem. Głosem kamienia, który jest burmistrzem i nie skacze.', 'A fourth came from Rechotka in the public gallery: replace the bridge with lily pads for everyone to hop across. It failed by one vote. The vote of the stone, who is mayor and doesn’t hop.'),
        ],
        recap: l('rada nie zgodziła się na liście grzybieni zamiast mostka.', 'the council rejected lily pads instead of a bridge.'),
        buzz: l('Liście grzybieni to genialny pomysł. Ul głosuje za. Ul nadal nie ma głosu. Wstyd.', 'Lily pads are a genius idea. The hive votes yes. The hive still has no vote. Shame.'),
      },
      {
        title: l('Przyszły mrówki. Cztery tysiące, z deseczkami', 'The ants have arrived. Four thousand of them, with little planks'),
        body: [
          l('W środę rano nad staw przymaszerowała brygada mrówek budowlanych. Każda niosła jedną małą deseczkę. Razem jest ich cztery tysiące.', 'On Wednesday morning a brigade of builder ants marched to the pond. Each carried one small plank. There are four thousand of them.'),
          l('Mrówki nie rozmawiają z prasą, ale ich kierowniczka przekazała, że mostek będzie gotowy w piątek, „bez skrzypienia, ale z ławeczką”.', 'The ants don’t talk to the press, but their forewoman said the bridge will be ready on Friday, “without the creak, but with a little bench”.'),
        ],
        recap: l('cztery tysiące mrówek zaczęło naprawiać mostek.', 'four thousand ants started rebuilding the bridge.'),
        buzz: l('Mrówki pracują jak pszczoły. Prawie. Dajemy im cztery beczki miodu na pięć.', 'The ants work like bees. Almost. We give them four barrels of honey out of five.'),
      },
      {
        title: l('Mostek otwarty. Ma ławeczkę dla żab', 'The bridge is open. It has a bench for frogs'),
        body: [
          l('W piątek o południu Atrament przeciął wstęgę, a dokładniej przegryzł, i mostek został otwarty. Nie skrzypi. Ma za to ławeczkę nad samą wodą.', 'At noon on Friday Atrament cut the ribbon, or rather bit through it, and the bridge was opened. It doesn’t creak. It does have a bench right above the water.'),
          l('Rechotka siedzi na niej od rana. — Nie skacze się po nim, ale jest dobry do siedzenia — przyznała. — Skrzypienia mi trochę brakuje. Będę je nucić.', 'Rechotka has been sitting on it since morning. “You can’t hop on it, but it’s good for sitting,” she admitted. “I miss the creak a bit. I’ll hum it.”'),
        ],
        art: 'rechotka',
        recap: l('mostek otwarto i ma ławeczkę dla żab.', 'the bridge opened, with a bench for frogs.'),
        buzz: l('Atrament przegryzł wstęgę. Radny. Zębami. Brzęczyk ma zdjęcia, ale są za mocne do druku.', 'Atrament bit through the ribbon. A councillor. With his teeth. Brzęczyk has photos, but they’re too strong to print.'),
      },
    ],
  },
  {
    id: 'windowsill',
    name: l('Konkurs na najładniejszy parapet', 'The Prettiest Windowsill Contest'),
    episodes: [
      {
        title: l('Rusza konkurs na najładniejszy parapet w Bratkowie', 'Bratkowo’s prettiest windowsill contest begins'),
        body: [
          l('Ratusz ogłosił konkurs na najładniejszy parapet w miasteczku. Liczą się kwiaty, porządek i „to coś”, czego regulamin nie umiał lepiej opisać.', 'The town hall has announced a contest for the prettiest windowsill in town. Points for flowers, tidiness and “that certain something”, which the rules couldn’t describe any better.'),
          l('Zgłoszenia przyjmuje się do czwartku. Nagrodą jest dyplom i doniczka z ratusza, ta ładniejsza.', 'Entries close on Thursday. The prize is a certificate and a flowerpot from the town hall, the nicer one.'),
        ],
        art: 'pansy',
        recap: l('ruszył konkurs na najładniejszy parapet.', 'the prettiest windowsill contest began.'),
        buzz: l('Konkurs na parapety! Ul zgłasza swój: jest okrągły, złoty i pachnie miodem. Czekamy na dyplom.', 'A windowsill contest! The hive enters its own: round, golden, smells of honey. Awaiting our certificate.'),
      },
      {
        title: l('Zgłoszenia: koronki, pajęczyny i dynia', 'The entries: lace, cobwebs and a pumpkin'),
        body: [
          l('Do konkursu zgłoszono jedenaście parapetów. Pani Jadzia ozdobiła swój koronkami, Duszek pajęczynami („to nie bałagan, to styl”), a Atrament zgłosił cudzy parapet, na którym akurat leżał.', 'Eleven windowsills have been entered. Mrs Jadzia decorated hers with lace, Little Ghost with cobwebs (“it’s not mess, it’s style”), and Atrament entered someone else’s, which he happened to be lying on.'),
          l('Największe wrażenie robi parapet Pani Jadzi, na którym stoi rekordowa dynia. Parapet jest pod nią trochę wygięty.', 'The most striking is Mrs Jadzia’s, which holds the record pumpkin. The sill is slightly bent under it.'),
        ],
        recap: l('do konkursu zgłoszono jedenaście parapetów, w tym jeden z dynią.', 'eleven windowsills were entered, one with a pumpkin.'),
        buzz: l('Pajęczyny Duszka to jednak bałagan. Mówimy to z miłością. I z daleka.', 'Little Ghost’s cobwebs are mess, though. We say it with love. From a distance.'),
      },
      {
        title: l('Spór o jury. Pszczoły chcą oceniać kwiaty', 'Jury row. The bees want to judge the flowers'),
        body: [
          l('Ratusz powołał jury: sowę, Panią Jadzię i kamień, który jest burmistrzem. Natychmiast zaprotestowała redakcja pewnego bzyczącego pisemka, domagając się miejsca dla pszczół.', 'The town hall named a jury: the owl, Mrs Jadzia and the stone who is mayor. A certain buzzing rag immediately protested, demanding a seat for the bees.'),
          l('Po negocjacjach ustalono, że pszczoły mogą oceniać kwiaty, ale tylko z odległości jednego metra i bez zapylania. Pszczoły uznały to za „okrutne, ale do przyjęcia”.', 'After talks it was agreed that bees may judge the flowers, but only from a metre away and without pollinating. The bees called this “cruel, but acceptable”.'),
        ],
        recap: l('pszczoły dołączyły do jury, ale nie mogą zapylać.', 'the bees joined the jury, but may not pollinate.'),
        buzz: l('WYGRAŁYŚMY! Jesteśmy w jury! Metr odległości to nic. Mamy dobre oczy. Drżyjcie, parapety!', 'WE WON! We’re on the jury! A metre is nothing. We have good eyes. Tremble, windowsills!'),
      },
      {
        title: l('Jury w objeździe. Najdłużej zostało przy oknie z dwoma psami', 'The jury on tour. It lingered longest at the window with two dogs'),
        body: [
          l('Wczoraj jury obejrzało wszystkie zgłoszone parapety. Najdłużej zostało przy oknie przy ogrodzie, gdzie w doniczkach kwitną bratki, a w koszyku pod oknem śpią dwa teriery i jajko.', 'Yesterday the jury inspected every windowsill. It lingered longest at the garden window, where pansies bloom in pots and two terriers and an egg sleep in a basket beneath.'),
          l('Sowa zanotowała „przytulnie”, Pani Jadzia „ładnie podlane”, pszczoły z odległości metra napisały „AAAAA”. Kamień nie zanotował nic, ale stał tam bardzo długo.', 'The owl noted “cosy”, Mrs Jadzia “nicely watered”, and the bees, from a metre away, wrote “AAAAA”. The stone noted nothing, but stood there a very long time.'),
        ],
        art: 'dogs',
        recap: l('jury najdłużej oglądało okno z bratkami i dwoma psami.', 'the jury spent longest at the window with pansies and two dogs.'),
        buzz: l('Nasza ocena parapetu z bratkami: AAAAA. To jest najwyższa ocena w skali pszczół.', 'Our verdict on the pansy windowsill: AAAAA. The highest score on the bee scale.'),
      },
      {
        title: l('Wyniki! Wyróżnienie dla parapetu z bratkami', 'The results! A special mention for the pansy windowsill'),
        body: [
          l('Pierwsze miejsce zajął parapet Pani Jadzi z dynią, głównie dlatego, że jury bało się, że dynia spadnie, jeśli przegra.', 'First place went to Mrs Jadzia’s windowsill with the pumpkin, mostly because the jury feared the pumpkin would fall off if it lost.'),
          l('Wyróżnienie specjalne otrzymał parapet przy ogrodzie, „za bratki, za spokój i za to, że ktoś tu naprawdę o wszystko dba”. Dyplom zostanie doręczony przez pana listonosza, jeśli nie będzie mgły.', 'A special mention went to the garden windowsill, “for the pansies, for the peace, and because somebody here really looks after everything”. The postman will deliver the certificate, fog permitting.'),
        ],
        art: 'pansy',
        recap: l('parapet z bratkami dostał wyróżnienie specjalne.', 'the pansy windowsill got a special mention.'),
        buzz: l('Wyróżnienie dla bratków! Brzęczyk przewidział. Tym razem naprawdę. Możecie sprawdzić.', 'A special mention for the pansies! Brzęczyk predicted it. Really, this time. You can check.'),
      },
    ],
  },
  {
    id: 'hedgehog-sleep',
    name: l('Czy Pan Jeżyk zaśnie na zimę?', 'Will Pan Jeżyk Sleep Through Winter?'),
    episodes: [
      {
        title: l('Pan Jeżyk ziewa. Kto poprowadzi stragan?', 'Pan Jeżyk is yawning. Who will run the stall?'),
        body: [
          l('Pan Jeżyk przyznał wczoraj, że czuje się „coraz bardziej zimowo”. Ziewa przy wydawaniu reszty i dwa razy zasnął w trakcie polecania nasion.', 'Pan Jeżyk admitted yesterday that he’s feeling “more and more wintry”. He yawns while giving change and twice fell asleep mid-recommendation.'),
          l('Miasteczko pyta: kto poprowadzi stragan, jeśli jego właściciel zaśnie do wiosny? Pan Jeżyk ogłosił przesłuchania na zastępcę.', 'The town asks: who will run the stall if its owner sleeps until spring? Pan Jeżyk has announced auditions for a stand-in.'),
        ],
        art: 'jezyk-asleep',
        recap: l('Pan Jeżyk robi się senny i szuka zastępcy na stragan.', 'Pan Jeżyk is getting sleepy and is looking for someone to run the stall.'),
        buzz: l('Jeżyk ziewa! Pszczoły też zimą śpią, ale my przynajmniej na raz, wszystkie, i bez dramatu.', 'Jeżyk is yawning! Bees sleep in winter too, but at least we all do it at once, without the drama.'),
      },
      {
        title: l('Przesłuchania na zastępcę. Atrament zasnął w trakcie', 'Auditions for a stand-in. Atrament fell asleep halfway through'),
        body: [
          l('Na przesłuchania przyszło troje chętnych. Atrament zasnął na ladzie po czterech minutach, co Pan Jeżyk uznał za „szczere, ale niepraktyczne”.', 'Three candidates turned up. Atrament fell asleep on the counter after four minutes, which Pan Jeżyk called “honest, but impractical”.'),
          l('Wiedźmusia sprzedała dwie torebki nasion, z których jedna od razu wykiełkowała w kieszeni klienta. Najlepiej wypadła wiewiórka Halinka: szybka, uprzejma i przy liczeniu reszty niczego nie chowała. Prawie niczego.', 'Wiedźmusia sold two packets, one of which sprouted at once in the customer’s pocket. Best of all was Halinka the squirrel: quick, polite, and hid nothing while counting change. Almost nothing.'),
        ],
        art: 'squirrel',
        recap: l('na przesłuchaniach najlepiej wypadła wiewiórka Halinka.', 'Halinka the squirrel did best at the auditions.'),
        buzz: l('Halinka na straganie? Ta sama, która zgubiła trzysta orzechów? Brzęczyk tylko pyta.', 'Halinka at the stall? The same one who lost three hundred nuts? Brzęczyk is only asking.'),
      },
      {
        title: l('Pierwszy dzień Halinki. Nasiona znikają', 'Halinka’s first day. The seeds are vanishing'),
        body: [
          l('Halinka przejęła stragan na próbę. Klienci chwalą jej szybkość. Pan Jeżyk, który spał w skrzynce pod ladą, chwali ciszę.', 'Halinka took over the stall on trial. Customers praise her speed. Pan Jeżyk, asleep in a crate under the counter, praises the quiet.'),
          l('Problem w tym, że pod koniec dnia brakowało dwunastu torebek nasion. Halinka nie pamięta, gdzie je schowała. Redakcja podejrzewa, że wiosną w miasteczku wyrośnie dużo niespodzianek.', 'The problem: at the end of the day twelve seed packets were missing. Halinka can’t remember where she put them. The editors suspect the town will be full of surprises come spring.'),
        ],
        art: 'stall',
        recap: l('Halinka prowadzi stragan, ale chowa nasiona i zapomina gdzie.', 'Halinka is running the stall, but hides the seeds and forgets where.'),
        buzz: l('Dwanaście torebek nasion zniknęło! Wiosną pół miasteczka zakwitnie w przypadkowych miejscach. Pszczoły są ZACHWYCONE.', 'Twelve seed packets gone! Come spring, half the town will bloom in random places. The bees are THRILLED.'),
      },
      {
        title: l('Pan Jeżyk zostaje. Będzie spał tylko po południu', 'Pan Jeżyk is staying. He’ll only sleep in the afternoons'),
        body: [
          l('Po trzech dniach Pan Jeżyk ogłosił decyzję: nie zaśnie na całą zimę. — Za bardzo bym tęsknił — powiedział. — Za klientami. I za tym, co się dzieje w ogrodzie przy oknie.', 'After three days Pan Jeżyk announced his decision: he won’t sleep all winter. “I’d miss it too much,” he said. “The customers. And what goes on in the garden at the window.”'),
          l('Stragan będzie czynny jak zawsze, a po południu może się zdarzyć, że właściciel drzemie. Halinka zostaje jako pomocnica od chowania. Rzeczy, które schowa, będą niespodzianką.', 'The stall will open as usual, though in the afternoons the owner may be napping. Halinka stays on as assistant in charge of hiding. Whatever she hides will be a surprise.'),
        ],
        art: 'jezyk-happy',
        recap: l('Pan Jeżyk zostaje na straganie przez zimę, z drzemkami po południu.', 'Pan Jeżyk is staying at the stall through winter, with afternoon naps.'),
        buzz: l('Jeżyk zostaje! Dobra wiadomość. Kurier napisał o tym jak o pogrzebie, a to przecież dobra wiadomość. Kurier, uśmiechnij się.', 'Jeżyk is staying! Good news. The Kurier wrote it up like a funeral, and it’s good news. Smile, Kurier.'),
      },
    ],
  },
];
