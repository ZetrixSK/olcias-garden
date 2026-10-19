import { useEffect, useState } from 'react';
import { backupName, backupSummary, makeBackup, readBackup, type Restored } from '../garden/backup';
import type { GardenState } from '../garden/state';
import { getImage } from '../garden/storage';

/** Hands the file to the phone's share sheet (Save to Files, AirDrop, a message), or downloads it where sharing a file isn't possible. */
function sendFile(file: File): Promise<'shared' | 'downloaded' | 'cancelled'> {
  if (navigator.canShare?.({ files: [file] })) {
    return navigator.share({ files: [file], title: "Olcia's Garden backup" }).then(
      () => 'shared' as const,
      (e: unknown) => (e instanceof DOMException && e.name === 'AbortError' ? 'cancelled' : download(file)),
    );
  }
  return Promise.resolve(download(file));
}

function download(file: File): 'downloaded' {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  return 'downloaded';
}

/** Opens the phone's file picker; null if she cancels. */
function chooseFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    // no file type filter: some phones grey out .json files when one is given
    input.style.display = 'none';
    document.body.appendChild(input);
    const done = (file: File | null) => {
      input.remove();
      resolve(file);
    };
    input.onchange = () => done(input.files?.[0] ?? null);
    input.addEventListener('cancel', () => done(null));
    input.click();
  });
}

const longDate = (t: number) => new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

const MAX_FILE = 200 * 1024 * 1024;

/** Saving the whole garden into one file, and bringing one back. */
export function BackupSheet({ garden, onRestore, onClose }: {
  garden: GardenState;
  onRestore: (r: Restored) => Promise<void>;
  onClose: () => void;
}) {
  // the file is made as soon as the sheet opens: Safari only opens its share sheet straight from a tap
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<Restored | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    const t = Date.now();
    makeBackup(garden, getImage, t)
      .then((text) => live && setFile(new File([text], backupName(t), { type: 'application/json' })))
      .catch(() => live && setError("The backup couldn't be made just now."));
    return () => {
      live = false;
    };
    // made once, from the garden as it was when the sheet opened
  }, []);

  const save = () => {
    if (!file) return;
    setError(null);
    void sendFile(file).then((how) => {
      if (how === 'shared') setNote('Done. Keep it somewhere safe, like Files or iCloud Drive.');
      if (how === 'downloaded') setNote(`Saved as ${file.name}, in Downloads.`);
    });
  };

  const choose = async () => {
    setError(null);
    setNote(null);
    const picked = await chooseFile();
    if (!picked) return;
    if (picked.size > MAX_FILE) return setError("That file is far too big to be a garden backup.");
    try {
      const r = readBackup(await picked.text(), Date.now());
      if (r) setFound(r);
      else setError("That file isn't a garden backup, or it's damaged.");
    } catch {
      setError("That file couldn't be opened.");
    }
  };

  const restore = async () => {
    if (!found) return;
    setBusy(true);
    try {
      await onRestore(found);
    } catch {
      setBusy(false);
      setError("There wasn't room on the phone to restore it. Nothing was changed.");
    }
  };

  return (
    <div className="sheet studio backup" role="dialog" aria-label="Backup">
      <div className="sheet-head">
        <h2>Keep it safe</h2>
        <button className="close" aria-label="Close" onClick={onClose}>×</button>
      </div>
      <div className="studio-body">
        {error && <p className="decor-error">{error}</p>}
        {found ? (
          <section className="studio-section">
            <h3>{found.exportedAt ? `Backup from ${longDate(found.exportedAt)}` : 'A garden backup'}</h3>
            <p className="decor-hint">{backupSummary(found)}.</p>
            <p className="decor-hint">Restoring puts this in place of the garden as it is now. The garden now is kept aside on the phone, not thrown away.</p>
            <div className="decor-choice two">
              <button className="quiet" onClick={() => setFound(null)} disabled={busy}>Not now</button>
              <button className="danger" onClick={() => void restore()} disabled={busy}>{busy ? 'Restoring…' : 'Restore it'}</button>
            </div>
          </section>
        ) : (
          <>
            <p className="decor-hint">
              Everything here lives only on this phone. A backup is one file with all of it inside: the plants, the diary,
              pressed flowers, drawings and photos.
            </p>
            <div className="decor-buttons backup-buttons">
              <button onClick={save} disabled={!file}>{file ? 'Save a backup' : 'Getting it ready…'}</button>
              <button className="quiet" onClick={() => void choose()}>Restore from a backup</button>
            </div>
            {note && <p className="decor-hint">{note}</p>}
          </>
        )}
      </div>
    </div>
  );
}

export const BACKUP_ICON = (
  <g>
    <path d="M-9,-3 L-9,9 L9,9 L9,-3" />
    <path d="M0,-11 L0,4 M-5,-1 L0,4 L5,-1" />
  </g>
);
