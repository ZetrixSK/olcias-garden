import { useState } from 'react';
import {
  designRef, PANSY_FACES, PANSY_SWATCHES, POT_PATTERNS, POT_SHAPES, POT_SWATCHES, SWATCH_NAMES,
  type PansyDesign, type PotDesign,
} from '../garden/designs';
import { SPECIES } from '../garden/species';
import { newId, type GardenState } from '../garden/state';
import { designColors } from '../plants/looks';
import { PansyFlower, PansyPlant } from '../plants/Pansy';
import { Potted } from '../plants/Pots';
import { Panel, type Send } from './Panels';

const NEW_PANSY: Omit<PansyDesign, 'id'> = { name: '', top: '#241326', low: '#eaa2bb', face: 'blotch', faceColor: '#241326', edge: null };
const NEW_POT: Omit<PotDesign, 'id'> = { shape: 'wide', body: '#2b2229', pattern: 'scallops', patternColor: '#e79ab4', rim: '#2b2229' };

function Swatches({ colors, value, onPick, none }: { colors: readonly string[]; value: string | null; onPick: (c: string | null) => void; none?: string }) {
  return (
    <div className="swatches">
      {none && (
        <button type="button" className={`swatch none${value === null ? ' on' : ''}`} aria-pressed={value === null} onClick={() => onPick(null)}>
          {none}
        </button>
      )}
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          className={`swatch${value === c ? ' on' : ''}`}
          style={{ background: c }}
          aria-label={SWATCH_NAMES[c] ?? c}
          aria-pressed={value === c}
          title={SWATCH_NAMES[c] ?? c}
          onClick={() => onPick(c)}
        />
      ))}
    </div>
  );
}

function Options<T extends string>({ items, value, onPick }: { items: readonly T[]; value: T; onPick: (v: T) => void }) {
  return (
    <div className="choices">
      {items.map((i) => (
        <button key={i} type="button" className={i === value ? 'on' : ''} aria-pressed={i === value} onClick={() => onPick(i)}>
          {i[0]!.toUpperCase() + i.slice(1)}
        </button>
      ))}
    </div>
  );
}

/**
 * A new bratek or painted pot for her garden, from the same swatches her own studio offers, so it
 * belongs to the same world. It can go straight onto one of her plants.
 */
export function DesignPanel({ garden, send }: { garden: GardenState; send: Send }) {
  const [type, setType] = useState<'pansy' | 'pot'>('pansy');
  const [pansy, setPansy] = useState(NEW_PANSY);
  const [pot, setPot] = useState(NEW_POT);
  const [giveTo, setGiveTo] = useState('');
  const takers = garden.plants.filter((p) => type === 'pot' || p.species === 'pansy');
  const colors = designColors({ id: 'preview', ...pansy });

  const sendIt = async () => {
    const id = newId();
    const design = type === 'pansy' ? { id, ...pansy } : { id, ...pot };
    await send('design', { type, design });
    // only once the design is stored, so her phone carries this out after the design exists
    if (giveTo) await send(type === 'pansy' ? 'variety' : 'pot', type === 'pansy' ? { plant: giveTo, variety: designRef(id) } : { plant: giveTo, pot: designRef(id) });
    setGiveTo('');
  };

  return (
    <Panel title="Design something">
      <div className="choices">
        <button type="button" className={type === 'pansy' ? 'on' : ''} aria-pressed={type === 'pansy'} onClick={() => setType('pansy')}>A bratek</button>
        <button type="button" className={type === 'pot' ? 'on' : ''} aria-pressed={type === 'pot'} onClick={() => setType('pot')}>A pot</button>
      </div>

      <div className="design-preview">
        {type === 'pansy' ? (
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
        ) : (
          <svg viewBox="-60 -128 120 192" aria-hidden="true">
            <Potted kind={pot.shape} design={{ id: 'preview', ...pot }}>
              <PansyPlant stage="bloom" />
            </Potted>
          </svg>
        )}
      </div>

      {type === 'pansy' ? (
        <>
          <h3>Name</h3>
          <input value={pansy.name} maxLength={32} placeholder="Her new bratek" onChange={(e) => setPansy({ ...pansy, name: e.target.value })} />
          <h3>Top petals</h3>
          <Swatches colors={PANSY_SWATCHES} value={pansy.top} onPick={(c) => c && setPansy({ ...pansy, top: c })} />
          <h3>Lower petals</h3>
          <Swatches colors={PANSY_SWATCHES} value={pansy.low} onPick={(c) => c && setPansy({ ...pansy, low: c })} />
          <h3>Face</h3>
          <Options items={PANSY_FACES} value={pansy.face} onPick={(face) => setPansy({ ...pansy, face })} />
          {pansy.face !== 'clear' && (
            <>
              <h3>Face colour</h3>
              <Swatches colors={PANSY_SWATCHES} value={pansy.faceColor} onPick={(c) => c && setPansy({ ...pansy, faceColor: c })} />
            </>
          )}
          <h3>Edge</h3>
          <Swatches colors={PANSY_SWATCHES} value={pansy.edge} none="None" onPick={(edge) => setPansy({ ...pansy, edge })} />
        </>
      ) : (
        <>
          <h3>Shape</h3>
          <Options items={POT_SHAPES} value={pot.shape} onPick={(shape) => setPot({ ...pot, shape })} />
          <h3>Colour</h3>
          <Swatches colors={POT_SWATCHES} value={pot.body} onPick={(c) => c && setPot({ ...pot, body: c })} />
          <h3>Pattern</h3>
          <Options items={POT_PATTERNS} value={pot.pattern} onPick={(pattern) => setPot({ ...pot, pattern })} />
          {pot.pattern !== 'none' && (
            <>
              <h3>Pattern colour</h3>
              <Swatches colors={POT_SWATCHES} value={pot.patternColor} onPick={(c) => c && setPot({ ...pot, patternColor: c })} />
            </>
          )}
          <h3>Rim</h3>
          <Swatches colors={POT_SWATCHES} value={pot.rim} onPick={(c) => c && setPot({ ...pot, rim: c })} />
        </>
      )}

      <h3>Give it to</h3>
      <select value={giveTo} onChange={(e) => setGiveTo(e.target.value)}>
        <option value="">Just add it to her designs</option>
        {takers.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name ? `${p.name} (${SPECIES[p.species].name.toLowerCase()})` : SPECIES[p.species].name}
          </option>
        ))}
      </select>
      <div className="row">
        <button type="button" className="primary" onClick={() => void sendIt()}>
          Send to her garden
        </button>
      </div>
    </Panel>
  );
}
