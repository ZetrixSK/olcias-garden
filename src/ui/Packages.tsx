import { useState } from 'react';
import { designRef } from '../garden/designs';
import { MAX_ITEMS, MAX_LETTER, type Package, type PackageItem } from '../garden/packages';
import type { GardenState } from '../garden/state';
import type { PostError } from '../remote/client';
import { useWords } from '../i18n';
import { BouquetArt } from '../plants/Bouquet';
import { pansyPalette } from '../plants/looks';
import { PansyFlower } from '../plants/Pansy';
import { cleanTag, postMessage, TagInput, validTag } from './Post';

/** What she picks to put in a package: a bouquet of hers, or some seeds from a packet in her tin. */
export type Picked = { bouquetId: string } | { packetId: string; count: number };

/** A parcel in brown paper, tied with twine and a bow: the icon for packages. */
export const PACKAGE_ICON = (
  <g>
    <path d="M-10,-6 L10,-6 L10,10 L-10,10 Z M-11,-9.5 L11,-9.5 L11,-6 L-11,-6 Z M0,-9.5 L0,10" />
    <path d="M0,-9.5 C-3,-14 -8,-13 -6.4,-10.6 C-5.4,-9.6 -2.6,-9.5 0,-9.5 C2.6,-9.5 5.4,-9.6 6.4,-10.6 C8,-13 3,-14 0,-9.5" />
  </g>
);

/** Who it's from. */
function FromName({ from }: { from: string | null }) {
  const { t } = useWords();
  return <span className="from-tag">{from ? `#${from}` : t('someone', 'kogoś')}</span>;
}

/** A seed, drawn: a little teardrop with a shine, tilted. */
const seed = (x: number, y: number, r: number) => (
  <g key={`${x},${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
    <path className="ink-thin" fill="#6b4a32" d="M0,-4.6 C2.6,-2.4 3,1.6 0,3.6 C-3,1.6 -2.6,-2.4 0,-4.6 Z" />
    <path d="M-0.9,-2.2 C-1.4,-0.8 -1.3,0.6 -0.8,1.4" stroke="#b08a63" strokeWidth="0.7" fill="none" strokeLinecap="round" />
  </g>
);

/**
 * Mystery seeds: the same paper packet, but plain, with only seeds drawn on the front and a
 * hand-written question mark, so nothing gives away what they'll grow into.
 */
export function MysterySeedsArt() {
  return (
    <svg viewBox="-24 -32 48 62" aria-hidden="true">
      <path className="ink" fill="#e9d6b0" d="M-18,-22 L18,-22 L18,26 L-18,26 Z" />
      <path className="ink" fill="#dcc497" d="M-18,-22 L-14,-28 L14,-28 L18,-22 Z" />
      <path d="M-15,-17 L15,-17 M-15,21 L15,21" stroke="#b9925e" strokeWidth="0.8" strokeDasharray="2 2" />
      <path d="M-5.5,-8 C-5.5,-13.5 5.8,-13.8 5.6,-7.6 C5.4,-3.6 0.2,-3.4 0.2,1.2" stroke="#8a3550" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="0.3" cy="6" r="1.6" fill="#8a3550" />
      {seed(-10, 12, -30)}
      {seed(9.5, 10, 25)}
      {seed(-3, 15.5, 70)}
      {seed(4, 15, -10)}
    </svg>
  );
}

/** Seeds of a design, in their paper packet: the bratek on the front, or plain if they're a mystery. */
function SeedsArt({ item, peek = false }: { item: Extract<PackageItem, { kind: 'seeds' }>; peek?: boolean }) {
  if (item.mystery && !peek) return <MysterySeedsArt />;
  const c = pansyPalette(designRef(item.design.id), { pansies: [item.design], pots: [] })[0]!;
  return (
    <svg viewBox="-24 -32 48 62" aria-hidden="true">
      <path className="ink" fill="#e9d6b0" d="M-18,-22 L18,-22 L18,26 L-18,26 Z" />
      <path className="ink" fill="#dcc497" d="M-18,-22 L-14,-28 L14,-28 L18,-22 Z" />
      <path d="M-15,-17 L15,-17 M-15,21 L15,21" stroke="#b9925e" strokeWidth="0.8" strokeDasharray="2 2" />
      <PansyFlower x={0} y={2} s={0.62} c={c} />
    </svg>
  );
}

/** One thing in a package, drawn small for its square. The sender peeks behind her own mystery. */
function ItemArt({ item, peek = false }: { item: PackageItem; peek?: boolean }) {
  if (item.kind === 'seeds') return <SeedsArt item={item} peek={peek} />;
  return (
    <svg viewBox="-70 -118 140 126" aria-hidden="true">
      <BouquetArt bouquet={item.bouquet} showNote={false} />
    </svg>
  );
}

function itemName(item: PackageItem, t: (en: string, pl: string) => string, peek = false) {
  if (item.kind === 'seeds' && item.mystery && !peek)
    return t(`Mystery seeds × ${item.count}`, `Tajemnicze nasiona × ${item.count}`);
  if (item.kind === 'seeds') return t(`${item.design.name || 'Bratek'} seeds × ${item.count}`, `Nasiona: ${item.design.name || 'bratek'} × ${item.count}`);
  return t('A bouquet', 'Bukiet');
}

/** The squares along the bottom: what's in the package, each tappable. */
function Hotbar({ items, selected, onSelect, onRemove, onAdd, peek }: {
  items: PackageItem[];
  /** Which squares the sender may see behind (her own seeds she's making a mystery of). */
  peek?: (i: number) => boolean;
  selected?: number | null;
  onSelect?: (i: number) => void;
  onRemove?: (i: number) => void;
  onAdd?: () => void;
}) {
  const { t } = useWords();
  return (
    <div className="hotbar">
      {Array.from({ length: MAX_ITEMS }, (_, i) => {
        const item = items[i];
        if (!item) {
          return i === items.length && onAdd ? (
            <button key={i} className="slot add" aria-label={t('Put something in', 'Włóż coś')} onClick={onAdd}>
              +
            </button>
          ) : (
            <span key={i} className="slot empty" />
          );
        }
        const sees = peek?.(i) ?? false;
        return (
          <span key={i} className="slot-wrap">
            <button className={`slot${selected === i ? ' on' : ''}`} aria-label={itemName(item, t, sees)} onClick={() => onSelect?.(i)}>
              <ItemArt item={item} peek={sees} />
              {item.kind === 'seeds' && <span className="slot-count">×{item.count}</span>}
              {sees && item.kind === 'seeds' && item.mystery && <span className="slot-mystery" aria-hidden="true">?</span>}
            </button>
            {onRemove && (
              <button className="slot-remove" aria-label={t('Take it out', 'Wyjmij')} onClick={() => onRemove(i)}>
                ×
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Packing a parcel: who it's for, a letter, and up to six things from her shelves and seed tin.
 * The seeds can go as a mystery: a plain packet, nothing to say what they'll grow into.
 */
export function PackageComposer({ garden, onSend, onClose }: {
  garden: GardenState;
  onSend: (to: string, letter: string, picked: Picked[], mystery: boolean) => Promise<PostError | null>;
  onClose: () => void;
}) {
  const w = useWords();
  const { t } = w;
  const [to, setTo] = useState('');
  const [letter, setLetter] = useState('');
  const [picked, setPicked] = useState<Picked[]>([]);
  const [mystery, setMystery] = useState(false);
  const [choosing, setChoosing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PostError | null>(null);

  const bouquets = [...garden.bouquets, ...garden.parcels];
  const pickedBouquets = new Set(picked.flatMap((p) => ('bouquetId' in p ? [p.bouquetId] : [])));
  const seedsLeft = (packetId: string) => {
    const packet = garden.seeds.find((s) => s.id === packetId);
    const used = picked.reduce((n, p) => n + ('packetId' in p && p.packetId === packetId ? p.count : 0), 0);
    return (packet?.count ?? 0) - used;
  };
  const items: PackageItem[] = picked.flatMap((p): PackageItem[] => {
    if ('bouquetId' in p) {
      const b = bouquets.find((x) => x.id === p.bouquetId);
      return b ? [{ kind: 'bouquet', bouquet: b }] : [];
    }
    const packet = garden.seeds.find((s) => s.id === p.packetId);
    const design = packet ? garden.designs.pansies.find((d) => designRef(d.id) === packet.variety) : undefined;
    return packet && design ? [{ kind: 'seeds', design, count: p.count, mystery: mystery || packet.mystery === true }] : [];
  });
  const full = picked.length >= MAX_ITEMS;
  const addSeed = (packetId: string) =>
    setPicked((list) => {
      const at = list.findIndex((p) => 'packetId' in p && p.packetId === packetId);
      if (at >= 0) return list.map((p, i) => (i === at && 'packetId' in p ? { ...p, count: p.count + 1 } : p));
      return [...list, { packetId, count: 1 }];
    });
  const canSend = validTag(to) && (letter.trim().length > 0 || picked.length > 0) && !busy;

  return (
    <div className="sheet studio package-composer" role="dialog" aria-label={t('Send a package', 'Wyślij paczkę')}>
      <div className="sheet-head">
        <h2>{t('Send a package', 'Wyślij paczkę')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <div className="studio-body">
        <section className="studio-section">
          <h3>{t('For', 'Dla')}</h3>
          <TagInput value={to} onChange={setTo} placeholder={t('their tag', w.other('jej tag', 'jego tag'))} />
          {garden.post.contacts.length > 0 && (
            <div className="contact-chips">
              {garden.post.contacts.map((c) => (
                <button key={c} aria-pressed={to === c} onClick={() => setTo(cleanTag(c))}>
                  #{c}
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="studio-section">
          <h3>{t('A letter', 'List')}</h3>
          <textarea
            className="package-letter"
            value={letter}
            maxLength={MAX_LETTER}
            placeholder={t('Write something, if you like…', 'Napisz coś, jeśli chcesz…')}
            onChange={(e) => setLetter(e.target.value)}
          />
        </section>
        <section className="studio-section">
          <h3>{t("What's inside", 'Co w środku')}</h3>
          <Hotbar
            items={items}
            peek={(i) => {
              const p = picked[i];
              return !!p && 'packetId' in p && !garden.seeds.find((s) => s.id === p.packetId)?.mystery;
            }}
            onRemove={(i) => setPicked((list) => list.filter((_, k) => k !== i))}
            onAdd={full ? undefined : () => setChoosing((c) => !c)}
          />
          {choosing && !full && (
            <div className="package-choices">
              {bouquets.filter((b) => !pickedBouquets.has(b.id)).length === 0 && garden.seeds.every((s) => seedsLeft(s.id) <= 0) && (
                <p className="hint">
                  {t('Make a bouquet, or design a bratek with seeds, and it can go in here.', 'Ułóż bukiet albo zaprojektuj bratka z nasionami, a będzie można je tu włożyć.')}
                </p>
              )}
              {bouquets
                .filter((b) => !pickedBouquets.has(b.id))
                .map((b) => (
                  <button
                    key={b.id}
                    className="choice"
                    onClick={() => {
                      setPicked((list) => [...list, { bouquetId: b.id }]);
                      setChoosing(false);
                    }}
                  >
                    <ItemArt item={{ kind: 'bouquet', bouquet: b }} />
                    <span>{t('Bouquet', 'Bukiet')}</span>
                  </button>
                ))}
              {garden.seeds
                .filter((s) => seedsLeft(s.id) > 0)
                .map((s) => {
                  const design = garden.designs.pansies.find((d) => designRef(d.id) === s.variety);
                  if (!design) return null;
                  return (
                    <button key={s.id} className="choice" onClick={() => addSeed(s.id)}>
                      <ItemArt item={{ kind: 'seeds', design, count: 1, mystery: s.mystery === true }} />
                      <span>
                        {s.mystery ? '?' : design.name || t('Seeds', 'Nasiona')} · {seedsLeft(s.id)}
                      </span>
                    </button>
                  );
                })}
            </div>
          )}
        </section>
        {items.some((it) => it.kind === 'seeds') && (
          <section className="studio-section">
            <button className="wide mystery-toggle" aria-pressed={mystery} onClick={() => setMystery((m) => !m)}>
              <span className="toggle-dot" aria-hidden="true" />
              <span>
                {t('Send the seeds as a mystery', 'Wyślij nasiona jako niespodziankę')}
                <small>{t("A plain packet: they'll see what grows only when it flowers", 'Zwykła torebka: zobaczy, co wyrośnie, dopiero kiedy zakwitnie')}</small>
              </span>
            </button>
          </section>
        )}
        {error && <p className="decor-error">{postMessage(error, w)}</p>}
      </div>
      <div className="studio-actions">
        <button
          className="primary"
          disabled={!canSend}
          onClick={async () => {
            setBusy(true);
            setError(null);
            const why = await onSend(to, letter, picked, mystery);
            setBusy(false);
            if (why) setError(why);
          }}
        >
          {busy ? t('Sending…', 'Wysyłam…') : t('Send', 'Wyślij')}
        </button>
      </div>
    </div>
  );
}

/**
 * Opening a package: first the parcel, wrapped, with who it's from; then the letter, and along the
 * bottom what was inside, each thing tappable. "Take it all" puts the bouquets on her shelves and
 * the seeds in her tin. An opened one can be looked at again, letter and all.
 */
export function PackageOpen({ pkg, onTake, onClose }: { pkg: Package; onTake: () => void; onClose: () => void }) {
  const w = useWords();
  const { t } = w;
  const [unwrapped, setUnwrapped] = useState(pkg.opened !== null);
  const [selected, setSelected] = useState<number | null>(null);
  const when = new Date(pkg.at).toLocaleDateString(w.locale, { day: 'numeric', month: 'long' });
  const item = selected !== null ? pkg.items[selected] : undefined;
  return (
    <>
      <div className="scrim letter-scrim" onClick={onClose} />
      <div className="package-open" role="dialog" aria-label={t('A package', 'Paczka')}>
        {!unwrapped ? (
          <div className="parcel-wrapped">
            <svg className="parcel-art" viewBox="-60 -64 120 112" aria-hidden="true">
              <path className="ink" fill="#c9a26b" d="M-46,-24 L46,-24 L46,44 L-46,44 Z" />
              <path className="ink" fill="#d8b47c" d="M-50,-36 L50,-36 L50,-22 L-50,-22 Z" />
              <path d="M-4,-36 L-4,44 M4,-36 L4,44" stroke="#7a5a3a" strokeWidth="1.6" />
              <path d="M-46,10 L46,10 M-46,18 L46,18" stroke="#7a5a3a" strokeWidth="1.6" />
              <path className="ink" fill="#c0435f" d="M0,-36 C-8,-52 -26,-50 -20,-40 C-16,-34 -6,-35 0,-36 C6,-35 16,-34 20,-40 C26,-50 8,-52 0,-36 Z" />
              <circle className="ink" cx="0" cy="-36" r="4" fill="#a83652" />
              <g transform="translate(26 26) rotate(-8)">
                <path className="ink-thin" fill="#f3ead6" d="M-12,-8 L14,-8 L14,8 L-12,8 L-17,0 Z" />
                <circle cx="-11" cy="0" r="1.6" fill="#7a5a3a" />
              </g>
            </svg>
            <p className="parcel-from">
              {t('From', 'Od')} <FromName from={pkg.from} /> · {when}
            </p>
            <div className="letter-actions">
              <button className="quiet" onClick={onClose}>
                {t('Later', 'Później')}
              </button>
              <button onClick={() => setUnwrapped(true)}>{t('Open it', 'Otwórz')}</button>
            </div>
          </div>
        ) : (
          <div className="parcel-inside">
            <div className="letter-paper package-paper">
              {pkg.letter.trim() ? (
                pkg.letter
                  .split(/\n\s*\n/)
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((p, i) => <p key={i}>{p}</p>)
              ) : (
                <p className="no-letter">{t('No letter this time, only what’s inside.', 'Tym razem bez listu, tylko to, co w środku.')}</p>
              )}
              {pkg.from && (
                <p className="letter-signature package-from">
                  <FromName from={pkg.from} />
                </p>
              )}
            </div>
            {item && (
              <div className="item-detail">
                <div className="item-art">
                  <ItemArt item={item} />
                </div>
                <p>
                  {itemName(item, t)}
                  {item.kind === 'bouquet' && item.bouquet.note ? ` · „${item.bouquet.note}”` : ''}
                </p>
              </div>
            )}
            {pkg.items.length > 0 && <Hotbar items={pkg.items} selected={selected} onSelect={(i) => setSelected((s) => (s === i ? null : i))} />}
            <div className="letter-actions">
              {pkg.opened === null ? (
                <>
                  <button className="quiet" onClick={onClose}>
                    {t('Later', 'Później')}
                  </button>
                  <button onClick={onTake}>{pkg.items.length ? t('Take it all', 'Zabierz wszystko') : t('Keep the letter', 'Zachowaj list')}</button>
                </>
              ) : (
                <button onClick={onClose}>{t('Close', 'Zamknij')}</button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

/** Her packages in the post box: the wrapped ones first, then opened ones with their letters. */
export function PackageList({ packages, onOpen }: { packages: Package[]; onOpen: (id: string) => void }) {
  const w = useWords();
  const { t } = w;
  const list = [...packages].sort((a, b) => (a.opened === null) !== (b.opened === null) ? (a.opened === null ? -1 : 1) : b.at - a.at);
  return (
    <ul className="package-list">
      {list.map((p) => (
        <li key={p.id}>
          <button className={p.opened === null ? 'wrapped' : undefined} onClick={() => onOpen(p.id)}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              {PACKAGE_ICON}
            </svg>
            <span className="package-line">
              <FromName from={p.from} />
              <small>
                {new Date(p.at).toLocaleDateString(w.locale, { day: 'numeric', month: 'short' })}
                {p.opened === null ? ` · ${t('still wrapped', 'jeszcze zapakowana')}` : ''}
              </small>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
