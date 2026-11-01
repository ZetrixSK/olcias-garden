import { useState } from 'react';
import { MAX_DRAWINGS, TILE_WIDTH, type Decor, type WallpaperSize } from '../garden/decor';
import { useWords } from '../i18n';

const SIZE_NAMES: Record<WallpaperSize, [string, string]> = { s: ['Small', 'Mały'], m: ['Medium', 'Średni'], l: ['Large', 'Duży'] };

/** A button that asks once more before undoing something she made. */
export function ConfirmButton({ label, confirm, onConfirm }: { label: string; confirm: string; onConfirm: () => void }) {
  const [asking, setAsking] = useState(false);
  return (
    <button className={asking ? 'danger' : 'quiet'} onClick={() => (asking ? onConfirm() : setAsking(true))}>
      {asking ? confirm : label}
    </button>
  );
}

/** The sizes guide: what to draw, at what size in pixels, for each place. */
function Guide() {
  const { pl } = useWords();
  if (pl) {
    return (
      <details className="decor-guide">
        <summary>Jakiego rozmiaru mają być obrazki?</summary>
        <dl>
          <dt>Tapeta</dt>
          <dd>
            Kwadratowy rysunek, około <b>512 × 512 px</b> (do 1024 px pozostaje ostry). Powtarza się we wszystkie strony, więc lewa krawędź
            powinna przechodzić w prawą, a górna w dolną. Zapisz go jako <b>PNG z przezroczystym tłem</b>, a między Twoimi wzorkami
            będzie widać kolor ściany; obrazek bez przezroczystości zakryje całą ścianę.
          </dd>
          <dt>Ramka na zdjęcie</dt>
          <dd>
            Dowolne zdjęcie z galerii. Ramka jest pionowa, <b>3 na 4</b>, na przykład <b>900 × 1200 px</b>. Zdjęcie o innym kształcie
            zostanie przycięte od środka, więc to, co ważne, trzymaj blisko środka.
          </dd>
          <dt>Rysunki na półkach</dt>
          <dd>
            <b>PNG z przezroczystym tłem</b>, pionowy, około <b>600 × 800 px</b>, z przedmiotem stojącym na dolnej krawędzi obrazka
            i odrobiną pustego miejsca dookoła. Stoi na półce tak jak doniczka.
          </dd>
        </dl>
        <p>Większe obrazki też się nadają: zostaną zmniejszone przy dodawaniu. Są zapisane tylko w tym telefonie.</p>
      </details>
    );
  }
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
  const { t } = useWords();
  return (
    <div className="sheet studio decorate" role="dialog" aria-label={t('Decorate', 'Dekoracje')}>
      <div className="sheet-head">
        <h2>{t('Decorate', 'Dekoracje')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <div className="studio-body">
        {error && <p className="decor-error">{error}</p>}

        <section className="studio-section">
          <h3>{t('Wallpaper', 'Tapeta')}</h3>
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
              {!wp && <span>{t("the room's own", 'zwykła')}</span>}
            </div>
            <div className="decor-buttons">
              <button onClick={onWallpaper} disabled={busy !== null}>
                {busy === 'wallpaper' ? t('Adding…', 'Dodaję…') : wp ? t('Choose another drawing', 'Wybierz inny rysunek') : t('Use my drawing', 'Użyj mojego rysunku')}
              </button>
              {wp && (
                <ConfirmButton
                  label={t('Back to the usual wallpaper', 'Wróć do zwykłej tapety')}
                  confirm={t('Sure? Back to the usual', 'Na pewno? Wróć do zwykłej')}
                  onConfirm={onWallpaperReset}
                />
              )}
            </div>
          </div>
          {wp && (
            <>
              <div className="decor-choice" role="group" aria-label={t('Pattern size', 'Rozmiar wzoru')}>
                {(['s', 'm', 'l'] as const).map((size) => (
                  <button key={size} aria-pressed={wp.size === size} onClick={() => onWallpaperLook({ size })}>
                    {t(...SIZE_NAMES[size])}
                  </button>
                ))}
              </div>
              <div className="decor-choice two" role="group" aria-label={t('Strength', 'Intensywność')}>
                <button aria-pressed={!wp.soft} onClick={() => onWallpaperLook({ soft: false })}>
                  {t('Full colour', 'Pełny kolor')}
                </button>
                <button aria-pressed={wp.soft} onClick={() => onWallpaperLook({ soft: true })}>
                  {t('Soft', 'Delikatny')}
                </button>
              </div>
            </>
          )}
        </section>

        <section className="studio-section">
          <h3>{t('Photo frame', 'Ramka na zdjęcie')}</h3>
          <div className="decor-row">
            <div className="decor-thumb photo" aria-hidden="true" style={photoUrl ? { backgroundImage: `url(${photoUrl})` } : undefined}>
              {!photoUrl && <span>{t('a little painting', 'mały obrazek')}</span>}
            </div>
            <div className="decor-buttons">
              <button onClick={onPhoto} disabled={busy !== null}>
                {busy === 'photo' ? t('Adding…', 'Dodaję…') : photoUrl ? t('Choose another photo', 'Wybierz inne zdjęcie') : t('Choose a photo', 'Wybierz zdjęcie')}
              </button>
              {decor.photo && (
                <ConfirmButton
                  label={t('Back to the painting', 'Wróć do obrazka')}
                  confirm={t('Sure? Take the photo out', 'Na pewno? Wyjmij zdjęcie')}
                  onConfirm={onPhotoReset}
                />
              )}
            </div>
          </div>
          <p className="decor-hint">
            {t('It hangs on the wall to the right in the window view. Tap it there to change it.', 'Wisi na ścianie po prawej, w widoku okna. Stuknij ją tam, żeby zmienić.')}
          </p>
        </section>

        <section className="studio-section">
          <h3>{t('Drawings on the shelves', 'Rysunki na półkach')}</h3>
          <p className="decor-hint">
            {t('Tap an empty spot on the shelves and choose ', 'Stuknij puste miejsce na półce i wybierz ')}
            <b>{t('One of my drawings', 'Mój rysunek')}</b>
            {t('. Tap a drawing to move it or take it down.', '. Stuknij rysunek, żeby go przesunąć albo zdjąć.')}
            {decor.drawings.length > 0 && ` (${decor.drawings.length} ${t('of', 'z')} ${MAX_DRAWINGS})`}
          </p>
        </section>

        <Guide />
      </div>
    </div>
  );
}

/** What she can do with a drawing on the shelves. */
export function DrawingCard({ onMove, onRemove, onClose }: { onMove: () => void; onRemove: () => void; onClose: () => void }) {
  const { t } = useWords();
  return (
    <div className="sheet" role="dialog" aria-label={t('Your drawing', 'Twój rysunek')}>
      <div className="sheet-head">
        <h2>{t('Your drawing', 'Twój rysunek')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <div className="actions two-wide">
        <button onClick={onMove}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-10,0 L10,0 M6,-4 L10,0 L6,4 M-6,-4 L-10,0 L-6,4" />
          </svg>
          {t('Move', 'Przesuń')}
        </button>
        <ConfirmButton label={t('Take it down', 'Zdejmij')} confirm={t('Sure? Take it down', 'Na pewno? Zdejmij')} onConfirm={onRemove} />
      </div>
    </div>
  );
}
