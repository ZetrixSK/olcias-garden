import { isSoilWet, stageAt } from '../garden/growth';
import type { Plant } from '../garden/state';
import { PlantArt } from '../plants/PlantArt';
import { POT_HEIGHT, Potted, RIM } from '../plants/Pots';

/** One of her plants in its pot, as drawn in either view. Rooted at the rim; the pot hangs below. */
export function GardenPlanter({ plant, now, selected, moving, watering, ribbon = false }: {
  plant: Plant;
  now: number;
  selected: boolean;
  moving: boolean;
  watering: boolean;
  /** A little bow on the pot: on the shelves it marks the plants that are also in the window. */
  ribbon?: boolean;
}) {
  const stage = stageAt(plant.species, plant, now);
  const wet = isSoilWet(plant, now);
  // remount the inner group on each watering so the wobble replays
  const last = plant.waterings[plant.waterings.length - 1];
  return (
    <g className={moving ? 'moving' : undefined}>
      <Potted kind={plant.pot} wet={wet}>
        <g className="sway" style={{ animationDuration: `${7 + (plant.id.charCodeAt(0) % 5)}s` }}>
          <g key={last ?? 0} className={last ? 'wobble' : undefined}>
            <PlantArt species={plant.species} stage={stage} />
          </g>
        </g>
      </Potted>
      {ribbon && <Ribbon x={RIM[plant.pot][0] * 0.62} />}
      {selected && <ellipse cx="0" cy={POT_HEIGHT[plant.pot] + 4} rx="40" ry="6" fill="none" className="ink selected-ring" strokeDasharray="4 5" />}
      {watering && <WateringCan />}
    </g>
  );
}

function Ribbon({ x }: { x: number }) {
  return (
    <g transform={`translate(${x.toFixed(1)} 6) rotate(-8)`}>
      <path className="ink-thin" fill="#c95d7f" d="M-1,1 C-2,6 -4,10 -6,13 L-3.4,12.4 L-2.4,14.6 C-0.6,10.6 0.4,6 0.6,1.4 Z" />
      <path className="ink-thin" fill="#c95d7f" d="M1,1 C2.4,5 4.6,8.6 7,11 L4.4,11 L4,13.4 C2,10 0.6,5.6 0,1.6 Z" />
      <path className="ink-thin" fill="#e58aa6" d="M0,0 C-3,-5 -9,-6 -9,-2 C-9,1.6 -4,2 0,0 Z" />
      <path className="ink-thin" fill="#e58aa6" d="M0,0 C3,-5 9,-6 9,-2 C9,1.6 4,2 0,0 Z" />
      <path d="M-6.6,-2.4 C-5,-3.2 -3.4,-2.4 -2,-1.2 M6.6,-2.4 C5,-3.2 3.4,-2.4 2,-1.2" stroke="#f6c3d1" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <ellipse className="ink-thin" cx="0" cy="0" rx="2" ry="2.2" fill="#c95d7f" />
    </g>
  );
}

/** A little can tips over the pot and pours; shown for a moment after tapping Water. */
function WateringCan() {
  return (
    <g className="pour" transform="translate(0 -46) scale(1.35)">
      <g className="can">
        <path className="ink" fill="#8fa596" d="M14,-74 L16,-52 C16,-49 40,-49 40,-52 L42,-74 Z" />
        <path className="ink" fill="#8fa596" d="M16,-62 L-6,-78 L-8,-75 L14,-58 Z" />
        <path className="ink" fill="#a8bcae" d="M-10,-82 L-3,-76 L-7,-71 L-13,-77 Z" />
        <path className="ink" fill="none" strokeWidth="2.2" d="M42,-70 C54,-72 54,-56 42,-56" />
        <path d="M17,-66 L41,-66" stroke="#e69bb2" strokeWidth="2.4" />
      </g>
      {[-14, -8, -2, 4].map((dx, i) => (
        <path
          key={dx}
          className="drop-fall"
          style={{ animationDelay: `${0.35 + i * 0.12}s` }}
          d={`M${dx},-64 C${dx + 1.4},-61 ${dx + 1.6},-59.4 ${dx},-58 C${dx - 1.6},-59.4 ${dx - 1.4},-61 ${dx},-64 Z`}
          fill="#bcd8e8"
          stroke="#3d5568"
          strokeWidth="0.6"
        />
      ))}
    </g>
  );
}

/** A dashed ring with a plus: an empty place to plant or to put something. */
export function EmptySlot({ hang, highlight }: { hang?: boolean; highlight: boolean }) {
  return (
    <g className={highlight ? 'slot-target' : 'slot-empty'}>
      <ellipse cx="0" cy={hang ? 30 : 0} rx="26" ry="5" fill="none" className="ink" strokeDasharray="3 5" />
      <path d={`M0,${hang ? 24 : -6} L0,${hang ? 12 : -18} M-6,${hang ? 18 : -12} L6,${hang ? 18 : -12}`} className="ink" fill="none" strokeWidth="2" />
    </g>
  );
}
