import { useState } from 'react';
import { stageAt } from '../garden/growth';
import { SPECIES, SPECIES_IDS, STAGE_LABEL, type GardenPot, type SpeciesId, type Stage } from '../garden/species';
import type { Plant } from '../garden/state';
import { PlantArt } from '../plants/PlantArt';
import { Potted } from '../plants/Pots';

function Preview({ species, stage = 'bloom', pot = SPECIES[species].pot }: { species: SpeciesId; stage?: Stage; pot?: GardenPot }) {
  return (
    <svg viewBox="-56 -150 112 210" aria-hidden="true">
      <Potted kind={pot}>
        <PlantArt species={species} stage={stage} />
      </Potted>
    </svg>
  );
}

const WINDOW_ICON = <path d="M-8,10 L-8,-2 A8,8 0 0 1 8,-2 L8,10 Z M0,-10 L0,10 M-8,2 L8,2" />;

export function PlantPicker({ onPick, onClose }: { onPick: (s: SpeciesId) => void; onClose: () => void }) {
  return (
    <div className="sheet" role="dialog" aria-label="Plant something">
      <div className="sheet-head">
        <h2>What shall we plant?</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <div className="picker">
        {SPECIES_IDS.map((s) => (
          <button key={s} onClick={() => onPick(s)}>
            <Preview species={s} />
            <span className="pl">{SPECIES[s].polish}</span>
            <span className="en">{SPECIES[s].name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function plantedText(plant: Plant, now: number): string {
  const days = Math.floor((now - plant.plantedAt) / 86_400_000);
  if (days <= 0) return 'Planted today';
  if (days === 1) return 'Planted yesterday';
  return `Planted ${days} days ago`;
}

/** Which of her plants goes into an empty window spot. */
export function WindowChooser({ plants, now, onPick, onShelves, onClose }: {
  plants: Plant[];
  now: number;
  onPick: (id: string) => void;
  onShelves: () => void;
  onClose: () => void;
}) {
  return (
    <div className="sheet" role="dialog" aria-label="Put a plant in the window">
      <div className="sheet-head">
        <h2>Which one goes here?</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      {plants.length === 0 ? (
        <div className="empty-note">
          <p>Everything on the shelves is already in the window.</p>
          <button onClick={onShelves}>Plant something new</button>
        </div>
      ) : (
        <div className="picker scroll">
          {plants.map((p) => (
            <button key={p.id} onClick={() => onPick(p.id)}>
              <Preview species={p.species} stage={stageAt(p.species, p, now)} pot={p.pot} />
              <span className="pl">{SPECIES[p.species].polish}</span>
              <span className="en">{STAGE_LABEL[stageAt(p.species, p, now)]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PlantCard({ plant, now, inWindowView, onWater, onMove, onWindow, onPot, onRemove, onClose }: {
  plant: Plant;
  now: number;
  /** In the window view the card offers taking the plant down; on the shelves, putting it up or removing it. */
  inWindowView: boolean;
  onWater: () => void;
  onMove: () => void;
  onWindow: () => void;
  onPot: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const info = SPECIES[plant.species];
  const stage = stageAt(plant.species, plant, now);
  return (
    <div className="sheet" role="dialog" aria-label={info.name}>
      <div className="sheet-head">
        <h2>
          {info.polish} <small>{info.name}</small>
        </h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <p className="meta">
        {STAGE_LABEL[stage]} · {plantedText(plant, now)}
        {!inWindowView && plant.display && ' · in the window'}
      </p>
      <div className={inWindowView ? 'actions' : 'actions five'}>
        <button onClick={onWater}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-2,8 L-1,-3 C-1,-5 9,-5 9,-3 L10,8 Z M-1,0 L-11,-8 M-13,-10 L-9,-6 M9,-2 C14,-3 14,5 9.6,5" />
          </svg>
          Water
        </button>
        <button onClick={onMove}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-10,0 L10,0 M6,-4 L10,0 L6,4 M-6,-4 L-10,0 L-6,4" />
          </svg>
          Move
        </button>
        {!inWindowView && (
          <button onClick={onWindow}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">{WINDOW_ICON}</svg>
            {plant.display ? 'Take down' : 'Window'}
          </button>
        )}
        <button onClick={onPot}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-9,-6 L9,-6 L6,9 L-6,9 Z M-10,-9 L10,-9 L10,-6 L-10,-6 Z" />
          </svg>
          Pot
        </button>
        {inWindowView ? (
          <button onClick={onWindow}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M0,-9 L0,7 M-5,2 L0,7 L5,2 M-9,10 L9,10" />
            </svg>
            Take down
          </button>
        ) : (
          <button className={confirm ? 'danger' : undefined} onClick={() => (confirm ? onRemove() : setConfirm(true))}>
            <svg viewBox="-14 -14 28 28" aria-hidden="true">
              <path d="M-8,-6 L8,-6 M-3,-6 L-3,-9 L3,-9 L3,-6 M-6,-6 L-5,9 L5,9 L6,-6" />
            </svg>
            {confirm ? 'Sure?' : 'Remove'}
          </button>
        )}
      </div>
    </div>
  );
}

export function MoveBanner({ text, onCancel }: { text: string; onCancel: () => void }) {
  return (
    <div className="banner" role="status">
      <span>{text}</span>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
}
