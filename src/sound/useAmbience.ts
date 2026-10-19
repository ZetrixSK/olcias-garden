import { useEffect } from 'react';
import { ambience, ambienceIfMade } from './ambience';
import type { Mix } from './mix';

/**
 * Plays the room's sounds while `on`. They fade out when the garden is hidden; on the way back,
 * the next tap starts them again, since a phone only lets sound start from a tap.
 */
export function useAmbience(on: boolean, mix: Mix) {
  useEffect(() => {
    if (!on) {
      ambienceIfMade()?.stop();
      return;
    }
    const resume = () => {
      if (document.visibilityState === 'visible') ambience()?.start();
    };
    const onVisibility = () => (document.visibilityState === 'visible' ? resume() : ambience()?.stop());
    resume();
    window.addEventListener('click', resume);
    window.addEventListener('touchend', resume);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('click', resume);
      window.removeEventListener('touchend', resume);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [on]);

  const { rain, wind, birds, crickets, crackle } = mix;
  useEffect(() => {
    if (on) ambience()?.set({ rain, wind, birds, crickets, crackle });
  }, [on, rain, wind, birds, crickets, crackle]);
}
