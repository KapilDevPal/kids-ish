/**
 * Saving an image to the device. Order of preference:
 * 1. The hosting shell's `downloads` capability (when running as a hosted Claude artifact),
 * 2. the Web Share API with a file (great on phones and tablets),
 * 3. a classic download link.
 */
type DownloadsNs = { save: (req: { filename: string; data: Blob }) => Promise<unknown> };
type ClaudeHost = { use?: (name: string) => Promise<unknown> };

let hostDownloads: Promise<DownloadsNs | null> | null = null;

function getHostDownloads(): Promise<DownloadsNs | null> {
  if (hostDownloads) return hostDownloads;
  const host = (window as unknown as { claude?: ClaudeHost }).claude;
  hostDownloads = host?.use ? (host.use('downloads') as Promise<DownloadsNs | null>).catch(() => null) : Promise.resolve(null);
  return hostDownloads;
}

// Warm up early so the capability has resolved before a child taps "Save".
if (typeof window !== 'undefined') void getHostDownloads();

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const res = await fetch(dataUrl);
  return res.blob();
}

export type SaveOutcome = 'saved' | 'shared' | 'cancelled' | 'failed';

export async function saveImageToDevice(dataUrl: string, name: string): Promise<SaveOutcome> {
  const ext = dataUrl.startsWith('data:image/png') ? 'png' : dataUrl.startsWith('data:image/webp') ? 'webp' : 'jpg';
  const filename = `${name.replace(/[^\w\- ]+/g, '').trim() || 'my-space-art'}.${ext}`;
  const blob = await dataUrlToBlob(dataUrl);

  const downloads = await getHostDownloads();
  if (downloads) {
    try {
      await downloads.save({ filename, data: blob });
      return 'saved';
    } catch (e) {
      const code = (e as { code?: string })?.code;
      if (code === 'declined') return 'cancelled';
      // fall through to other methods
    }
  }

  try {
    const file = new File([blob], filename, { type: blob.type });
    const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
    if (nav.share && nav.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: name });
      return 'shared';
    }
  } catch (e) {
    if ((e as DOMException)?.name === 'AbortError') return 'cancelled';
  }

  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return 'saved';
  } catch {
    return 'failed';
  }
}

/** Downscale and encode a canvas for the archive. Keeps IndexedDB small on phones. */
export function encodeCanvas(source: HTMLCanvasElement, maxSide = 1200, background?: string): string {
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const w = Math.round(source.width * scale);
  const h = Math.round(source.height * scale);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(source, 0, 0, w, h);
  const webp = c.toDataURL('image/webp', 0.9);
  return webp.startsWith('data:image/webp') ? webp : c.toDataURL('image/jpeg', 0.9);
}
