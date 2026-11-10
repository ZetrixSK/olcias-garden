// The Kurier's news column, written once a day at dawn.
//
// Reads the day's public headlines (Szczecin first, then Poland), asks Gemini to tell two or three
// light ones as the little town of Bratkowo would, checks the answer with the same code the garden
// uses (world.ts, a copy of src/paper/world.ts), and keeps it in public.paper_world. Nothing about
// any garden or anyone's phone is ever sent anywhere.
//
// Anyone may call it, but it only ever writes a day once (with two retries if writing failed), so
// at most three calls to Gemini a day. Writing again on demand needs the admin's sign-in.
//
// Needs the secret GEMINI_API_KEY (Google AI Studio). GEMINI_MODEL may name a model to use first.

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { checkWorld } from './world.ts';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const FEEDS: Array<{ place: string; url: string }> = [
  { place: 'szczecin', url: 'https://news.google.com/rss/search?q=Szczecin&hl=pl&gl=PL&ceid=PL:pl' },
  { place: 'polska', url: 'https://news.google.com/rss?hl=pl&gl=PL&ceid=PL:pl' },
  { place: 'polska', url: 'https://news.google.com/rss/search?q=ciekawostki+OR+kultura+OR+nauka+OR+przyroda&hl=pl&gl=PL&ceid=PL:pl' },
  { place: 'polska', url: 'https://news.google.com/rss/search?q=sport+Polska+OR+festiwal+OR+koncert&hl=pl&gl=PL&ceid=PL:pl' },
];

const MODELS = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-2.0-flash'];

/** The day in Poland, as YYYY-MM-DD. */
const warsawDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/** The headlines of one feed, without the source's name tacked on the end. */
async function headlines(url: string): Promise<string[]> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (garden newspaper)' }, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return [];
    const xml = await res.text();
    const out: string[] = [];
    for (const m of xml.matchAll(/<item>[\s\S]*?<title>([\s\S]*?)<\/title>/g)) {
      const t = decode(m[1] ?? '').replace(/\s+-\s+[^-]{2,60}$/, '');
      if (t.length > 12 && t.length < 220) out.push(t);
      if (out.length >= 14) break;
    }
    return out;
  } catch {
    return [];
  }
}

const SYSTEM = `Piszesz rubrykę "Ze świata" w Kurierze Bratkowskim: porannej gazecie wymyślonego, przytulnego miasteczka Bratkowo, które czyta jedna osoba: młoda kobieta ze Szczecina, która kocha bratki, psy, rzeczy przytulne i trochę wiedźmowe.

Dostajesz prawdziwe nagłówki z dzisiejszych wiadomości. Wybierz z nich 2 albo 3 LEKKIE, ciekawe lub zabawne sprawy (ciekawostki, kultura, sport, przyroda, pogoda, święta, wydarzenia lokalne). Jeśli jest coś miłego ze Szczecina, jedna pozycja ma być ze Szczecina (place: "szczecin"); reszta z Polski (place: "polska") albo ze świata (place: "swiat").

Nigdy nie pisz o: śmierci, wypadkach, przemocy, wojnie, zamachach, polityce partyjnej, katastrofach, chorobach, przestępstwach, ani niczym, co mogłoby zasmucić czy zaniepokoić. Jeśli lekkich nagłówków jest mało, wybierz zwykłe rzeczy (pogoda, sezon, sport) i opowiedz je pogodnie.

Każda pozycja: najpierw jedno zdanie o tym, co się naprawdę wydarzyło (bez zmyślania faktów, liczb ani nazwisk, których nie ma w nagłówku), potem jak zareagowało Bratkowo. Mieszkańcy Bratkowa: Pan Jeżyk (jeż, prowadzi stragan z nasionami, lubi drzemki i herbatę), Pani Ćma (ćma, nocny targ, kocha światło), Pani Jadzia (robi na drutach swetry dla wszystkiego), Atrament (czarny kot, radny, śpi), Rechotka (żaba w żółtych kaloszach), Pan listonosz (dumny z wąsów), Wiedźmusia (uczennica czarownicy, kapelusz o rozmiar za duży), Duszek (grzeczny duch ze strychu), Jingleton (puchaty trzmiel, kocha stokrotki), kret Zenon, sowa (stróż nocny), wiewiórka Halinka (gubi orzechy), Milton (jajko, które się nie wykluwa; mówi bardzo mało). Nie wymyślaj nowych postaci.

Styl: ciepły, dowcipny, krótki, jak w prawdziwej małomiasteczkowej gazecie. Bez emotek, bez wykrzykników co zdanie. Tytuł 4-10 słów. Treść 2-3 zdania, 160-380 znaków. Polski poprawny i naturalny. Podaj też wersję angielską (en) tego samego, naturalną, nie dosłowną.

Przykład dobrego stylu (pl): tytuł "Poznań piecze rogale. Jeden zaginął w drodze", treść "Na świętego Marcina w Poznaniu znowu pieką rogale z białym makiem. Pan Jeżyk zamówił jednego „dla gości”. Goście rogala nie widzieli. Pan Jeżyk ma okruszki na kolcach i odmawia komentarza."
Przykład (pl): tytuł "Flagi na Wałach Chrobrego. W Bratkowie na słoneczniku", treść "Szczecin świętuje nad Odrą, z flagami i paradą. Bratkowo nie zostało w tyle: flagę zawieszono na najwyższym słoneczniku w okolicy. Słonecznik jest dumny, choć od rana trochę się pochyla."

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
          title: { type: 'OBJECT', properties: { pl: { type: 'STRING' }, en: { type: 'STRING' } }, required: ['pl', 'en'] },
          body: { type: 'OBJECT', properties: { pl: { type: 'STRING' }, en: { type: 'STRING' } }, required: ['pl', 'en'] },
        },
        required: ['place', 'title', 'body'],
      },
    },
  },
  required: ['items'],
};

async function askGemini(key: string, lines: string): Promise<{ raw: string; model: string } | { error: string }> {
  const preferred = Deno.env.get('GEMINI_MODEL');
  const models = preferred ? [preferred, ...MODELS.filter((m) => m !== preferred)] : MODELS;
  let last = 'no model answered';
  for (const model of models) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        signal: AbortSignal.timeout(45_000),
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: `Dzisiejsze nagłówki:\n${lines}` }] }],
          generationConfig: { responseMimeType: 'application/json', responseSchema: SCHEMA, temperature: 0.9 },
        }),
      });
      if (!res.ok) {
        last = `${model}: HTTP ${res.status} ${(await res.text()).slice(0, 300)}`;
        continue;
      }
      const data = await res.json();
      const raw = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
      if (!raw) {
        last = `${model}: empty answer`;
        continue;
      }
      return { raw, model };
    } catch (e) {
      last = `${model}: ${e instanceof Error ? e.message : String(e)}`;
    }
  }
  return { error: last };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
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
    const asCaller = createClient(url, anon, { global: { headers: { Authorization: auth } }, auth: { persistSession: false } });
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
  const lists = await Promise.all(FEEDS.map(async (f) => (await headlines(f.url)).map((t) => ({ place: f.place, t }))));
  const seen = new Set<string>();
  const all = lists.flat().filter((h) => (seen.has(h.t) ? false : (seen.add(h.t), true)));
  const lines = all.map((h) => `[${h.place}] ${h.t}`).join('\n');

  let items: unknown = null;
  let raw: string | null = null;
  let model: string | null = null;
  let error: string | null = null;
  if (!key) error = 'GEMINI_API_KEY is not set';
  else if (all.length < 4) error = 'Too few headlines could be read';
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
