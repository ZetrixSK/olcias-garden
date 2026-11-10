import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_SETTINGS, parseSave, starterGarden, type SlotId } from '../garden/state';
import { applyAction } from '../remote/actions';
import { seasonShown } from '../theme/seasons';
import { clockWeather } from '../weather/weather';
import { useWeather } from '../weather/useWeather';
import { admin, relabel, useActions, useGardens, useSend, useSession, type Sent } from './data';
import { activeMoments, ago, isOnline, withPending, type ActionRow, type GardenRow } from './logic';
import { BookPanel, GardenPanel, History, NewPlantPanel, PlantPanel, VisitorsPanel, type Send } from './Panels';
import { World } from './World';
import { DesignPanel } from './DesignPanel';
import { PapersPanel } from './PapersPanel';

function useClock(): number {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 20_000);
    return () => window.clearInterval(t);
  }, []);
  return now;
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <main className="admin sign-in">
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!admin) return;
          setBusy(true);
          setError(null);
          const { error: err } = await admin.auth.signInWithPassword({ email, password });
          setBusy(false);
          if (err) setError(err.message);
        }}
      >
        <h1>Olcia's garden</h1>
        <p className="hint">Gardener's door</p>
        <label>
          Email
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="primary" disabled={busy}>
          {busy ? 'Opening…' : 'Open'}
        </button>
      </form>
    </main>
  );
}

function GardenList({ gardens, chosen, onChoose, now }: { gardens: GardenRow[]; chosen: string | null; onChoose: (id: string) => void; now: number }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  return (
    <ul className="gardens">
      {gardens.map((g) => {
        const seen = Date.parse(g.last_seen);
        return (
          <li key={g.id} className={g.id === chosen ? 'on' : ''}>
            {editing === g.id ? (
              <form
                className="row"
                onSubmit={async (e) => {
                  e.preventDefault();
                  await relabel(g.id, draft.trim());
                  setEditing(null);
                }}
              >
                <input autoFocus value={draft} maxLength={60} onChange={(e) => setDraft(e.target.value)} />
                <button type="submit">Save</button>
              </form>
            ) : (
              <button type="button" className="garden-pick" onClick={() => onChoose(g.id)}>
                <span className={`dot${isOnline(seen, now) ? ' live' : ''}`} />
                <strong>{g.label || 'Unnamed'}</strong>
                <span className="seen">
                  {isOnline(seen, now) ? 'open now' : `seen ${ago(seen, now)}`} · opened {g.open_count}×
                </span>
              </button>
            )}
            {editing !== g.id && (
              <button
                type="button"
                className="quiet"
                onClick={() => {
                  setDraft(g.label);
                  setEditing(g.id);
                }}
              >
                Rename
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

type Picked = { kind: 'plant'; id: string } | { kind: 'empty'; slot: SlotId } | null;

type Source = {
  gardens: GardenRow[];
  loading: boolean;
  error: string | null;
  useActionsFor: (id: string | null) => ActionRow[];
  useSendTo: (id: string | null) => (kind: string, payload: Record<string, unknown>) => Promise<Sent>;
  signOut: () => void;
};

function LiveDashboard() {
  const { gardens, loading, error } = useGardens(true);
  return (
    <Dashboard
      source={{ gardens, loading, error, useActionsFor: useActions, useSendTo: useSend, signOut: () => void admin?.auth.signOut() }}
    />
  );
}

function Dashboard({ source }: { source: Source }) {
  const now = useClock();
  const { gardens, loading, error } = source;
  const [chosen, setChosen] = useState<string | null>(null);
  const [view, setView] = useState<'room' | 'shelves'>('room');
  const [picked, setPicked] = useState<Picked>(null);
  const [toast, setToast] = useState<string | null>(null);

  // the garden seen most recently, until another is chosen
  const id = chosen ?? gardens[0]?.id ?? null;
  const row = gardens.find((g) => g.id === id) ?? null;
  const uploaded = useMemo(() => (row ? parseSave(row.garden, Date.now()) : null), [row]);
  const live = source.useActionsFor(id);
  // what was just sent shows straight away, before the live history echoes it back
  const [mine, setMine] = useState<ActionRow[]>([]);
  const actions = useMemo(() => {
    const known = new Set(live.map((a) => a.id));
    return [...mine.filter((a) => !known.has(a.id) && a.garden === id), ...live];
  }, [live, mine, id]);
  const sendRaw = source.useSendTo(id);
  const { weather } = useWeather(uploaded?.settings ?? DEFAULT_SETTINGS, now);
  const moments = useMemo(() => activeMoments(actions, now), [actions, now]);
  // her garden as it will be once her phone catches up, so every change shows at once
  const garden = useMemo(
    () => (uploaded ? withPending(uploaded, actions, Date.now(), { night: weather.night, sky: weather.sky, season: seasonShown(Date.now()) }) : null),
    [uploaded, actions, weather.night, weather.sky],
  );

  useEffect(() => setPicked(null), [id]);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const send: Send = useCallback(
    async (kind, payload) => {
      const r = await sendRaw(kind, payload);
      if (r.error !== null) return setToast(`Not sent: ${r.error}`);
      const row = r.row;
      if (row) setMine((list) => [row, ...list].slice(0, 30));
      setToast('Sent');
    },
    [sendRaw],
  );

  const plant = picked?.kind === 'plant' ? garden?.plants.find((p) => p.id === picked.id) : undefined;
  const waiting = actions.filter((a) => a.status === 'pending').length;
  const seen = row ? Date.parse(row.last_seen) : 0;

  return (
    <main className="admin">
      <header className="top">
        <h1>Olcia's garden</h1>
        <button type="button" className="quiet" onClick={source.signOut}>
          Sign out
        </button>
      </header>

      {error && <p className="error">{error}</p>}
      {!loading && gardens.length === 0 && <p className="hint">No gardens yet. One appears as soon as the garden is opened on a phone.</p>}
      <GardenList gardens={gardens} chosen={id} onChoose={setChosen} now={now} />

      {row && garden && (
        <div className="layout">
          <div className="world-col">
            <p className="status">
              {isOnline(seen, now) ? 'Her garden is open right now.' : `Last open ${ago(seen, now)}; changes wait until she opens it.`}
              {waiting > 0 && ` ${waiting} waiting.`}
            </p>
            <div className="choices" role="group" aria-label="What you're looking at">
              <button type="button" className={view === 'room' ? 'on' : ''} aria-pressed={view === 'room'} onClick={() => setView('room')}>Look at the window</button>
              <button type="button" className={view === 'shelves' ? 'on' : ''} aria-pressed={view === 'shelves'} onClick={() => setView('shelves')}>Look at the shelves</button>
            </div>
            <World
              garden={garden}
              weather={weather}
              now={now}
              view={view}
              selectedId={plant?.id ?? null}
              moments={moments}
              onPlant={(pid) => setPicked({ kind: 'plant', id: pid })}
              onEmpty={(slot) => setPicked({ kind: 'empty', slot })}
            />
            <p className="hint">Tap a plant to tend it. On the shelves, tap an empty place to plant something.</p>
          </div>
          <div className="panels-col">
            {plant && <PlantPanel key={plant.id} garden={garden} plant={plant} now={now} send={send} onClose={() => setPicked(null)} />}
            {picked?.kind === 'empty' && <NewPlantPanel key={picked.slot} garden={garden} slot={picked.slot} send={send} onClose={() => setPicked(null)} />}
            <History actions={actions} garden={garden} now={now} />
            <GardenPanel garden={garden} weather={weather} now={now} send={send} />
            <BookPanel garden={garden} send={send} />
            <VisitorsPanel garden={garden} send={send} />
            <DesignPanel garden={garden} send={send} />
            <PapersPanel garden={garden} send={send} />
          </div>
        </div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

/**
 * Dev only (/admin.html?demo): the page with a starter garden kept in memory. Actions are carried
 * out at once by the same code her phone uses, so the page can be tried without the database.
 */
function DemoDashboard() {
  const [row, setRow] = useState<GardenRow>(() => {
    const t = Date.now();
    const g = starterGarden(t);
    const bloom = g.plants.find((p) => p.display === 'sill-2')!;
    const garden = { ...g, pressed: [{ id: 'demo-pressed', plantId: bloom.id, species: bloom.species, at: t - 86_400_000, variety: null, design: null, name: null, note: '' }] };
    return { id: 'demo', label: 'Demo garden', garden, save_version: 4, first_seen: new Date(t).toISOString(), last_seen: new Date(t).toISOString(), open_count: 3 };
  });
  const [actions, setActions] = useState<ActionRow[]>([]);
  const rowRef = useRef(row);
  // like a real phone: each action waits a moment as "waiting", then is carried out and uploaded
  const send = useCallback(async (kind: string, payload: Record<string, unknown>) => {
    const t = Date.now();
    const sent: ActionRow = { id: `demo-${t}-${Math.random()}`, garden: 'demo', kind, payload, created_at: new Date(t).toISOString(), status: 'pending', done_at: null, reason: null };
    setActions((list) => [sent, ...list]);
    window.setTimeout(() => {
      const now = Date.now();
      const weather = clockWeather(new Date(now));
      const world = { night: weather.night, sky: weather.sky, season: seasonShown(now) };
      const r = rowRef.current;
      const { garden, outcome } = applyAction(parseSave(r.garden, now)!, sent, now, world);
      rowRef.current = { ...r, garden, last_seen: new Date(now).toISOString() };
      setRow(rowRef.current);
      setActions((list) => list.map((a) => (a.id === sent.id ? { ...a, status: outcome.status, reason: outcome.reason, done_at: new Date(now).toISOString() } : a)));
    }, 3000);
    return { error: null, row: null } as const;
  }, []);
  return (
    <Dashboard
      source={{ gardens: [row], loading: false, error: null, useActionsFor: () => actions, useSendTo: () => send, signOut: () => {} }}
    />
  );
}

export function AdminApp() {
  const { session, ready } = useSession();
  if (import.meta.env.DEV && new URLSearchParams(location.search).has('demo')) return <DemoDashboard />;
  if (!admin) return <main className="admin"><p className="error">Supabase isn't configured for this build.</p></main>;
  if (!ready) return <main className="admin" />;
  return session ? <LiveDashboard /> : <SignIn />;
}
