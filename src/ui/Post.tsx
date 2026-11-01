import { useEffect, useState } from 'react';
import type { Words } from '../i18n';
import { useWords } from '../i18n';
import type { AccessRule, PostError, VisitLevel } from '../remote/client';
import { AccessSection, VisitStart } from './Visit';
import type { Arrival } from '../remote/useMail';

/** A tag as she types it: lower case, letters, numbers and _, no # (that's drawn in front). */
export const cleanTag = (s: string) => s.replace(/^#/, '').toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
export const validTag = (s: string) => /^[a-z0-9_]{3,20}$/.test(s);

export function postMessage(e: PostError, w: Words): string {
  const { t } = w;
  switch (e) {
    case 'taken':
      return t('Someone already has that tag. Try another.', 'Ktoś już ma ten tag. Spróbuj innego.');
    case 'bad tag':
      return t('A tag is 3 to 20 letters, numbers or _.', 'Tag to od 3 do 20 liter, cyfr albo _.');
    case 'no tag':
      return t('Choose your own tag first, so they know it’s from you.', w.other('Najpierw wybierz swój tag, żeby wiedziała, że to od Ciebie.', 'Najpierw wybierz swój tag, żeby wiedział, że to od Ciebie.'));
    case 'no such tag':
      return t('Nobody has that tag.', 'Nikt nie ma takiego tagu.');
    case 'too many today':
      return t("That's a lot of bouquets for one day. Try again tomorrow.", 'To dużo bukietów jak na jeden dzień. Spróbuj jutro.');
    case 'not allowed':
      return t("Their garden isn't open to you for that.", 'W tym ogrodzie nie masz na to pozwolenia.');
    case 'no garden':
      return t("That garden hasn't been opened yet.", 'Ten ogród nie był jeszcze otwierany.');
    case 'yourself':
      return t("That's your own garden!", 'To Twój własny ogród!');
    case 'offline':
      return t("Couldn't reach the post. Try again when you're online.", 'Nie udało się połączyć z pocztą. Spróbuj ponownie, kiedy będzie internet.');
  }
}

/** A field for a tag, with the # drawn in front. */
export function TagInput({ value, onChange, placeholder, autoFocus }: { value: string; onChange: (v: string) => void; placeholder: string; autoFocus?: boolean }) {
  return (
    <label className="tag-input">
      <span aria-hidden="true">#</span>
      <input
        value={value}
        onChange={(e) => onChange(cleanTag(e.target.value))}
        placeholder={placeholder}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        maxLength={21}
        autoFocus={autoFocus}
      />
    </label>
  );
}

/** Taking her own tag: what others send bouquets to, and what they see a bouquet is from. */
export function ClaimTag({ current, onClaim }: { current: string | null; onClaim: (tag: string) => Promise<PostError | null> }) {
  const w = useWords();
  const { t } = w;
  const [tag, setTag] = useState(current ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<PostError | null>(null);
  return (
    <form
      className="claim"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!validTag(tag)) return setError('bad tag');
        setBusy(true);
        setError(await onClaim(tag));
        setBusy(false);
      }}
    >
      <TagInput value={tag} onChange={setTag} placeholder={t('yourname', 'twojeimie')} />
      <button type="submit" disabled={busy || !tag || tag === current}>
        {busy ? t('Moment…', 'Chwila…') : current ? t('Change', 'Zmień') : t('Take it', 'Biorę')}
      </button>
      {error && <p className="decor-error">{postMessage(error, w)}</p>}
    </form>
  );
}

/**
 * Her post box: her own tag, bouquets waiting in the box on the floor, the tags she has sent to,
 * and the tags she doesn't want post from.
 */
export function PostSheet({ tag, contacts, parcels, onClaim, onParcels, loadBlocked, onUnblock, onVisit, loadAccess, onSetAccess, onClose }: {
  tag: string | null;
  contacts: string[];
  parcels: number;
  onClaim: (tag: string) => Promise<PostError | null>;
  onParcels: () => void;
  loadBlocked: () => Promise<string[] | null>;
  onUnblock: (tag: string) => Promise<boolean>;
  onVisit: (tag: string) => Promise<PostError | null>;
  loadAccess: () => Promise<AccessRule[] | null>;
  onSetAccess: (who: string, level: VisitLevel | null) => Promise<boolean>;
  onClose: () => void;
}) {
  const w = useWords();
  const { t } = w;
  const [blocked, setBlocked] = useState<string[] | null>(null);
  useEffect(() => {
    void loadBlocked().then(setBlocked);
  }, [loadBlocked]);
  return (
    <div className="sheet studio" role="dialog" aria-label={t('Post box', 'Skrzynka pocztowa')}>
      <div className="sheet-head">
        <h2>{t('Post box', 'Skrzynka pocztowa')}</h2>
        <button className="close" aria-label={t('Close', 'Zamknij')} onClick={onClose}>×</button>
      </div>
      <div className="studio-body">
        <section className="studio-section">
          <h3>{t('Your tag', 'Twój tag')}</h3>
          <p className="hint">
            {tag
              ? t(`Others send bouquets to #${tag}, and see it on the ones you send.`, `Na #${tag} inni mogą wysyłać Ci bukiety. Ten tag widać też na bukietach od Ciebie.`)
              : t('Choose a tag so others can send you bouquets, and know who yours are from.', 'Wybierz tag, żeby inni mogli wysyłać Ci bukiety i wiedzieli, od kogo dostają Twoje.')}
          </p>
          <ClaimTag current={tag} onClaim={onClaim} />
        </section>
        <section className="studio-section">
          <h3>{t('Visit a garden', 'Odwiedź ogród')}</h3>
          {tag ? (
            <VisitStart onVisit={onVisit} />
          ) : (
            <p className="hint">{t('Take a tag first, so they know who came.', w.other('Najpierw wybierz swój tag, żeby wiedziała, kto przyszedł w odwiedziny.', 'Najpierw wybierz swój tag, żeby wiedział, kto przyszedł w odwiedziny.'))}</p>
          )}
        </section>
        {tag && (
          <section className="studio-section">
            <h3>{t('Who can visit your garden', 'Kto może odwiedzać Twój ogród')}</h3>
            <AccessSection load={loadAccess} onSet={onSetAccess} />
          </section>
        )}
        {parcels > 0 && (
          <section className="studio-section">
            <h3>{t('Waiting in the box', 'Czeka w pudełku')}</h3>
            <button className="wide" onClick={onParcels}>
              {t(`${parcels} bouquet${parcels === 1 ? '' : 's'} on the floor`, `Bukiety na podłodze: ${parcels}`)}
            </button>
          </section>
        )}
        {contacts.length > 0 && (
          <section className="studio-section">
            <h3>{t("You've sent to", w.g('Wysyłałaś do', 'Wysyłałeś do'))}</h3>
            <p className="contacts">{contacts.map((c) => `#${c}`).join('  ')}</p>
          </section>
        )}
        <section className="studio-section">
          <h3>{t('Blocked', 'Zablokowane')}</h3>
          {blocked === null ? (
            <p className="hint">{t('The list needs the internet.', 'Do wyświetlenia listy potrzebny jest internet.')}</p>
          ) : blocked.length === 0 ? (
            <p className="hint">{t('Nobody. You can block someone from a bouquet they sent.', 'Nikt. Nadawcę możesz zablokować, otwierając bukiet od tej osoby.')}</p>
          ) : (
            <ul className="blocked">
              {blocked.map((b) => (
                <li key={b}>
                  #{b}
                  <button
                    onClick={async () => {
                      if (await onUnblock(b)) setBlocked((list) => (list ?? []).filter((x) => x !== b));
                    }}
                  >
                    {t('Unblock', 'Odblokuj')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export type Notice = { title: string; text: string };

/** What she's told when a bouquet arrives while she's looking. */
export function arrivalNotice(a: Arrival, { t }: Words): Notice {
  return {
    title: t(`A bouquet from #${a.from}!`, `Bukiet od #${a.from}!`),
    text: a.inBox ? t("It's waiting in a box on the floor.", 'Czeka w pudełku na podłodze.') : t("It's on your shelves.", 'Stoi na Twoich półkach.'),
  };
}

/** A note for a moment: a bouquet arrived, or one is on its way. Tap to put it away sooner. */
export function NoticeNote({ notice, onDone }: { notice: Notice; onDone: () => void }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, 5200);
    return () => window.clearTimeout(timer);
  }, [notice, onDone]);
  return (
    <div className="arrival" role="status" onClick={onDone}>
      <strong>{notice.title}</strong>
      <span>{notice.text}</span>
    </div>
  );
}
