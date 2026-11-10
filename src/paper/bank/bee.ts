import type { BeeStory, L, Piece } from '../types';

const l = (pl: string, en: string) => ({ pl, en });

/** Brzęczyk's own front pages, for days it doesn't lead with the Kurier's story. */
export const BEE_STORIES: BeeStory[] = [
  {
    id: 'dance-off',
    title: l('WIELKI TANIEC W ULU! Kto zatańczy najdokładniejszą mapę?', 'THE GREAT HIVE DANCE-OFF! Who can dance the most accurate map?'),
    body: [
      l('Co roku pszczoły tańczą sobie nawzajem, gdzie są najlepsze kwiaty. W tym roku po raz pierwszy z jury i punktami!', 'Every year bees dance each other directions to the best flowers. This year, for the first time, with judges and points!'),
      l('Faworytka, Bzyczysława z trzeciego plastra, zatańczyła drogę do lawendy tak dokładnie, że dwanaście pszczół doleciało tam z zamkniętymi oczami. Dziesięć wróciło.', 'The favourite, Bzyczysława from the third comb, danced the way to the lavender so precisely that twelve bees got there with their eyes shut. Ten came back.'),
      l('Kurier o tańcu nie napisał. Kurier nie umie tańczyć. To widać po układzie stron.', 'The Kurier didn’t cover the dance. The Kurier can’t dance. You can tell from its layout.'),
    ],
    art: 'jingleton',
    caption: l('Fragment zwycięskiego tańca. W ruchu wygląda lepiej.', 'Part of the winning dance. It looks better moving.'),
  },
  {
    id: 'wasp-gang',
    title: l('OSY ZNOWU! Gang spod śmietnika grasuje', 'WASPS AGAIN! The bin gang strikes'),
    body: [
      l('Mieszkańcy alarmują: przy śmietniku za ratuszem znowu kręcą się osy. Pasiaste, głośne i bez żadnych manier.', 'Residents are alarmed: wasps are hanging round the bin behind the town hall again. Striped, loud and with no manners at all.'),
      l('Przypominamy: osa to NIE pszczoła. Osa nie robi miodu. Osa nie wydaje gazety. Osa nawet nie umie się przedstawić. My umiemy: dzień dobry, jesteśmy Brzęczyk.', 'A reminder: a wasp is NOT a bee. A wasp makes no honey. A wasp publishes no newspaper. A wasp can’t even introduce itself. We can: good morning, we are Brzęczyk.'),
      l('Redakcja nic nie sugeruje. Redakcja tylko patrzy. Bardzo uważnie.', 'The editors suggest nothing. The editors are just watching. Very closely.'),
    ],
    art: 'wasp',
    caption: l('Podejrzana osa. Twarz zasłonięta paskami.', 'A suspicious wasp. Face hidden behind stripes.'),
    when: { months: [4, 5, 6, 7, 8, 9] },
  },
  {
    id: 'honey-shortage',
    title: l('KRYZYS MIODOWY? Spokojnie, to tylko inwentaryzacja', 'HONEY CRISIS? Relax, it’s just a stocktake'),
    body: [
      l('Po mieście krąży plotka, że w ulu skończył się miód. Dementujemy: miód jest. Po prostu liczymy go od poniedziałku i pomyliłyśmy się przy dwóch tysiącach.', 'A rumour is going round that the hive has run out of honey. We deny it: there is honey. We’ve just been counting it since Monday and lost track at two thousand.'),
      l('Liczenie trwa. Jeśli ktoś chce pomóc, zapraszamy z długopisem. Nie z łyżeczką. Pan Jeżyk przyszedł z łyżeczką.', 'Counting continues. Anyone who wants to help, bring a pen. Not a spoon. Pan Jeżyk came with a spoon.'),
    ],
    art: 'jezyk',
    caption: l('Pan Jeżyk, „pomocnik” przy inwentaryzacji.', 'Pan Jeżyk, stocktake “helper”.'),
  },
  {
    id: 'trzmielina-interview',
    title: l('Redaktor naczelna odpowiada na pytania czytelników!', 'Our editor-in-chief answers readers’ questions!'),
    body: [
      l('„Czy Brzęczyk pisze prawdę?” Zawsze! Prawie zawsze. Często. „Dlaczego Kurier jest taki gruby?” Bo dużo pisze, mało mówi. „Czy pani się kiedyś myliła?” Raz. W 2019. Nie chcę o tym mówić.', '“Does Brzęczyk tell the truth?” Always! Almost always. Often. “Why is the Kurier so thick?” It writes a lot and says little. “Have you ever been wrong?” Once. In 2019. I don’t want to talk about it.'),
      l('„Jaki jest pani ulubiony kwiat?” Bratek. Nie mówcie Kurierowi, bo napisze artykuł na dwie strony.', '“What’s your favourite flower?” The pansy. Don’t tell the Kurier, it’ll write two pages about it.'),
    ],
    art: 'jingleton',
    caption: l('Trzmielina, redaktor naczelna. Zdjęcie z lepszych czasów, czyli z wczoraj.', 'Trzmielina, editor-in-chief. Photo from better days, meaning yesterday.'),
  },
  {
    id: 'jingleton-hero',
    title: l('Jingleton bohaterem! Uratował biedronkę z kałuży', 'Jingleton a hero! He rescued a ladybird from a puddle'),
    body: [
      l('Nasz honorowy członek redakcji wczoraj po raz kolejny pokazał, że ma wielkie serce. I wielkie futerko. Zauważył biedronkę w kałuży i wyciągnął ją na liść.', 'Our honorary staff member showed once again that he has a big heart. And a big fluffy coat. He spotted a ladybird in a puddle and pulled her out onto a leaf.'),
      l('— Ktoś mi kiedyś też pomógł — powiedział tylko. — To się pamięta.', '“Someone helped me once too,” was all he said. “You remember that.”'),
      l('Biedronka dziękuje. Brzęczyk dziękuje. Jingleton zjadł potem dwie stokrotki i poszedł spać. Zasłużył.', 'The ladybird says thank you. Brzęczyk says thank you. Jingleton then ate two daisies and went to bed. He earned it.'),
    ],
    art: 'jingleton',
    caption: l('Jingleton po akcji ratunkowej. Skromny jak zawsze.', 'Jingleton after the rescue. Modest as ever.'),
  },
  {
    id: 'kurier-typo',
    title: l('KURIER ZROBIŁ BŁĄD! Mamy dowody!', 'THE KURIER MADE A MISTAKE! We have proof!'),
    body: [
      l('W zeszłotygodniowym wydaniu Kuriera napisano „sałata” przez dwa „ł”. Tak, sprawdziłyśmy. Trzy razy. Przez lupę.', 'Last week’s Kurier spelt “lettuce” with three t’s. Yes, we checked. Three times. With a magnifying glass.'),
      l('Kurier, który tak lubi poprawiać innych w swoich „sprostowaniach”, tym razem milczy. Czekamy. Mamy czas. Mamy też lupę.', 'The Kurier, so fond of correcting others in its “corrections”, is silent this time. We’re waiting. We have time. We also have the magnifying glass.'),
    ],
    art: 'owl',
    caption: l('Sowa, która podobno sprawdza teksty w Kurierze. Podobno.', 'The owl who supposedly proofreads the Kurier. Supposedly.'),
  },
  {
    id: 'summer-meadow',
    title: l('ŁĄKA ZAKWITŁA! Redakcja zamknięta, wszystkie w terenie!', 'THE MEADOW IS IN BLOOM! Office closed, everyone’s out in the field!'),
    body: [
      l('Dzisiejszy numer jest krótki, bo cała redakcja jest na łące. Koniczyna, chabry, maki. MAKI. Wiecie, jak dawno nie było maków?', 'Today’s issue is short because the whole newsroom is in the meadow. Clover, cornflowers, poppies. POPPIES. Do you know how long it’s been since poppies?'),
      l('Wracamy jutro. Może pojutrze. Proszę nie czekać z obiadem.', 'Back tomorrow. Maybe the day after. Don’t wait up for dinner.'),
    ],
    art: 'daisy',
    caption: l('Widok z redakcji. Tymczasowej.', 'The view from the office. The temporary one.'),
    when: { months: [4, 5, 6, 7] },
  },
  {
    id: 'winter-ball',
    title: l('Zimowy kłębek! Relacja z wnętrza ula', 'Winter cluster! Live from inside the hive'),
    body: [
      l('Na zewnątrz zimno, a u nas ciepło jak w lecie. Cała redakcja siedzi w jednym wielkim kłębku i drży skrzydełkami, żeby grzać.', 'It’s cold outside and warm as summer in here. The whole newsroom sits in one big cluster, shivering our wings to keep the heat in.'),
      l('Plotki krążą od środka na zewnątrz i z powrotem. Dzięki temu wszystkie wiemy wszystko. Kurier tak nie umie. Kurier siedzi sam.', 'Gossip travels from the middle to the outside and back again. That’s how we all know everything. The Kurier can’t do that. The Kurier sits alone.'),
    ],
    art: 'jingleton',
    caption: l('Jedna z nas. Trochę zaspana.', 'One of us. A bit sleepy.'),
    when: { months: [10, 11, 0, 1, 2] },
  },
];

/** Gossip from the hive: three or four in each Brzęczyk. */
export const BUZZ: Piece[] = [
  { title: l('Wróżki w sadzie?', 'Fairies in the orchard?'), body: l('Nasza fotoreporterka ma zdjęcie! Niestety z palcem w obiektywie. Szukamy dalej.', 'Our photographer got a picture! Sadly with a finger over the lens. The search goes on.') },
  { title: l('Osy znowu przy śmietniku.', 'Wasps at the bin again.'), body: l('Redakcja nic nie sugeruje. Redakcja tylko patrzy.', 'The editors suggest nothing. The editors are just watching.') },
  { title: l('Duszek w sklepie z prześcieradłami.', 'Little Ghost in the linen shop.'), body: l('Mierzył trzy. Kupił to samo co zawsze. Białe.', 'He tried on three. Bought the same as always. White.') },
  { title: l('Kto zjadł konfiturę Pani Jadzi?', 'Who ate Mrs Jadzia’s jam?'), body: l('Słoik pusty, łyżeczka lepka, a Atrament wyjątkowo zadowolony. Kot podobno nie je konfitur. Podobno.', 'Jar empty, spoon sticky, and Atrament unusually pleased. Cats don’t eat jam, apparently. Apparently.') },
  { title: l('Listonosz zgolił wąsy?!', 'The postman shaved off his moustache?!'), body: l('Nie. Fałszywy alarm. To był cień. Uff.', 'No. False alarm. It was a shadow. Phew.') },
  { title: l('Milton się rusza!', 'Milton moved!'), body: l('Albo wiatr. Raczej wiatr. Ale może Milton.', 'Or the wind. Probably the wind. But maybe Milton.') },
  { title: l('Rechotka ma nowe kalosze?', 'New boots for Rechotka?'), body: l('Też żółte. Identyczne. Pytamy po co. Odpowiada: „na zapas”.', 'Also yellow. Identical. We asked why. Answer: “spares”.') },
  { title: l('Sowa ziewnęła w dzień.', 'The owl yawned in daylight.'), body: l('Pierwszy raz od lat ktoś ją widział z otwartymi oczami przed zmrokiem. Świat się zmienia.', 'First time in years anyone’s seen her eyes open before dusk. The world is changing.') },
  { title: l('Kret Zenon kupił mapę.', 'Zenon the mole bought a map.'), body: l('Mapę MIASTA. Po co kretowi mapa, skoro i tak chodzi pod spodem? Metro, mówimy wam. METRO.', 'A map of the TOWN. Why would a mole need a map when he goes underneath anyway? The underground, we tell you. The UNDERGROUND.') },
  { title: l('Wiedźmusia warzy coś różowego.', 'Wiedźmusia is brewing something pink.'), body: l('Znowu. Staw prosi o ostrożność.', 'Again. The pond asks for caution.') },
  { title: l('Pani Ćma kupiła nową latarnię.', 'Pani Ćma has a new lantern.'), body: l('Większą. Jaśniejszą. Pan Jeżyk przechodzi obok niej trzy razy dziennie. Zupełnie przypadkiem.', 'Bigger. Brighter. Pan Jeżyk walks past it three times a day. Purely by chance.') },
  { title: l('Halinka znalazła orzech!', 'Halinka found a nut!'), body: l('Jeden. Zostało dwieście dziewięćdziesiąt dziewięć. Trzymamy kciuki. Nie mamy kciuków, ale trzymamy.', 'One. Two hundred and ninety-nine to go. Fingers crossed. We don’t have fingers, but crossed anyway.') },
  { title: l('Świerszcze ćwiczą po nocach.', 'The crickets rehearse at night.'), body: l('Nowy utwór nazywa się „Sernik”. Ciekawe dlaczego.', 'The new piece is called “Cheesecake”. Wonder why.') },
  { title: l('Psy z okna szczekały na listonosza.', 'The window dogs barked at the postman.'), body: l('Codziennie to samo, a listonosz codziennie zaskoczony. To jest prawdziwa przyjaźń.', 'Same every day, and the postman is surprised every day. That’s true friendship.') },
  { title: l('Pan Jeżyk ma nowy kapelusz?', 'A new hat for Pan Jeżyk?'), body: l('Nie, to liść. Przykleił się rano. Wygląda dobrze, nie mówmy mu.', 'No, it’s a leaf. Stuck to him this morning. It suits him, let’s not tell him.') },
  { title: l('Atrament na trzech parapetach naraz?', 'Atrament on three windowsills at once?'), body: l('Świadkowie przysięgają. Albo jest trzech Atramentów, albo nam coś umyka.', 'Witnesses swear to it. Either there are three Atraments, or we’re missing something.') },
  { title: l('Kamień, który jest burmistrzem, przesunął się o centymetr.', 'The stone who is mayor moved a centimetre.'), body: l('Reforma? Rewolucja? Atrament mówi, że to on go pchnął, bo chciał słońca.', 'Reform? Revolution? Atrament says he pushed it, he wanted the sun.') },
  { title: l('Ktoś zostawił światło na straganie.', 'Someone left a light on at the stall.'), body: l('Pan Jeżyk mówi, że to dla bezpieczeństwa. Pani Ćma lata wokół niego co noc. Bezpiecznie.', 'Pan Jeżyk says it’s for safety. Pani Ćma circles it every night. Safely.') },
  { title: l('Pierwszy przebiśnieg?', 'First snowdrop?'), body: l('Nasze zwiadowczynie widziały coś białego pod śniegiem. Albo to śnieg. Sprawdzimy wiosną.', 'Our scouts saw something white under the snow. Or it’s snow. We’ll check in spring.'), when: { months: [0, 1, 2] } },
  { title: l('Lawenda kwitnie!', 'The lavender’s out!'), body: l('Redakcja ma dziś dyżur w ogródku. Od rana do wieczora. Bardzo ciężka praca.', 'The newsroom is on duty in the garden today. Morning to night. Very hard work.'), when: { months: [5, 6, 7] } },
  { title: l('Dynie rosną.', 'The pumpkins are growing.'), body: l('Pani Jadzia czyta im na głos. Podobno najbardziej lubią kryminały.', 'Mrs Jadzia reads to them aloud. Apparently they like crime novels best.'), when: { months: [7, 8, 9] } },
  { title: l('Kto narysował serduszko na zaparowanej szybie?', 'Who drew a heart on the misted window?'), body: l('Okno przy ogrodzie. Rano. Mamy podejrzenia, ale jesteśmy dyskretne. Czasem.', 'The garden window. This morning. We have suspicions, but we’re discreet. Sometimes.'), when: { months: [9, 10, 11, 0, 1, 2] } },
];

/** Brzęczyk's horoscope, always for Capricorn. */
export const BEE_HOROSCOPES: L[] = [
  l('Dziś leć prosto do celu, bez zygzaków. Wieczorem coś słodkiego. Najlepiej miód. Bzz.', 'Fly straight to your goal today, no zigzags. Something sweet this evening. Ideally honey. Bzz.'),
  l('Gwiazdy mówią: zapyl coś. Nieważne co. Poczujesz się lepiej.', 'The stars say: pollinate something. Anything. You’ll feel better.'),
  l('Unikaj os i ludzi, którzy brzmią jak osy. Wiesz, o kim mowa.', 'Avoid wasps, and people who sound like wasps. You know who we mean.'),
  l('Dobry dzień na taniec. Nawet jeśli nikt nie wie, co oznacza.', 'A good day for a dance. Even if nobody knows what it means.'),
  l('Ktoś o Tobie dziś pomyśli. Może trzmiel. Może ktoś większy.', 'Someone will think of you today. Maybe a bumblebee. Maybe someone bigger.'),
  l('Twój kwiat szczęścia: bratek. Twój kolor szczęścia: złoty. Twoja liczba: sześć, jak boki plastra.', 'Your lucky flower: the pansy. Lucky colour: gold. Lucky number: six, like the sides of a honeycomb.'),
  l('Nie słuchaj horoskopu w Kurierze. Nasz jest lepszy. Ten też.', 'Don’t listen to the Kurier’s horoscope. Ours is better. This one too.'),
  l('Dzień pełen pyłku. Uważaj na kichanie, zwłaszcza nad stawem.', 'A day full of pollen. Mind the sneezing, especially near the pond.'),
  l('Planety ustawiły się w kształt plastra. To znaczy, że wszystko się uda. Albo że ul ma okno.', 'The planets are lined up like a honeycomb. That means everything will work out. Or that the hive has a window.'),
  l('Zrób dziś jedną rzecz powoli. Pszczoły tego nie umieją, ale Ty tak.', 'Do one thing slowly today. Bees can’t, but you can.'),
  l('Ktoś Ci zazdrości ogrodu. To my. Przepraszamy, jest za ładny.', 'Someone is jealous of your garden. It’s us. Sorry, it’s too pretty.'),
  l('Wieczór sprzyja kocykom. Kocyk sprzyja drzemce. Drzemka sprzyja wszystkiemu.', 'The evening favours blankets. Blankets favour naps. Naps favour everything.'),
  l('Gwiazdy radzą: podlej coś, co dawno nie piło. Ono też ma uczucia.', 'The stars advise: water something that hasn’t had a drink in a while. It has feelings too.'),
  l('Dziś brzęczy Ci w uchu? To znak. Albo my. Raczej my.', 'Buzzing in your ear today? It’s a sign. Or us. Probably us.'),
  l('Szczęście przyjdzie z lewej strony. Z prawej przyjdzie pies.', 'Luck comes from the left. From the right comes a dog.'),
  l('Księżyc mówi „odpocznij”. Słońce mówi „leć”. Wybierz drzemkę na słońcu.', 'The moon says “rest”. The sun says “fly”. Choose a nap in the sun.'),
];

/** Brzęczyk's correction of the Kurier, when today's Kurier gives it nothing better. */
export const BEE_JABS: L[] = [
  l('Kurier ma dziś dwie strony. Dwie strony! My mówimy wszystko na jednej. Kto tu jest profesjonalistą?', 'The Kurier has two pages today. Two pages! We say it all on one. Who’s the professional here?'),
  l('Kurier w horoskopie obiecuje „spokojny dzień”. Spokojny dzień to nie jest wiadomość, Kurierze.', 'The Kurier’s horoscope promises “a quiet day”. A quiet day is not news, Kurier.'),
  l('Kurier znowu napisał „Bratkowo” z kropką na końcu nagłówka. Nagłówki nie mają kropek. Nawet my to wiemy.', 'The Kurier put a full stop at the end of a headline again. Headlines don’t have full stops. Even we know that.'),
  l('Kurier pisze długie zdania. Bardzo długie. Tak długie, że w połowie zapomina się początek. Bzz.', 'The Kurier writes long sentences. Very long. So long you forget the start halfway. Bzz.'),
  l('W Kurierze nie ma ani jednego zdjęcia pszczoły. Ani jednego. Od lat. Zgłaszamy to do ratusza.', 'Not one photo of a bee in the Kurier. Not one. For years. We’re reporting this to the town hall.'),
  l('Kurier pisze o pogodzie, jakby ją wymyślił. Pogoda była pierwsza, Kurierze.', 'The Kurier writes about the weather as if it invented it. The weather was here first, Kurier.'),
  l('Kurier ma w nagłówku słowo „Kurier”. My mamy w nagłówku pszczołę. Dwie. Wygrywamy.', 'The Kurier has the word “Kurier” in its masthead. We have a bee. Two. We win.'),
  l('Kurier twierdzi, że jest „gazetą poranną”. My wychodzimy o tej samej porze i nikt nie robi z tego afery.', 'The Kurier calls itself “the morning paper”. We come out at the same time and nobody makes a fuss.'),
];

/** What the bees say about the flower of the week, by how it looks. */
export const FLOWER_OF_WEEK: Record<'pansy' | 'tulip' | 'rose' | 'daisy' | 'lavender' | 'other', L[]> = {
  pansy: [
    l('Bratek! Nasz ulubiony. Ma buźkę, ma kolory, ma klasę. Nektar dyskretny, ale szczery.', 'A pansy! Our favourite. It has a face, it has colours, it has class. Discreet nectar, but honest.'),
    l('Płatki jak aksamit, środek jak mały uśmiech. Redakcja zakochana. Znowu.', 'Petals like velvet, a middle like a little smile. The newsroom is in love. Again.'),
  ],
  tulip: [
    l('Płatki: idealne. Kolor: odważny. Nektaru nie oceniamy, to sprawa prywatna.', 'Petals: perfect. Colour: bold. We don’t rate the nectar, that’s a private matter.'),
    l('Tulipan stoi prosto jak listonosz na defiladzie. Elegancja bez wysiłku.', 'The tulip stands straight as a postman on parade. Effortless elegance.'),
  ],
  rose: [
    l('Róża. Piękna i trochę dumna. Kolce zauważone, wybaczone.', 'A rose. Beautiful and a little proud. Thorns noted, forgiven.'),
    l('Pachnie tak, że trzy reporterki zapomniały, po co przyleciały. Najwyższa nota.', 'Smells so good three reporters forgot why they came. Top marks.'),
  ],
  daisy: [
    l('Stokrotka! Prosta, pogodna i zawsze ma czas. Jingleton głosował dwa razy.', 'A daisy! Simple, cheerful and always has time. Jingleton voted twice.'),
    l('Mała, biała, z żółtym środkiem jak słoneczko. Nie trzeba nic więcej.', 'Small, white, with a yellow middle like a little sun. Nothing more needed.'),
  ],
  lavender: [
    l('Lawenda. Redakcja spędziła przy niej cały dyżur i nie żałuje ani minuty.', 'Lavender. The newsroom spent its whole shift there and regrets nothing.'),
    l('Fioletowa, pachnąca, spokojna. Jak sen, który chce się dośnić.', 'Purple, fragrant, calm. Like a dream you want to finish.'),
  ],
  other: [
    l('Kwiat wyjątkowy, jakich w Bratkowie mało. Redakcja pod wrażeniem i lekko onieśmielona.', 'An unusual flower, rare in Bratkowo. The newsroom is impressed and a little shy.'),
    l('Nie wszystkie pszczoły wiedzą, jak to się nazywa. Wszystkie wiedzą, że jest piękne.', 'Not every bee knows what it’s called. Every bee knows it’s beautiful.'),
  ],
};
