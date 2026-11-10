import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/playfair-display/latin-ext-700.css';
import '@fontsource/playfair-display/latin-900.css';
import '@fontsource/playfair-display/latin-ext-900.css';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/playfair-display/latin-ext-700-italic.css';
import '@fontsource/old-standard-tt/latin-400.css';
import '@fontsource/old-standard-tt/latin-ext-400.css';
import '@fontsource/old-standard-tt/latin-400-italic.css';
import '@fontsource/old-standard-tt/latin-ext-400-italic.css';
import '@fontsource/old-standard-tt/latin-700.css';
import '@fontsource/old-standard-tt/latin-ext-700.css';
import '@fontsource/anton/latin-400.css';
import '@fontsource/anton/latin-ext-400.css';
import '@fontsource/archivo/latin-400.css';
import '@fontsource/archivo/latin-ext-400.css';
import '@fontsource/archivo/latin-600.css';
import '@fontsource/archivo/latin-ext-600.css';
import '@fontsource/archivo/latin-800.css';
import '@fontsource/archivo/latin-ext-800.css';
import './paper.css';
import type { GardenState } from '../garden/state';
import type { Lang, Me } from '../i18n';
import { PlantArt } from '../plants/PlantArt';
import { buildIssue, PAPERS_BEGAN, roman, type Issue, type Story } from './issue';
import { dayKeyOf, paperDate } from './log';
import { PaperArt } from './PaperArt';
import { useWorld } from './worldCache';
import type { WorldItem } from './world';

type Which = 'kurier' | 'bee';

const t = (lang: 'pl' | 'en', en: string, pl: string) => (lang === 'pl' ? pl : en);

function SkyIcon({ sky, night }: { sky: 'clear' | 'cloudy' | 'rain'; night: boolean }) {
  return (
    <svg className="paper-sky" viewBox="0 0 34 26" aria-hidden="true">
      {sky === 'clear' && !night && (
        <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <circle cx="17" cy="13" r="5.6" />
          <path d="M17,2 L17,4.6 M17,21.4 L17,24 M6,13 L8.6,13 M25.4,13 L28,13 M9.2,5.2 L11,7 M23,19 L24.8,20.8 M24.8,5.2 L23,7 M11,19 L9.2,20.8" />
        </g>
      )}
      {sky === 'clear' && night && <path d="M21,4 C14,5 11,13 15,19 C9,18 6,11 9,6 C12,2 17,2 21,4 Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />}
      {sky !== 'clear' && (
        <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round">
          <path d="M8,19 C3,19 2,12 7,11 C7,5 15,3 18,8 C21,4 29,6 28,12 C33,12 33,19 28,19 Z" />
          {sky === 'rain' && <path d="M10,22 L9,25 M17,22 L16,25 M24,22 L23,25" />}
        </g>
      )}
    </svg>
  );
}

function Lead({ story, tone }: { story: Story; tone: 'sepia' | 'black' }) {
  const [first, ...rest] = story.body;
  return (
    <article className="paper-lead">
      {story.kicker && <span className="paper-kicker">{story.kicker}</span>}
      <h2>{story.title}</h2>
      {story.sub && <p className="paper-sub">{story.sub}</p>}
      {story.shot && (
        <figure>
          <PaperArt shot={story.shot} label={story.caption ?? story.title} tone={tone} />
          {story.caption && <figcaption>{story.caption}</figcaption>}
        </figure>
      )}
      <div className="paper-body">
        {first && (
          <p className={tone === 'sepia' ? 'with-drop' : undefined}>
            {tone === 'sepia' && <span className="paper-drop">{first.charAt(0)}</span>}
            {tone === 'sepia' ? first.slice(1) : first}
          </p>
        )}
        {rest.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </article>
  );
}

function Rule({ thick = false }: { thick?: boolean }) {
  return <div className={thick ? 'paper-rule thick' : 'paper-rule'} />;
}

function KurierFront({ issue, onTurn }: { issue: Issue; onTurn: () => void }) {
  const k = issue.kurier;
  const L = issue.lang;
  return (
    <>
      <header className="kurier-mast">
        <div className="paper-meta">
          <span>
            {t(L, 'Year', 'Rok')} {roman(issue.year)} · Nr {issue.number}
          </span>
          <span>{t(L, 'Price: 1 petal', 'Cena: 1 płatek')}</span>
        </div>
        <Rule thick />
        <h1>Kurier Bratkowski</h1>
        <p className="kurier-motto">{t(L, 'All that blooms, and a little of what doesn’t', 'Wszystko, co kwitnie, i trochę tego, co nie')}</p>
        <Rule thick />
        <div className="paper-meta strong">
          <span>{k.date}</span>
          <span>{t(L, 'Bratkowo, morning edition', 'Bratkowo, wyd. poranne')}</span>
        </div>
      </header>
      <section className="kurier-weather" aria-label={t(L, 'Weather', 'Pogoda')}>
        <SkyIcon sky={k.weather.sky} night={k.weather.night} />
        <div>
          <strong>{k.weather.line}</strong>
          <span>{k.weather.sun}</span>
        </div>
      </section>
      <Lead story={k.lead} tone="sepia" />
      <Rule />
      <section className="kurier-world" aria-label={t(L, 'From the world', 'Ze świata')}>
        <div className="paper-section-head">
          <h3>{t(L, 'From the world', 'Ze świata')}</h3>
          {k.world.fresh && <span>{t(L, 'written this morning from the news', 'pisane dziś rano z wiadomości')}</span>}
        </div>
        {k.world.items.map((w, i) => (
          <div key={i} className="kurier-world-item">
            {w.place && <span className="paper-kicker small">{w.place}</span>}
            <h4>{w.title}</h4>
            <p>{w.body}</p>
          </div>
        ))}
        {k.world.none && <p className="kurier-world-none">{k.world.none}</p>}
      </section>
      {k.town.length > 0 && (
        <section className="kurier-town" aria-label={t(L, 'From Bratkowo', 'Z Bratkowa')}>
          <div className="paper-section-head">
            <h3>{t(L, 'From Bratkowo', 'Z Bratkowa')}</h3>
            <span>{t(L, 'in brief', 'w skrócie')}</span>
          </div>
          {k.town.map((x, i) => (
            <div key={i} className="kurier-town-item">
              <h4>{x.title}</h4>
              <p>{x.body}</p>
            </div>
          ))}
        </section>
      )}
      <section className="kurier-garden" aria-label={t(L, 'Yesterday in your garden', 'Wczoraj w Twoim ogrodzie')}>
        <h3>{t(L, 'Yesterday in your garden', 'Wczoraj w Twoim ogrodzie')}</h3>
        <ul>
          {k.garden.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </section>
      <footer className="paper-foot">
        <Rule thick />
        <div className="paper-foot-row">
          <span>{t(L, 'Page 1 of 2', 'Strona 1 z 2')}</span>
          <button className="paper-btn" onClick={onTurn}>
            {t(L, 'Turn the page →', 'Przewróć stronę →')}
          </button>
        </div>
      </footer>
    </>
  );
}

function KurierBack({ issue, onBack, archive }: { issue: Issue; onBack: () => void; archive: ReactNode }) {
  const k = issue.kurier;
  const L = issue.lang;
  const s = k.serial;
  return (
    <>
      <div className="paper-meta ruled">
        <span>Kurier Bratkowski</span>
        <span>
          {issue.day.toLocaleDateString(L === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'numeric', year: 'numeric' })} · {t(L, 'p. 2', 'str. 2')}
        </span>
      </div>
      <h2 className="paper-section">{t(L, 'Around town', 'Z miasteczka')}</h2>
      <article className="paper-story">
        <span className="paper-kicker">
          {s.name} · {t(L, `part ${s.part} of ${s.of}`, `odc. ${s.part} z ${s.of}`)}
        </span>
        <h3>{s.title}</h3>
        {s.shot && (
          <figure>
            <PaperArt shot={s.shot} label={s.title} />
          </figure>
        )}
        <div className="paper-body">
          {s.recap && (
            <p>
              <i>
                {t(L, 'Last time: ', 'W poprzednim odcinku: ')}
                {s.recap}
              </i>
            </p>
          )}
          {s.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </article>
      {k.retort && (
        <aside className="kurier-retort">
          <span className="paper-kicker small dark">{t(L, 'Correction', 'Sprostowanie')}</span>
          <p>{k.retort}</p>
        </aside>
      )}
      <Rule />
      <article className="paper-story">
        <span className="paper-kicker">{t(L, 'Gossip', 'Plotki')}</span>
        <h3 className="smaller">{k.gossip.title}</h3>
        <p className="paper-text">{k.gossip.body}</p>
      </article>
      <section className="kurier-vox">
        <h4>{k.vox.q}</h4>
        {k.vox.a.map((a, i) => (
          <p key={i}>
            <b>{a.who}:</b> {L === 'pl' ? `„${a.say}”` : `“${a.say}”`}
          </p>
        ))}
      </section>
      <h2 className="paper-section small">{t(L, 'Coming up in the garden', 'Wkrótce w ogrodzie')}</h2>
      <ul className="kurier-soon">
        {k.soon.map((x, i) => (
          <li key={i}>
            <span className={x.rumour ? 'when rumour' : 'when'}>{x.when}</span>
            <span>{x.text}</span>
          </li>
        ))}
      </ul>
      <h2 className="paper-section small">{t(L, 'Calendar', 'Kalendarz')}</h2>
      <div className="kurier-calendar">
        {k.calendar.map((c, i) => (
          <div key={i}>
            <b>{c.label}:</b> {c.text}
          </div>
        ))}
      </div>
      <h2 className="paper-section small">{t(L, 'Small print', 'Drobne')}</h2>
      <div className="kurier-small">
        <div className="kurier-horo">
          <h4>{t(L, 'Horoscope', 'Horoskop')}</h4>
          <p>
            <b>{t(L, 'Capricorn', 'Koziorożec')}:</b> {k.horoscope}
          </p>
        </div>
        <div className="kurier-ads">
          <h4>{t(L, 'Small ads', 'Ogłoszenia')}</h4>
          {k.ads.map((a, i) => (
            <p key={i}>
              <b>{a.kind}</b> {a.text} <span className="sign">{a.sign}</span>
            </p>
          ))}
        </div>
      </div>
      <section className="kurier-letter">
        <h4>{t(L, 'Letters to the editor', 'Listy do redakcji')}</h4>
        <p className="paper-letter-text">{k.letter.text}</p>
        <p className="paper-letter-sign">{k.letter.sign}</p>
        {k.letter.reply && (
          <p className="paper-letter-text">
            {t(L, 'The editors reply: ', 'Odpowiedź redakcji: ')}
            {k.letter.reply}
          </p>
        )}
      </section>
      {k.note && (
        <aside className="kurier-note" aria-label={t(L, 'A note', 'Liścik')}>
          <span className="tape" />
          <p>{k.note}</p>
          <p className="from">— d.</p>
        </aside>
      )}
      <footer className="paper-foot">
        <Rule thick />
        <p className="paper-colophon">
          {t(L, 'Editor-in-chief: Bogdan Borsuk. Out every day at dawn. Office: the willow by the pond.', 'Redaktor naczelny: Bogdan Borsuk. Wydawany codziennie o świcie. Redakcja: wierzba przy stawie.')}
        </p>
        <div className="paper-foot-row">
          <button className="paper-btn" onClick={onBack}>
            {t(L, '← Page 1', '← Strona 1')}
          </button>
          {archive}
        </div>
      </footer>
    </>
  );
}

function Bee({ flip = false }: { flip?: boolean }) {
  return (
    <svg className="bee-mascot" viewBox="0 0 40 34" aria-hidden="true" style={flip ? { transform: 'scaleX(-1) rotate(-8deg)' } : undefined}>
      <g stroke="#1f1a14" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14,8 C8,0 1,4 5,10 C8,14 14,12 16,11" fill="#fbf3dc" />
        <path d="M22,8 C26,-1 35,2 32,9 C30,13 24,12 21,11" fill="#fbf3dc" />
        <ellipse cx="19" cy="21" rx="12" ry="9" fill="#e2ad3f" />
        <path d="M15,13 C14,18 14,25 15,29 M21,12.4 C20,18 20,25 21,30" fill="none" strokeWidth="3" />
        <circle cx="29" cy="18" r="1.4" fill="#1f1a14" stroke="none" />
        <path d="M31,13 C32,9 34,8 36,8" fill="none" />
        <path d="M7,22 L3,23" fill="none" />
      </g>
    </svg>
  );
}

function Barrels({ n }: { n: number }) {
  return (
    <svg className="barrels" viewBox="0 0 90 16" role="img" aria-label={`${n}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <path
          key={i}
          d={`M${3 + i * 18},3 L${13 + i * 18},3 C${15 + i * 18},8 ${15 + i * 18},10 ${13 + i * 18},14 L${3 + i * 18},14 C${1 + i * 18},10 ${1 + i * 18},8 ${3 + i * 18},3 Z`}
          fill={i < n ? '#e2ad3f' : 'none'}
          stroke="#1f1a14"
          strokeWidth="1.1"
        />
      ))}
    </svg>
  );
}

function Brzeczyk({ issue, onClose, archive, me }: { issue: Issue; onClose: () => void; archive: ReactNode; me: Me }) {
  const b = issue.bee;
  const L = issue.lang;
  return (
    <>
      <header className="bee-mast">
        <svg className="bee-comb" viewBox="0 0 390 16" preserveAspectRatio="none" aria-hidden="true">
          <path
            d={Array.from({ length: 16 }, (_, i) => `M${i * 26},8 l5,-6 h8 l5,6 l-5,6 h-8 Z`).join(' ')}
            fill="none"
            stroke="#1f1a14"
            strokeWidth="1"
            opacity="0.35"
          />
        </svg>
        <div className="bee-title">
          <Bee />
          <h1>Brzęczyk</h1>
          <Bee flip />
        </div>
        <p className="bee-motto">{t(L, 'We buzz about what others keep quiet!', 'Brzęczymy o tym, o czym inni milczą!')}</p>
        <div className="bee-bar">
          <span>
            {b.date} · {t(L, 'hive edition', 'wydanie z ula')}
          </span>
          <span>{t(L, 'Price: 1 drop of honey', 'Cena: 1 kropla miodu')}</span>
        </div>
      </header>
      <article className="bee-lead">
        <span className="bee-stamp">{b.lead.kicker}</span>
        <h2>{b.lead.title}</h2>
        {b.lead.shot && (
          <figure>
            <PaperArt shot={b.lead.shot} label={b.lead.caption ?? b.lead.title} tone="black" />
            {b.lead.caption && <figcaption>{b.lead.caption}</figcaption>}
          </figure>
        )}
        <div className="bee-body">
          {b.lead.body.map((p, i) => (
            <p key={i} className={i === 0 ? 'first' : undefined}>
              {p}
            </p>
          ))}
        </div>
      </article>
      {b.jab && (
        <aside className="bee-jab">
          <span>{t(L, 'The Kurier is wrong!', 'Kurier się myli!')}</span>
          <p>{b.jab}</p>
        </aside>
      )}
      <section className="bee-section">
        <h3>{t(L, 'From the hive', 'Z ula')}</h3>
        {b.buzz.map((x, i) => (
          <p key={i}>
            <b>{x.title}</b> {x.body}
          </p>
        ))}
      </section>
      <figure className="bee-photo">
        <span className="bee-stamp small">{t(L, 'Caught on camera!', 'Przyłapane!')}</span>
        <PaperArt shot={b.photo.shot} label={b.photo.caption} tone="black" />
        <figcaption>{b.photo.caption}</figcaption>
      </figure>
      <section className="bee-flower" aria-label={t(L, 'Flower of the week', 'Kwiat tygodnia')}>
        {b.flower ? (
          <>
            <svg viewBox="-58 -150 116 156" preserveAspectRatio="xMidYMax meet" aria-hidden="true" className="bee-flower-art">
              <PlantArt species={b.flower.species} stage="bloom" />
            </svg>
            <div>
              <h3>{t(L, 'Flower of the week', 'Kwiat tygodnia')}</h3>
              <p>
                <b>
                  {b.flower.name} {t(L, 'from our reader’s window.', me === 'he' ? 'z okna naszego Czytelnika.' : 'z okna naszej Czytelniczki.')}
                </b>{' '}
                {b.flower.text}
              </p>
              <div className="bee-rating">
                <span>{t(L, 'Rating:', 'Ocena:')}</span>
                <Barrels n={b.flower.barrels} />
                <span>{b.flower.barrels}/5</span>
              </div>
            </div>
          </>
        ) : (
          <div>
            <h3>{t(L, 'Flower of the week', 'Kwiat tygodnia')}</h3>
            <p>{t(L, 'Nothing in flower at our reader’s window yet. The newsroom is waiting, very patiently. Almost.', `W oknie ${me === 'he' ? 'naszego Czytelnika' : 'naszej Czytelniczki'} jeszcze nic nie kwitnie. Redakcja czeka, bardzo cierpliwie. Prawie.`)}</p>
          </div>
        )}
      </section>
      <section className="bee-section">
        <h3>{t(L, 'Bee horoscope', 'Pszczeli horoskop')}</h3>
        <p>
          <b>{t(L, 'Capricorn', 'Koziorożec')}:</b> {b.horoscope}
        </p>
      </section>
      <footer className="bee-foot">
        <p className="bee-sign">— {t(L, 'Trzmielina, and the whole hive', 'Trzmielina, z całym ulem')}</p>
        <div className="bee-foot-rule" />
        <p className="bee-colophon">
          {t(L, 'Editor-in-chief: Trzmielina · Honorary member of staff: Jingleton', 'Redaktor naczelna: Trzmielina · Honorowy członek redakcji: Jingleton')}
          <br />
          {b.rivals
            ? t(L, 'Brzęczyk: read in every hive. Kurier: read by Pan Jeżyk and his glasses.', 'Brzęczyk: czytany w każdym ulu. Kurier: czytany przez Pana Jeżyka i jego okulary.')
            : t(L, 'Brzęczyk: read in every hive. Soon in every garden.', 'Brzęczyk: czytany w każdym ulu. Wkrótce w każdym ogrodzie.')}
        </p>
        <div className="paper-foot-row center">
          {archive}
          <button className="bee-btn" onClick={onClose}>
            {t(L, 'Fold the paper', 'Złóż gazetę')}
          </button>
        </div>
      </footer>
    </>
  );
}

/**
 * The morning papers, opened from the doormat or the menu: the Kurier Bratkowski (two pages) and
 * Brzęczyk (one), and the last week's issues. `world` overrides the news column (the test page).
 */
const LANG_KEY = 'paper-lang';
function savedLang(): 'pl' | 'en' {
  try {
    return localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'pl';
  } catch {
    return 'pl';
  }
}

export default function PaperView({ garden, now, lang: fixedLang, me, weather, onClose, onRead, world: worldOverride }: {
  garden: GardenState;
  now: number;
  /** The papers are Polish unless the reader switches them; the test page sets it. */
  lang?: 'pl' | 'en';
  me: Me;
  weather: { sky: 'clear' | 'cloudy' | 'rain'; night: boolean };
  onClose: () => void;
  onRead?: (day: string) => void;
  world?: WorldItem[] | null;
}) {
  const today = paperDate(now);
  const [chosenLang, setChosenLang] = useState<'pl' | 'en'>(savedLang);
  const lang: Lang = fixedLang ?? chosenLang;
  const switchLang = () => {
    const next = chosenLang === 'pl' ? 'en' : 'pl';
    setChosenLang(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {
      // the choice just won't be remembered
    }
  };
  // older issues go back a week, but never before the first paper
  const first = PAPERS_BEGAN;
  const days = Math.max(0, Math.min(6, Math.round((today.getTime() - first.getTime()) / 86_400_000)));
  const [back, setBack] = useState(0);
  const day = useMemo(() => new Date(today.getFullYear(), today.getMonth(), today.getDate() - back, 12), [today.getTime(), back]); // eslint-disable-line react-hooks/exhaustive-deps
  const key = dayKeyOf(day);
  const fetched = useWorld(key, back === 0 && worldOverride === undefined);
  const world = worldOverride !== undefined ? worldOverride : fetched;
  const [which, setWhich] = useState<Which>('kurier');
  const [page, setPage] = useState<1 | 2>(1);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const issue = useMemo(() => buildIssue({ day, now, garden, lang, me, weather, world }), [day, now, garden, lang, me, weather, world]);
  const L = issue.lang;

  useEffect(() => {
    if (back === 0) onRead?.(key);
  }, [key, back]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 });
  }, [which, page, back]);

  const archive = days === 0 ? null : (
    <button className="paper-btn dashed" aria-expanded={archiveOpen} onClick={() => setArchiveOpen((o) => !o)}>
      {t(L, 'Older issues', 'Starsze numery')}
    </button>
  );

  return (
    <div className="papers" role="dialog" aria-label={t(L, 'The morning papers', 'Poranne gazety')}>
      <div className="papers-top">
        <div className="papers-tabs" role="tablist">
          <button role="tab" aria-selected={which === 'kurier'} className="tab-kurier" onClick={() => setWhich('kurier')}>
            Kurier Bratkowski
          </button>
          <button role="tab" aria-selected={which === 'bee'} className="tab-bee" onClick={() => setWhich('bee')}>
            Brzęczyk
          </button>
        </div>
        {!fixedLang && (
          <button className="papers-lang" aria-label={L === 'pl' ? 'Read in English' : 'Czytaj po polsku'} onClick={switchLang}>
            <span className={L === 'pl' ? 'on' : undefined}>PL</span>
            <span className={L === 'en' ? 'on' : undefined}>EN</span>
          </button>
        )}
        <button className="papers-close" aria-label={t(L, 'Close', 'Zamknij')} onClick={onClose}>
          <svg viewBox="-14 -14 28 28" aria-hidden="true">
            <path d="M-7,-7 L7,7 M7,-7 L-7,7" />
          </svg>
        </button>
      </div>
      {archiveOpen && (
        <div className="papers-archive">
          {Array.from({ length: days + 1 }, (_, i) => {
            const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i, 12);
            const label = i === 0 ? t(L, 'Today', 'Dziś') : d.toLocaleDateString(L === 'pl' ? 'pl-PL' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'numeric' });
            return (
              <button
                key={i}
                aria-pressed={back === i}
                onClick={() => {
                  setBack(i);
                  setPage(1);
                  setArchiveOpen(false);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}
      <div className="papers-scroll" ref={scroller}>
        <div className={which === 'kurier' ? 'paper-sheet kurier' : 'paper-sheet brzeczyk'} lang={L}>
          {which === 'kurier' && page === 1 && <KurierFront issue={issue} onTurn={() => setPage(2)} />}
          {which === 'kurier' && page === 2 && <KurierBack issue={issue} onBack={() => setPage(1)} archive={archive} />}
          {which === 'bee' && <Brzeczyk issue={issue} onClose={onClose} archive={archive} me={me} />}
        </div>
      </div>
    </div>
  );
}
