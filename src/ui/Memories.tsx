import { useEffect, useRef, useState } from 'react';
import {
  ALL,
  COVERS,
  fileMemories,
  HEARTS,
  inAlbum,
  MAX_ALBUM_NAME,
  MAX_ALBUMS,
  MAX_CAPTION,
  removeAlbum,
  saveAlbum,
  STAMPS,
  editMemory,
  type Album,
  type Cover,
  type Memories,
  type Memory,
  type Stamp,
} from '../garden/memories';
import { newId } from '../garden/state';
import { hash, rng } from '../garden/vines';
import { useWords, type Words } from '../i18n';
import { STAMP_NAMES, StampArt } from './stamps';
import { useStoredUrl } from './storedImages';

type Page =
  | { kind: 'shelf' }
  | { kind: 'album'; album: string }
  | { kind: 'memory'; album: string; id: string }
  /** making an album or changing one; `filing` are pictures that go into a new one once it's made */
  | { kind: 'edit'; album: Album; isNew: boolean; back: Page; filing: string[] };

const COVER_NAMES: Record<Cover, [string, string]> = {
  rose: ['Rose', 'Róża'],
  ink: ['Ink', 'Atrament'],
  sage: ['Sage', 'Szałwia'],
  plum: ['Plum', 'Śliwka'],
  sky: ['Sky', 'Niebo'],
  linen: ['Linen', 'Len'],
};

const dateText = (t: number, w: Words) =>
  t ? new Date(t).toLocaleDateString(w.locale, { day: 'numeric', month: 'long', year: 'numeric' }) : '';
const tiltOf = (id: string, range: number) => ((rng(hash(`${id}/tilt`))() - 0.5) * range).toFixed(1);

/** The shelves that aren't her own albums: everything, and the ones she gave a heart. */
function builtIn(id: string, w: Words): Album | null {
  if (id === ALL) return { id, name: w.t('All memories', 'Wszystkie'), stamp: 'camera', cover: 'linen', created: 0 };
  if (id === HEARTS) return { id, name: w.t('With a heart', 'Z serduszkiem'), stamp: 'heart', cover: 'rose', created: 0 };
  return null;
}

function Thumb({ m }: { m: Memory }) {
  const url = useStoredUrl(m.thumb);
  return url ? <img src={url} alt="" decoding="async" draggable={false} /> : <span className="snap-wait" />;
}

/** An album on the shelf: cloth in her colour, the newest picture in a little window, its stamp and name. */
function CoverTile({ album, items, onOpen }: { album: Album; items: Memory[]; onOpen: () => void }) {
  const w = useWords();
  const latest = items[0];
  return (
    <button className={`album-cover cover-${album.cover}`} onClick={onOpen}>
      <span className="cover-window">{latest ? <Thumb m={latest} /> : <StampArt stamp={album.stamp} />}</span>
      <span className="cover-label">
        <StampArt stamp={album.stamp} />
        <span className="cover-name">{album.name || w.t('Untitled', 'Bez nazwy')}</span>
      </span>
      <span className="cover-count">{items.length}</span>
    </button>
  );
}

/** One picture large, with what she wrote under it and the albums it's in. */
function MemoryPage({ m, albums, onChange, onEditNew, canShelf, onHang, onShelf, onRepaint, onRemove, onPrev, onNext }: {
  m: Memory;
  albums: Album[];
  onChange: (fn: (x: Memories) => Memories) => void;
  onEditNew: () => void;
  canShelf: boolean;
  onHang: () => Promise<boolean>;
  onShelf: () => Promise<boolean>;
  onRepaint: () => void;
  onRemove: () => void;
  onPrev: (() => void) | null;
  onNext: (() => void) | null;
}) {
  const w = useWords();
  const { t } = w;
  const full = useStoredUrl(m.img);
  const thumb = useStoredUrl(m.thumb);
  const [asking, setAsking] = useState(false);
  const [done, setDone] = useState<'hung' | 'shelf' | null>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const portrait = m.h >= m.w;
  return (
    <div className="memory-page">
      <figure
        className={`polaroid${portrait ? ' tall' : ''}${m.kind === 'painting' && !m.paper ? ' clear' : ''}`}
        style={{ ['--tilt' as string]: `${tiltOf(m.id, 3)}deg` }}
        onPointerDown={(e) => (swipe.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = swipe.current;
          swipe.current = null;
          if (!s) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(e.clientY - s.y) * 1.5) return;
          if (dx < 0) onNext?.();
          else onPrev?.();
        }}
      >
        {full || thumb ? <img src={full ?? thumb!} alt="" draggable={false} style={{ aspectRatio: `${m.w} / ${m.h}` }} /> : <span className="snap-wait" style={{ aspectRatio: `${m.w} / ${m.h}` }} />}
        <span className="tape" aria-hidden="true" />
      </figure>
      <div className="memory-meta">
        <span>{dateText(m.at, w)}</span>
        <button
          className={`heart${m.fav ? ' on' : ''}`}
          aria-label={t('Heart', 'Serduszko')}
          aria-pressed={m.fav}
          onClick={() => onChange((x) => editMemory(x, m.id, { fav: !m.fav }))}
        >
          <StampArt stamp="heart" />
        </button>
      </div>
      <textarea
        className="journal-note memory-caption"
        value={m.caption}
        maxLength={MAX_CAPTION}
        placeholder={t('What do you remember?', 'Co pamiętasz?')}
        aria-label={t('Caption', 'Podpis')}
        onChange={(e) => {
          const caption = e.target.value;
          onChange((x) => editMemory(x, m.id, { caption }));
        }}
      />
      <p className="memory-hint">{t('In albums', 'W albumach')}</p>
      <div className="album-chips">
        {albums.map((a) => {
          const on = m.albums.includes(a.id);
          return (
            <button key={a.id} className={`chip cover-${a.cover}`} aria-pressed={on} onClick={() => onChange((x) => fileMemories(x, [m.id], a.id, !on))}>
              <StampArt stamp={a.stamp} />
              {a.name || t('Untitled', 'Bez nazwy')}
            </button>
          );
        })}
        {albums.length < MAX_ALBUMS && (
          <button className="chip new" onClick={onEditNew}>
            + {t('New album', 'Nowy album')}
          </button>
        )}
      </div>
      <div className="memory-do">
        <button
          onClick={() =>
            void onHang().then((ok) => {
              if (ok) setDone('hung');
            })
          }
        >
          {done === 'hung' ? t('Hung in the frame ✓', 'Wisi w ramce ✓') : t('Hang in the frame', 'Powieś w ramce')}
        </button>
        {m.kind === 'painting' && !m.paper && (
          <button
            disabled={!canShelf && done !== 'shelf'}
            onClick={() =>
              void onShelf().then((ok) => {
                if (ok) setDone('shelf');
              })
            }
          >
            {done === 'shelf' ? t('On a shelf ✓', 'Stoi na półce ✓') : canShelf ? t('Stand on a shelf', 'Postaw na półce') : t('No room on the shelves', 'Brak miejsca na półkach')}
          </button>
        )}
        {m.kind === 'painting' && <button onClick={onRepaint}>{t('Keep painting', 'Maluj dalej')}</button>}
        {asking ? (
          <span className="memory-ask">
            <button className="danger" onClick={onRemove}>
              {t('Delete for good', 'Usuń na zawsze')}
            </button>
            <button onClick={() => setAsking(false)}>{t('Keep', 'Zostaw')}</button>
          </span>
        ) : (
          <button className="quiet" onClick={() => setAsking(true)}>
            {t('Delete', 'Usuń')}
          </button>
        )}
      </div>
    </div>
  );
}

function AlbumEditor({ album, isNew, onChange, onDelete }: {
  album: Album;
  isNew: boolean;
  onChange: (a: Album) => void;
  onDelete: () => void;
}) {
  const w = useWords();
  const { t } = w;
  const [asking, setAsking] = useState(false);
  return (
    <div className="album-edit">
      <h2>{isNew ? t('A new album', 'Nowy album') : t('This album', 'Ten album')}</h2>
      <div className={`album-cover big cover-${album.cover}`} aria-hidden="true">
        <span className="cover-window">
          <StampArt stamp={album.stamp} />
        </span>
        <span className="cover-label">
          <span className="cover-name">{album.name || t('Its name', 'Nazwa')}</span>
        </span>
      </div>
      <input
        className="album-name"
        value={album.name}
        maxLength={MAX_ALBUM_NAME}
        placeholder={t('Summer by the lake', 'Lato nad jeziorem')}
        aria-label={t("Album's name", 'Nazwa albumu')}
        onChange={(e) => onChange({ ...album, name: e.target.value })}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      />
      <p className="memory-hint">{t('Its stamp', 'Znaczek')}</p>
      <div className="stamp-grid">
        {STAMPS.map((s: Stamp) => (
          <button key={s} aria-label={t(...STAMP_NAMES[s])} aria-pressed={album.stamp === s} onClick={() => onChange({ ...album, stamp: s })}>
            <StampArt stamp={s} />
          </button>
        ))}
      </div>
      <p className="memory-hint">{t('Its cover', 'Okładka')}</p>
      <div className="cover-grid">
        {COVERS.map((c) => (
          <button key={c} className={`cover-${c}`} aria-label={t(...COVER_NAMES[c])} aria-pressed={album.cover === c} onClick={() => onChange({ ...album, cover: c })} />
        ))}
      </div>
      {!isNew && (
        <div className="memory-do">
          {asking ? (
            <span className="memory-ask">
              <button className="danger" onClick={onDelete}>
                {t('Take the album away', 'Usuń album')}
              </button>
              <button onClick={() => setAsking(false)}>{t('Keep', 'Zostaw')}</button>
            </span>
          ) : (
            <button className="quiet" onClick={() => setAsking(true)}>
              {t('Delete album · pictures stay', 'Usuń album · zdjęcia zostaną')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Her album of memories. It opens on a shelf of albums: all her pictures, the ones with a
 * heart, and the albums she made, each with its own stamp and cloth. Inside an album the
 * pictures lie like prints on a table; one opens large, to write under it.
 */
export function MemoryBook({ memories, busy, error, canShelf, onChange, onAdd, onPaint, onRemove, onHang, onShelf, onClose }: {
  memories: Memories;
  /** What is being added right now, to say so ("Adding 2 of 5…"). */
  busy: string | null;
  error: string | null;
  canShelf: boolean;
  onChange: (fn: (m: Memories) => Memories) => void;
  onAdd: (album: string | null) => void;
  onPaint: (album: string | null, again: Memory | null) => void;
  onRemove: (ids: string[]) => void;
  onHang: (m: Memory) => Promise<boolean>;
  onShelf: (m: Memory) => Promise<boolean>;
  onClose: () => void;
}) {
  const w = useWords();
  const { t } = w;
  const [page, setPage] = useState<Page>({ kind: 'shelf' });
  const [choosing, setChoosing] = useState<Set<string> | null>(null);
  const [filing, setFiling] = useState(false);
  const [askDelete, setAskDelete] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const albumOf = (id: string) => builtIn(id, w) ?? memories.albums.find((a) => a.id === id) ?? null;
  const own = (id: string) => id !== ALL && id !== HEARTS;

  // a page that no longer has anything to show (an album taken away, a picture deleted) goes back a step
  const current = page.kind === 'memory' ? memories.items.find((m) => m.id === page.id) : null;
  useEffect(() => {
    if (page.kind === 'memory' && !current) setPage({ kind: 'album', album: page.album });
    if ((page.kind === 'album' || page.kind === 'memory') && !albumOf(page.album)) setPage({ kind: 'shelf' });
  });
  // each page starts at its top
  const pageKey = page.kind === 'memory' ? page.id : page.kind === 'album' ? page.album : page.kind;
  useEffect(() => {
    scroller.current?.scrollTo(0, 0);
  }, [pageKey]);

  const open = (to: Page) => {
    setChoosing(null);
    setFiling(false);
    setAskDelete(false);
    setPage(to);
  };
  const newAlbum = (back: Page, filing: string[] = []): Page => ({
    kind: 'edit',
    album: { id: newId(), name: '', stamp: 'heart', cover: COVERS[memories.albums.length % COVERS.length]!, created: Date.now() },
    isNew: true,
    back,
    filing,
  });

  let body: JSX.Element;
  let bar: JSX.Element;
  if (page.kind === 'edit') {
    const save = () => {
      const album = { ...page.album, name: page.album.name.trim() || t('My album', 'Mój album') };
      onChange((m) => {
        const saved = saveAlbum(m, album);
        return page.filing.length ? fileMemories(saved, page.filing, album.id, true) : saved;
      });
      open(page.isNew && page.back.kind !== 'memory' ? { kind: 'album', album: album.id } : page.back);
    };
    body = (
      <AlbumEditor
        album={page.album}
        isNew={page.isNew}
        onChange={(album) => setPage({ ...page, album })}
        onDelete={() => {
          onChange((m) => removeAlbum(m, page.album.id));
          open({ kind: 'shelf' });
        }}
      />
    );
    bar = (
      <>
        <button className="quiet" onClick={() => open(page.back)}>
          {page.isNew ? t('Cancel', 'Anuluj') : t('Back', 'Wróć')}
        </button>
        <button onClick={save}>{page.isNew ? t('Make the album', 'Zrób album') : t('Done', 'Gotowe')}</button>
      </>
    );
  } else if (page.kind === 'memory' && current) {
    const list = inAlbum(memories, page.album);
    const i = list.findIndex((m) => m.id === current.id);
    const prev = i > 0 ? () => open({ ...page, id: list[i - 1]!.id }) : null;
    const next = i >= 0 && i < list.length - 1 ? () => open({ ...page, id: list[i + 1]!.id }) : null;
    body = (
      <MemoryPage
        key={current.id}
        m={current}
        albums={memories.albums}
        onChange={onChange}
        onEditNew={() => open(newAlbum(page, [current.id]))}
        canShelf={canShelf}
        onHang={() => onHang(current)}
        onShelf={() => onShelf(current)}
        onRepaint={() => onPaint(own(page.album) ? page.album : null, current)}
        onRemove={() => onRemove([current.id])}
        onPrev={prev}
        onNext={next}
      />
    );
    bar = (
      <>
        <button className="quiet" aria-label={t('Previous', 'Poprzednie')} disabled={!prev} onClick={() => prev?.()}>
          ‹
        </button>
        <span className="book-folio">
          {i + 1} / {list.length}
        </span>
        <button className="quiet" aria-label={t('Next', 'Następne')} disabled={!next} onClick={() => next?.()}>
          ›
        </button>
        <button onClick={() => open({ kind: 'album', album: page.album })}>{t('Back', 'Wróć')}</button>
      </>
    );
  } else if (page.kind === 'album' && albumOf(page.album)) {
    const album = albumOf(page.album)!;
    const list = inAlbum(memories, album.id);
    const chosen = choosing ?? new Set<string>();
    body = (
      <>
        <div className="album-head">
          <StampArt stamp={album.stamp} />
          <h2>{album.name || t('Untitled', 'Bez nazwy')}</h2>
          {own(album.id) && (
            <button className="album-pencil" aria-label={t('Change this album', 'Zmień album')} onClick={() => open({ kind: 'edit', album, isNew: false, back: page, filing: [] })}>
              <svg viewBox="-12 -12 24 24" aria-hidden="true">
                <path d="M-7,7 L-6,2.5 L4.5,-8 L8,-4.5 L-2.5,6 Z M2.5,-6 L6,-2.5" />
              </svg>
            </button>
          )}
        </div>
        {list.length === 0 ? (
          <p className="book-empty memory-empty">
            {album.id === HEARTS
              ? t('Give a picture a heart and it comes here too.', 'Daj zdjęciu serduszko, a trafi też tutaj.')
              : t('Nothing here yet. Add photos from your gallery, or paint something.', 'Jeszcze nic tu nie ma. Dodaj zdjęcia z galerii albo coś namaluj.')}
          </p>
        ) : (
          <ul className="snaps">
            {list.map((m) => {
              const on = chosen.has(m.id);
              return (
                <li key={m.id}>
                  <button
                    className={`snap${on ? ' chosen' : ''}${m.kind === 'painting' && !m.paper ? ' clear' : ''}`}
                    style={{ ['--tilt' as string]: `${tiltOf(m.id, 5)}deg` }}
                    aria-label={m.caption || dateText(m.at, w)}
                    aria-pressed={choosing ? on : undefined}
                    onClick={() => {
                      if (!choosing) return open({ kind: 'memory', album: album.id, id: m.id });
                      const next = new Set(chosen);
                      if (on) next.delete(m.id);
                      else next.add(m.id);
                      setChoosing(next);
                    }}
                  >
                    <Thumb m={m} />
                    {m.fav && (
                      <span className="snap-heart">
                        <StampArt stamp="heart" />
                      </span>
                    )}
                    {choosing && <span className="snap-tick" aria-hidden="true" />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {filing && choosing && (
          <div className="filing" role="dialog" aria-label={t('Put in an album', 'Włóż do albumu')}>
            <p className="memory-hint">{t('Put them in…', 'Włóż je do…')}</p>
            {memories.albums
              .filter((a) => a.id !== album.id)
              .map((a) => (
                <button
                  key={a.id}
                  className={`chip cover-${a.cover}`}
                  onClick={() => {
                    onChange((m) => fileMemories(m, [...chosen], a.id, true));
                    open({ kind: 'album', album: a.id });
                  }}
                >
                  <StampArt stamp={a.stamp} />
                  {a.name || t('Untitled', 'Bez nazwy')}
                </button>
              ))}
            {memories.albums.length < MAX_ALBUMS && (
              <button className="chip new" onClick={() => open(newAlbum({ kind: 'album', album: album.id }, [...chosen]))}>
                + {t('New album', 'Nowy album')}
              </button>
            )}
          </div>
        )}
      </>
    );
    bar = choosing ? (
      askDelete ? (
        <>
          <span>{t(`Delete ${chosen.size}?`, `Usunąć ${chosen.size}?`)}</span>
          <button
            className="danger"
            onClick={() => {
              onRemove([...chosen]);
              open(page);
            }}
          >
            {t('Yes', 'Tak')}
          </button>
          <button onClick={() => setAskDelete(false)}>{t('No', 'Nie')}</button>
        </>
      ) : (
        <>
          <button className="quiet" onClick={() => open(page)}>
            {t('Cancel', 'Anuluj')}
          </button>
          <button disabled={!chosen.size} onClick={() => setFiling((f) => !f)}>
            {t('Into an album', 'Do albumu')}
          </button>
          {own(album.id) && (
            <button
              disabled={!chosen.size}
              onClick={() => {
                onChange((m) => fileMemories(m, [...chosen], album.id, false));
                open(page);
              }}
            >
              {t('Take out', 'Wyjmij')}
            </button>
          )}
          <button className="quiet" disabled={!chosen.size} aria-label={t('Delete', 'Usuń')} onClick={() => setAskDelete(true)}>
            <svg viewBox="-12 -12 24 24" aria-hidden="true">
              <path d="M-7,-5 L7,-5 M-2.5,-5 L-2.5,-8 L2.5,-8 L2.5,-5 M-5.5,-5 L-4.5,8.5 L4.5,8.5 L5.5,-5 M-1.5,-1.5 L-1.5,5 M1.5,-1.5 L1.5,5" />
            </svg>
          </button>
        </>
      )
    ) : (
      <>
        <button className="quiet" aria-label={t('Back to the albums', 'Wróć do albumów')} onClick={() => open({ kind: 'shelf' })}>
          ‹
        </button>
        {album.id !== HEARTS && (
          <>
            <button disabled={!!busy} onClick={() => onAdd(own(album.id) ? album.id : null)}>
              {t('+ Photos', '+ Zdjęcia')}
            </button>
            <button onClick={() => onPaint(own(album.id) ? album.id : null, null)}>{t('Paint', 'Maluj')}</button>
          </>
        )}
        {list.length > 0 && (
          <button className="quiet" onClick={() => setChoosing(new Set())}>
            {t('Choose', 'Wybierz')}
          </button>
        )}
      </>
    );
  } else {
    const shelves = [ALL, ...(memories.items.some((m) => m.fav) ? [HEARTS] : []), ...memories.albums.map((a) => a.id)];
    body = (
      <>
        <h2>{t('Memories', 'Wspomnienia')}</h2>
        {memories.items.length === 0 && (
          <p className="memory-welcome">
            {t(
              'Keep your photos here, or paint something of your own. Make albums for them, give each one a name and a stamp.',
              'Tu możesz trzymać swoje zdjęcia albo namalować coś swojego. Zrób dla nich albumy i daj każdemu nazwę i znaczek.',
            )}
          </p>
        )}
        <div className="album-shelf">
          {shelves.map((id) => (
            <CoverTile key={id} album={albumOf(id)!} items={inAlbum(memories, id)} onOpen={() => open({ kind: 'album', album: id })} />
          ))}
          {memories.albums.length < MAX_ALBUMS && (
            <button className="album-cover new" onClick={() => open(newAlbum({ kind: 'shelf' }))}>
              <span>+</span>
              {t('New album', 'Nowy album')}
            </button>
          )}
        </div>
      </>
    );
    bar = (
      <>
        <button disabled={!!busy} onClick={() => onAdd(null)}>
          {t('+ Photos', '+ Zdjęcia')}
        </button>
        <button onClick={() => onPaint(null, null)}>{t('Paint', 'Maluj')}</button>
        <button onClick={onClose}>{t('Close', 'Zamknij')}</button>
      </>
    );
  }

  return (
    <>
      <div className="scrim letter-scrim" onClick={onClose} />
      <div className="book memories" role="dialog" aria-label={t('Memories', 'Wspomnienia')}>
        <div className="book-page memories-page" ref={scroller}>
          {body}
          {(busy || error) && (
            <p className={`memory-status${error ? ' error' : ''}`} role="status">
              {error ?? busy}
            </p>
          )}
        </div>
        <div className="letter-actions book-actions">{bar}</div>
      </div>
    </>
  );
}
