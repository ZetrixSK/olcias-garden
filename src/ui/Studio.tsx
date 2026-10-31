import { useState, type ReactNode } from 'react';
import {
  PANSY_FACES,
  PANSY_SWATCHES,
  POT_PATTERNS,
  POT_SHAPES,
  POT_SWATCHES,
  SWATCH_NAMES,
  type PansyDesign,
  type PansyFace,
  type PotDesign,
  type PotPattern,
} from '../garden/designs';
import { CANDLE_SHAPE_NAMES, CANDLE_SHAPES, WAX_COLORS, WAX_NAMES, type CandleLit, type CandleLook, type CandleShape } from '../garden/candle';
import { newId } from '../garden/state';
import { useWords } from '../i18n';
import { candleFlame, Flame, SillCandle } from '../scene/Decor';
import { designColors } from '../plants/looks';
import { PansyFlower, PansyPlant } from '../plants/Pansy';
import { PaintedFront } from '../plants/PaintedPot';
import { Potted } from '../plants/Pots';
import { FLOOR_SWATCHES, ROOM_SWATCH_NAMES, ROOM_SWATCHES, type OwnRoom, type RoomPart } from '../theme/ownRoom';
import type { Theme } from '../theme/palettes';

export function Swatches({ colors, value, onPick, none, names = SWATCH_NAMES }: {
  colors: readonly string[];
  value: string | null;
  onPick: (c: string | null) => void;
  none?: boolean;
  names?: Record<string, string>;
}) {
  const { t } = useWords();
  return (
    <div className="swatches">
      {none && (
        <button className="swatch none" aria-label={t('None', 'Brak')} aria-pressed={value === null} onClick={() => onPick(null)}>
          <svg viewBox="-10 -10 20 20" aria-hidden="true">
            <path d="M-6,6 L6,-6" />
          </svg>
        </button>
      )}
      {colors.map((c) => (
        <button key={c} className="swatch" aria-label={names[c] ?? c} aria-pressed={value === c} style={{ background: c }} onClick={() => onPick(c)} />
      ))}
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="studio-section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function StudioFrame({ title, preview, children, editing, onSave, onDelete, onClose, compact = false }: {
  title: string;
  /** Left out when the room itself shows the result, above the sheet. */
  preview?: ReactNode;
  compact?: boolean;
  children: ReactNode;
  editing: boolean;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const { t } = useWords();
  return (
    <div className={compact ? 'sheet studio compact' : 'sheet studio'} role="dialog" aria-label={title}>
      <div className="sheet-head">
        <h2>{title}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      {preview && <div className="studio-preview">{preview}</div>}
      <div className="studio-body">{children}</div>
      <div className="studio-actions">
        {editing &&
          (confirm ? (
            <button className="danger" onClick={onDelete}>{t('Throw it away?', 'Wyrzucić?')}</button>
          ) : (
            <button className="quiet" onClick={() => setConfirm(true)}>{t('Delete', 'Usuń')}</button>
          ))}
        <button className="primary" onClick={onSave}>{t('Save', 'Zapisz')}</button>
      </div>
    </div>
  );
}

// ---- pots ----

const PATTERN_NAMES: Record<PotPattern, [string, string]> = {
  none: ['Plain', 'Gładka'], scallops: ['Scallops', 'Falbanki'], dots: ['Dots', 'Kropki'], stripes: ['Stripes', 'Paski'],
  bands: ['Bands', 'Obręcze'], hearts: ['Hearts', 'Serca'], moons: ['Moons', 'Księżyce'], checks: ['Checks', 'Kratka'],
  zigzag: ['Zigzag', 'Zygzak'], flowers: ['Flowers', 'Kwiatki'],
};
const SHAPE_NAMES: Record<PotDesign['shape'], [string, string]> = {
  wide: ['Bowl', 'Miska'], slim: ['Flowerpot', 'Doniczka'], round: ['Jar', 'Słoik'], cauldron: ['Cauldron', 'Kociołek'], teacup: ['Teacup', 'Filiżanka'],
};

/** A pot drawn small, for the option buttons. */
function MiniPot({ d }: { d: PotDesign }) {
  return (
    <svg viewBox="-50 -8 100 66" aria-hidden="true">
      <PaintedFront d={d} />
    </svg>
  );
}

export const NEW_POT = (): PotDesign => ({ id: newId(), shape: 'wide', body: '#2b2229', pattern: 'scallops', patternColor: '#e79ab4', rim: '#4a2f4a' });

export function PotStudio({ initial, editing, children, onSave, onDelete, onClose }: {
  initial: PotDesign;
  editing: boolean;
  /** What grows in the preview pot. */
  children: ReactNode;
  onSave: (d: PotDesign) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [d, setD] = useState(initial);
  const set = (patch: Partial<PotDesign>) => setD((x) => ({ ...x, ...patch }));
  const { t } = useWords();
  return (
    <StudioFrame
      title={editing ? t('Repaint the pot', 'Przemaluj doniczkę') : t('Paint a pot', 'Pomaluj doniczkę')}
      editing={editing}
      onSave={() => onSave(d)}
      onDelete={onDelete}
      onClose={onClose}
      preview={
        <svg viewBox="-60 -128 120 192" aria-hidden="true">
          <Potted kind={d.shape} design={d}>
            {children}
          </Potted>
        </svg>
      }
    >
      <Section title={t('Shape', 'Kształt')}>
        <div className="options five">
          {POT_SHAPES.map((shape) => (
            <button key={shape} aria-pressed={d.shape === shape} onClick={() => set({ shape })}>
              <MiniPot d={{ ...d, shape }} />
              <span>{t(...SHAPE_NAMES[shape])}</span>
            </button>
          ))}
        </div>
      </Section>
      <Section title={t('Colour', 'Kolor')}>
        <Swatches colors={POT_SWATCHES} value={d.body} onPick={(c) => c && set({ body: c })} />
      </Section>
      <Section title={t('Pattern', 'Wzór')}>
        <div className="options five">
          {POT_PATTERNS.map((pattern) => (
            <button key={pattern} aria-pressed={d.pattern === pattern} onClick={() => set({ pattern })}>
              <MiniPot d={{ ...d, pattern }} />
              <span>{t(...PATTERN_NAMES[pattern])}</span>
            </button>
          ))}
        </div>
      </Section>
      {d.pattern !== 'none' && (
        <Section title={t('Pattern colour', 'Kolor wzoru')}>
          <Swatches colors={POT_SWATCHES} value={d.patternColor} onPick={(c) => c && set({ patternColor: c })} />
        </Section>
      )}
      <Section title={t('Rim', 'Brzeg')}>
        <Swatches colors={POT_SWATCHES} value={d.rim} onPick={(c) => c && set({ rim: c })} />
      </Section>
    </StudioFrame>
  );
}

// ---- bratki ----

const FACE_NAMES: Record<PansyFace, [string, string]> = { blotch: ['Blotch', 'Plamka'], whiskers: ['Whiskers', 'Wąsiki'], clear: ['Clear', 'Bez wzoru'] };

export const NEW_PANSY = (): PansyDesign => ({
  id: newId(), name: '', top: '#4a2350', low: '#eaa2bb', face: 'blotch', faceColor: '#241326', edge: null,
});

export function PansyStudio({ initial, editing, onSave, onDelete, onClose }: {
  initial: PansyDesign;
  editing: boolean;
  onSave: (d: PansyDesign) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [d, setD] = useState(initial);
  const set = (patch: Partial<PansyDesign>) => setD((x) => ({ ...x, ...patch }));
  const colors = designColors(d);
  const w = useWords();
  const { t } = w;
  const bratek = w.lang === 'en' ? 'pansy' : 'bratek';
  return (
    <StudioFrame
      title={editing ? t(`Your ${bratek}`, 'Twój bratek') : t(`Design a ${bratek}`, 'Zaprojektuj bratka')}
      editing={editing}
      onSave={() => onSave({ ...d, name: d.name.trim() })}
      onDelete={onDelete}
      onClose={onClose}
      preview={
        <svg viewBox="-110 -128 220 192" aria-hidden="true">
          <g transform="translate(-48 -40)">
            <PansyFlower x={0} y={0} s={2} c={colors} />
          </g>
          <g transform="translate(58 6) scale(0.72)">
            <Potted kind="wide">
              <PansyPlant stage="bloom" palette={[colors]} />
            </Potted>
          </g>
        </svg>
      }
    >
      <Section title={t('Name', 'Nazwa')}>
        <input
          className="studio-name"
          value={d.name}
          maxLength={32}
          placeholder={t(`Name your ${bratek}`, 'Nazwij swojego bratka')}
          onChange={(e) => set({ name: e.target.value })}
        />
      </Section>
      <Section title={t('Top petals', 'Górne płatki')}>
        <Swatches colors={PANSY_SWATCHES} value={d.top} onPick={(c) => c && set({ top: c })} />
      </Section>
      <Section title={t('Lower petals', 'Dolne płatki')}>
        <Swatches colors={PANSY_SWATCHES} value={d.low} onPick={(c) => c && set({ low: c })} />
      </Section>
      <Section title={t('Face', 'Oczko')}>
        <div className="options three">
          {PANSY_FACES.map((face) => (
            <button key={face} aria-pressed={d.face === face} onClick={() => set({ face })}>
              <svg viewBox="-34 -30 68 64" aria-hidden="true">
                <PansyFlower x={0} y={0} c={designColors({ ...d, face })} />
              </svg>
              <span>{t(...FACE_NAMES[face])}</span>
            </button>
          ))}
        </div>
      </Section>
      {d.face !== 'clear' && (
        <Section title={t('Face colour', 'Kolor oczka')}>
          <Swatches colors={PANSY_SWATCHES} value={d.faceColor} onPick={(c) => c && set({ faceColor: c })} />
        </Section>
      )}
      <Section title={t('Petal edge', 'Brzeg płatków')}>
        <Swatches colors={PANSY_SWATCHES} value={d.edge} onPick={(edge) => set({ edge })} none />
      </Section>
    </StudioFrame>
  );
}

// ---- her room ----

const ROOM_SECTIONS: Array<[RoomPart, string, string]> = [
  ['wall', 'Walls', 'Ściany'],
  ['motif', 'Wallpaper pattern', 'Wzór tapety'],
  ['curtain', 'Curtains', 'Zasłony'],
  ['frame', 'Window frame', 'Rama okna'],
  ['floor', 'Floor', 'Podłoga'],
  ['bed', 'Dog bed', 'Legowisko psów'],
];

/**
 * Painting her own room. The room itself is the preview: every tap shows straight away above the
 * sheet, and nothing is kept until she saves.
 */
export function RoomStudio({ room, editing, onChange, onSave, onClose }: {
  room: OwnRoom;
  editing: boolean;
  onChange: (room: OwnRoom) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const set = (patch: Partial<OwnRoom>) => onChange({ ...room, ...patch });
  const { t } = useWords();
  return (
    <StudioFrame compact title={editing ? t('My room', 'Mój pokój') : t('Paint my room', 'Pomaluj mój pokój')} editing={false} onSave={onSave} onDelete={() => {}} onClose={onClose}>
      <Section title={t('Furniture and decorations', 'Meble i ozdoby')}>
        <div className="decor-choice two">
          {(['cozy', 'witchy'] as Theme[]).map((base) => (
            <button key={base} aria-pressed={room.base === base} onClick={() => set({ base })}>
              {base === 'cozy' ? t('Cozy', 'Przytulny') : t('Witchy', 'Wiedźmowy')}
            </button>
          ))}
        </div>
      </Section>
      {ROOM_SECTIONS.map(([part, en, pl]) => (
        <Section key={part} title={t(en, pl)}>
          <Swatches
            colors={part === 'floor' ? FLOOR_SWATCHES : ROOM_SWATCHES}
            names={ROOM_SWATCH_NAMES}
            value={room[part]}
            onPick={(c) => c && set({ [part]: c } as Partial<OwnRoom>)}
          />
        </Section>
      ))}
    </StudioFrame>
  );
}

const FLAME_CHOICES: Array<[CandleLit, string, string]> = [
  [true, 'Lit', 'Zapalona'],
  [false, 'Blown out', 'Zgaszona'],
  [null, 'Lights itself', 'Sama się pali'],
];
const SHAPES_PL: Record<CandleShape, string> = { jar: 'W słoiku', pillar: 'Słupek', taper: 'Wysoka świeca' };

/** Her candle on the sill: its shape and wax, shown live in the room above the sheet. */
export function CandleStudio({ look, lit, own, onChange, onLit, onRoomCandle, onSave, onClose }: {
  look: CandleLook;
  lit: CandleLit;
  /** Whether she already has her own candle, so she can go back to the room's. */
  own: boolean;
  onChange: (look: CandleLook) => void;
  onLit: (lit: CandleLit) => void;
  onRoomCandle: () => void;
  onSave: () => void;
  onClose: () => void;
}) {
  const { t } = useWords();
  return (
    <StudioFrame
      title={t('My candle', 'Moja świeca')}
      preview={
        <svg viewBox="296 448 82 80" aria-hidden="true">
          <defs>
            <radialGradient id="studio-candle-glow">
              <stop offset="0" stopColor="#ffc97e" stopOpacity="0.6" />
              <stop offset="1" stopColor="#ff9f5a" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path className="ink" fill="#b98a5e" d="M290,517 L384,517 L384,530 L290,530 Z" />
          {lit !== false && <circle cx={candleFlame('cozy', look)[0]} cy={candleFlame('cozy', look)[1]} r="40" fill="url(#studio-candle-glow)" />}
          <SillCandle theme="cozy" look={look} />
          {lit !== false && <Flame x={candleFlame('cozy', look)[0]} y={candleFlame('cozy', look)[1]} />}
        </svg>
      }
      editing={false}
      onSave={onSave}
      onDelete={() => {}}
      onClose={onClose}
    >
      <Section title={t('Shape', 'Kształt')}>
        <div className="decor-choice">
          {CANDLE_SHAPES.map((shape) => (
            <button key={shape} aria-pressed={look.shape === shape} onClick={() => onChange({ ...look, shape })}>
              {t(CANDLE_SHAPE_NAMES[shape], SHAPES_PL[shape])}
            </button>
          ))}
        </div>
      </Section>
      <Section title={t('Wax', 'Wosk')}>
        <Swatches colors={WAX_COLORS} names={WAX_NAMES} value={look.wax} onPick={(wax) => wax && onChange({ ...look, wax })} />
      </Section>
      <Section title={t('Flame', 'Płomień')}>
        <div className="decor-choice">
          {FLAME_CHOICES.map(([value, en, pl]) => (
            <button key={en} aria-pressed={lit === value} onClick={() => onLit(value)}>
              {t(en, pl)}
            </button>
          ))}
        </div>
        <p className="decor-hint">
          {t(
            'Tap the candle in the room to light it or blow it out. Left to itself, it lights in the evening and when it rains.',
            'Stuknij świecę w pokoju, żeby ją zapalić albo zdmuchnąć. Zostawiona sama sobie zapala się wieczorem i kiedy pada.',
          )}
        </p>
      </Section>
      {own && (
        <button className="quiet candle-reset" onClick={onRoomCandle}>
          {t("Back to the room's own candle", 'Wróć do świecy z pokoju')}
        </button>
      )}
    </StudioFrame>
  );
}
