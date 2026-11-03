import { TRAITS } from '../garden/traits';
import { VISITOR_IDS } from '../garden/visitors';
import { TRAIT_WORDS } from '../ui/traitWords';
import { useState, type ReactNode } from 'react';
import { stageAt } from '../garden/growth';
import { PANSY_PRESET_NAMES, PANSY_PRESETS, designRef } from '../garden/designs';
import { POT_KINDS, SPECIES, SPECIES_IDS, STAGES, STAGE_LABEL, type SpeciesId, type Stage } from '../garden/species';
import { isHanging, newId, SLOT_IDS, WINDOW_SPOTS, type GardenState, type Plant, type SlotId } from '../garden/state';
import { isVineSpecies, isVineSpot } from '../garden/vines';
import type { Weather } from '../theme/palettes';
import { seasonShown } from '../theme/seasons';
import { MOMENTS, momentBlocked } from '../weather/moments';
import { ago, describe, MOMENT_NAMES, SLOT_NAMES, SPOT_NAMES, type ActionRow } from './logic';

/** Sends an action; resolves once it's stored, so one sent after it is always carried out after it. */
export type Send = (kind: string, payload: Record<string, unknown>) => Promise<void>;


export function Panel({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="panel">
      <header>
        <h2>{title}</h2>
        {aside}
      </header>
      {children}
    </section>
  );
}

function Choice<T extends string>({ value, options, onPick, disabled }: { value: T | null; options: readonly { id: T; label: string }[]; onPick: (v: T) => void; disabled?: (v: T) => string | null }) {
  return (
    <div className="choices">
      {options.map((o) => {
        const why = disabled?.(o.id) ?? null;
        return (
          <button key={o.id} type="button" className={o.id === value ? 'on' : ''} disabled={o.id === value || why !== null} title={why ?? undefined} onClick={() => onPick(o.id)}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function potOptions(g: GardenState) {
  return [
    ...POT_KINDS.map((k) => ({ id: k as string, label: k[0]!.toUpperCase() + k.slice(1) })),
    ...g.designs.pots.map((d, i) => ({ id: designRef(d.id) as string, label: `Her pot ${i + 1} (${d.shape}, ${d.pattern})` })),
  ];
}

function colourOptions(g: GardenState) {
  return [
    ...PANSY_PRESETS.map((v) => ({ id: v as string, label: PANSY_PRESET_NAMES[v] })),
    ...g.designs.pansies.map((d, i) => ({ id: designRef(d.id) as string, label: d.name || `Her bratek ${i + 1}` })),
  ];
}

/** Everything that can be done to one plant. */
export function PlantPanel({ garden, plant, now, send, onClose }: { garden: GardenState; plant: Plant; now: number; send: Send; onClose: () => void }) {
  const [name, setName] = useState(plant.name ?? '');
  const stage = stageAt(plant.species, plant, now);
  const lastWater = plant.waterings.length ? Math.max(...plant.waterings) : null;
  const canVine = isVineSpecies(plant.species);
  const onSill = isVineSpot(plant.display);
  const vinePct = plant.vine ? Math.round(plant.vine.length * 100) : 0;
  const at = { plant: plant.id };
  const freeSlots = SLOT_IDS.filter((s) => s !== plant.slot && !(isHanging(plant.slot) && garden.decor.drawings.some((d) => d.slot === s)));
  return (
    <Panel title={plant.name ? `${plant.name}` : SPECIES[plant.species].name} aside={<button type="button" className="quiet" onClick={onClose}>Close</button>}>
      <p className="facts">
        {SPECIES[plant.species].name} · {STAGE_LABEL[stage]} · {lastWater ? `watered ${ago(lastWater, now)}` : 'never watered'}
        {canVine && ` · vine ${plant.vine ? `${vinePct}%` : 'none'}`}
        <br />
        {SLOT_NAMES[plant.slot]}
        {plant.display && ` · in the window: ${SPOT_NAMES[plant.display]}`}
      </p>

      <div className="row">
        <button type="button" onClick={() => send('water', at)}>Water</button>
        {canVine && (
          <button type="button" disabled={!onSill || !garden.settings.vines || vinePct >= 100} title={!onSill ? 'Only from the sill' : undefined} onClick={() => send('overgrow', at)}>
            Overgrow
          </button>
        )}
        {plant.vine && <button type="button" onClick={() => send('trim', at)}>Trim vine</button>}
      </div>

      <h3>Stage</h3>
      <Choice value={stage} options={STAGES.map((s) => ({ id: s, label: STAGE_LABEL[s] }))} onPick={(s) => send('stage', { ...at, stage: s })} />

      <h3>Trait</h3>
      <Choice
        value={plant.trait?.kind ?? 'none'}
        options={[{ id: 'none', label: 'None' }, ...TRAITS.map((k) => ({ id: k as string, label: TRAIT_WORDS[k].name[0] }))]}
        onPick={(k) => send('trait', { ...at, kind: k === 'none' ? null : k })}
      />

      <h3>In the window</h3>
      <Choice
        value={plant.display ?? 'none'}
        options={[{ id: 'none', label: 'Not shown' }, ...WINDOW_SPOTS.map((s) => ({ id: s as string, label: SPOT_NAMES[s] }))]}
        onPick={(s) => send('window', { ...at, spot: s === 'none' ? null : s })}
      />

      <h3>Place on the shelves</h3>
      <select value="" onChange={(e) => e.target.value && send('move', { ...at, slot: e.target.value })}>
        <option value="">Move to…</option>
        {freeSlots.map((s) => {
          const there = garden.plants.find((p) => p.slot === s);
          return (
            <option key={s} value={s}>
              {SLOT_NAMES[s]}
              {there ? ` (swap with ${there.name ?? SPECIES[there.species].name.toLowerCase()})` : ''}
            </option>
          );
        })}
      </select>

      <h3>Pot</h3>
      <Choice value={plant.pot as string} options={potOptions(garden)} onPick={(pot) => send('pot', { ...at, pot })} />

      {plant.species === 'pansy' && (
        <>
          <h3>Colours</h3>
          <Choice value={plant.variety ?? 'mix'} options={colourOptions(garden)} onPick={(variety) => send('variety', { ...at, variety })} />
        </>
      )}

      <h3>Name</h3>
      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          send('name', { ...at, name });
        }}
      >
        <input value={name} maxLength={24} placeholder="No name" onChange={(e) => setName(e.target.value)} />
        <button type="submit" disabled={name.trim() === (plant.name ?? '')}>Save name</button>
      </form>

      <div className="row danger">
        <button
          type="button"
          onClick={() => {
            if (window.confirm(`Take ${plant.name ?? `the ${SPECIES[plant.species].name.toLowerCase()}`} out of her garden for good?`)) send('remove', at);
          }}
        >
          Remove plant
        </button>
      </div>
    </Panel>
  );
}

/** Planting something new in an empty place on the shelves. */
export function NewPlantPanel({ garden, slot, send, onClose }: { garden: GardenState; slot: SlotId; send: Send; onClose: () => void }) {
  const [species, setSpecies] = useState<SpeciesId>('pansy');
  const [stage, setStage] = useState<Stage>('seed');
  const [variety, setVariety] = useState('mix');
  const [name, setName] = useState('');
  return (
    <Panel title={`Plant on ${SLOT_NAMES[slot].toLowerCase()}`} aside={<button type="button" className="quiet" onClick={onClose}>Close</button>}>
      <h3>Flower</h3>
      <Choice value={species} options={SPECIES_IDS.map((s) => ({ id: s, label: SPECIES[s].name }))} onPick={setSpecies} />
      <h3>Grown to</h3>
      <Choice value={stage} options={STAGES.map((s) => ({ id: s, label: STAGE_LABEL[s] }))} onPick={setStage} />
      {species === 'pansy' && (
        <>
          <h3>Colours</h3>
          <Choice value={variety} options={colourOptions(garden)} onPick={setVariety} />
        </>
      )}
      <h3>Name (optional)</h3>
      <input value={name} maxLength={24} placeholder="No name" onChange={(e) => setName(e.target.value)} />
      <div className="row">
        <button
          type="button"
          className="primary"
          onClick={() => {
            // its id is chosen here, so it can be shown and tended before her phone has even planted it
            send('plant', { id: newId(), slot, species, stage, ...(species === 'pansy' ? { variety } : {}), ...(name.trim() ? { name: name.trim() } : {}) });
            onClose();
          }}
        >
          Plant it
        </button>
      </div>
    </Panel>
  );
}

/** Things for the whole garden: a moment outside, the room, the weather, the letter. */
export function GardenPanel({ garden, weather, now, send }: { garden: GardenState; weather: Weather; now: number; send: Send }) {
  const s = garden.settings;
  const [minutes, setMinutes] = useState(30);
  const settings = (patch: Record<string, unknown>) => send('settings', { patch });
  const season = seasonShown(now);
  return (
    <Panel title="Her window">
      <h3>A moment outside</h3>
      <p className="hint">
        Shows for{' '}
        <select value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
          {[5, 15, 30, 60, 120, 240].map((m) => (
            <option key={m} value={m}>{m < 60 ? `${m} min` : `${m / 60} h`}</option>
          ))}
        </select>
        . Greyed out ones can't be seen in her sky right now.
      </p>
      <Choice
        value={null}
        options={MOMENTS.map((m) => ({ id: m, label: MOMENT_NAMES[m] }))}
        disabled={(m) => momentBlocked(m, season, weather.night, weather.sky)}
        onPick={(moment) => send('moment', { moment, minutes })}
      />

      <h3>Room</h3>
      <Choice
        value={s.useOwn && s.own ? 'own' : s.theme}
        options={[
          { id: 'cozy', label: 'Cozy' },
          { id: 'witchy', label: 'Witchy' },
          ...(s.own ? [{ id: 'own', label: 'Her own colours' }] : []),
        ]}
        onPick={(v) => settings(v === 'own' ? { useOwn: true } : { theme: v, useOwn: false })}
      />

      <h3>Her app opens on</h3>
      <Choice value={s.view} options={[{ id: 'room', label: 'Window' }, { id: 'shelves', label: 'Shelves' }]} onPick={(view) => settings({ view })} />

      <h3>Weather</h3>
      <Choice
        value={s.weatherMode === 'manual' ? `${s.manual.sky}${s.manual.night ? '-night' : ''}` : s.weatherMode}
        options={[
          { id: 'clock', label: 'Clear skies (by the clock)' },
          { id: 'live', label: 'Live weather' },
          { id: 'clear', label: 'Sunny' },
          { id: 'cloudy', label: 'Cloudy' },
          { id: 'rain', label: 'Rain' },
          { id: 'clear-night', label: 'Clear night' },
          { id: 'rain-night', label: 'Rainy night' },
        ]}
        disabled={(v) => (v === 'live' && !s.location ? 'She has not shared a location for live weather.' : null)}
        onPick={(v) => {
          if (v === 'clock' || v === 'live') settings({ weatherMode: v });
          else {
            const [sky, night] = v.split('-');
            settings({ weatherMode: 'manual', manual: { sky, night: night === 'night' } });
          }
        }}
      />

      <h3>Vines</h3>
      <Choice value={s.vines ? 'on' : 'off'} options={[{ id: 'on', label: 'Growing' }, { id: 'off', label: 'Switched off' }]} onPick={(v) => settings({ vines: v === 'on' })} />

      <h3>Candle</h3>
      <Choice
        value={s.candleLit === null ? 'auto' : s.candleLit ? 'lit' : 'out'}
        options={[{ id: 'auto', label: 'Lights itself' }, { id: 'lit', label: 'Lit' }, { id: 'out', label: 'Blown out' }]}
        onPick={(v) => settings({ candleLit: v === 'auto' ? null : v === 'lit' })}
      />

      <h3>Language</h3>
      <Choice value={s.lang} options={[{ id: 'pl', label: 'Polski' }, { id: 'en', label: 'English' }, { id: 'mixed', label: 'EN+PL' }]} onPick={(lang) => settings({ lang })} />

      <h3>The letter</h3>
      <p className="hint">She has {s.letter === 'unread' ? 'not read it yet' : s.letter === 'kept' ? 'read and kept it' : 'thrown it away'}.</p>
      <div className="row">
        <button type="button" disabled={s.letter === 'unread'} onClick={() => settings({ letter: 'unread' })}>
          Send it to her again
        </button>
      </div>
    </Panel>
  );
}

/** Her pressed flowers, newest first; a note can be written beside any she hasn't written beside herself. */
export function BookPanel({ garden, send }: { garden: GardenState; send: Send }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const pressed = [...garden.pressed].reverse().slice(0, 12);
  if (pressed.length === 0) return null;
  return (
    <Panel title="Her pressed flowers">
      {!garden.settings.shareNotes && <p className="hint">Her notes aren't shared, so they show empty here. A note is never written over one of hers.</p>}
      <ul className="pressed-list">
        {pressed.map((p) => (
          <li key={p.id}>
            <span>
              {p.name ?? SPECIES[p.species].name} · {new Date(p.at).toLocaleDateString()}
            </span>
            {p.note ? (
              <em>"{p.note}"</em>
            ) : (
              <form
                className="row"
                onSubmit={(e) => {
                  e.preventDefault();
                  const note = drafts[p.id]?.trim();
                  if (note) send('note', { press: p.id, note });
                }}
              >
                <input value={drafts[p.id] ?? ''} maxLength={400} placeholder="Write beside it…" onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))} />
                <button type="submit" disabled={!drafts[p.id]?.trim()}>Write</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/** Her visitors: who's at the door, sending one round, and the flowers she can plant. */
export function VisitorsPanel({ garden, send }: { garden: GardenState; send: Send }) {
  const v = garden.visitors;
  const locked = SPECIES_IDS.filter((s) => !v.unlocked.includes(s));
  return (
    <Panel title="Her visitors">
      <p className="hint">
        {v.request ? `At the door: ${v.request.visitor}${v.request.seen ? '' : ' (still knocking)'}.` : `Nobody at the door. Next one from ${new Date(v.nextAt).toLocaleString()}.`}
      </p>
      <p className="hint">Send one round now:</p>
      <Choice
        value={null}
        options={VISITOR_IDS.map((id) => ({ id, label: `${id}${v.friends[id] ? ` (${v.friends[id]!.hearts}♥)` : ''}` }))}
        disabled={() => (v.request ? 'Someone is already at the door.' : null)}
        onPick={(visitor) => send('visitor', { visitor })}
      />
      <p className="hint">
        Petals in her purse: {garden.market.petals}. Trinkets: {garden.market.owned.length}
        {garden.market.milton ? ' and Milton' : ''}.
      </p>
      <Choice value={null} options={[{ id: '5', label: '+5 petals' }, { id: '20', label: '+20 petals' }]} onPick={(n) => send('petals', { n: Number(n) })} />
      <Choice value={null} options={[{ id: '3', label: 'Open the night market for 3 h' }]} onPick={(h) => send('nightmarket', { hours: Number(h) })} />
      {locked.length > 0 && (
        <>
          <p className="hint">Flowers she can't plant yet (visitors bring the seeds):</p>
          <Choice value={null} options={locked.map((s) => ({ id: s, label: SPECIES[s].name }))} onPick={(species) => send('unlock', { species })} />
        </>
      )}
    </Panel>
  );
}

/** What was sent, newest first, and what became of it on her phone. */
export function History({ actions, garden, now }: { actions: ActionRow[]; garden: GardenState | null; now: number }) {
  return (
    <Panel title="Sent">
      {actions.length === 0 ? (
        <p className="hint">Nothing sent to this garden yet.</p>
      ) : (
        <ul className="history">
          {actions.map((a) => (
            <li key={a.id} className={a.status}>
              <span className="what">{describe(a, garden)}</span>
              <span className="when">{ago(Date.parse(a.created_at), now)}</span>
              <span className="status">
                {a.status === 'pending' ? 'Waiting for her phone' : a.status === 'applied' ? 'Done' : `Skipped: ${a.reason ?? ''}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
