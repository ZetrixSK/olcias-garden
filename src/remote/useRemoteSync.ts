import { useEffect, useRef } from 'react';
import { SAVE_VERSION, type GardenState } from '../garden/state';
import { isRobot, remoteConfigured, uploadGarden } from './client';
import { deviceLabel, sharedGarden } from './shared';
import { createUploader, HEARTBEAT, type Uploader } from './uploader';

/** Coming back to the app after this long counts as opening it again. */
const REOPEN = 5 * 60 * 1000;

/**
 * Keeps the shared copy of the garden up to date: on opening, after changes, when the app is put
 * away, and every few minutes while it's open. Works quietly in the background; offline it just
 * waits. Pass null until the garden has loaded, or always null where nothing should be shared.
 */
export function useRemoteSync(garden: GardenState | null, enabled: boolean): void {
  const on = enabled && remoteConfigured && !isRobot();
  const uploader = useRef<Uploader | null>(null);
  const latest = useRef<GardenState | null>(null);
  latest.current = garden;
  // the first garden after loading (or after sharing starts) is the opening; every one after it is a change
  const first = useRef(true);

  useEffect(() => {
    if (!on) return;
    const standalone = window.matchMedia?.('(display-mode: standalone)').matches || ('standalone' in navigator && navigator.standalone === true);
    const label = deviceLabel(navigator.userAgent, standalone);
    const up = createUploader((g, opened) => uploadGarden(g, SAVE_VERSION, opened, label));
    uploader.current = up;
    // switched on after the garden had already loaded (a welcome was showing): this is the opening
    if (latest.current && first.current) {
      first.current = false;
      up.opened(sharedGarden(latest.current));
    }
    let hiddenAt: number | null = null;
    const onVisibility = () => {
      const g = latest.current;
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now();
        void up.flush();
      } else if (g && hiddenAt !== null && Date.now() - hiddenAt >= REOPEN) {
        up.opened(sharedGarden(g));
      }
    };
    const onOnline = () => void up.flush();
    const beat = window.setInterval(() => {
      const g = latest.current;
      if (g && document.visibilityState === 'visible') up.heartbeat(sharedGarden(g));
    }, HEARTBEAT / 5);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
      window.clearInterval(beat);
      up.dispose();
      uploader.current = null;
    };
  }, [on]);

  useEffect(() => {
    const up = uploader.current;
    if (!up || !garden) return;
    if (first.current) {
      first.current = false;
      up.opened(sharedGarden(garden));
    } else up.changed(sharedGarden(garden));
  }, [garden]);
}
