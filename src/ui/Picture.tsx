import { useEffect, useState } from 'react';
import { snapshotScene } from '../scene/snapshot';
import { sendFile } from './share';

const fileName = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `olcias-garden-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.png`;
};

/**
 * A picture of the garden as it is right now. It's made as soon as the sheet opens, so the Save tap
 * can hand it straight to the phone (Safari only shares straight from a tap).
 */
export function PictureSheet({ onClose }: { onClose: () => void }) {
  const [pic, setPic] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    let url: string | null = null;
    snapshotScene(Math.min(3, Math.max(2, window.devicePixelRatio || 2)))
      .then((blob) => {
        if (!live) return;
        url = URL.createObjectURL(blob);
        setPic({ file: new File([blob], fileName(), { type: 'image/png' }), url });
      })
      .catch(() => live && setError(true));
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, []);

  const save = () => {
    if (!pic) return;
    void sendFile(pic.file, "Olcia's Garden").then((how) => {
      if (how === 'shared') setNote('Done. "Save Image" keeps it in Photos.');
      if (how === 'downloaded') setNote(`Saved as ${pic.file.name}, in Downloads.`);
    });
  };

  return (
    <div className="sheet studio picture" role="dialog" aria-label="A picture of the garden">
      <div className="sheet-head">
        <h2>A picture</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <div className="studio-body">
        {error ? (
          <p className="decor-error">The picture couldn't be made just now.</p>
        ) : (
          <div className="picture-frame">{pic ? <img src={pic.url} alt="The garden as it is now" /> : <span>Taking it…</span>}</div>
        )}
        {note && <p className="decor-hint">{note}</p>}
        <div className="decor-buttons picture-buttons">
          <button onClick={save} disabled={!pic}>Save picture</button>
        </div>
      </div>
    </div>
  );
}

export const CAMERA_ICON = (
  <g>
    <path d="M-10,-5 L-5,-5 L-3,-8.5 L3,-8.5 L5,-5 L10,-5 L10,8 L-10,8 Z" />
    <circle cy="1.5" r="4.2" />
  </g>
);
