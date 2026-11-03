import { CHANGELOG } from '../changelog';
import { useWords } from '../i18n';

/** "What's new": each version of the garden on a notebook page, newest first. */
export function WhatsNew({ onClose }: { onClose: () => void }) {
  const w = useWords();
  const { t } = w;
  const when = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return w.date(new Date(y!, m! - 1, d!), { day: 'numeric', month: 'long', year: 'numeric' });
  };
  return (
    <>
      <div className="scrim letter-scrim" onClick={onClose} />
      <div className="book whats-new" role="dialog" aria-label={t("What's new", 'Co nowego')}>
        <div className="book-page">
          <h2>{t("What's new", 'Co nowego')}</h2>
          {CHANGELOG.map((e) => (
            <section key={e.version} className="news-entry">
              <h3>
                <span className="news-version">{e.version.replace(/\.0$/, '')}</span>
                <span className="news-date">{when(e.date)}</span>
              </h3>
              <ul>
                {e.en.map((line, i) => {
                  const pl = e.pl[i]!;
                  return <li key={i}>{w.pl ? (Array.isArray(pl) ? w.g(pl[0], pl[1]) : pl) : line}</li>;
                })}
              </ul>
            </section>
          ))}
        </div>
        <div className="letter-actions book-actions">
          <button onClick={onClose}>{t('Close', 'Zamknij')}</button>
        </div>
      </div>
    </>
  );
}

/** A notebook with a little star: the icon for "What's new". */
export const NEWS_ICON = (
  <g>
    <path d="M-8,-10 L7,-10 C8.6,-10 9,-9.4 9,-8 L9,10 L-8,10 C-9.4,10 -10,9.4 -10,8 L-10,-8 C-10,-9.4 -9.4,-10 -8,-10 Z M-6,-10 L-6,10" />
    <path d="M2,-5.4 L3.1,-2.6 L6,-2.4 L3.7,-0.6 L4.5,2.2 L2,0.6 L-0.5,2.2 L0.3,-0.6 L-2,-2.4 L0.9,-2.6 Z" />
  </g>
);
