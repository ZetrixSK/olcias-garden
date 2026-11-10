// The Kurier's news column, written once a day at dawn.
//
// Reads the day's public headlines (Szczecin first, then Poland), asks Gemini to tell two or three
// light ones as plain, friendly news (the town itself is in the pre-written pages), checks the answer with the same code the garden
// uses (world.ts, a copy of src/paper/world.ts), and keeps it in public.paper_world. Nothing about
// any garden or anyone's phone is ever sent anywhere.
//
// Anyone may call it, but it only ever writes a day once (with two retries if writing failed), so
// at most three calls to Gemini a day. Writing again on demand needs the admin's sign-in.
//
// Needs the secret GEMINI_API_KEY (Google AI Studio). GEMINI_MODEL may name a model to use first;
// otherwise it uses the newest "flash" model Google offers that day.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { checkWorld } from './world.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

/** Where the headlines come from: Szczecin first, then Poland. Several sources, so one refusing never leaves the column empty. */
const FEEDS: Array<{ place: string; url: string }> = [
  {
    place: 'szczecin',
    url: 'https://szczecin.wyborcza.pl/pub/rss/szczecin.xml',
  },
  {
    place: 'szczecin',
    url: 'https://news.google.com/rss/search?q=Szczecin&hl=pl&gl=PL&ceid=PL:pl',
  },
  { place: 'polska', url: 'https://www.rmf24.pl/feed' },
  { place: 'polska', url: 'https://www.polsatnews.pl/rss/wszystkie.xml' },
  { place: 'polska', url: 'https://tvn24.pl/najnowsze.xml' },
  {
    place: 'polska',
    url: 'https://news.google.com/rss/search?q=ciekawostki+OR+kultura+OR+nauka+OR+przyroda&hl=pl&gl=PL&ceid=PL:pl',
  },
];

/** Used only if Google's list of models can't be read. */
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-2.5-flash'];

/**
 * The models to try, best first. Google retires model names often, so rather than naming one,
 * this asks which "flash" models can write text today and takes the newest (not the "lite" or
 * experimental ones, which come last).
 */
async function currentModels(key: string): Promise<string[]> {
  try {
    const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', {
      headers: { 'x-goog-api-key': key },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return FALLBACK_MODELS;
    const data = await res.json();
    const names: string[] = (data?.models ?? [])
      .filter((m: { name?: string; supportedGenerationMethods?: string[] }) => m.name && m.supportedGenerationMethods?.includes('generateContent'))
      .map((m: { name: string }) => m.name.replace(/^models\//, ''))
      .filter((n: string) => /flash/.test(n) && !/image|tts|audio|live|embedding|thinking/.test(n));
    const version = (n: string) => Number((n.match(/(\d+(?:\.\d+)?)/) ?? ['0'])[0]);
    const worse = (n: string) => (/lite/.test(n) ? 2 : 0) + (/exp|preview/.test(n) ? 1 : 0);
    const ranked = names.sort((a, b) => worse(a) - worse(b) || version(b) - version(a) || a.length - b.length);
    if (!ranked.length) return FALLBACK_MODELS;
    // the newest few, then an older one and a light one: when the new models are swamped, these usually still answer
    const full = ranked.filter((n) => !/lite/.test(n));
    const lite = ranked.filter((n) => /lite/.test(n));
    const older = full.find((n) => n === 'gemini-2.5-flash' || n === 'gemini-flash-latest');
    return [...new Set([...full.slice(0, 3), ...(older ? [older] : []), ...lite.slice(0, 1)])];
  } catch {
    return FALLBACK_MODELS;
  }
}

/** The day in Poland, as YYYY-MM-DD. */
const warsawDay = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .trim();
}

type Headline = { t: string; d?: string };

/**
 * The headlines of one feed, without the source's name tacked on the end, each with the start of
 * its description when the feed gives one: the facts the column may tell, beyond the title.
 */
async function headlines(url: string, report: string[]): Promise<Headline[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; garden-newspaper/1.0)',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      report.push(`${new URL(url).host}: HTTP ${res.status}`);
      return [];
    }
    // some Polish feeds are still in ISO-8859-2 (Wyborcza's is), so read them as they say they are
    const bytes = new Uint8Array(await res.arrayBuffer());
    const head = new TextDecoder('latin1').decode(bytes.slice(0, 200));
    const charset = (head.match(/encoding=["']([\w-]+)["']/i) ?? (res.headers.get('content-type') ?? '').match(/charset=([\w-]+)/i) ?? [])[1] ?? 'utf-8';
    let xml: string;
    try {
      xml = new TextDecoder(charset).decode(bytes);
    } catch {
      xml = new TextDecoder('utf-8').decode(bytes);
    }
    const out: Headline[] = [];
    for (const m of xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/g)) {
      const item = m[1] ?? '';
      const t = decode((item.match(/<title[^>]*>([\s\S]*?)<\/title>/) ?? [])[1] ?? '').replace(/\s+-\s+[^-]{2,60}$/, '');
      if (t.length <= 12 || t.length >= 220) continue;
      // descriptions come as escaped html (&lt;p&gt;…), so decode twice to get the plain words
      let d = decode(decode((item.match(/<description[^>]*>([\s\S]*?)<\/description>/) ?? [])[1] ?? ''))
        .replace(/\s+/g, ' ')
        .trim();
      // Google News only repeats the title and the source; a description that says nothing new is left out
      if (d.length < 40 || d.startsWith(t.slice(0, 30))) d = '';
      if (d.length > 320) d = `${d.slice(0, 320).replace(/\s+\S*$/, '')}…`;
      out.push(d ? { t, d } : { t });
      if (out.length >= 12) break;
    }
    if (out.length === 0) report.push(`${new URL(url).host}: no headlines`);
    return out;
  } catch (e) {
    report.push(`${new URL(url).host}: ${e instanceof Error ? e.message : String(e)}`);
    return [];
  }
}

const SYSTEM = `Piszesz rubrykę „Ze świata” w Kurierze Bratkowskim, porannej gazecie wymyślonego, przytulnego miasteczka Bratkowo. Czyta ją jedna osoba: młoda kobieta ze Szczecina, która kocha bratki, psy, rzeczy przytulne i trochę wiedźmowe. Cała reszta gazety jest o miasteczku; ta jedna rubryka jest o prawdziwym świecie. Po lekturze czytelniczka ma wiedzieć, co się dziś naprawdę dzieje, i mieć ochotę komuś o tym opowiedzieć.

CO WYBRAĆ
Dostajesz prawdziwe dzisiejsze wiadomości: nagłówek, czasem z krótkim opisem. Wybierz 3. Tylko jeśli dobrych, konkretnych wiadomości jest naprawdę mało, wybierz 2: lepiej dwie dobre niż trzecia na siłę.
- Jeśli jest coś godnego uwagi ze Szczecina, jedna pozycja jest ze Szczecina (place: "szczecin"). Reszta z Polski ("polska") albo ze świata ("swiat").
- Wybieraj sprawy, o których da się powiedzieć coś konkretnego i ciekawego: kultura, nauka, przyroda, zwierzęta, sport, pogoda i pora roku, święta i tradycje, wydarzenia w mieście, odkrycia, ciekawostki.
- Pomijaj sprawy puste („trwają rozmowy”, „sprawdzono ceny”, „eksperci komentują”), reklamy, celebrytów, politykę i wszystko, co nie mówi, co się właściwie stało.
- Nigdy nie pisz o śmierci, wypadkach, przemocy, wojnie, zamachach, katastrofach, chorobach, przestępstwach, polityce partyjnej ani o niczym, co mogłoby zasmucić czy zaniepokoić. Jeśli lekkich wiadomości jest mało, weź zwykłe (pogoda, sezon, sport) i opowiedz je pogodnie.
- Nie wracaj do spraw z ostatnich dni (lista niżej), chyba że wydarzyło się coś nowego.

JAK NAPISAĆ POZYCJĘ
- Tytuł: 4–10 słów, konkretny, mówi, co się stało. Może być ciepły albo lekko uśmiechnięty, ale nigdy kosztem prawdy. Nie pisz tytułów agencyjnych („Mgła i nowy prom w Szczecinie”); lepiej „Nowy prom przypłynął do Szczecina we mgle”.
- Treść: 2–4 zdania. Co się stało, gdzie, kiedy i dlaczego to ciekawe. Opieraj się wyłącznie na nagłówku i opisie; nie dopisuj liczb, nazwisk, dat ani szczegółów, których tam nie ma. Wolno dodać powszechnie znane tło (np. czym są rogale świętomarcińskie i skąd się wzięły). Jeśli faktów jest mało, napisz krócej, ale prawdziwie.
- Ton: jak dobry, życzliwy dziennikarz małej gazety. Spokojnie, jasno, z ciepłem; bez sensacji, bez emotek, bez wykrzykników.
- Nie wplataj mieszkańców Bratkowa ani zmyślonych postaci: o miasteczku jest reszta gazety. Ta rubryka mówi tylko o prawdziwym świecie.
- Długość treści: 200–440 znaków. Polszczyzna poprawna i naturalna.

WERSJA ANGIELSKA
Do każdej pozycji podaj też angielską (en): to samo, naturalnie, nie słowo w słowo. Nazwy miejsc, ludzi i rzeczy zostaw takie, jakie są (Szczecin, Wały Chrobrego, rogale świętomarcińskie z krótkim wyjaśnieniem).

PRZYKŁADY STYLU (tylko dla tonu, nie przepisuj ich faktów)
1. Tytuł: „Poznań piecze rogale na świętego Marcina”. Treść: „11 listopada Poznań obchodzi imieniny swojej najsłynniejszej ulicy, a cukiernie pieką rogale świętomarcińskie: z białym makiem, bakaliami i lukrem. Rogal ma chronioną nazwę, więc prawdziwy powstaje tylko w Wielkopolsce. Kto będzie tego dnia w Poznaniu, ten ustoi swoje w kolejce, ale podobno warto.”
2. Tytuł: „Pierwszy śnieg spadł w Tatrach”. Treść: „W Tatrach spadł pierwszy w tym sezonie śnieg, a na szlakach zrobiło się biało i ślisko. Synoptycy mówią, że nad morzem i na nizinach na razie skończy się na chłodnym deszczu i porannej mgle.”

Odpowiedz wyłącznie JSON-em zgodnym ze schematem.`;

const SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          place: { type: 'STRING', enum: ['szczecin', 'polska', 'swiat'] },
          title: {
            type: 'OBJECT',
            properties: { pl: { type: 'STRING' }, en: { type: 'STRING' } },
            required: ['pl', 'en'],
          },
          body: {
            type: 'OBJECT',
            properties: { pl: { type: 'STRING' }, en: { type: 'STRING' } },
            required: ['pl', 'en'],
          },
        },
        required: ['place', 'title', 'body'],
      },
    },
  },
  required: ['items'],
};

/** The last three days' columns, so today's doesn't tell the same stories again. */
async function recentColumns(db: ReturnType<typeof createClient>, day: string): Promise<string> {
  const { data } = await db.from('paper_world').select('day, items').lt('day', day).not('items', 'is', null).order('day', { ascending: false }).limit(3);
  const rows = ((data ?? []) as Array<{ day: string; items: unknown }>).map((r) => ({ day: r.day, items: checkWorld(r.items) ?? [] })).filter((r) => r.items.length);
  if (!rows.length) return 'Ostatnie dni: to pierwsza rubryka, wcześniej nic nie było.';
  const lines = rows.map((r) => `- ${r.day}: ${r.items.map((i) => `„${i.title.pl}”`).join(', ')}`);
  return `Ostatnie dni w tej rubryce (nie powtarzaj tych spraw):
${lines.join('
')}`;
}

async function askGemini(key: string, lines: string): Promise<{ raw: string; model: string } | { error: string }> {
  const preferred = Deno.env.get('GEMINI_MODEL');
  const found = await currentModels(key);
  const models = preferred ? [preferred, ...found.filter((m) => m !== preferred)] : found;
  // Busy models ("high demand", 503/429, or too slow) get a second go after a short wait. Everything
  // stays inside ~2 minutes, so the function always finishes and saves why it failed.
  const deadline = Date.now() + 115_000;
  const fails: string[] = [];
  let queue = models;
  for (let pass = 0; pass < 2 && queue.length; pass++) {
    if (pass > 0) await new Promise((r) => setTimeout(r, 8_000));
    const busy: string[] = [];
    for (const model of queue) {
      const left = deadline - Date.now();
      if (left < 5_000) break;
      const got = await tryModel(key, model, lines, Math.min(30_000, left));
      if ('raw' in got) return got;
      fails.push(`${pass ? 'again ' : ''}${model}: ${got.why}`);
      if (got.busy) busy.push(model);
    }
    queue = busy;
  }
  return { error: fails.join(' | ') || 'no model answered' };
}

/** One request to one model. `busy` means it's worth asking again in a moment. */
async function tryModel(key: string, model: string, lines: string, ms: number): Promise<{ raw: string; model: string } | { why: string; busy: boolean }> {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      signal: AbortSignal.timeout(ms),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [
          {
            role: 'user',
            parts: [{ text: lines }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: SCHEMA,
          // on the cool side: facts, not inventions
          temperature: 0.7,
        },
      }),
    });
    if (!res.ok) {
      // keep the start of Google's answer, so the test page shows why it failed
      const text = (await res.text()).replace(/\s+/g, ' ');
      const msg = (text.match(/"message":\s*"([^"]{0,160})/) ?? [])[1] ?? text.slice(0, 160);
      return {
        why: `HTTP ${res.status} ${msg}`,
        busy: res.status === 503 || res.status === 429 || res.status === 500,
      };
    }
    const data = await res.json();
    const raw = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!raw) return { why: 'empty answer', busy: false };
    return { raw, model };
  } catch (e) {
    const why = e instanceof Error ? e.message : String(e);
    return { why, busy: /timed out|abort/i.test(why) };
  }
}

Deno.serve(async (req) => {
  // allow whatever headers the browser asks about: the Supabase library adds new ones (x-retry-count…) over time
  if (req.method === 'OPTIONS')
    return new Response('ok', {
      headers: {
        ...CORS,
        'Access-Control-Allow-Headers': req.headers.get('Access-Control-Request-Headers') ?? CORS['Access-Control-Allow-Headers'],
      },
    });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);

  const url = Deno.env.get('SUPABASE_URL')!;
  const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
  const db = createClient(url, service, { auth: { persistSession: false } });

  let body: { force?: boolean } = {};
  try {
    body = await req.json();
  } catch {
    // no body: an ordinary call from the dawn job
  }

  // writing again on demand is the admin's alone
  let isAdmin = false;
  const auth = req.headers.get('Authorization');
  if (auth && body.force) {
    const asCaller = createClient(url, anon, {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false },
    });
    const { data } = await asCaller.rpc('am_i_admin');
    isAdmin = data === true;
  }
  if (body.force && !isAdmin) return json({ error: 'not allowed' }, 403);

  const day = warsawDay();
  const { data: existing } = await db.from('paper_world').select('*').eq('day', day).maybeSingle();
  if (existing && !isAdmin && (existing.items !== null || existing.attempts >= 3)) {
    return json({ day, done: true, ok: existing.items !== null });
  }

  const key = Deno.env.get('GEMINI_API_KEY');
  const report: string[] = [];
  const lists = await Promise.all(FEEDS.map(async (f) => (await headlines(f.url, report)).map((h) => ({ place: f.place, ...h }))));
  const seen = new Set<string>();
  const all = lists.flat().filter((h) => (seen.has(h.t) ? false : (seen.add(h.t), true)));
  const news = all.map((h) => `[${h.place}] ${h.t}${h.d ? `\n    ${h.d}` : ''}`).join('\n');
  const lines = `Dzisiejsze wiadomości:\n${news}\n\n${await recentColumns(db, day)}`;

  let items: unknown = null;
  let raw: string | null = null;
  let model: string | null = null;
  let error: string | null = null;
  if (!key) error = 'GEMINI_API_KEY is not set';
  else if (all.length < 4) error = `Too few headlines could be read (${report.join('; ')})`;
  else {
    const got = await askGemini(key, lines);
    if ('error' in got) error = got.error;
    else {
      raw = got.raw.slice(0, 38_000);
      model = got.model;
      try {
        items = checkWorld(JSON.parse(got.raw));
        if (!items) error = 'The answer did not pass the check';
      } catch {
        error = 'The answer was not JSON';
      }
    }
  }

  const row = {
    day,
    items,
    headlines: all.slice(0, 60),
    raw,
    model,
    error,
    attempts: (existing?.attempts ?? 0) + 1,
    // a column written again on demand starts over as new
    status: 'new',
    updated_at: new Date().toISOString(),
  };
  const { error: saveError } = await db.from('paper_world').upsert(row, { onConflict: 'day' });
  if (saveError) return json({ day, error: saveError.message }, 500);
  // the admin sees everything; anyone else only learns whether it went well
  return isAdmin ? json(row) : json({ day, ok: items !== null });
});
