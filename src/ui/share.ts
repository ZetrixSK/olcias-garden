/** Hands the file to the phone's share sheet (Save to Files, AirDrop, a message), or downloads it where sharing a file isn't possible. */
export function sendFile(file: File, title: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  if (navigator.canShare?.({ files: [file] })) {
    return navigator.share({ files: [file], title }).then(
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
