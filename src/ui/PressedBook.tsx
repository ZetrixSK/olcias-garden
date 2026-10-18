import { useLayoutEffect, useRef, useState } from 'react';
import { designRef, NO_DESIGNS, PANSY_PRESET_NAMES, type PansyPreset } from '../garden/designs';
import { MAX_NOTE, type Pressing } from '../garden/pressed';
import { SPECIES } from '../garden/species';
import { hash, rng } from '../garden/vines';
import { pansyPalette } from '../plants/looks';
import { PressedSprig } from '../plants/Pressed';

const PER_PAGE = 4;

/** What's written under a pressed flower: the plant's own name, her bratek's name, a variety's name, or just the plant's kind. */
export function pressedName(p: Pressing): string {
  if (p.name) return p.name;
  if (p.design?.name) return p.design.name;
  if (p.variety && p.variety !== 'mix') return PANSY_PRESET_NAMES[p.variety as PansyPreset] ?? SPECIES[p.species].polish;
  return SPECIES[p.species].polish;
}

const dateText = (t: number) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

/**
 * One flower, laid flat on the page at a slight angle. The drawing is fitted to its own outline,
 * so a short daisy and a tall tulip both fill their place on the page.
 */
function Specimen({ p }: { p: Pressing }) {
  const ref = useRef<SVGGElement>(null);
  const [box, setBox] = useState('-60 -140 120 150');
  const tilt = (rng(hash(`${p.id}/tilt`))() - 0.5) * 24;
  const palette = p.design ? pansyPalette(designRef(p.design.id), { pansies: [p.design], pots: [] }) : pansyPalette(p.variety, NO_DESIGNS);
  useLayoutEffect(() => {
    const b = ref.current?.getBBox();
    if (!b || !b.width) return;
    const pad = 6;
    setBox(`${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
  }, [p.id]);
  return (
    <svg className="specimen-art" viewBox={box} aria-hidden="true">
      {/* measured from outside the tilt, so the box fits the flower as it lies on the page */}
      <g ref={ref}>
        <g transform={`rotate(${tilt.toFixed(1)})`}>
          <PressedSprig species={p.species} palette={palette} seed={hash(p.id)} />
        </g>
      </g>
    </svg>
  );
}

/**
 * One page of the journal, opened from the book: the flower large, its name and date, and what
 * she wrote beside it. Writing is kept as she types; there's nothing to save.
 */
function JournalPage({ p, onNote, onRemove, onBack }: {
  p: Pressing;
  onNote: (note: string) => void;
  onRemove: () => void;
  onBack: () => void;
}) {
  const [asking, setAsking] = useState(false);
  return (
    <>
      <div className="book-page journal-page">
        <div className="journal-art">
          <Specimen p={p} />
          <span className="tape" aria-hidden="true" />
        </div>
        <p className="specimen-name">{pressedName(p)}</p>
        <p className="specimen-date">{dateText(p.at)}</p>
        <textarea
          className="journal-note"
          value={p.note}
          maxLength={MAX_NOTE}
          placeholder="Write something beside it…"
          aria-label="Your note"
          onChange={(e) => onNote(e.target.value)}
        />
      </div>
      <div className="letter-actions book-actions">
        {asking ? (
          <>
            <span>Take it out?</span>
            <button className="danger" onClick={onRemove}>
              Yes
            </button>
            <button onClick={() => setAsking(false)}>No</button>
          </>
        ) : (
          <>
            <button className="quiet" onClick={() => setAsking(true)}>
              Take out
            </button>
            <button onClick={onBack}>Back to the book</button>
          </>
        )}
      </div>
    </>
  );
}

export function PressedBook({ pressed, onNote, onRemove, onClose }: {
  pressed: Pressing[];
  onNote: (id: string, note: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const pages = Math.max(1, Math.ceil(pressed.length / PER_PAGE));
  // the book opens on the newest page
  const [page, setPage] = useState(pages - 1);
  const [open, setOpen] = useState<string | null>(null);
  const shown = Math.min(page, pages - 1);
  const onPage = pressed.slice(shown * PER_PAGE, shown * PER_PAGE + PER_PAGE);
  const opened = open ? pressed.find((p) => p.id === open) : undefined;
  const turn = (to: number) => setPage(Math.max(0, Math.min(pages - 1, to)));
  return (
    <>
      <div className="scrim letter-scrim" onClick={onClose} />
      <div className="book" role="dialog" aria-label="Pressed flowers">
        {opened ? (
          <JournalPage
            key={opened.id}
            p={opened}
            onNote={(note) => onNote(opened.id, note)}
            onRemove={() => {
              onRemove(opened.id);
              setOpen(null);
            }}
            onBack={() => setOpen(null)}
          />
        ) : (
          <>
            <div className="book-page">
              <h2>Pressed flowers</h2>
              {pressed.length === 0 ? (
                <p className="book-empty">
                  Nothing pressed yet.
                  <br />
                  When a flower is in bloom, tap it and choose Press.
                </p>
              ) : (
                <ul className="book-grid">
                  {onPage.map((p) => (
                    <li key={p.id}>
                      <button className="specimen" aria-label={`${pressedName(p)}, ${dateText(p.at)}. Open its page`} onClick={() => setOpen(p.id)}>
                        <Specimen p={p} />
                        <span className="tape" aria-hidden="true" />
                        <span className="specimen-name">{pressedName(p)}</span>
                        <span className="specimen-date">{dateText(p.at)}</span>
                        {p.note && <span className="specimen-note">{p.note}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="letter-actions book-actions">
              <button className="quiet" aria-label="Previous page" disabled={shown === 0} onClick={() => turn(shown - 1)}>
                ‹
              </button>
              <span className="book-folio">
                {shown + 1} / {pages}
              </span>
              <button className="quiet" aria-label="Next page" disabled={shown === pages - 1} onClick={() => turn(shown + 1)}>
                ›
              </button>
              <button onClick={onClose}>Close</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export const BOOK_ICON = (
  <g>
    <path d="M0,-6 C-4,-9 -8,-9 -11,-8 L-11,8 C-8,7 -4,7 0,10 C4,7 8,7 11,8 L11,-8 C8,-9 4,-9 0,-6 Z M0,-6 L0,10" />
    <path d="M-6,4 C-6,0 -5,-2 -4,-4 M-4,-4 C-6,-4 -7,-3 -7,-1 M-4,-4 C-3,-2 -3,-1 -4,0" />
  </g>
);
