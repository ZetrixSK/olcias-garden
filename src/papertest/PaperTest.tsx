import { useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import PaperView from '../paper/PaperView';
import { testGarden } from '../garden/testGarden';
import { starterGarden, type GardenState } from '../garden/state';
import { logEvent, withNote, dayKeyOf, type PaperState } from '../paper/log';
import { EPISODE_COUNT, leadsFor, buildIssue } from '../paper/issue';
import { checkWorld, type WorldItem } from '../paper/world';
import { admin, useSession, useWorldRows } from './staff';
import type { Me } from '../i18n';
import { PaperArt } from '../paper/PaperArt';
import { PHOTOS, SHOTS } from '../paper/bank/shots';
import { HEADLINES } from '../paper/bank/headlines';
import { BEE_STORIES } from '../paper/bank/bee';
import { SERIALS } from '../paper/bank/serials';
import { INTRO } from '../paper/bank/intro';

type Lang = 'pl' | 'en';

const SAMPLE_WORLD: WorldItem[] = [
  {
    place: 'szczecin',
    title: { pl: 'Flagi na Wałach Chrobrego. W Bratkowie na słoneczniku', en: 'Flags on the Chrobry Embankment. In Bratkowo, on a sunflower' },
    body: {
      pl: 'Szczecin świętuje nad Odrą, z flagami i paradą. Bratkowo nie zostało w tyle: flagę zawieszono na najwyższym słoneczniku w okolicy. Słonecznik jest dumny, choć od rana trochę się pochyla.',
      en: 'Szczecin is celebrating by the Oder, with flags and a parade. Bratkowo kept up: a flag went up on the tallest sunflower around. The sunflower is proud, if leaning a little since this morning.',
    },
  },
  {
    place: 'polska',
    title: { pl: 'Poznań piecze rogale. Jeden zaginął w drodze', en: 'Poznań bakes its croissants. One went missing on the way' },
    body: {
      pl: 'Na świętego Marcina w Poznaniu znowu pieką rogale z białym makiem. Pan Jeżyk zamówił jednego „dla gości”. Goście rogala nie widzieli. Pan Jeżyk ma okruszki na kolcach i odmawia komentarza.',
      en: 'For St Martin’s Day, Poznań is baking its white-poppy-seed croissants again. Pan Jeżyk ordered one “for guests”. The guests never saw it. Pan Jeżyk has crumbs on his spines and declines to comment.',
    },
  },
];

type GardenKind = 'busy' | 'new' | 'quiet';

/** A garden for the test page, with something happening "yesterday" in the busy one. */
function gardenFor(kind: GardenKind, day: Date, note: string, since: string): GardenState {
  const at = (h: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, h).getTime();
  const base = kind === 'new' ? starterGarden(at(10)) : testGarden(at(10) - 3 * 86_400_000);
  let paper: PaperState = base.paper;
  if (kind === 'busy') {
    paper = logEvent(paper, { at: at(9), kind: 'visit', who: 'jingleton', petals: 7 });
    paper = logEvent(paper, { at: at(13), kind: 'buy', what: 'species', ref: 'lavender', name: null });
    paper = logEvent(paper, { at: at(15), kind: 'visit', who: 'rechotka', petals: 5 });
    paper = logEvent(paper, { at: at(19), kind: 'post', from: 'daniel' });
  }
  if (note.trim()) paper = withNote(paper, { id: 'test', day: dayKeyOf(day), text: note });
  paper = { ...paper, since };
  const plants = kind === 'busy' ? base.plants.map((p, i) => (i < 2 ? { ...p, waterings: [...p.waterings, at(11), at(18)] } : p)) : base.plants;
  return { ...base, plants, paper };
}

/** /test-prewritten: any day's papers, any weather, any garden, and a look at the schedule. */
export function TestPrewritten() {
  const [date, setDate] = useState(() => dayKeyOf(new Date()));
  const since = '2026-11-10';
  const [lang, setLang] = useState<Lang>('pl');
  const [me, setMe] = useState<Me>('she');
  const [sky, setSky] = useState<'clear' | 'cloudy' | 'rain'>('cloudy');
  const [night, setNight] = useState(false);
  const [kind, setKind] = useState<GardenKind>('busy');
  const [world, setWorld] = useState<'standin' | 'sample'>('standin');
  const [note, setNote] = useState('');
  const [show, setShow] = useState<'paper' | 'schedule' | 'pictures'>('paper');
  const [y, m, d] = date.split('-').map(Number) as [number, number, number];
  const day = new Date(y, m - 1, d, 12);
  const now = new Date(y, m - 1, d, 9).getTime();
  const garden = useMemo(() => gardenFor(kind, day, note, since), [kind, date, note, since]); // eslint-disable-line react-hooks/exhaustive-deps
  const weather = useMemo(() => ({ sky, night }), [sky, night]);
  const shift = (n: number) => setDate(dayKeyOf(new Date(y, m - 1, d + n, 12)));
  return (
    <div className="papertest">
      <div className="papertest-bar">
        <button onClick={() => shift(-1)}>◀</button>
        <input type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} />
        <button onClick={() => shift(1)}>▶</button>
        <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
          <option value="pl">Polski</option>
          <option value="en">English</option>
        </select>
        <select value={me} onChange={(e) => setMe(e.target.value as Me)}>
          <option value="she">to her</option>
          <option value="he">to him</option>
        </select>
        <select value={sky} onChange={(e) => setSky(e.target.value as typeof sky)}>
          <option value="clear">clear</option>
          <option value="cloudy">cloudy</option>
          <option value="rain">rain</option>
        </select>
        <label>
          <input type="checkbox" checked={night} onChange={(e) => setNight(e.target.checked)} /> night
        </label>
        <select value={kind} onChange={(e) => setKind(e.target.value as GardenKind)}>
          <option value="busy">busy garden</option>
          <option value="quiet">quiet garden</option>
          <option value="new">new garden</option>
        </select>
        <select value={world} onChange={(e) => setWorld(e.target.value as typeof world)}>
          <option value="standin">world: stand-in</option>
          <option value="sample">world: sample</option>
        </select>
        <input placeholder="his note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
        <button onClick={() => setShow('paper')}>Paper</button>
        <button onClick={() => setShow('schedule')}>Schedule</button>
        <button onClick={() => setShow('pictures')}>Pictures</button>
      </div>
      {show === 'paper' ? (
        <div className="papertest-paper">
          <PaperView key={date} garden={garden} now={now} lang={lang} me={me} weather={weather} onClose={() => {}} world={world === 'sample' ? SAMPLE_WORLD : null} />
        </div>
      ) : show === 'schedule' ? (
        <Schedule from={day} garden={garden} lang={lang} />
      ) : (
        <Pictures />
      )}
    </div>
  );
}

/** Sixty days from the chosen one: which story leads each paper, the serial's part, and repeats too close together. */
/** What each picture belongs to: its paper and its story's headline. */
function pictureTitle(k: string): string {
  const [kind, id, part] = k.split(':');
  if (kind === 'h') return `Kurier: ${HEADLINES.find((h) => h.id === id)?.title.pl ?? id}`;
  if (kind === 'hb') return `Brzęczyk: ${HEADLINES.find((h) => h.id === id)?.bee?.title.pl ?? id}`;
  if (kind === 'b') return `Brzęczyk: ${BEE_STORIES.find((b) => b.id === id)?.title.pl ?? id}`;
  if (kind === 'i') return `Kurier, dzień ${Number(id) + 1}: ${INTRO[Number(id)]?.title.pl ?? ''}`;
  if (kind === 'ib') return `Brzęczyk, dzień ${Number(id) + 1}: ${INTRO[Number(id)]?.bee?.title.pl ?? ''}`;
  if (kind === 's') {
    const serial = SERIALS.find((x) => x.id === id);
    return `Kurier, ${serial?.name.pl ?? id} (odc. ${part}): ${serial?.episodes[Number(part) - 1]?.title.pl ?? ''}`;
  }
  return k;
}

/** Every picture the papers can print: all at once, or one by one, large. */
function Pictures() {
  const all = [
    ...Object.entries(SHOTS).map(([k, shot]) => ({ k, shot, title: pictureTitle(k), tone: (k.startsWith('hb:') || k.startsWith('b:') || k.startsWith('ib:') ? 'black' : 'sepia') as 'black' | 'sepia' })),
    ...PHOTOS.map((p, i) => ({ k: `photo:${i}`, shot: p.shot, title: `Brzęczyk, Przyłapane!: ${p.caption.pl}`, tone: 'black' as const })),
  ];
  const [one, setOne] = useState<number | null>(0);
  if (one !== null) {
    const p = all[one]!;
    const go = (n: number) => setOne((one + n + all.length) % all.length);
    return (
      <div className="papertest-one">
        <div className="papertest-one-bar">
          <button onClick={() => go(-1)}>◀</button>
          <span>
            {one + 1} / {all.length}
          </span>
          <button onClick={() => go(1)}>▶</button>
          <button onClick={() => setOne(null)}>All at once</button>
        </div>
        <PaperArt shot={p.shot} label={p.title} tone={p.tone} />
        <p className="papertest-one-title">{p.title}</p>
        <p className="papertest-one-key">{p.k}</p>
      </div>
    );
  }
  return (
    <div className="papertest-pictures">
      {all.map((p, i) => (
        <figure key={p.k}>
          <button className="papertest-pick" onClick={() => setOne(i)}>
            <PaperArt shot={p.shot} label={p.title} tone={p.tone} />
          </button>
          <figcaption>{p.title}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function Schedule({ from, garden, lang }: { from: Date; garden: GardenState; lang: Lang }) {
  const days = Array.from({ length: 60 }, (_, i) => new Date(from.getFullYear(), from.getMonth(), from.getDate() + i, 12));
  const rows = days.map((day) => {
    const leads = leadsFor(day, new Date(`${garden.paper.since}T12:00:00`));
    const issue = buildIssue({ day, now: day.getTime(), garden, lang, me: 'she', weather: { sky: 'clear', night: false }, world: null });
    return { day, kurier: leads.kurier, bee: leads.bee.shared ? '= same story' : issue.bee.lead.title, shared: leads.bee.shared, serial: `${issue.kurier.serial.name} ${issue.kurier.serial.part}/${issue.kurier.serial.of}`, gossip: issue.kurier.gossip.title };
  });
  const lastSeen = new Map<string, number>();
  const shared = rows.filter((r) => r.shared).length;
  return (
    <div className="papertest-schedule">
      <p>
        First paper {garden.paper.since}. Serial episodes in the cycle: {EPISODE_COUNT}. Shared front pages in these 60 days: {shared} ({((shared / 60) * 7).toFixed(1)} a week).
      </p>
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Kurier lead</th>
            <th>Brzęczyk</th>
            <th>Serial</th>
            <th>Gossip</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const prev = lastSeen.get(r.kurier);
            lastSeen.set(r.kurier, i);
            const close = prev !== undefined && i - prev < 10;
            return (
              <tr key={i}>
                <td>{r.day.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric', month: 'numeric' })}</td>
                <td className={close ? 'warn' : ''}>
                  {r.kurier}
                  {prev !== undefined ? ` (again after ${i - prev} days)` : ''}
                </td>
                <td>{r.bee}</td>
                <td>{r.serial}</td>
                <td>{r.gossip}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

type RunResult = { day: string; items: unknown; headlines: Array<{ place: string; t: string }>; raw: string | null; model: string | null; error: string | null; attempts: number };

function AdminSignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  return (
    <form
      className="papertest-signin"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!admin) return;
        const { error: err } = await admin.auth.signInWithPassword({ email, password });
        if (err) setError(err.message);
      }}
    >
      <h1>Test the news column</h1>
      <p>Only the gardener can run it. Sign in as on the admin page.</p>
      <input type="email" placeholder="Email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      {error && <p className="error">{error}</p>}
      <button type="submit">Sign in</button>
    </form>
  );
}

/** /test-gemini: runs today's news column now and shows every step: headlines, the answer, the check, the page. */
export function TestGemini() {
  const { session, ready } = useSession();
  if (!admin) return <p className="papertest-msg">Supabase is not configured here.</p>;
  if (!ready) return null;
  if (!session) return <AdminSignIn />;
  return <GeminiRunner session={session} />;
}

function GeminiRunner({ session }: { session: Session }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Lang>('pl');
  const [preview, setPreview] = useState(false);
  const { rows, reload } = useWorldRows();
  const items = result ? checkWorld(result.items) : null;
  const garden = useMemo(() => gardenFor('busy', new Date(), '', dayKeyOf(new Date(Date.now() - 10 * 86_400_000))), []);
  const [posted, setPosted] = useState<string | null>(null);
  /** Approves a day's column, so her papers print it the next time they open. */
  const post = async (day: string) => {
    if (!admin) return;
    const { error: err } = await admin.from('paper_world').update({ status: 'approved', updated_at: new Date().toISOString() }).eq('day', day);
    if (err) setError(`Written, but not posted: ${err.message}`);
    else setPosted(day);
    reload();
  };
  const run = async (andPost: boolean) => {
    if (!admin) return;
    setBusy(true);
    setError(null);
    setPosted(null);
    const { data, error: err } = await admin.functions.invoke('paper-world', { body: { force: true }, headers: { Authorization: `Bearer ${session.access_token}` } });
    setBusy(false);
    if (err) {
      setError(err.message);
      reload();
      return;
    }
    const got = data as RunResult;
    setResult(got);
    if (andPost && checkWorld(got.items)) await post(got.day);
    else reload();
  };
  if (preview && items) {
    return (
      <div className="papertest">
        <div className="papertest-bar">
          <button onClick={() => setPreview(false)}>← Back</button>
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)}>
            <option value="pl">Polski</option>
            <option value="en">English</option>
          </select>
        </div>
        <div className="papertest-paper">
          <PaperView garden={garden} now={Date.now()} lang={lang} me="she" weather={{ sky: 'cloudy', night: false }} onClose={() => setPreview(false)} world={items} />
        </div>
      </div>
    );
  }
  return (
    <main className="papertest-gemini">
      <h1>The news column</h1>
      <p>
        Runs today’s column now: reads the headlines, asks Gemini, checks the answer. It replaces today’s column and marks it new, so it only reaches her once you approve it (or if the column is
        switched to go out every day). “Write and post” approves it straight away if it passes the check, so it goes in her paper. Each run is one Gemini request.
      </p>
      <div className="papertest-actions">
        <button onClick={() => void run(true)} disabled={busy}>
          {busy ? 'Writing… (up to a minute)' : 'Write and post today’s column'}
        </button>
        <button onClick={() => void run(false)} disabled={busy}>
          Write only (don’t post)
        </button>
      </div>
      {error && <p className="error">{error}</p>}
      {posted && (
        <p className="ok">
          Posted for {posted}. Her paper prints it the next time it opens, unless that phone already kept a column for today.
        </p>
      )}
      {result && (
        <>
          <h2>
            {result.day} · {result.model ?? 'no model'} · attempt {result.attempts}
          </h2>
          <p className={items ? 'ok' : 'error'}>{items ? `Passed the check: ${items.length} items.` : `Did not pass: ${result.error ?? 'unknown'}`}</p>
          {items && (
            <>
              {items.map((it, i) => (
                <div key={i} className="papertest-item">
                  <b>
                    [{it.place}] {it.title.pl}
                  </b>
                  <p>{it.body.pl}</p>
                  <p className="en">
                    {it.title.en}: {it.body.en}
                  </p>
                </div>
              ))}
              <div className="papertest-actions">
                <button onClick={() => setPreview(true)}>See it in the paper</button>
                {posted !== result.day && <button onClick={() => void post(result.day)}>Post this one</button>}
              </div>
            </>
          )}
          <details>
            <summary>Headlines it read ({result.headlines.length})</summary>
            <ul>
              {result.headlines.map((h, i) => (
                <li key={i}>
                  [{h.place}] {h.t}
                </li>
              ))}
            </ul>
          </details>
          <details>
            <summary>Gemini’s raw answer</summary>
            <pre>{result.raw ?? '(none)'}</pre>
          </details>
        </>
      )}
      <h2>The last few days</h2>
      <ul>
        {rows.map((r) => {
          const ok = checkWorld(r.items);
          return (
            <li key={r.day}>
              {r.day} · {r.status} · {ok ? ok.map((i) => i.title.pl).join(' / ') : `failed: ${r.error ?? ''}`}
            </li>
          );
        })}
      </ul>
    </main>
  );
}
