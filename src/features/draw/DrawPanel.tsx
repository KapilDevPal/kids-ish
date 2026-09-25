import { Icon, type IconName } from '@/ui/Icon';
import { PAINT_SWATCHES } from '@/content/palette';
import { BRUSHES } from '@/drawing/brushes';
import { STAMPS, drawStamp } from '@/drawing/stamps';
import { BACKGROUNDS, drawBackground } from '@/drawing/backgrounds';
import { COLOURING_PAGES, getPage, pageColours } from '@/content/colouring';
import { getEngine } from '@/drawing/DrawingEngine';
import type { Orientation, ToolId } from '@/drawing/types';
import { isUnlocked, unlockSource } from '@/content/unlocks';
import { useProgress } from '@/state/progressStore';
import { useUi } from '@/state/uiStore';
import { BRUSH_SIZES, useDrawUi, useEngineVersion } from './drawStore';
import { CanvasThumb } from './CanvasThumb';
import { PageThumb } from './PageThumb';
import { useLibrary } from './libraryStore';

export const TOOLS: { id: ToolId; name: string; icon: IconName; hint: string }[] = [
  ...BRUSHES.map((b) => ({
    id: b.id as ToolId,
    name: b.name,
    hint: b.hint,
    icon: ({ pencil: 'pencil', marker: 'brush', crayon: 'crayon', neon: 'sparkle', stars: 'star', rainbow: 'palette', eraser: 'eraser' } as const)[b.id],
  })),
  { id: 'fill', name: 'Fill', icon: 'bucket', hint: 'Tap a shape to fill it' },
  { id: 'stamp', name: 'Stamps', icon: 'stamp', hint: 'Tap to place, drag to move' },
];

export function ToolRow({ grid }: { grid?: boolean }) {
  const tool = useDrawUi((s) => s.tool);
  const color = useDrawUi((s) => s.color);
  const setTool = useDrawUi((s) => s.setTool);
  return (
    <div className={grid ? 'draw-tools draw-tools--grid' : 'draw-tools scroll-x'} role="radiogroup" aria-label="Drawing tools">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          role="radio"
          aria-checked={tool === t.id}
          className="draw-tool"
          onClick={() => setTool(t.id)}
          style={{ ['--tool-c' as string]: t.id === 'rainbow' ? 'conic-gradient(#ff5e5e,#ffc93c,#2fbf71,#6fd3ff,#8a5cf6,#ff5e5e)' : t.id === 'eraser' ? '#fff' : color }}
        >
          <Icon name={t.icon} size={26} />
          <span>{t.name}</span>
        </button>
      ))}
    </div>
  );
}

export function ColourRow() {
  const color = useDrawUi((s) => s.color);
  const setColor = useDrawUi((s) => s.setColor);
  useEngineVersion();
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  // Colours that suit the open page come first, then the usual space swatches.
  const page = getPage(getEngine().doc.page);
  const suggested = page ? pageColours(page).slice(0, 5) : [];
  const rest = PAINT_SWATCHES.filter((s) => !suggested.some((c) => same(c, s.hex)));
  const all = [...suggested.map((hex) => ({ hex, name: PAINT_SWATCHES.find((s) => same(s.hex, hex))?.name ?? 'Page colour' })), ...rest];
  const custom = !all.some((s) => same(s.hex, color));
  return (
    <div className="scroll-x draw-colours" role="radiogroup" aria-label="Colours">
      {all.map((s, i) => (
        <button key={s.hex} role="radio" className={i === suggested.length - 1 ? 'swatch swatch--last-suggested' : 'swatch'} aria-checked={same(color, s.hex)} aria-pressed={same(color, s.hex)} aria-label={s.name} title={s.name} style={{ background: s.hex }} onClick={() => setColor(s.hex.toUpperCase())} />
      ))}
      <label className="swatch swatch--custom" aria-pressed={custom} title="Mix your own colour" style={custom ? { background: color } : undefined}>
        <span className="sr-only">Mix your own colour</span>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value.toUpperCase())} />
      </label>
    </div>
  );
}

export function SizeRow() {
  const sizeIdx = useDrawUi((s) => s.sizeIdx);
  const setSize = useDrawUi((s) => s.setSize);
  const color = useDrawUi((s) => s.color);
  const labels = ['Tiny', 'Small', 'Big', 'Huge'];
  return (
    <div className="draw-sizes" role="radiogroup" aria-label="Size">
      {BRUSH_SIZES.map((px, i) => (
        <button key={px} role="radio" aria-checked={sizeIdx === i} aria-label={labels[i]} className="draw-size" onClick={() => setSize(i)}>
          <i style={{ width: 8 + i * 9, height: 8 + i * 9, background: color }} />
        </button>
      ))}
    </div>
  );
}

function useLockedToast() {
  const toast = useUi((s) => s.toast);
  return (kind: 'stamp' | 'background', id: string) => {
    const m = unlockSource(kind, id);
    toast(m ? `Discover ${m.name} in Explore to unlock this` : 'Keep exploring to unlock this');
  };
}

export function StampRow({ grid }: { grid?: boolean }) {
  const stampId = useDrawUi((s) => s.stampId);
  const tool = useDrawUi((s) => s.tool);
  const color = useDrawUi((s) => s.color);
  const setStamp = useDrawUi((s) => s.setStamp);
  const discovered = useProgress((s) => s.discovered);
  const locked = useLockedToast();
  return (
    <div className={grid ? 'draw-stamps draw-stamps--grid' : 'draw-stamps scroll-x'} role="radiogroup" aria-label="Stamps">
      {STAMPS.map((s) => {
        const open = isUnlocked('stamp', s.id, discovered);
        return (
          <button
            key={s.id}
            role="radio"
            aria-checked={tool === 'stamp' && stampId === s.id}
            aria-label={open ? s.name : `${s.name}, locked`}
            className="draw-stamp"
            data-locked={!open || undefined}
            onClick={() => (open ? setStamp(s.id) : locked('stamp', s.id))}
          >
            <CanvasThumb w={48} h={48} deps={[s.id, color]} draw={(ctx) => drawStamp(ctx, s.id, 24, 24, 0.42, 0, color)} />
            {!open && <span className="draw-lock"><Icon name="lock" size={16} /></span>}
          </button>
        );
      })}
    </div>
  );
}

export function SceneSection({ onNew, onLibrary, onDownload }: { onNew: (o: { page?: string; orient?: Orientation }) => void; onLibrary: () => void; onDownload: () => void }) {
  useEngineVersion();
  const e = getEngine();
  const bg = e.currentBg();
  const discovered = useProgress((s) => s.discovered);
  const recent = useLibrary((s) => s.recent);
  const locked = useLockedToast();
  const orient = e.doc.orient;
  const tw = orient === 'portrait' ? 54 : 72;
  const th = orient === 'portrait' ? 72 : 54;
  // A few pages to jump straight into: recent ones first, then a spread across categories.
  const quick = [...recent, 'pslv-xl-pad', 'ch3-landing', 'skyroot-vikram-s', 'simple-rocket', 'planet-saturn', 'gaganyatri-wave']
    .filter((id, i, a) => a.indexOf(id) === i && getPage(id))
    .slice(0, 6);
  return (
    <>
      <h4 className="draw-h">Colouring pages</h4>
      <button className="btn btn--sky draw-libbtn" onClick={onLibrary}><Icon name="book" /> Browse all {COLOURING_PAGES.length} pages</button>
      <div className="scroll-x" role="list" aria-label="Quick colouring pages">
        {quick.map((id) => {
          const p = getPage(id)!;
          return (
            <button key={id} role="listitem" className="draw-scene" aria-current={e.doc.page === id || undefined} onClick={() => onNew({ page: id })}>
              <PageThumb id={id} orient={orient} w={tw} className="draw-scene__thumb" />
              <span>{p.title}</span>
            </button>
          );
        })}
      </div>
      <h4 className="draw-h">Background</h4>
      <div className="scroll-x" role="radiogroup" aria-label="Background">
        {BACKGROUNDS.map((b) => {
          const open = isUnlocked('background', b.id, discovered);
          return (
            <button key={b.id} role="radio" aria-checked={bg === b.id} className="draw-scene" data-locked={!open || undefined}
              aria-label={open ? b.name : `${b.name}, locked`}
              onClick={() => (open ? e.setBackground(b.id) : locked('background', b.id))}>
              <CanvasThumb w={tw} h={th} deps={[b.id, orient]} draw={(ctx, w, h) => {
                const k = w / (orient === 'portrait' ? 1080 : 1440);
                ctx.scale(k, k);
                drawBackground(ctx, b.id, w / k, h / k);
              }} />
              <span>{b.name}</span>
              {!open && <span className="draw-lock"><Icon name="lock" size={16} /></span>}
            </button>
          );
        })}
      </div>
      <h4 className="draw-h">Canvas</h4>
      <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
        <button className="chip" aria-pressed={orient === 'portrait'} onClick={() => orient !== 'portrait' && onNew({ orient: 'portrait', page: e.doc.page })}>Tall</button>
        <button className="chip" aria-pressed={orient === 'landscape'} onClick={() => orient !== 'landscape' && onNew({ orient: 'landscape', page: e.doc.page })}>Wide</button>
        <button className="chip" onClick={() => onNew({})}><Icon name="plus" size={20} /> New picture</button>
        <button className="chip" onClick={() => e.clearInk()}><Icon name="trash" size={20} /> Clear drawing</button>
        <button className="chip" onClick={onDownload}><Icon name="download" size={20} /> Download PNG</button>
      </div>
    </>
  );
}
