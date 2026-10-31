import { useEffect, useState } from 'react';
import { backupName, backupSummary, makeBackup, readBackup, type Restored } from '../garden/backup';
import type { GardenState } from '../garden/state';
import { getImage } from '../garden/storage';
import { sendFile } from './share';
import { useWords } from '../i18n';

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
  const w = useWords();
  const { t } = w;
  const longDate = (at: number) => new Date(at).toLocaleDateString(w.locale, { day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    let live = true;
    const made = Date.now();
    makeBackup(garden, getImage, made)
      .then((text) => live && setFile(new File([text], backupName(made), { type: 'application/json' })))
      .catch(() => live && setError(t("The backup couldn't be made just now.", 'Nie udało się teraz zrobić kopii.')));
    return () => {
      live = false;
    };
    // made once, from the garden as it was when the sheet opened
  }, []);

  const save = () => {
    if (!file) return;
    setError(null);
    void sendFile(file, "Olcia's Garden backup").then((how) => {
      if (how === 'shared') setNote(t('Done. Keep it somewhere safe, like Files or iCloud Drive.', 'Gotowe. Trzymaj ją w bezpiecznym miejscu, na przykład w Plikach albo na iCloud Drive.'));
      if (how === 'downloaded') setNote(t(`Saved as ${file.name}, in Downloads.`, `Zapisano jako ${file.name}, w Pobranych.`));
    });
  };

  const choose = async () => {
    setError(null);
    setNote(null);
    const picked = await chooseFile();
    if (!picked) return;
    if (picked.size > MAX_FILE) return setError(t('That file is far too big to be a garden backup.', 'Ten plik jest za duży jak na kopię ogrodu.'));
    try {
      const r = readBackup(await picked.text(), Date.now());
      if (r) setFound(r);
      else setError(t("That file isn't a garden backup, or it's damaged.", 'To nie jest kopia ogrodu albo plik jest uszkodzony.'));
    } catch {
      setError(t("That file couldn't be opened.", 'Nie udało się otworzyć tego pliku.'));
    }
  };

  const restore = async () => {
    if (!found) return;
    setBusy(true);
    try {
      await onRestore(found);
    } catch {
      setBusy(false);
      setError(t("There wasn't room on the phone to restore it. Nothing was changed.", 'Zabrakło miejsca w telefonie. Nic nie zostało zmienione.'));
    }
  };

  return (
    <div className="sheet studio backup" role="dialog" aria-label={t('Backup', 'Kopia zapasowa')}>
      <div className="sheet-head">
        <h2>{t('Keep it safe', 'Kopia zapasowa')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <div className="studio-body">
        {error && <p className="decor-error">{error}</p>}
        {found ? (
          <section className="studio-section">
            <h3>
              {found.exportedAt
                ? t(`Backup from ${longDate(found.exportedAt)}`, `Kopia z ${longDate(found.exportedAt)}`)
                : t('A garden backup', 'Kopia ogrodu')}
            </h3>
            <p className="decor-hint">{backupSummary(found, w)}.</p>
            <p className="decor-hint">
              {t(
                'Restoring puts this in place of the garden as it is now. The garden now is kept aside on the phone, not thrown away.',
                'Przywrócenie zastąpi obecny ogród tą kopią. Obecny ogród zostanie odłożony na bok w telefonie, nie zniknie.',
              )}
            </p>
            <div className="decor-choice two">
              <button className="quiet" onClick={() => setFound(null)} disabled={busy}>{t('Not now', 'Nie teraz')}</button>
              <button className="danger" onClick={() => void restore()} disabled={busy}>
                {busy ? t('Restoring…', 'Przywracam…') : t('Restore it', 'Przywróć')}
              </button>
            </div>
          </section>
        ) : (
          <>
            <p className="decor-hint">
              {t(
                'Everything here lives only on this phone. A backup is one file with all of it inside: the plants, the diary, pressed flowers, drawings and photos.',
                'Wszystko tutaj jest zapisane tylko na tym telefonie. Kopia to jeden plik, w którym jest wszystko: rośliny, pamiętnik, zielnik, rysunki i zdjęcia.',
              )}
            </p>
            <div className="decor-buttons backup-buttons">
              <button onClick={save} disabled={!file}>{file ? t('Save a backup', 'Zapisz kopię') : t('Getting it ready…', 'Przygotowuję…')}</button>
              <button className="quiet" onClick={() => void choose()}>{t('Restore from a backup', 'Przywróć z kopii')}</button>
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
