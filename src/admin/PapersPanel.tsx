import { useCallback, useEffect, useState } from 'react';
import type { GardenState } from '../garden/state';
import { dayKeyOf, MAX_NOTE_TEXT, paperDate } from '../paper/log';
import { checkWorld } from '../paper/world';
import { admin } from './data';
import { Panel, type Send } from './Panels';

type WorldRow = { day: string; items: unknown; status: 'new' | 'approved' | 'dropped'; error: string | null; model: string | null; attempts: number; updated_at: string };

/** Today's news column on the server, the switch that sends new ones to her without approval, and approving or dropping a day. */
export function useWorldRows(): { rows: WorldRow[]; live: boolean | null; reload: () => void; setLive: (v: boolean) => Promise<void>; setStatus: (day: string, s: WorldRow['status']) => Promise<void> } {
  const [rows, setRows] = useState<WorldRow[]>([]);
  const [live, setLiveState] = useState<boolean | null>(null);
  const reload = useCallback(() => {
    if (!admin) return;
    void admin
      .from('paper_world')
      .select('day, items, status, error, model, attempts, updated_at')
      .order('day', { ascending: false })
      .limit(7)
      .then(({ data }) => setRows((data as WorldRow[] | null) ?? []));
    void admin.rpc('paper_live').then(({ data }) => setLiveState(data === true));
  }, []);
  useEffect(reload, [reload]);
  const setLive = async (v: boolean) => {
    if (!admin) return;
    await admin.rpc('set_paper_live', { p_live: v });
    reload();
  };
  const setStatus = async (day: string, status: WorldRow['status']) => {
    if (!admin) return;
    await admin.from('paper_world').update({ status, updated_at: new Date().toISOString() }).eq('day', day);
    reload();
  };
  return { rows, live, reload, setLive, setStatus };
}

/**
 * Her morning papers: a note for a day's Kurier (it shows taped in, on that day only), and the news
 * column the server writes each dawn, which reaches her only once approved or switched live.
 */
export function PapersPanel({ garden, send }: { garden: GardenState; send: Send }) {
  const today = dayKeyOf(paperDate(Date.now()));
  const [day, setDay] = useState(today);
  const [text, setText] = useState('');
  const { rows, live, setLive, setStatus } = useWorldRows();
  const upcoming = garden.paper.notes.filter((n) => n.day >= today);
  return (
    <Panel title="Her morning papers">
      <form
        className="paper-note-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          void send('papernote', { day, text: text.trim() }).then(() => setText(''));
        }}
      >
        <p className="hint">A note from you, taped into that day’s Kurier. Leave a day without one and the page simply fills up with other things.</p>
        <label>
          Day
          <input type="date" value={day} min={today} onChange={(e) => setDay(e.target.value || today)} />
        </label>
        <textarea value={text} maxLength={MAX_NOTE_TEXT} rows={3} placeholder="Dzień dobry, słoneczko…" onChange={(e) => setText(e.target.value)} />
        <button type="submit" className="primary" disabled={!text.trim()}>
          Put it in the paper
        </button>
      </form>
      {upcoming.length > 0 && (
        <ul className="history">
          {upcoming.map((n) => (
            <li key={n.id}>
              <span className="what">
                {n.day}: {n.text}
              </span>
              <button type="button" onClick={() => void send('papernote', { day: n.day, text: '' })}>
                Take out
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="hint">
        The news column (“Ze świata”), written each dawn by Gemini. {live === null ? '' : live ? 'It goes to her as soon as it’s written.' : 'Only what you approve goes to her.'}
      </p>
      {live !== null && (
        <div className="choices">
          <button type="button" className={live ? '' : 'on'} disabled={!live} onClick={() => void setLive(false)}>
            Approve each day first
          </button>
          <button type="button" className={live ? 'on' : ''} disabled={live} onClick={() => void setLive(true)}>
            Send it to her every day
          </button>
        </div>
      )}
      <ul className="history">
        {rows.length === 0 && <li>No columns written yet. The first comes at dawn, once the Gemini key is set.</li>}
        {rows.map((r) => {
          const items = checkWorld(r.items);
          return (
            <li key={r.day} className={r.status === 'dropped' ? 'skipped' : r.status === 'approved' ? 'applied' : ''}>
              <span className="what">
                {r.day} · {r.status}
                {items ? `: ${items.map((i) => i.title.pl).join(' / ')}` : ` · failed: ${r.error ?? 'unknown'}`}
              </span>
              {items && (
                <span className="choices">
                  <button type="button" disabled={r.status === 'approved'} onClick={() => void setStatus(r.day, 'approved')}>
                    Approve
                  </button>
                  <button type="button" disabled={r.status === 'dropped'} onClick={() => void setStatus(r.day, 'dropped')}>
                    Drop
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="hint">
        <a href="/test-gemini">Test the news column</a> · <a href="/test-prewritten">Leaf through any day’s papers</a>
      </p>
    </Panel>
  );
}
