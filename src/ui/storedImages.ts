import { useEffect, useState } from 'react';
import { getImages } from '../garden/storage';

/**
 * Addresses for pictures kept on the phone, read only when something on screen asks for them.
 * Requests made at the same moment (a page of the album) are read together in one go, and each
 * picture is only read once while the app is open.
 */
const urls = new Map<string, string | null>();
const waiting = new Map<string, ((url: string | null) => void)[]>();
let queued = false;

function flush() {
  queued = false;
  const keys = [...waiting.keys()];
  const listeners = new Map(waiting);
  waiting.clear();
  void getImages(keys).then((blobs) => {
    for (const key of keys) {
      const blob = blobs[key];
      const url = blob ? URL.createObjectURL(blob) : null;
      urls.set(key, url);
      for (const done of listeners.get(key) ?? []) done(url);
    }
  });
}

export function storedUrl(key: string): Promise<string | null> {
  if (urls.has(key)) return Promise.resolve(urls.get(key)!);
  return new Promise((resolve) => {
    const list = waiting.get(key);
    if (list) list.push(resolve);
    else waiting.set(key, [resolve]);
    if (!queued) {
      queued = true;
      queueMicrotask(flush);
    }
  });
}

/** Lets go of a picture that has been cleared away. */
export function forgetUrl(key: string) {
  const url = urls.get(key);
  if (url) URL.revokeObjectURL(url);
  urls.delete(key);
}

/** Tells the cache about a picture that was only just made, so it shows without reading it back. */
export function rememberUrl(key: string, blob: Blob) {
  forgetUrl(key);
  urls.set(key, URL.createObjectURL(blob));
}

export function useStoredUrl(key: string | null): string | null {
  const [url, setUrl] = useState(() => (key ? (urls.get(key) ?? null) : null));
  useEffect(() => {
    if (!key) return setUrl(null);
    let live = true;
    if (urls.has(key)) setUrl(urls.get(key)!);
    else void storedUrl(key).then((u) => live && setUrl(u));
    return () => {
      live = false;
    };
  }, [key]);
  return url;
}
