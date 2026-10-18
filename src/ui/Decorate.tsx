import { useState } from 'react';
import { MAX_DRAWINGS, TILE_WIDTH, type Decor, type WallpaperSize } from '../garden/decor';

const SIZE_NAMES: Record<WallpaperSize, string> = { s: 'Small', m: 'Medium', l: 'Large' };

/** A button that asks once more before undoing something she made. */
function ConfirmButton({ label, confirm, onConfirm }: { label: string; confirm: string; onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);
  return (
    <button className={asking ? 'danger' : 'quiet'} onClick={() => (asking ? onConfirm() : setAsking(true))}>
      {asking ? confirm : label}
    </button>
  );
}

/** The sizes guide: what to draw, at what size in pixels, for each place. */
function Guide() {
  return (
    <details className="decor-guide">
      <summary>What size should my pictures be?</summary>
      <dl>
        <dt>Wallpaper</dt>
        <dd>
          A square drawing, about <b>512 × 512 px</b> (anything up to 1024 is kept sharp). It repeats in every direction, so make
          the left edge carry on into the right and the top into the bottom. Save it as a <b>PNG with a transparent background</b> and
          the room's own wall colour shows between your motifs; a picture with no transparency covers the wall completely.
        </dd>
        <dt>Photo frame</dt>
        <dd>
          Any photo from your gallery. The frame is upright, <b>3 wide by 4 tall</b>, for example <b>900 × 1200 px</b>. A photo of a
          different shape is cut to fit from the middle, so keep what matters near the centre.
        </dd>
        <dt>Drawings on the shelves</dt>
        <dd>
          A <b>PNG with a transparent background</b>, upright, about <b>600 × 800 px</b>, with the object standing on the bottom
          edge of the picture and only a little empty space around it. It stands on the shelf like a pot would.
        </dd>
      </dl>
      <p>Bigger pictures are fine: they're shrunk to fit when you add them. They're kept only on this phone.</p>
    </details>
  );
}

export function DecorateSheet({ decor, wallpaperUrl, photoUrl, busy, error, onWallpaper, onWallpaperLook, onWallpaperReset, onPhoto, onPhotoReset, onClose }: {
  decor: Decor;
  wallpaperUrl: string | null;
  photoUrl: string | null;
  /** Which picture is being added right now, if any. */
  busy: 'wallpaper' | 'photo' | 'drawing' | null;
  error: string | null;
  onWallpaper: () => void;
  onWallpaperLook: (patch: { size?: WallpaperSize; soft?: boolean }) => void;
  onWallpaperReset: () => void;
  onPhoto: () => void;
  onPhotoReset: () => void;
  onClose: () => void;
}) {
  const wp = decor.wallpaper;
  return (
    <div className="sheet studio decorate" role="dialog" aria-label="Decorate">
      <div className="sheet-head">
        <h2>Decorate</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <div className="studio-body">
        {error && <p className="decor-error">{error}</p>}

        <section className="studio-section">
          <h3>Wallpaper</h3>
          <div className="decor-row">
            <div
              className="decor-thumb"
              aria-hidden="true"
              style={
                wp && wallpaperUrl
                  ? { backgroundImage: `url(${wallpaperUrl})`, backgroundSize: `${(TILE_WIDTH[wp.size] * 0.6).toFixed(0)}px auto`, opacity: wp.soft ? 0.6 : 1 }
                  : undefined
              }
            >
              {!wp && <span>the room's own</span>}
            </div>
            <div className="decor-buttons">
              <button onClick={onWallpaper} disabled={busy !== null}>
                {busy === 'wallpaper' ? 'Adding…' : wp ? 'Choose another drawing' : 'Use my drawing'}
              </button>
              {wp && <ConfirmButton label="Back to the usual wallpaper" confirm="Sure? Back to the usual" onConfirm={onWallpaperReset} />}
            </div>
          </div>
          {wp && (
            <>
              <div className="decor-choice" role="group" aria-label="Pattern size">
                {(['s', 'm', 'l'] as const).map((size) => (
                  <button key={size} aria-pressed={wp.size === size} onClick={() => onWallpaperLook({ size })}>
                    {SIZE_NAMES[size]}
                  </button>
                ))}
              </div>
              <div className="decor-choice two" role="group" aria-label="Strength">
                <button aria-pressed={!wp.soft} onClick={() => onWallpaperLook({ soft: false })}>
                  Full colour
                </button>
                <button aria-pressed={wp.soft} onClick={() => onWallpaperLook({ soft: true })}>
                  Soft
                </button>
              </div>
            </>
          )}
        </section>

        <section className="studio-section">
          <h3>Photo frame</h3>
          <div className="decor-row">
            <div className="decor-thumb photo" aria-hidden="true" style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}>
              {!photoUrl && <span>a little painting</span>}
            </div>
            <div className="decor-buttons">
              <button onClick={onPhoto} disabled={busy !== null}>
                {busy === 'photo' ? 'Adding…' : photoUrl ? 'Choose another photo' : 'Choose a photo'}
              </button>
              {decor.photo && <ConfirmButton label="Back to the painting" confirm="Sure? Take the photo out" onConfirm={onPhotoReset} />}
            </div>
          </div>
          <p className="decor-hint">It hangs on the wall to the right in the window view. Tap it there to change it.</p>
        </section>

        <section className="studio-section">
          <h3>Drawings on the shelves</h3>
          <p className="decor-hint">
            Tap an empty spot on the shelves and choose <b>One of my drawings</b>. Tap a drawing to move it or take it down.
            {decor.drawings.length > 0 && ` (${decor.drawings.length} of ${MAX_DRAWINGS})`}
          </p>
        </section>

        <Guide />
      </div>
    </div>
  );
}

/** What she can do with a drawing on the shelves. */
export function DrawingCard({ onMove, onRemove, onClose }: { onMove: () => void; onRemove: () => void; onClose: () => void }) {
  return (
    <div className="sheet" role="dialog" aria-label="Your drawing">
      <div className="sheet-head">
        <h2>Your drawing</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <div className="actions two-wide">
        <button onClick={onMove}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-10,0 L10,0 M6,-4 L10,0 L6,4 M-6,-4 L-10,0 L-6,4" />
          </svg>
          Move
        </button>
        <ConfirmButton label="Take it down" confirm="Sure? Take it down" onConfirm={onRemove} />
      </div>
    </div>
  );
}
