import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './draw.css';
import { getEngine, STAMP_BASE } from '@/drawing/DrawingEngine';
import { loadDraft, saveDraftSoon } from '@/drawing/draft';
import type { Orientation } from '@/drawing/types';
import { STAMPS } from '@/drawing/stamps';
import { encodeCanvas, saveImageToDevice } from '@/persistence/exportImage';
import { getPage, type PageFilter } from '@/content/colouring';
import { saveCreation } from '@/state/gameplay';
import { useGallery } from '@/state/galleryStore';
import { useUi } from '@/state/uiStore';
import { Icon } from '@/ui/Icon';
import { Sheet } from '@/ui/Sheet';
import { Confirm } from '@/ui/Confirm';
import { go } from '@/app/router';
import { useIsWide, useMediaQuery } from '@/hooks/useMediaQuery';
import { BRUSH_SIZES, stampScale, useDrawUi, useEngineVersion } from './drawStore';
import { ColourRow, SceneSection, SizeRow, StampRow, TOOLS, ToolRow } from './DrawPanel';
import { Library, parseFilter } from './Library';
import { LearnCard, PageBar } from './Journey';
import { useLibrary } from './libraryStore';

const MAX_ZOOM = 5;
const autoOrient = (): Orientation => (window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape');

/** Restore the unfinished picture once per session. Deep links wait for this so a draft never overwrites them. */
let restoring: Promise<void> | null = null;
const restoreDraft = () =>
  (restoring ??= loadDraft().then((d) => {
    if (d && getEngine().isEmpty) getEngine().load(d);
    else if (getEngine().isEmpty) getEngine().newDoc({ orient: autoOrient() });
  }));

export default function DrawScreen({ params }: { params: string[] }) {
  const e = getEngine();
  useEngineVersion();
  const wide = useIsWide();
  const side = useMediaQuery('(orientation: landscape) and (max-height: 600px)');
  const layout = wide ? 'wide' : side ? 'side' : 'dock';
  const [sheetOpen, setSheetOpen] = useState(false);
  const [ask, setAsk] = useState<null | { title: string; body: string; label: string; run: () => void }>(null);
  const [saving, setSaving] = useState(false);
  const [library, setLibrary] = useState<null | { filter?: PageFilter }>(null);
  const [learn, setLearn] = useState(false);
  const tool = useDrawUi((s) => s.tool);
  const toast = useUi((s) => s.toast);
  const items = useGallery((s) => s.items);
  const ready = useGallery((s) => s.ready);

  // Restore the unfinished picture, then keep the draft saved as the child draws.
  useEffect(() => { void restoreDraft(); }, []);
  useEffect(() => e.subscribe(() => { if (!e.drawing) saveDraftSoon(e.doc); }), [e]);

  const startNew = useCallback((o: { page?: string; orient?: Orientation; baseImage?: string; remixOf?: string }) => {
    const run = () => {
      getEngine().newDoc({ orient: o.orient ?? (o.baseImage ? getEngine().doc.orient : autoOrient()), page: o.page, baseImage: o.baseImage, remixOf: o.remixOf });
      if (o.page && o.page !== 'none') {
        useDrawUi.getState().setTool('fill');
        useLibrary.getState().opened(o.page);
      }
      setAsk(null);
    };
    if (getEngine().isEmpty) run();
    else setAsk({ title: 'Start a new picture?', body: 'This picture will be replaced. Save it to your archive first if you want to keep it.', label: 'Start new', run });
  }, []);

  // Remix a saved drawing: #/draw/remix/:id
  useEffect(() => {
    if (params[0] !== 'remix' || !ready) return;
    const c = items.find((x) => x.id === params[1]);
    go('#/draw');
    if (!c || getEngine().doc.remixOf === c.id) return;
    const img = new Image();
    img.onload = () => void restoreDraft().then(() => startNew({ baseImage: c.image, remixOf: c.id, orient: img.width > img.height ? 'landscape' : 'portrait' }));
    img.src = c.image;
  }, [params, ready, items, startNew]);

  // Deep links: #/draw/page/:id opens a page, #/draw/library[/:category | /:kind/:id] opens the library.
  useEffect(() => {
    const [a, b, c] = params;
    if (a === 'page' && b) {
      go('#/draw');
      if (getPage(b) && getEngine().doc.page !== b) void restoreDraft().then(() => startNew({ page: b }));
    } else if (a === 'library') {
      go('#/draw');
      setLibrary({ filter: parseFilter(b, c) });
    }
  }, [params, startNew]);

  const openPage = (id: string) => {
    setLibrary(null);
    setSheetOpen(false);
    startNew({ page: id });
  };

  const save = async () => {
    if (e.isEmpty) return toast('Draw something first!');
    setSaving(true);
    try {
      const stats = e.stats();
      const canvas = e.compose();
      const image = encodeCanvas(canvas, 1200, e.baseColour());
      await saveCreation({ kind: 'drawing', image, meta: { stamps: stats.stamps, brushes: stats.brushes, background: stats.background, page: stats.page, pageCategory: getPage(stats.page)?.cat } });
    } finally {
      setSaving(false);
    }
  };

  /** Full-resolution PNG straight to the device, for printing or sharing. */
  const download = async () => {
    if (e.isEmpty) return toast('Draw something first!');
    const url = e.compose().toDataURL('image/png');
    const r = await saveImageToDevice(url, getPage(e.doc.page)?.title ?? 'my-space-art');
    if (r === 'saved') toast('Saved as a PNG picture');
    else if (r === 'shared') toast('Ready to share!');
    else if (r === 'failed') toast('Could not save this time');
  };

  // Keyboard: undo/redo everywhere; arrows, +/- and Enter adjust a stamp being placed.
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if ((ev.target as HTMLElement)?.tagName === 'INPUT' || document.querySelector('.lib, .learn')) return;
      if ((ev.ctrlKey || ev.metaKey) && ev.key.toLowerCase() === 'z') {
        ev.preventDefault();
        if (ev.shiftKey) e.redo();
        else e.undo();
        return;
      }
      const p = e.pending;
      if (!p) return;
      const step = ev.shiftKey ? 60 : 20;
      const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[ev.key]) { ev.preventDefault(); e.setPending({ ...p, x: p.x + moves[ev.key][0], y: p.y + moves[ev.key][1] }); }
      else if (ev.key === '+' || ev.key === '=') e.setPending({ ...p, scale: p.scale * 1.15 });
      else if (ev.key === '-') e.setPending({ ...p, scale: p.scale / 1.15 });
      else if (ev.key.toLowerCase() === 'r') e.setPending({ ...p, rot: p.rot + Math.PI / 8 });
      else if (ev.key === 'Enter') e.commitPending();
      else if (ev.key === 'Delete' || ev.key === 'Backspace') e.setPending(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [e]);

  const panel = (
    <>
      <ToolRow grid />
      {tool === 'stamp' ? <StampRow grid /> : null}
      {tool !== 'eraser' && tool !== 'rainbow' && <><h4 className="draw-h">Colour</h4><ColourRow /></>}
      {tool !== 'fill' && <><h4 className="draw-h">{tool === 'stamp' ? 'Stamp size' : 'Brush size'}</h4><SizeRow /></>}
      <SceneSection onNew={startNew} onLibrary={() => setLibrary({})} onDownload={download} />
    </>
  );

  return (
    <div className="draw" data-layout={layout}>
      <div className="draw__stage">
        <DrawTopBar onSave={save} saving={saving} onDownload={download} />
        <Board />
        <ContextBar onLibrary={() => setLibrary({})} onLearn={() => setLearn(true)} />
      </div>
      {layout === 'dock' ? (
        <div className="draw__dock">
          <Sheet
            label="drawing tools"
            open={sheetOpen}
            onToggle={setSheetOpen}
            peek={
              <div className="draw-peek">
                <ToolRow />
                <div className="draw-peek__row">
                  {tool === 'stamp' ? <StampRow /> : tool === 'eraser' || tool === 'rainbow' ? <SizeRow /> : <ColourRow />}
                  <button className="icon-btn" aria-label={sheetOpen ? 'Fewer options' : 'More options'} aria-expanded={sheetOpen} onClick={() => setSheetOpen(!sheetOpen)}>
                    <Icon name={sheetOpen ? 'chevronDown' : 'sliders'} />
                  </button>
                </div>
              </div>
            }
          >
            <div className="draw-sheet-body">
              {tool === 'stamp' && <><h4 className="draw-h">Colour</h4><ColourRow /></>}
              {tool !== 'fill' && tool !== 'eraser' && tool !== 'rainbow' && <><h4 className="draw-h">{tool === 'stamp' ? 'Stamp size' : 'Brush size'}</h4><SizeRow /></>}
              <SceneSection onNew={(o) => { setSheetOpen(false); startNew(o); }} onLibrary={() => setLibrary({})} onDownload={download} />
            </div>
          </Sheet>
        </div>
      ) : (
        <aside className="draw__panel" aria-label="Drawing tools">{panel}</aside>
      )}
      {library && <Library initial={library.filter} orient={autoOrient()} current={e.doc.page} onPick={openPage} onClose={() => setLibrary(null)} />}
      {learn && <LearnCard onClose={() => setLearn(false)} onLibrary={(f) => { setLearn(false); setLibrary({ filter: f }); }} />}
      {ask && <Confirm title={ask.title} body={ask.body} confirmLabel={ask.label} onConfirm={ask.run} onCancel={() => setAsk(null)} />}
    </div>
  );
}

function DrawTopBar({ onSave, saving, onDownload }: { onSave: () => void; saving: boolean; onDownload: () => void }) {
  const e = getEngine();
  const [full, setFull] = useState(() => !!document.fullscreenElement);
  const canFull = typeof document !== 'undefined' && !!document.fullscreenEnabled;
  useEffect(() => {
    const on = () => setFull(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', on);
    return () => document.removeEventListener('fullscreenchange', on);
  }, []);
  return (
    <div className="draw__top">
      <button className="icon-btn icon-btn--round" aria-label="Home" onClick={() => go('#/home')}><Icon name="back" /></button>
      <button className="icon-btn" aria-label="Undo" disabled={!e.canUndo} onClick={() => e.undo()}><Icon name="undo" /></button>
      <button className="icon-btn" aria-label="Redo" disabled={!e.canRedo} onClick={() => e.redo()}><Icon name="redo" /></button>
      <span className="spacer" />
      <button className="icon-btn hide-narrow" aria-label="Download as PNG" onClick={onDownload}><Icon name="download" /></button>
      {canFull && (
        <button className="icon-btn hide-narrow" aria-label={full ? 'Exit full screen' : 'Full screen'} aria-pressed={full}
          onClick={() => (full ? document.exitFullscreen() : document.documentElement.requestFullscreen()).catch(() => undefined)}>
          <Icon name={full ? 'shrink' : 'expand'} />
        </button>
      )}
      <button className="btn btn--green" onClick={onSave} disabled={saving}><Icon name="save" /> Save</button>
    </div>
  );
}

/** The artboard: fitted to the available space, with pointer handling for every tool. */
function Board() {
  const e = getEngine();
  const wrap = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEngineVersion();

  useLayoutEffect(() => {
    if (host.current) e.mount(host.current);
  }, [e]);

  useLayoutEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const fit = () => {
      const pad = 8;
      const aw = el.clientWidth - pad * 2, ah = el.clientHeight - pad * 2;
      const s = Math.max(0.05, Math.min(aw / e.W, ah / e.H));
      setBox({ w: Math.floor(e.W * s), h: Math.floor(e.H * s) });
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [e, e.doc.orient]);

  // Zoom and pan: a CSS transform on the artboard. Board coordinates stay correct because
  // toBoard() reads the transformed rectangle.
  const view = useRef({ s: 1, x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const applyView = (s: number, x: number, y: number) => {
    const el = host.current;
    if (!el) return;
    s = Math.min(MAX_ZOOM, Math.max(1, s));
    const mx = (box.w * (s - 1)) / 2 + (s > 1 ? box.w * 0.2 : 0);
    const my = (box.h * (s - 1)) / 2 + (s > 1 ? box.h * 0.2 : 0);
    x = s === 1 ? 0 : Math.max(-mx, Math.min(mx, x));
    y = s === 1 ? 0 : Math.max(-my, Math.min(my, y));
    view.current = { s, x, y };
    el.style.transform = s === 1 ? '' : `translate(${x}px, ${y}px) scale(${s})`;
    setZoom(s);
  };
  /** Zoom to scale s, keeping the screen point (fx, fy) under the same spot of the picture. */
  const zoomAt = (s: number, fx: number, fy: number, from = view.current, fromF: [number, number] = [fx, fy]) => {
    const r = wrap.current!.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const s1 = Math.min(MAX_ZOOM, Math.max(1, s));
    const ux = (fromF[0] - cx - from.x) / from.s, uy = (fromF[1] - cy - from.y) / from.s;
    applyView(s1, fx - cx - s1 * ux, fy - cy - s1 * uy);
  };
  const zoomBy = (k: number) => {
    const r = wrap.current!.getBoundingClientRect();
    zoomAt(view.current.s * k, r.left + r.width / 2, r.top + r.height / 2);
  };
  // A new picture or a new size starts fitted.
  useLayoutEffect(() => { applyView(1, 0, 0); }, [box.w, box.h, e.doc.page]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const k = Math.exp(-ev.deltaY * (ev.ctrlKey ? 0.01 : 0.0015));
      zoomAt(view.current.s * k, ev.clientX, ev.clientY);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  });

  const pointers = useRef(new Map<number, { x: number; y: number; cx: number; cy: number }>());
  const gesture = useRef<
    | null
    | { kind: 'drag'; dx: number; dy: number }
    | { kind: 'pinch'; d0: number; a0: number; s0: number; r0: number }
    | { kind: 'tap'; x: number; y: number }
    | { kind: 'view'; d0: number; m0: [number, number]; from: { s: number; x: number; y: number } }
  >(null);

  const toBoard = (cx: number, cy: number) => {
    const r = host.current!.getBoundingClientRect();
    return { x: ((cx - r.left) * e.W) / r.width, y: ((cy - r.top) * e.H) / r.height };
  };
  const pinchInfo = () => {
    const [a, b] = [...pointers.current.values()];
    return { d: Math.hypot(b.x - a.x, b.y - a.y), a: Math.atan2(b.y - a.y, b.x - a.x) };
  };
  const screenPinch = () => {
    const [a, b] = [...pointers.current.values()];
    return { d: Math.hypot(b.cx - a.cx, b.cy - a.cy), m: [(a.cx + b.cx) / 2, (a.cy + b.cy) / 2] as [number, number] };
  };

  const down = (ev: React.PointerEvent) => {
    if (ev.button > 0) return;
    host.current!.setPointerCapture(ev.pointerId);
    const p = toBoard(ev.clientX, ev.clientY);
    pointers.current.set(ev.pointerId, { ...p, cx: ev.clientX, cy: ev.clientY });
    const ui = useDrawUi.getState();

    if (pointers.current.size === 2) {
      // Second finger: never leave a stray mark. With a stamp selected, pinch sizes and turns it;
      // otherwise two fingers zoom and pan the picture.
      if (e.drawing) (e.livePoints < 8 ? e.cancelStroke() : e.endStroke());
      if (e.pending) {
        const { d, a } = pinchInfo();
        gesture.current = { kind: 'pinch', d0: d, a0: a, s0: e.pending.scale, r0: e.pending.rot };
      } else {
        const { d, m } = screenPinch();
        gesture.current = { kind: 'view', d0: Math.max(1, d), m0: m, from: { ...view.current } };
      }
      return;
    }
    if (pointers.current.size > 2) return;

    if (ui.tool === 'stamp') {
      const pend = e.pending;
      if (pend && Math.hypot(p.x - pend.x, p.y - pend.y) < (STAMP_BASE / 2 + 30) * pend.scale) {
        gesture.current = { kind: 'drag', dx: pend.x - p.x, dy: pend.y - p.y };
      } else {
        e.commitPending();
        e.setPending({ t: 'stamp', id: ui.stampId, x: p.x, y: p.y, scale: stampScale(ui.sizeIdx, e.W, e.H), rot: 0, color: ui.color });
        gesture.current = { kind: 'drag', dx: 0, dy: 0 };
      }
    } else if (ui.tool === 'fill') {
      gesture.current = { kind: 'tap', x: p.x, y: p.y };
    } else {
      e.beginStroke(ui.tool, ui.color, BRUSH_SIZES[ui.sizeIdx], p.x, p.y);
    }
  };

  const move = (ev: React.PointerEvent) => {
    if (!pointers.current.has(ev.pointerId)) return;
    const events = (ev.nativeEvent as PointerEvent).getCoalescedEvents?.() ?? [ev.nativeEvent];
    const last = toBoard(ev.clientX, ev.clientY);
    pointers.current.set(ev.pointerId, { ...last, cx: ev.clientX, cy: ev.clientY });
    const g = gesture.current;
    if (g?.kind === 'view') {
      if (pointers.current.size === 2) {
        const { d, m } = screenPinch();
        zoomAt(g.from.s * (d / g.d0), m[0], m[1], g.from, g.m0);
      }
      return;
    }
    if (pointers.current.size === 2 && g?.kind === 'pinch' && e.pending) {
      const { d, a } = pinchInfo();
      e.setPending({ ...e.pending, scale: Math.min(8, Math.max(0.3, (g.s0 * d) / Math.max(1, g.d0))), rot: g.r0 + (a - g.a0) });
      return;
    }
    if (pointers.current.size !== 1) return;
    if (e.drawing) {
      for (const pe of events.length ? events : [ev.nativeEvent]) {
        const p = toBoard(pe.clientX, pe.clientY);
        e.extendStroke(p.x, p.y);
      }
    } else if (g?.kind === 'drag' && e.pending) {
      e.setPending({ ...e.pending, x: last.x + g.dx, y: last.y + g.dy });
    }
  };

  const up = (ev: React.PointerEvent) => {
    if (!pointers.current.has(ev.pointerId)) return;
    const p = pointers.current.get(ev.pointerId)!;
    pointers.current.delete(ev.pointerId);
    if (e.drawing && pointers.current.size === 0) e.endStroke();
    const g = gesture.current;
    if (g?.kind === 'tap' && pointers.current.size === 0 && Math.hypot(p.x - g.x, p.y - g.y) < 24) {
      e.fill(g.x, g.y, useDrawUi.getState().color);
    }
    if (pointers.current.size === 0) gesture.current = null;
  };

  const cancel = (ev: React.PointerEvent) => {
    pointers.current.delete(ev.pointerId);
    if (e.drawing) e.cancelStroke();
    gesture.current = null;
  };

  const tool = useDrawUi((s) => s.tool);
  const label = TOOLS.find((t) => t.id === tool)?.name ?? '';
  const wideZoom = useIsWide();
  const finePointer = useMediaQuery('(pointer: fine)');
  // Touch screens pinch; mouse and big screens also get buttons.
  const showZoom = wideZoom || finePointer;
  return (
    <div className="draw__board" ref={wrap}>
      {(showZoom || zoom > 1) && (
        <div className="draw-zoom" role="toolbar" aria-label="Zoom">
          {showZoom && <button className="icon-btn" aria-label="Zoom in" disabled={zoom >= MAX_ZOOM} onClick={() => zoomBy(1.4)}><Icon name="plus" /></button>}
          {showZoom && <button className="icon-btn" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => zoomBy(1 / 1.4)}><Icon name="minus" /></button>}
          {zoom > 1 && <button className="icon-btn" aria-label="Show the whole picture" onClick={() => applyView(1, 0, 0)}><Icon name="fit" /></button>}
        </div>
      )}
      <div
        ref={host}
        className="artboard"
        data-tool={tool}
        style={{ width: box.w, height: box.h }}
        role="img"
        aria-label={`Your drawing. ${label} selected. Drag on the picture to use it.`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={cancel}
        onContextMenu={(ev) => ev.preventDefault()}
      />
    </div>
  );
}

/** One line under the picture: what the tool does, or controls for the stamp being placed. */
function ContextBar({ onLibrary, onLearn }: { onLibrary: () => void; onLearn: () => void }) {
  const e = getEngine();
  useEngineVersion();
  const tool = useDrawUi((s) => s.tool);
  const p = e.pending;
  if (p) {
    const name = STAMPS.find((s) => s.id === p.id)?.name ?? 'Stamp';
    return (
      <div className="draw__context" role="toolbar" aria-label={`${name} placement`}>
        <button className="icon-btn" aria-label="Smaller" onClick={() => e.setPending({ ...p, scale: Math.max(0.3, p.scale / 1.2) })}><Icon name="minus" /></button>
        <button className="icon-btn" aria-label="Bigger" onClick={() => e.setPending({ ...p, scale: Math.min(8, p.scale * 1.2) })}><Icon name="plus" /></button>
        <button className="icon-btn" aria-label="Turn" onClick={() => e.setPending({ ...p, rot: p.rot + Math.PI / 8 })}><Icon name="redo" /></button>
        <button className="icon-btn" aria-label="Remove stamp" onClick={() => e.setPending(null)}><Icon name="trash" /></button>
        <button className="btn btn--sky" onClick={() => e.commitPending()}><Icon name="check" /> Stick it</button>
      </div>
    );
  }
  const t = TOOLS.find((x) => x.id === tool);
  return (
    <PageBar
      onLibrary={onLibrary}
      onLearn={onLearn}
      hint={<span aria-live="polite"><Icon name={t?.icon ?? 'brush'} size={18} /> <strong>{t?.name}</strong> {t?.hint}</span>}
    />
  );
}
