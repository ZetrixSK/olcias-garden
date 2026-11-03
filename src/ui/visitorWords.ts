import type { Colour, Gift, VisitorId, Wish } from '../garden/visitors';
import type { Vase } from '../garden/bouquets';
import type { words } from '../i18n';

type W = ReturnType<typeof words>;
/** English, Polish to her, and Polish to him where it differs. */
type Line = readonly [string, string, string?];
export const say = (w: W, [en, she, he]: Line) => w.t(en, w.g(she, he ?? she));

export const VISITOR_NAME: Record<VisitorId, Line> = {
  jadzia: ['Mrs Jadzia', 'Pani Jadzia'],
  atrament: ['Atrament', 'Atrament'],
  duszek: ['Little Ghost', 'Duszek'],
  rechotka: ['Rechotka', 'Rechotka'],
  listonosz: ['The postman', 'Pan listonosz'],
  wiedzmusia: ['Wiedźmusia', 'Wiedźmusia'],
  jingleton: ['Jingleton', 'Jingleton'],
};

/** Who they are, for their page in the book. */
export const VISITOR_BIO: Record<VisitorId, Line> = {
  jadzia: ['Lives at the end of the lane. Knits everything, even hats for teapots that don’t need them.', 'Mieszka na końcu uliczki. Robi na drutach wszystko, nawet czapeczki na czajniki, które ich nie potrzebują.'],
  atrament: ['A black cat who belongs to nobody and visits everybody. In the evenings.', 'Czarny kot, który jest niczyj i odwiedza wszystkich. Wieczorami.'],
  duszek: ['Lives in an attic somewhere. Only comes out at night, and is very polite about it.', 'Mieszka gdzieś na strychu. Wychodzi tylko nocą i jest przy tym bardzo grzeczny.'],
  rechotka: ['From the pond by the lake. Owns one umbrella (a leaf) and two very yellow boots.', 'Mieszka w stawie nad jeziorem. Ma jeden parasol (liść) i dwa bardzo żółte kalosze.'],
  listonosz: ['Brings the post by bike every morning except Sundays. Very proud of his moustache.', 'Przywozi pocztę rowerem każdego ranka oprócz niedziel. Bardzo dumny ze swoich wąsów.'],
  wiedzmusia: ['A witch’s apprentice. Her hat is a size too big; she says she’ll grow into it.', 'Uczennica czarownicy. Kapelusz ma o rozmiar za duży, ale mówi, że do niego dorośnie.'],
  jingleton: ['A big, fluffy bumblebee. Someone once tried very hard to save him, and he has been coming back ever since.', 'Wielki, puchaty trzmiel. Ktoś kiedyś bardzo się starał go uratować i od tamtej pory zawsze tu wraca.'],
};

/** What she learns about them, a line for each bouquet she brings. */
export const VISITOR_LIKES: Record<VisitorId, Line[]> = {
  jadzia: [
    ['Likes pink, and roses.', 'Lubi róż i róże.'],
    ['A bouquet without a ribbon isn’t a bouquet to her.', 'Bukiet bez wstążki to dla niej nie bukiet.'],
    ['Comes by in the daytime.', 'Przychodzi w dzień.'],
  ],
  atrament: [
    ['Likes dark and purple flowers.', 'Lubi ciemne i fioletowe kwiaty.'],
    ['Unties ribbons. Most of them.', 'Rozwiązuje wstążki. Większość.'],
    ['Comes in the evening.', 'Przychodzi wieczorem.'],
  ],
  duszek: [
    ['Likes white flowers, the paler the better.', 'Lubi białe kwiaty, im bledsze, tym lepiej.'],
    ['Likes things best when they’re picked at night.', 'Najbardziej lubi to, co zerwane nocą.'],
    ['Only comes at night.', 'Przychodzi tylko nocą.'],
  ],
  rechotka: [
    ['Likes big bouquets, and anything purple or blue like the pond.', 'Lubi duże bukiety i wszystko, co fioletowe albo niebieskie jak staw.'],
    ['Likes anything that holds water.', 'Lubi wszystko, w czym jest woda.'],
    ['Comes when it rains, or on grey mornings.', 'Przychodzi, kiedy pada, albo w szare poranki.'],
  ],
  listonosz: [
    ['Likes small bouquets that fit on a bike.', 'Lubi małe bukieciki, które zmieszczą się na rowerze.'],
    ['Likes sunny colours.', 'Lubi słoneczne kolory.'],
    ['Comes in the mornings, never on Sundays.', 'Przychodzi rano, nigdy w niedzielę.'],
  ],
  wiedzmusia: [
    ['Needs lavender, and dark and purple flowers, for her potions.', 'Do eliksirów potrzebuje lawendy i ciemnych, fioletowych kwiatów.'],
    ['Loves anything that looks like it could hold a potion.', 'Uwielbia wszystko, w czym mógłby być eliksir.'],
    ['Flies over in the evening.', 'Przylatuje wieczorem.'],
  ],
  jingleton: [
    ['Likes lots of flowers: the more, the better.', 'Lubi dużo kwiatów: im więcej, tym lepiej.'],
    ['Likes purple and yellow.', 'Lubi fiolet i żółty.'],
    ['Comes on dry days, while it’s light.', 'Przylatuje w suche dni, kiedy jest jasno.'],
  ],
};

export const VISITOR_FAVOURITE: Record<VisitorId, Line> = {
  jadzia: ['Favourite: a few words on a card.', 'Ulubione: kilka słów na karteczce.'],
  atrament: ['Favourite: a black ribbon (the only kind he doesn’t untie).', 'Ulubione: czarna wstążka (jedyna, której nie rozwiązuje).'],
  duszek: ['Favourite: moonflowers.', 'Ulubione: kwiaty księżyca.'],
  rechotka: ['Favourite: the jug.', 'Ulubione: dzbanek.'],
  listonosz: ['Favourite: anything yellow.', 'Ulubione: wszystko, co żółte.'],
  wiedzmusia: ['Favourite: the old bottle.', 'Ulubione: stara buteleczka.'],
  jingleton: ['Favourite: daisies.', 'Ulubione: stokrotki.'],
};
export const FAVOURITE_UNKNOWN: Line = ['Favourite: ? (not found out yet)', 'Ulubione: ? (jeszcze nie wiadomo)'];

/** Each visitor's ways of writing their note: how it starts, and how they sign it. */
const NOTES: Record<VisitorId, Array<{ open: Line; close: Line }>> = {
  jadzia: [
    {
      open: ['Good morning, dear! It’s my sister’s name day, and I’d love to bring her something from your garden.', 'Dzień dobry, kochaniutka! Moja siostra ma imieniny, a chciałabym jej zanieść coś z Twojego ogródka.', 'Dzień dobry, kochaniutki! Moja siostra ma imieniny, a chciałabym jej zanieść coś z Twojego ogródka.'],
      close: ['Thank you, my dear. Jadzia', 'Dziękuję, złotko. Jadzia'],
    },
    {
      open: ['Oh, hello, dear! My table looks so bare without flowers…', 'Ojej, dzień dobry, słoneczko! Stół taki pusty bez kwiatków…'],
      close: ['I’ll put the kettle on while I wait. Jadzia', 'Nastawię w tym czasie wodę na herbatę. Jadzia'],
    },
    {
      open: ['Good day! I’ve been knitting all morning, and now I need something pretty to look at.', 'Dzień dobry! Cały ranek dziergałam, a teraz muszę popatrzeć na coś ładnego.'],
      close: ['Yours, Mrs Jadzia', 'Twoja Pani Jadzia'],
    },
  ],
  atrament: [
    { open: ['Mrrr. I’ve come about flowers. For my windowsill.', 'Mrrr. Przychodzę w sprawie kwiatów. Na mój parapet.'], close: ['Atrament (the cat)', 'Atrament (kot)'] },
    { open: ['Prrr. I knocked. With my head.', 'Prrr. Zapukałem. Głową.'], close: ['Miaow.', 'Miau.'] },
    { open: ['Good evening. I am a very serious cat with a very serious request.', 'Dobry wieczór. Jestem bardzo poważnym kotem z bardzo poważną prośbą.'], close: ['Purr. A.', 'Mrr. A.'] },
  ],
  duszek: [
    {
      open: ['Boo… sorry, I mean: good evening! Could I please have a bouquet I can see in the dark?', 'Uu… przepraszam, to znaczy: dobry wieczór! Czy mogę prosić o bukiet, który widać w ciemności?'],
      close: ['(I’m not scary, honestly.) Duszek', '(Naprawdę nie jestem straszny.) Duszek'],
    },
    { open: ['Hello… it’s ever so empty in the attic. A few flowers would help.', 'Cześć… na strychu jest tak pusto. Trochę kwiatków by pomogło.'], close: ['Quietly yours, Duszek', 'Cichutko, Duszek'] },
    { open: ['I’m having a tea party by moonlight! Just me and the moths.', 'Urządzam herbatkę przy księżycu! Tylko ja i ćmy.'], close: ['You could come too. Duszek', 'Możesz też przyjść. Duszek'] },
  ],
  rechotka: [
    { open: ['Ribbit! My pond needs cheering up after all this weather.', 'Kum kum! Mój staw trzeba rozweselić po tej pogodzie.'], close: ['Croaks and kisses, Rechotka', 'Całuski i kumkanie, Rechotka'] },
    { open: ['Hello, hello! It’s my birthday… well, nearly. Nearly counts!', 'Halo, halo! Mam urodziny… no, prawie. Prawie się liczy!'], close: ['Rechotka (in boots)', 'Rechotka (w kaloszach)'] },
    { open: ['I’ve been jumping in puddles all day, and I’d love something to take home.', 'Cały dzień skaczę po kałużach i chciałabym coś zanieść do domu.'], close: ['Kum! R.', 'Kum! R.'] },
  ],
  listonosz: [
    { open: ['Post! Nothing for you today, I’m afraid, but I’ve a favour to ask.', 'Poczta! Dziś nic dla Ciebie, niestety, ale mam prośbę.'], close: ['Regards from my round, the postman', 'Pozdrawiam z trasy, listonosz'] },
    {
      open: ['Morning! My wife says the house needs flowers. Small ones: they have to fit on the bike.', 'Dzień dobry! Żona mówi, że w domu brakuje kwiatów. Małych, bo muszą się zmieścić na rowerze.'],
      close: ['Much obliged! The postman', 'Uprzejmie dziękuję! Listonosz'],
    },
    { open: ['Good day! I bring everyone their letters, and nobody ever brings me anything.', 'Dzień dobry! Roznoszę wszystkim listy, a mnie nikt nic nie przynosi.'], close: ['(Just saying.)', '(Tak tylko mówię.)'] },
  ],
  wiedzmusia: [
    { open: ['Hi! I need ingredients for a potion. A nice one, I promise.', 'Cześć! Potrzebuję składników do eliksiru. Dobrego, obiecuję.'], close: ['Wiedźmusia, witch (in training)', 'Wiedźmusia, czarownica (w trakcie nauki)'] },
    {
      open: ['Hello! My teacher says a proper witch keeps fresh flowers in her tower.', 'Hej! Moja nauczycielka mówi, że prawdziwa czarownica trzyma w wieży świeże kwiaty.'],
      close: ['Wiedźmusia (I flew here all by myself!)', 'Wiedźmusia (sama tu przyleciałam!)'],
    },
    { open: ['Good evening! My broom won’t fly unless there’s something pretty tied to it.', 'Dobry wieczór! Moja miotła nie chce latać, jeśli nie ma przywiązanego czegoś ładnego.'], close: ['Love, W.', 'Buziaki, W.'] },
  ],
  jingleton: [
    { open: ['Bzzz, hello! It’s me again. I always find my way back here.', 'Bzzz, cześć! To znowu ja. Zawsze tu wracam.'], close: ['Your Jingleton', 'Twój Jingleton'] },
    { open: ['Bzz. I’ve been everywhere today, and your garden is still my favourite.', 'Bzz. Byłem dziś wszędzie, a Twój ogród i tak jest najlepszy.'], close: ['Buzzing gratefully, Jingleton', 'Brzęczę z wdzięcznością, Jingleton'] },
    { open: ['Hello, hello! I’ve put on my best bow tie for this.', 'Cześć, cześć! Założyłem na tę okazję najlepszą muszkę.'], close: ['Bzzz! J.', 'Bzzz! J.'] },
  ],
};

export const noteOpen = (w: W, v: VisitorId, style: number) => say(w, (NOTES[v][style] ?? NOTES[v][0]!).open);
export const noteClose = (w: W, v: VisitorId, style: number) => say(w, (NOTES[v][style] ?? NOTES[v][0]!).close);

/** What they say on getting the bouquet: delighted (five petals), pleased, or politely puzzled; a few ways of each. */
const THANKS: Record<VisitorId, [Line[], Line[], Line[]]> = {
  jadzia: [
    [
      ['Oh my! It’s perfect, just perfect!', 'Ojej! Idealny, po prostu idealny!'],
      ['My dear, you have golden hands. I could cry!', 'Złote ręce, kochaniutka. Aż się wzruszyłam!', 'Złote ręce, kochaniutki. Aż się wzruszyłam!'],
      ['Wait till my sister sees this! She’ll be green with envy.', 'Niech no siostra to zobaczy! Pozielenieje z zazdrości.'],
    ],
    [
      ['How lovely. Thank you, dear.', 'Jaki śliczny. Dziękuję, kochana.', 'Jaki śliczny. Dziękuję, kochany.'],
      ['Oh, that will brighten up the whole kitchen.', 'Och, rozjaśni mi całą kuchnię.'],
      ['Thank you, sunshine. Come by for cake some time.', 'Dziękuję, słoneczko. Wpadnij kiedyś na ciasto.'],
    ],
    [
      ['Oh! It’s… not quite what I had in mind, but how sweet of you.', 'Och! To… nie całkiem to, o czym myślałam, ale jakie to miłe.'],
      ['Well, my glasses must be playing tricks… but it’s pretty all the same.', 'No, może to te okulary… ale i tak jest ładny.'],
      ['Never mind, dear. It’s the thought that counts.', 'Nic nie szkodzi, złotko. Liczą się chęci.'],
    ],
  ],
  atrament: [
    [
      ['Mrrrrrrr. (He purrs so hard his bell rings.)', 'Mrrrrrrr. (Mruczy tak mocno, że dzwoni mu dzwoneczek.)'],
      ['(He rubs his whole head against the vase. Twice.)', '(Ociera się o wazon całą głową. Dwa razy.)'],
      ['Mrau! (He does a little slow blink. That means a lot, from a cat.)', 'Mrau! (Mruga powoli. U kota to bardzo dużo znaczy.)'],
    ],
    [
      ['Mrr. Acceptable. Very acceptable.', 'Mrr. Może być. Bardzo może być.'],
      ['Prrr. It will look good next to me.', 'Prrr. Będzie ładnie wyglądał obok mnie.'],
      ['(He nods, very seriously, and takes it by the ribbon.)', '(Kiwa głową, bardzo poważnie, i bierze go za wstążkę.)'],
    ],
    [
      ['…Miaow? (He sniffs it, then takes it anyway.)', '…Miau? (Obwąchuje go, a potem i tak bierze.)'],
      ['(He looks at the bouquet. Then at you. Then at the bouquet.)', '(Patrzy na bukiet. Potem na Ciebie. Potem znowu na bukiet.)'],
      ['Mrr. I will sit on it later. That is a compliment.', 'Mrr. Później na nim usiądę. To komplement.'],
    ],
  ],
  duszek: [
    [
      ['Ooooh! It’s the prettiest thing in the whole attic!', 'Uuuuu! To najpiękniejsza rzecz na całym strychu!'],
      ['I’m so happy I could float right through the ceiling!', 'Tak się cieszę, że mógłbym przelecieć przez sufit!'],
      ['The moths will be SO jealous. Thank you, thank you!', 'Ćmy będą TAK zazdrosne. Dziękuję, dziękuję!'],
    ],
    [
      ['Thank you… I’ll keep it by the little window.', 'Dziękuję… postawię go przy okienku.'],
      ['It’s lovely. I’ll whisper to it so it isn’t lonely.', 'Jest śliczny. Będę do niego szeptał, żeby nie było mu smutno.'],
      ['Oh! For me? Nobody ever gives ghosts flowers.', 'Och! Dla mnie? Duchom nikt nigdy nie daje kwiatów.'],
    ],
    [
      ['Oh… it’s lovely. Even if it isn’t quite… never mind. Thank you!', 'Och… jest śliczny. Nawet jeśli nie do końca… nieważne. Dziękuję!'],
      ['Hmm, it’s a bit bright for the attic. I’ll squint.', 'Hmm, trochę za jasny na strych. Będę mrużył oczy.'],
      ['I’ll love it anyway. Ghosts are good at that.', 'I tak będę go kochał. Duchy są w tym dobre.'],
    ],
  ],
  rechotka: [
    [
      ['KUM KUM KUM! Best bouquet in the whole pond!', 'KUM KUM KUM! Najlepszy bukiet w całym stawie!'],
      ['I’m going to jump for joy! (She does. Splash.)', 'Zaraz podskoczę z radości! (Podskakuje. Plusk.)'],
      ['The fish will never believe it. Ribbit!', 'Ryby w życiu w to nie uwierzą. Kum!'],
    ],
    [
      ['Ribbit! Thank you, it’s lovely!', 'Kum! Dziękuję, jest śliczny!'],
      ['Ooh, it’ll look lovely on my lily pad.', 'Och, ślicznie będzie wyglądał na moim liściu.'],
      ['Kum kum! I’ll carry it home under my umbrella.', 'Kum kum! Zaniosę go do domu pod parasolem.'],
    ],
    [
      ['Kum? Oh, it’s different! I like different. Usually.', 'Kum? O, jest inny! Lubię inne. Zazwyczaj.'],
      ['Ribbit… the ducks will like it, maybe.', 'Kum… może kaczkom się spodoba.'],
      ['It’s not what I asked for, but it’s still a present!', 'To nie to, o co prosiłam, ale to wciąż prezent!'],
    ],
  ],
  listonosz: [
    [
      ['Well I never! My wife will be over the moon!', 'No proszę! Żona będzie wniebowzięta!'],
      ['Thirty years on the round and nobody’s ever done this for me.', 'Trzydzieści lat roznoszę pocztę i nikt mi jeszcze czegoś takiego nie dał.'],
      ['Splendid! I’ll ring my bell all the way home!', 'Wspaniały! Całą drogę do domu będę dzwonił dzwonkiem!'],
    ],
    [
      ['Much obliged. That’ll ride nicely in the basket.', 'Uprzejmie dziękuję. Ładnie pojedzie w koszyku.'],
      ['Very nice. Signed for and delivered!', 'Bardzo ładny. Pokwitowane i doręczone!'],
      ['Thank you kindly. That’s the best thing in my bag today.', 'Dziękuję pięknie. To najlepsze, co mam dziś w torbie.'],
    ],
    [
      ['Ah! Well… I’ll find room for it somehow. Thank you!', 'Aha! No… jakoś się zmieści. Dziękuję!'],
      ['Hmm. Not quite to the address, but it got here. Thank you!', 'Hmm. Nie całkiem pod ten adres, ale doszedł. Dziękuję!'],
      ['My wife will like it anyway. She likes everything I bring.', 'Żonie i tak się spodoba. Lubi wszystko, co przynoszę.'],
    ],
  ],
  wiedzmusia: [
    [
      ['Yes! That’s exactly it! My potion is going to be amazing!', 'Tak! Dokładnie to! Mój eliksir będzie niesamowity!'],
      ['Perfect! My teacher is going to be SO proud of me!', 'Idealny! Moja nauczycielka będzie ze mnie TAK dumna!'],
      ['It’s practically glowing with magic! Thank you!', 'Aż się świeci od magii! Dziękuję!'],
    ],
    [
      ['Ooh, thank you! I think this will work.', 'Och, dziękuję! Chyba zadziała.'],
      ['Lovely! It smells like a proper potion already.', 'Śliczny! Już pachnie jak prawdziwy eliksir.'],
      ['Thank you! I’ll tie it to my broom right away.', 'Dziękuję! Od razu przywiążę go do miotły.'],
    ],
    [
      ['Hmm. It might turn the cauldron pink… let’s find out!', 'Hmm. Może zabarwi kociołek na różowo… sprawdzimy!'],
      ['That’s not in the recipe… but maybe it should be!', 'Tego nie ma w przepisie… ale może powinno być!'],
      ['Oops. Well, every witch makes a few frogs by accident.', 'Ups. No, każdej czarownicy czasem coś wyjdzie nie tak.'],
    ],
  ],
  jingleton: [
    [
      ['Bzzzzz! It’s wonderful! I’m so glad I came back!', 'Bzzzzz! Cudowny! Tak się cieszę, że wróciłem!'],
      ['Bzzz! I’m so happy I could do a loop-the-loop!', 'Bzzz! Ze szczęścia zrobię beczkę w powietrzu!'],
      ['It’s the best one yet. You always knew how to look after me.', 'Najpiękniejszy ze wszystkich. Zawsze umiałaś się mną zająć.', 'Najpiękniejszy ze wszystkich. Zawsze umiałeś się mną zająć.'],
    ],
    [
      ['Bzz, thank you! It smells lovely.', 'Bzz, dziękuję! Pięknie pachnie.'],
      ['Bzz! Just what a big bumblebee needs.', 'Bzz! Dokładnie tego trzeba wielkiemu trzmielowi.'],
      ['Thank you! I’ll hum about it all the way home.', 'Dziękuję! Będę o nim brzęczał całą drogę do domu.'],
    ],
    [
      ['Bzz? Oh, it’s lovely anyway. Everything here is.', 'Bzz? Och, i tak jest śliczny. Tutaj wszystko jest.'],
      ['Bzz… not quite, but I don’t mind one bit.', 'Bzz… nie do końca, ale wcale mi to nie przeszkadza.'],
      ['Any flower from you is a good flower.', 'Każdy kwiat od Ciebie jest dobrym kwiatem.'],
    ],
  ],
};

export function thanksLine(w: W, v: VisitorId, petals: number, pick: number) {
  const lines = THANKS[v][petals >= 5 ? 0 : petals >= 3 ? 1 : 2];
  return say(w, lines[pick % lines.length]!);
}

/** What they say when she opens the door to them again, after "back in a bit". */
const STILL_HERE: Record<VisitorId, Line[]> = {
  jadzia: [
    ['Oh, there you are, dear! I’ve been admiring your doormat.', 'O, jesteś, kochaniutka! Podziwiałam Twoją wycieraczkę.', 'O, jesteś, kochaniutki! Podziwiałam Twoją wycieraczkę.'],
    ['No hurry, dear. I brought my knitting.', 'Nie ma pośpiechu, złotko. Wzięłam ze sobą druty.'],
  ],
  atrament: [
    ['(He has made himself comfortable on the step.)', '(Rozgościł się na schodku.)'],
    ['Mrr. I am still here. I am very patient. For a cat.', 'Mrr. Wciąż tu jestem. Jestem bardzo cierpliwy. Jak na kota.'],
  ],
  duszek: [
    ['Boo! Oh, sorry, I startled myself.', 'Uu! Och, przepraszam, sam się przestraszyłem.'],
    ['I’m still here… I don’t mind waiting. I’m good at it.', 'Wciąż tu jestem… nie przeszkadza mi czekanie. Umiem czekać.'],
  ],
  rechotka: [
    ['Kum! I counted every raindrop while I waited.', 'Kum! Liczyłam krople, kiedy czekałam.'],
    ['Still here! Still in my boots!', 'Wciąż tu jestem! Wciąż w kaloszach!'],
  ],
  listonosz: [
    ['Still on my round! I can wait a moment longer.', 'Jeszcze jestem na trasie! Mogę chwilkę poczekać.'],
    ['I’ve leant the bike on your fence, I hope that’s all right.', 'Oparłem rower o Twój płot, mam nadzieję, że to nic.'],
  ],
  wiedzmusia: [
    ['I practised a spell while I waited! It didn’t work.', 'Ćwiczyłam zaklęcie, kiedy czekałam! Nie wyszło.'],
    ['Still here! My broom is having a little rest.', 'Wciąż tu jestem! Miotła sobie odpoczywa.'],
  ],
  jingleton: [
    ['Bzz! I’ve been buzzing round your flowers. They look happy.', 'Bzz! Brzęczałem nad Twoimi kwiatkami. Wyglądają na szczęśliwe.'],
    ['I’m still here. I always wait for you.', 'Wciąż tu jestem. Zawsze na Ciebie czekam.'],
  ],
};

export function stillHereLine(w: W, v: VisitorId, pick: number) {
  const lines = STILL_HERE[v];
  return say(w, lines[pick % lines.length]!);
}

/** What they say when she says "not now". */
const GOODBYE: Record<VisitorId, Line[]> = {
  jadzia: [
    ['Don’t you worry, dear. I’ll pop by another day.', 'Nic się nie martw, kochaniutka. Wpadnę innym razem.', 'Nic się nie martw, kochaniutki. Wpadnę innym razem.'],
    ['Of course, dear. Mind you keep warm!', 'Oczywiście, złotko. Tylko ciepło się ubieraj!'],
  ],
  atrament: [
    ['Mrr. (He leaves, tail high, as if it was his idea.)', 'Mrr. (Odchodzi z ogonem w górze, jakby to był jego pomysł.)'],
    ['Prrr. Another evening, then.', 'Prrr. To innego wieczoru.'],
  ],
  duszek: [
    ['Oh… all right. I’ll float by another night!', 'Och… dobrze. Przylecę innej nocy!'],
    ['That’s all right! Goodnight… boo… I mean, bye!', 'Nic nie szkodzi! Dobranoc… uu… to znaczy, pa!'],
  ],
  rechotka: [
    ['Kum! I’ll hop by another time!', 'Kum! Wskoczę innym razem!'],
    ['Okay! See you next rainy day!', 'Dobrze! Do następnego deszczu!'],
  ],
  listonosz: [
    ['Right you are! Back on the round, then.', 'Jasne! No to wracam na trasę.'],
    ['No trouble at all. Good day to you!', 'Żaden kłopot. Miłego dnia!'],
  ],
  wiedzmusia: [
    ['Okay! I’ll fly by another evening!', 'Dobrze! Przylecę innego wieczoru!'],
    ['No problem! I’ll go and practise my spells.', 'Nie ma sprawy! Pójdę poćwiczyć zaklęcia.'],
  ],
  jingleton: [
    ['Bzz, that’s all right. I’ll always come back.', 'Bzz, nic nie szkodzi. Zawsze wracam.'],
    ['See you soon! I’ll be buzzing about.', 'Do zobaczenia! Będę gdzieś tu brzęczał.'],
  ],
};

export function goodbyeLine(w: W, v: VisitorId, pick: number) {
  const lines = GOODBYE[v];
  return say(w, lines[pick % lines.length]!);
}

const COLOUR_ONE: Record<Colour, [string, string]> = {
  pink: ['something pink', 'coś różowego'],
  purple: ['something purple', 'coś fioletowego'],
  dark: ['something dark', 'coś ciemnego'],
  white: ['something white', 'coś białego'],
  yellow: ['something yellow', 'coś żółtego'],
  red: ['something red', 'coś czerwonego'],
  orange: ['something orange', 'coś pomarańczowego'],
  blue: ['something blue', 'coś niebieskiego'],
};
const COLOUR_MANY: Record<Colour, [string, string]> = {
  pink: ['pink', 'różowe'],
  purple: ['purple', 'fioletowe'],
  dark: ['dark', 'ciemne'],
  white: ['white', 'białe'],
  yellow: ['yellow', 'żółte'],
  red: ['red', 'czerwone'],
  orange: ['orange', 'pomarańczowe'],
  blue: ['blue', 'niebieskie'],
};

/** The ribbons, named; the first six she always had, the rest were gifts. */
export const RIBBON_NAMES: Record<string, [string, string]> = {
  '#c95d7f': ['Rose', 'Różowa'],
  '#2b2229': ['Black', 'Czarna'],
  '#f2c4cf': ['Blush', 'Pudrowa'],
  '#b9a3e3': ['Lilac', 'Liliowa'],
  '#c9a45c': ['Gold', 'Złota'],
  '#a7b598': ['Sage', 'Szałwiowa'],
  '#f4e6d4': ['Lace', 'Koronkowa'],
  '#3b2346': ['Ink', 'Atramentowa'],
  '#cdd8e6': ['Mist', 'Mglista'],
  '#b8433f': ['Postbox red', 'Czerwona jak skrzynka'],
  '#6b3a66': ['Plum', 'Śliwkowa'],
  '#e2ad3f': ['Honey', 'Miodowa'],
};

const VASE_IN: Record<Vase, [string, string]> = {
  jar: ['in the glass jar', 'w słoiku'],
  jug: ['in the jug', 'w dzbanku'],
  bottle: ['in the old bottle', 'w buteleczce'],
  can: ['in the watering can', 'w konewce'],
  cauldron: ['in the little cauldron', 'w kociołku'],
};

const flowers = (w: W, n: number) => w.t(n === 1 ? 'flower' : 'flowers', w.plural(n, 'kwiat', 'kwiaty', 'kwiatów'));

/** One wish, as it's written in the note. */
export function wishLine(w: W, wish: Wish): string {
  switch (wish.kind) {
    case 'colour':
      return wish.min === 1
        ? w.t(...COLOUR_ONE[wish.colour])
        : w.t(`${wish.min} ${COLOUR_MANY[wish.colour][0]} flowers`, `${wish.min} ${COLOUR_MANY[wish.colour][1]} ${flowers(w, wish.min)}`);
    case 'species':
      return wish.min === 1 ? w.flower(wish.species) : `${wish.min} × ${w.flower(wish.species)}`;
    case 'size':
      if (wish.min === wish.max) return w.t(`exactly ${wish.min} ${flowers(w, wish.min)}`, `dokładnie ${wish.min} ${flowers(w, wish.min)}`);
      if (wish.min <= 1) return w.t(`a small one: ${wish.max} flowers at most`, `mały: najwyżej ${wish.max} ${flowers(w, wish.max)}`);
      if (wish.max >= 7) return w.t(`a big one: at least ${wish.min} flowers`, `duży: co najmniej ${wish.min} ${flowers(w, wish.min)}`);
      return w.t(`${wish.min} to ${wish.max} flowers`, `od ${wish.min} do ${wish.max} kwiatów`);
    case 'ribbon':
      if (wish.ribbon === null) return w.t('no ribbon, please', 'bez wstążki, proszę');
      if (wish.ribbon === 'any') return w.t('with a ribbon', 'ze wstążką');
      return w.t(`a ${RIBBON_NAMES[wish.ribbon]?.[0].toLowerCase() ?? ''} ribbon`, `wstążka: ${RIBBON_NAMES[wish.ribbon]?.[1].toLowerCase() ?? ''}`);
    case 'vase':
      return w.t(...VASE_IN[wish.vase]);
    case 'night':
      return w.t('picked at night', 'zerwane nocą');
  }
}

/** What a gift is, said simply. */
export function giftLine(w: W, g: Gift, vaseName: (v: Vase) => string): { title: string; text: string } {
  switch (g.kind) {
    case 'species':
      return {
        title: w.t(`Seeds: ${w.flower(g.species)}`, `Nasiona: ${w.flower(g.species)}`),
        text: w.t('A new flower. You can plant it now, on any empty shelf.', 'Nowy kwiat. Możesz go teraz posadzić na każdym wolnym miejscu.'),
      };
    case 'ribbon':
      return {
        title: w.t(`A ribbon: ${RIBBON_NAMES[g.color]?.[0] ?? ''}`, `Wstążka: ${RIBBON_NAMES[g.color]?.[1].toLowerCase() ?? ''}`),
        text: w.t('It’s with your ribbons now, for bouquets.', 'Jest już z Twoimi wstążkami, do bukietów.'),
      };
    case 'vase':
      return {
        title: w.t(`A vase: ${vaseName(g.vase)}`, `Wazon: ${vaseName(g.vase).toLowerCase()}`),
        text: w.t('For bouquets, from now on.', 'Od teraz do bukietów.'),
      };
    case 'design':
      return {
        title: w.t(`Seeds of their bratek, “${g.design.name}” × ${g.count}`, `Nasiona bratka „${g.design.name}” × ${g.count}`),
        text: w.t('They’re in your seed tin.', 'Są w Twojej puszce z nasionami.'),
      };
  }
}
