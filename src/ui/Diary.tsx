import { useState } from 'react';
import { dateOfKey, dayKey, MAX_ENTRY, monthGrid, MOOD_NAMES, MOODS, onThisDay, type Diary, type Mood } from '../garden/diary';
import { MoodFace } from './Moods';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const monthTitle = (y: number, m: number) => new Date(y, m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
/** The day's name; a page from an earlier year says which year too. */
const dayTitle = (key: string) => {
  const d = dateOfKey(key);
  const year = d.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined;
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year });
};

/** The month on one page: each day she wrote shows her mood face, or a little ink mark if she chose none. */
function Calendar({ diary, today, onOpen, onClose }: { diary: Diary; today: string; onOpen: (key: string) => void; onClose: () => void }) {
  const t = dateOfKey(today);
  const [shown, setShown] = useState({ y: t.getFullYear(), m: t.getMonth() });
  const turn = (by: number) => setShown(({ y, m }) => ({ y: m + by < 0 ? y - 1 : m + by > 11 ? y + 1 : y, m: (m + by + 12) % 12 }));
  const atToday = shown.y === t.getFullYear() && shown.m === t.getMonth();
  const written = Object.keys(diary).filter((k) => k.startsWith(`${shown.y}-${String(shown.m + 1).padStart(2, '0')}`)).length;
  const memories = onThisDay(diary, today);
  return (
    <>
      <div className="book-page diary-page">
        {memories.map((m) => (
          <button key={m.key} className="diary-memory" onClick={() => onOpen(m.key)}>
            <span className="diary-memory-head">
              {m.entry.mood && <MoodFace mood={m.entry.mood} size={22} />}
              {m.yearsAgo === 1 ? 'A year ago today' : `${m.yearsAgo} years ago today`}
            </span>
            <span className="diary-memory-text">{m.entry.text.trim() || (m.entry.mood ? MOOD_NAMES[m.entry.mood] : '')}</span>
          </button>
        ))}
        <div className="diary-month">
          <button aria-label="Previous month" onClick={() => turn(-1)}>‹</button>
          <h2>{monthTitle(shown.y, shown.m)}</h2>
          <button aria-label="Next month" onClick={() => turn(1)} disabled={atToday}>›</button>
        </div>
        <div className="diary-grid" role="grid">
          {WEEKDAYS.map((d) => (
            <span key={d} className="diary-weekday">{d}</span>
          ))}
          {monthGrid(shown.y, shown.m).flat().map((d, i) => {
            if (!d) return <span key={i} />;
            const key = dayKey(d);
            const entry = diary[key];
            const future = key > today;
            return (
              <button
                key={key}
                className={`diary-day${key === today ? ' today' : ''}${entry ? ' has-entry' : ''}`}
                disabled={future}
                aria-label={`${dayTitle(key)}${entry ? `, ${entry.mood ? MOOD_NAMES[entry.mood] : 'written'}` : ''}`}
                onClick={() => onOpen(key)}
              >
                <span className="diary-num">{d.getDate()}</span>
                {entry?.mood ? <MoodFace mood={entry.mood} size={22} /> : entry ? <span className="diary-ink" aria-hidden="true" /> : null}
              </button>
            );
          })}
        </div>
        <p className="diary-count">{written ? `${written} ${written === 1 ? 'day' : 'days'} written this month` : 'Nothing written this month yet'}</p>
      </div>
      <div className="letter-actions book-actions">
        <button className="quiet" onClick={onClose}>Close</button>
        <button onClick={() => onOpen(today)}>{diary[today] ? 'Open today' : 'Write today'}</button>
      </div>
    </>
  );
}

/** One day's page: how she felt, what happened, and Save. */
function DayPage({ day, entry, onSave, onDelete, onBack }: {
  day: string;
  entry: Diary[string] | undefined;
  onSave: (mood: Mood | null, text: string) => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const [mood, setMood] = useState<Mood | null>(entry?.mood ?? null);
  const [text, setText] = useState(entry?.text ?? '');
  const [asking, setAsking] = useState<'leave' | 'delete' | null>(null);
  const dirty = mood !== (entry?.mood ?? null) || text !== (entry?.text ?? '');
  const empty = !mood && !text.trim();
  return (
    <>
      <div className="book-page diary-page">
        <h2 className="diary-day-title">{dayTitle(day)}</h2>
        <p className="diary-label">How was it?</p>
        <div className="mood-grid" role="radiogroup" aria-label="Mood">
          {MOODS.map((m) => (
            <button key={m} role="radio" aria-checked={mood === m} aria-label={MOOD_NAMES[m]} onClick={() => setMood(mood === m ? null : m)}>
              <MoodFace mood={m} size={30} />
              <span>{MOOD_NAMES[m]}</span>
            </button>
          ))}
        </div>
        <textarea
          className="journal-note diary-text"
          value={text}
          maxLength={MAX_ENTRY}
          placeholder="Dear diary…"
          aria-label="Diary entry"
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="letter-actions book-actions">
        {asking === 'leave' ? (
          <>
            <span>Leave without saving?</span>
            <button className="danger" onClick={onBack}>Leave</button>
            <button onClick={() => setAsking(null)}>Stay</button>
          </>
        ) : asking === 'delete' ? (
          <>
            <span>Tear out this page?</span>
            <button className="danger" onClick={onDelete}>Yes</button>
            <button onClick={() => setAsking(null)}>No</button>
          </>
        ) : (
          <>
            <button className="quiet" onClick={() => (dirty ? setAsking('leave') : onBack())}>Back</button>
            {entry && <button className="quiet" onClick={() => setAsking('delete')}>Delete</button>}
            <button data-sound="page" disabled={!dirty || (empty && !entry)} onClick={() => onSave(mood, text)}>Save</button>
          </>
        )}
      </div>
    </>
  );
}

/** Her diary: a calendar of the month, and a page for each day she writes. */
export function DiaryBook({ diary, now, onSave, onDelete, onClose }: {
  diary: Diary;
  now: number;
  onSave: (key: string, mood: Mood | null, text: string) => void;
  onDelete: (key: string) => void;
  onClose: () => void;
}) {
  const today = dayKey(new Date(now));
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <div className="scrim letter-scrim" onClick={open ? undefined : onClose} />
      <div className="book diary" role="dialog" aria-label="Diary">
        {open ? (
          <DayPage
            key={open}
            day={open}
            entry={diary[open]}
            onSave={(mood, text) => {
              onSave(open, mood, text);
              setOpen(null);
            }}
            onDelete={() => {
              onDelete(open);
              setOpen(null);
            }}
            onBack={() => setOpen(null)}
          />
        ) : (
          <Calendar diary={diary} today={today} onOpen={setOpen} onClose={onClose} />
        )}
      </div>
    </>
  );
}

export const DIARY_ICON = (
  <g>
    <path d="M-8,-10 L8,-10 L8,10 L-8,10 Z" />
    <path d="M-5,-10 L-5,10" />
    <path d="M-1,-5 L5,-5 M-1,-1 L5,-1 M-1,3 L3,3" />
    <path d="M4,-10 L4,-4 L5.6,-5.6 L7.2,-4 L7.2,-10" fill="currentColor" stroke="none" opacity="0.7" />
  </g>
);
