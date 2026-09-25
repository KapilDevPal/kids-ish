/**
 * Colouring pages: bold line art drawn on its own top layer.
 * The fill tool treats these lines as walls, so taps fill neat regions.
 * Pages themselves are data in content/colouring; this is the one entry point the engine uses.
 */
import { getPage, pageCaption } from '@/content/colouring';
import { drawClassicPage } from './kit/classic';
import { renderArt } from './kit/render';
import type { Anchors } from './kit/pen';

export { LINE } from './kit/pen';

/** Draw page `id` onto a transparent canvas. Returns part anchors (canvas pixels) for Colour → 3D. */
export function drawPage(ctx: CanvasRenderingContext2D, id: string, w: number, h: number): Anchors {
  if (id === 'none') return {};
  const page = getPage(id);
  if (!page) return {};
  if (!page.art) {
    drawClassicPage(ctx, id, w, h);
    return {};
  }
  return renderArt(ctx, { art: page.art, level: page.level, caption: pageCaption(page) }, w, h);
}
