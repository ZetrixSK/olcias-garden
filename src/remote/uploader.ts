/**
 * Decides when the garden goes up: soon after a change (but not on every tap), straight away when
 * the app is opened or put away, and now and then while it stays open so "last seen" keeps fresh.
 * Only the newest garden is ever waiting; a failed upload is tried again when the phone is back
 * online or something else happens, so nothing piles up while she's offline.
 */
export type Upload = (garden: unknown, opened: boolean) => Promise<void>;

export const CHANGE_DELAY = 4000;
export const HEARTBEAT = 5 * 60 * 1000;

export type Uploader = {
  /** The garden changed; it goes up after a short pause. */
  changed(garden: unknown): void;
  /** The app was opened (or came back after a while): counted, and sent at once. */
  opened(garden: unknown): void;
  /** Sends anything waiting now, such as when the app is put away or the phone is back online. */
  flush(): Promise<void>;
  /** Keeps "last seen" fresh: sends the garden even if nothing changed, if it's been a while. */
  heartbeat(garden: unknown): void;
  dispose(): void;
};

export function createUploader(upload: Upload, now: () => number = Date.now, delay = CHANGE_DELAY): Uploader {
  let waiting: { garden: unknown; text: string } | null = null;
  let opening = false;
  let sentText: string | null = null;
  let sentAt = -Infinity;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let busy: Promise<void> | null = null;
  let disposed = false;

  const clear = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
  };

  const take = (garden: unknown) => {
    waiting = { garden, text: JSON.stringify(garden) };
  };

  async function send(): Promise<void> {
    clear();
    if (busy) {
      // one upload at a time; whatever arrived meanwhile follows it
      await busy;
      return send();
    }
    if (!waiting || disposed) return;
    const job = waiting;
    const opened = opening;
    if (!opened && job.text === sentText && now() - sentAt < HEARTBEAT) {
      waiting = null;
      return;
    }
    busy = upload(job.garden, opened).then(
      () => {
        sentText = job.text;
        sentAt = now();
        if (opened) opening = false;
        if (waiting === job) waiting = null;
      },
      () => {
        // kept waiting (with the open still to be counted) until the next chance
      },
    );
    try {
      await busy;
    } finally {
      busy = null;
    }
  }

  return {
    changed(garden) {
      take(garden);
      clear();
      timer = setTimeout(() => void send(), delay);
    },
    opened(garden) {
      take(garden);
      opening = true;
      void send();
    },
    flush: send,
    heartbeat(garden) {
      if (now() - sentAt < HEARTBEAT) return;
      take(garden);
      sentText = null;
      void send();
    },
    dispose() {
      disposed = true;
      clear();
    },
  };
}
