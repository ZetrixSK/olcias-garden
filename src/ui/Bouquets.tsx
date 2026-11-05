import { RibbonSwatch } from '../plants/Ribbon';
import { useMemo, useState } from 'react';
import { BASE_VASES, MAX_NOTE, MAX_STEMS, RIBBONS, stemOf, stemsLeft, type Bouquet, type Vase } from '../garden/bouquets';
import { wishMet, type Request } from '../garden/visitors';
import { RIBBON_NAMES as RIBBON_WORDS, say, VISITOR_NAME, wishLine } from './visitorWords';
import { hash } from '../garden/vines';
import { freeShelfSlots, newId, type GardenState, type Plant } from '../garden/state';
import { useWords } from '../i18n';
import { BouquetArt, ParcelBox, stemPalette } from '../plants/Bouquet';
import { PressedSprig } from '../plants/Pressed';
import { ConfirmButton } from './Decorate';
import { ClaimTag, postMessage, TagInput, validTag } from './Post';
import type { PostError } from '../remote/client';
import { Section, Swatches } from './Studio';

export const VASE_NAMES: Record<Vase, [string, string]> = {
  jar: ['Glass jar', 'Słoik'],
  jug: ['Jug', 'Dzbanek'],
  bottle: ['Old bottle', 'Buteleczka'],
  can: ['Watering can', 'Konewka'],
  cauldron: ['Little cauldron', 'Kociołek'],
};

/** A bouquet drawn large enough to admire, in its own little frame. */
function BigBouquet({ bouquet }: { bouquet: Parameters<typeof BouquetArt>[0]['bouquet'] }) {
  return (
    <svg viewBox="-70 -118 140 126" aria-hidden="true">
      <BouquetArt bouquet={bouquet} />
    </svg>
  );
}

/** One stem, drawn small, for the buttons that choose it. */
function MiniSprig({ plant, garden }: { plant: Plant; garden: GardenState }) {
  const stem = stemOf(plant, garden.designs);
  return (
    <svg viewBox="-34 -84 68 88" aria-hidden="true">
      <PressedSprig species={stem.species} palette={stemPalette(stem)} seed={hash(plant.id)} />
    </svg>
  );
}

/**
 * Making a bouquet: stems cut from her flowers in bloom (a few from each plant a day, and they're
 * none the worse for it), a vase, a ribbon and a few words on a card.
 */
export function BouquetStudio({ garden, now, onKeep, onSend, onClaim, canSend, onClose, forVisitor, night = false, onGive }: {
  garden: GardenState;
  now: number;
  /** Made for someone at the door: their wishes are pinned at the top, ticked off as they're met. */
  forVisitor?: Request | null;
  /** Whether it's night, for a wish to have it picked at night. */
  night?: boolean;
  /** Hands the bouquet to the visitor at the door. */
  onGive?: (bouquet: Bouquet, cutFrom: string[]) => void;
  /** Keeps the bouquet: it goes on the shelves, or in a box on the floor if there's no room. */
  onKeep: (bouquet: Bouquet, cutFrom: string[]) => void;
  /** Sends it to a tag; resolves with why not, or null once it's on its way. */
  onSend: (bouquet: Bouquet, cutFrom: string[], to: string) => Promise<PostError | null>;
  onClaim: (tag: string) => Promise<PostError | null>;
  /** Whether the post is there at all (it needs the shared garden set up). */
  canSend: boolean;
  onClose: () => void;
}) {
  const w = useWords();
  const { t } = w;
  const [picked, setPicked] = useState<string[]>([]);
  const [vase, setVase] = useState<Vase>('jar');
  const [ribbon, setRibbon] = useState<string | null>(RIBBONS[0]);
  const [note, setNote] = useState('');
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100_000));
  const id = useMemo(() => newId(), []);
  const [step, setStep] = useState<'make' | 'send'>('make');
  const [to, setTo] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<PostError | null>(null);

  const blooming = garden.plants.filter((p) => stemsLeft(p, garden.cuttings, now) > 0);
  const left = (p: Plant) => stemsLeft(p, garden.cuttings, now) - picked.filter((x) => x === p.id).length;
  const stems = picked.flatMap((pid) => {
    const plant = garden.plants.find((p) => p.id === pid);
    return plant ? [stemOf(plant, garden.designs)] : [];
  });
  const bouquet: Bouquet = { id, stems, vase, ribbon, note: note.trim(), from: null, at: now, seed };
  const full = picked.length >= MAX_STEMS;
  const noRoom = freeShelfSlots(garden).length === 0;
  const name = (p: Plant) => p.name ?? w.flower(p.species);
  const ribbons = [...RIBBONS, ...garden.visitors.ribbons];
  const vases = [...BASE_VASES, ...garden.visitors.vases];
  const ribbonNames = Object.fromEntries(Object.entries(RIBBON_WORDS).map(([k, v]) => [k, t(...v)]));
  const visitor = forVisitor ?? null;

  return (
    <div className="sheet studio" role="dialog" aria-label={t('Make a bouquet', 'Ułóż bukiet')}>
      <div className="sheet-head">
        <h2>{t('Make a bouquet', 'Ułóż bukiet')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <div className="studio-preview bouquet-preview">
        {stems.length > 0 ? (
          <BigBouquet bouquet={bouquet} />
        ) : (
          <p className="hint">{t('Choose flowers below to put in the vase.', 'Wybierz kwiaty poniżej, żeby włożyć je do wazonu.')}</p>
        )}
        {stems.length > 1 && (
          <button className="shuffle" aria-label={t('Arrange them differently', 'Ułóż inaczej')} onClick={() => setSeed((s) => s + 1)}>
            <svg viewBox="-12 -12 24 24" aria-hidden="true">
              <path d="M-9,-5 L-4,-5 C2,-5 2,5 8,5 M5,2 L8,5 L5,8 M-9,5 L-4,5 C-1,5 0,3 1,1 M3,-3 C4,-4.6 5.6,-5 8,-5 M5,-8 L8,-5 L5,-2" />
            </svg>
          </button>
        )}
      </div>
      {step === 'send' ? (
        <div className="studio-body">
          {garden.post.tag ? (
            <Section title={t('Send it to', 'Wyślij do')}>
              <TagInput value={to} onChange={(v) => { setTo(v); setError(null); }} placeholder={t('their tag', 'tag tej osoby')} autoFocus />
              {garden.post.contacts.length > 0 && (
                <div className="in-vase contacts-pick">
                  {garden.post.contacts.map((c) => (
                    <button key={c} aria-pressed={to === c} onClick={() => { setTo(c); setError(null); }}>
                      #{c}
                    </button>
                  ))}
                </div>
              )}
              <p className="hint">{t(`It will come from #${garden.post.tag}.`, `Przyjdzie od #${garden.post.tag}.`)}</p>
            </Section>
          ) : (
            <Section title={t('First, your own tag', 'Najpierw Twój tag')}>
              <p className="hint">{t('So they know who the bouquet is from.', w.other('Żeby wiedziała, od kogo jest bukiet.', 'Żeby wiedział, od kogo jest bukiet.'))}</p>
              <ClaimTag current={null} onClaim={onClaim} />
            </Section>
          )}
          {error && <p className="decor-error">{postMessage(error, w)}</p>}
        </div>
      ) : (
      <div className="studio-body">
        {visitor && (
          <Section title={t(`For ${say(w, VISITOR_NAME[visitor.visitor])}`, `Dla: ${say(w, VISITOR_NAME[visitor.visitor])}`)}>
            <ul className="wish-list">
              {visitor.wishes.map((wish, i) => {
                const met = wishMet(wish, { ...bouquet, night });
                return (
                  <li key={i} className={met >= 1 ? 'met' : met > 0 ? 'part' : undefined}>
                    <span className="tick" aria-hidden="true" />
                    {wishLine(w, wish)}
                  </li>
                );
              })}
            </ul>
          </Section>
        )}
        <Section title={t('Flowers in bloom', 'Kwitnące kwiaty')}>
          {blooming.length === 0 ? (
            <p className="hint">
              {t(
                "Nothing has stems to give today. Bouquets are cut from flowers in bloom, a few from each a day.",
                'Dziś nie ma już czego ściąć. Bukiety układa się z kwitnących kwiatów, a z każdego można ściąć kilka łodyżek dziennie.',
              )}
            </p>
          ) : (
            <div className="options four">
              {blooming.map((p) => (
                <button key={p.id} disabled={full || left(p) <= 0} data-sound="tap" onClick={() => setPicked((list) => [...list, p.id])}>
                  <MiniSprig plant={p} garden={garden} />
                  <span className="stem-name">{name(p)}</span>
                  <small>{t(`${left(p)} left`, `zostało: ${left(p)}`)}</small>
                </button>
              ))}
            </div>
          )}
        </Section>
        {picked.length > 0 && (
          <Section title={t(`In the vase (${picked.length} of ${MAX_STEMS})`, `W wazonie (${picked.length} z ${MAX_STEMS})`)}>
            <div className="in-vase">
              {picked.map((pid, i) => {
                const plant = garden.plants.find((p) => p.id === pid);
                return (
                  <button key={`${pid}-${i}`} onClick={() => setPicked((list) => list.filter((_, k) => k !== i))} aria-label={t('Take it out', 'Wyjmij')}>
                    {plant ? name(plant) : '?'} <span aria-hidden="true">×</span>
                  </button>
                );
              })}
            </div>
          </Section>
        )}
        <Section title={t('Vase', 'Wazon')}>
          <div className="options three">
            {vases.map((v) => (
              <button key={v} aria-pressed={vase === v} onClick={() => setVase(v)}>
                <svg viewBox="-20 -50 40 54" aria-hidden="true">
                  <BouquetArt bouquet={{ id: v, stems: [], vase: v, ribbon, note: '', seed: 1 }} showNote={false} />
                </svg>
                {t(...VASE_NAMES[v])}
              </button>
            ))}
          </div>
        </Section>
        <Section title={t('Ribbon', 'Wstążka')}>
          <Swatches colors={ribbons} value={ribbon} none names={ribbonNames} onPick={setRibbon} render={(c) => <RibbonSwatch color={c} />} />
        </Section>
        <Section title={t('A card', 'Karteczka')}>
          <input
            className="studio-name"
            value={note}
            maxLength={MAX_NOTE}
            placeholder={t('A few words, if you like', 'Kilka słów, jeśli chcesz')}
            onChange={(e) => setNote(e.target.value)}
          />
        </Section>
        {noRoom && stems.length > 0 && (
          <p className="hint">{t("The shelves are full, so it'll wait in a box on the floor.", 'Półki są pełne, więc poczeka w pudełku na podłodze.')}</p>
        )}
      </div>
      )}
      <div className="studio-actions">
        {step === 'send' ? (
          <>
            <button className="quiet" onClick={() => { setStep('make'); setError(null); }}>
              {t('Back', 'Wróć')}
            </button>
            <button
              className="primary"
              disabled={!garden.post.tag || !validTag(to) || sending}
              data-sound="page"
              onClick={async () => {
                setSending(true);
                const e = await onSend(bouquet, picked, to);
                setSending(false);
                setError(e);
              }}
            >
              {sending ? t('Sending…', 'Wysyłam…') : t(`Send to #${to || '…'}`, `Wyślij do #${to || '…'}`)}
            </button>
          </>
        ) : visitor && onGive ? (
          <button className="primary" disabled={stems.length === 0} data-sound="page" onClick={() => onGive(bouquet, picked)}>
            {t(`Give it to ${say(w, VISITOR_NAME[visitor.visitor])}`, `Daj: ${say(w, VISITOR_NAME[visitor.visitor])}`)}
          </button>
        ) : (
          <>
            {canSend && (
              <button disabled={stems.length === 0} onClick={() => setStep('send')}>
                {t('Send it…', 'Wyślij…')}
              </button>
            )}
            <button className="primary" disabled={stems.length === 0} data-sound="soil" onClick={() => onKeep(bouquet, picked)}>
              {t('Keep it', 'Zostaw u siebie')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/** A bouquet on the shelves, looked at closely: who it's from, the words on its card, and moving it. */
export function BouquetCard({ bouquet, onMove, onRemove, onBlock, onClose }: {
  bouquet: Bouquet;
  onMove: () => void;
  onRemove: () => void;
  /** For a bouquet from someone: no more post from them. */
  onBlock?: () => void;
  onClose: () => void;
}) {
  const w = useWords();
  const { t } = w;
  // in her language, not the phone's
  const date = new Date(bouquet.at).toLocaleDateString(w.locale, { day: 'numeric', month: 'long' });
  return (
    <div className="sheet" role="dialog" aria-label={t('A bouquet', 'Bukiet')}>
      <div className="sheet-head">
        <h2>{bouquet.from ? t(`From #${bouquet.from}`, `Od #${bouquet.from}`) : t('Your bouquet', 'Twój bukiet')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <div className="studio-preview bouquet-preview">
        <BigBouquet bouquet={bouquet} />
      </div>
      {bouquet.note && <p className="bouquet-note">“{bouquet.note}”</p>}
      <p className="hint">{bouquet.from ? t(`Arrived ${date}`, `Przyszedł ${date}`) : t(`Made ${date}`, `Ułożony ${date}`)}</p>
      <div className="actions two-wide">
        <button onClick={onMove}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-10,0 L10,0 M6,-4 L10,0 L6,4 M-6,-4 L-10,0 L-6,4" />
          </svg>
          {t('Move', 'Przesuń')}
        </button>
        <ConfirmButton label={t('Put it away', 'Odłóż')} confirm={t('Sure? Put it away', 'Na pewno? Odłóż')} onConfirm={onRemove} />
      </div>
      {bouquet.from && onBlock && (
        <div className="block-row">
          <ConfirmButton
            label={t(`No more post from #${bouquet.from}`, `Zablokuj #${bouquet.from}`)}
            confirm={t(`Sure? Block #${bouquet.from}`, `Na pewno? Zablokuj #${bouquet.from}`)}
            onConfirm={onBlock}
          />
        </div>
      )}
    </div>
  );
}

/** The box on the floor: bouquets that arrived with no room on the shelves, waiting to be unpacked. */
export function ParcelsSheet({ garden, onUnpack, onRemove, onClose }: {
  garden: GardenState;
  onUnpack: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
}) {
  const { t } = useWords();
  const room = freeShelfSlots(garden).length > 0;
  return (
    <div className="sheet studio" role="dialog" aria-label={t('Parcels', 'Paczki')}>
      <div className="sheet-head">
        <h2>{t('Waiting in the box', 'Czeka w pudełku')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <div className="studio-body">
        {garden.parcels.length === 0 && <p className="hint">{t('The box is empty.', 'Pudełko jest puste.')}</p>}
        {!room && garden.parcels.length > 0 && (
          <p className="hint">{t('Make a little room on the shelves to unpack one.', 'Zrób trochę miejsca na półkach, żeby coś rozpakować.')}</p>
        )}
        <ul className="parcels">
          {garden.parcels.map((b) => (
            <li key={b.id}>
              <svg viewBox="-56 -112 112 118" aria-hidden="true">
                <BouquetArt bouquet={b} />
              </svg>
              <div>
                <strong>{b.from ? `#${b.from}` : t('Your bouquet', 'Twój bukiet')}</strong>
                {b.note && <p>“{b.note}”</p>}
                <div className="row-buttons">
                  <button className="primary" disabled={!room} data-sound="soil" onClick={() => onUnpack(b.id)}>
                    {t('Unpack', 'Rozpakuj')}
                  </button>
                  <ConfirmButton label={t('Put away', 'Odłóż')} confirm={t('Sure?', 'Na pewno?')} onConfirm={() => onRemove(b.id)} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** The parcel box as it stands on the floor, tappable. */
export function FloorParcels({ count, onOpen }: { count: number; onOpen: () => void }) {
  const { t } = useWords();
  if (count === 0) return null;
  return (
    <g className="tappable" role="button" aria-label={t('Parcels waiting', 'Czekające paczki')} data-sound="tap" onClick={onOpen} transform="translate(350 840)">
      <ParcelBox count={count} />
      <rect x="-24" y="-36" width="48" height="40" fill="transparent" />
    </g>
  );
}
