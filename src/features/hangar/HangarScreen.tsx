import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './hangar.css';
import { SpaceCanvas, type CaptureFn } from '@/engine3d/SpaceCanvas';
import { CameraRig } from '@/engine3d/CameraRig';
import { Bursts } from '@/engine3d/Bursts';
import { MODELS, getModel } from '@/engine3d/registry';
import { resetActionClock } from '@/engine3d/actionClock';
import { useHangar, currentRecipe } from '@/state/hangarStore';
import { useProgress } from '@/state/progressStore';
import { useGallery } from '@/state/galleryStore';
import { saveCreation, track } from '@/state/gameplay';
import { peekHandoff } from '@/state/handoff';
import { isUnlocked } from '@/content/unlocks';
import { TRICOLOUR } from '@/content/palette';
import { Icon } from '@/ui/Icon';
import { Glyph } from '@/ui/Glyph';
import { Sheet } from '@/ui/Sheet';
import { useIsWide } from '@/hooks/useMediaQuery';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { go } from '@/app/router';
import { PaintPanelBody, Swatches } from './PaintPanel';
import { ModelPicker } from './ModelPicker';
import type { ModelDefinition } from '@/engine3d/types';

export default function HangarScreen({ params }: { params: string[] }) {
  const discovered = useProgress((s) => s.discovered);
  const requested = getModel(params[0]);
  const def: ModelDefinition =
    requested && isUnlocked('model', requested.id, discovered) ? requested : MODELS[0];
  const remixId = params[1] === 'remix' ? params[2] : undefined;
  // Arrived from a colouring page: #/hangar/:model/colours carries the child's colours.
  const fromPage = params[1] === 'colours';

  const load = useHangar((s) => s.load);
  const loadedId = useHangar((s) => s.modelId);
  const items = useGallery((s) => s.items);

  // Load the model (and a remix recipe, if one was requested) before first paint.
  useLayoutEffect(() => {
    const recipe = remixId ? items.find((c) => c.id === remixId)?.recipe : fromPage ? peekHandoff(def.id) : undefined;
    load(def, recipe);
    resetActionClock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [def.id, remixId, fromPage]);

  const wide = useIsWide();
  const [picker, setPicker] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const capture = useRef<CaptureFn | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Keep the action button just above the sheet, whatever its height.
  useEffect(() => {
    const el = sheetRef.current;
    const stage = stageRef.current;
    if (!el || !stage) return;
    const ro = new ResizeObserver(() => stage.style.setProperty('--sheet-h', `${el.offsetHeight}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, [wide]);

  if (loadedId !== def.id) return <div className="screen" aria-busy="true" />;

  return (
    <div className="hangar">
      <div className="hangar__stage" ref={stageRef}>
        <Stage def={def} captureRef={capture} />
        <TopBar def={def} onPick={() => setPicker(true)} fromPage={fromPage} />
        <SideControls def={def} capture={capture} />
        <PartFact def={def} />
        <ActionButton def={def} />
        <Countdown />
        <Result def={def} capture={capture} />
        {!wide && (
          <div ref={sheetRef}>
            <Sheet
              label="paint tools"
              open={sheetOpen}
              onToggle={setSheetOpen}
              peek={
                <div className="paint-peek">
                  <Swatches />
                  <button className="icon-btn finish-btn" aria-label={sheetOpen ? 'Fewer tools' : 'More tools'} aria-expanded={sheetOpen} onClick={() => setSheetOpen(!sheetOpen)}>
                    <Icon name={sheetOpen ? 'chevronDown' : 'sliders'} />
                  </button>
                </div>
              }
            >
              <div style={{ maxHeight: '42vh', overflowY: 'auto', paddingBottom: 6 }}>
                <PaintPanelBody def={def} />
              </div>
            </Sheet>
          </div>
        )}
      </div>
      {wide && (
        <aside className="hangar__panel" aria-label="Paint tools">
          <h2>Paint {def.name}</h2>
          <p className="muted" style={{ marginBottom: 12 }}>Pick a colour, then tap any part of the model.</p>
          <Swatches />
          <PaintPanelBody def={def} />
        </aside>
      )}
      {picker && <ModelPicker current={def.id} onClose={() => setPicker(false)} />}
    </div>
  );
}

function Stage({ def, captureRef }: { def: ModelDefinition; captureRef: React.MutableRefObject<CaptureFn | null> }) {
  const options = useHangar((s) => s.options);
  const resetAt = useHangar((s) => s.cameraResetAt);
  const phase = useHangar((s) => s.phase);
  const reduced = useReducedMotion();
  const Model = def.Component;
  return (
    <SpaceCanvas camera={{ position: def.camera.position }} captureRef={captureRef} label={`3D ${def.name}. Drag to spin, pinch to zoom, tap a part to paint it.`}>
      <CameraRig
        position={def.camera.position}
        target={def.camera.target}
        min={def.camera.min}
        max={def.camera.max}
        resetKey={resetAt}
        autoRotate={!reduced && phase === 'idle'}
      />
      <Model options={options} />
      <Bursts />
    </SpaceCanvas>
  );
}

function TopBar({ def, onPick, fromPage }: { def: ModelDefinition; onPick: () => void; fromPage: boolean }) {
  const canUndo = useHangar((s) => s.past.length > 0);
  const canRedo = useHangar((s) => s.future.length > 0);
  const undo = useHangar((s) => s.undo);
  const redo = useHangar((s) => s.redo);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);
  return (
    <div className="topbar">
      {fromPage ? (
        <button className="icon-btn icon-btn--round" aria-label="Back to your colouring page" onClick={() => go('#/draw')}>
          <Icon name="back" />
        </button>
      ) : (
        <button className="icon-btn icon-btn--round" aria-label="Home" onClick={() => go('#/home')}>
          <Icon name="back" />
        </button>
      )}
      <button className="hangar__model-btn" onClick={onPick} aria-haspopup="dialog">
        <Glyph name={def.glyph} size={36} accent={def.accent} />
        {def.name}
        <Icon name="chevronDown" size={20} />
      </button>
      <span className="spacer" />
      <button className="icon-btn" aria-label="Undo" disabled={!canUndo} onClick={undo}>
        <Icon name="undo" />
      </button>
      <button className="icon-btn" aria-label="Redo" disabled={!canRedo} onClick={redo}>
        <Icon name="redo" />
      </button>
    </div>
  );
}

function SideControls({ def, capture }: { def: ModelDefinition; capture: React.MutableRefObject<CaptureFn | null> }) {
  const explode = useHangar((s) => s.explode);
  const toggleExplode = useHangar((s) => s.toggleExplode);
  const resetCamera = useHangar((s) => s.resetCamera);
  const busy = useHangar((s) => s.phase === 'running' || s.phase === 'countdown');
  const [saving, setSaving] = useState(false);
  const save = useSave(def, capture);
  return (
    <div className="hangar__side">
      <button className="icon-btn" aria-label="Save to archive" disabled={saving || busy} onClick={async () => { setSaving(true); await save(); setSaving(false); }}>
        <Icon name="camera" />
        <span className="icon-btn__label">Save</span>
      </button>
      {def.family !== 'planet' && (
        <button
          className="icon-btn"
          aria-pressed={explode}
          aria-label="Take apart to see the pieces"
          disabled={busy}
          onClick={() => { toggleExplode(); if (!explode) track({ type: 'explode' }); }}
        >
          <Icon name="explode" />
          <span className="icon-btn__label">Parts</span>
        </button>
      )}
      <button className="icon-btn" aria-label="Reset view" onClick={resetCamera}>
        <Icon name="reset" />
        <span className="icon-btn__label">View</span>
      </button>
      <a className="icon-btn" style={{ textDecoration: 'none' }} aria-label={`Colouring pages of ${def.name}`} href={`#/draw/library/model/${def.id}`}>
        <Icon name="book" />
        <span className="icon-btn__label">Colour</span>
      </a>
    </div>
  );
}

function useSave(def: ModelDefinition, capture: React.MutableRefObject<CaptureFn | null>) {
  return useCallback(async () => {
    const img = capture.current?.();
    const recipe = currentRecipe();
    if (!img || !recipe) return;
    const colours = new Set(Object.values(recipe.paint).map((p) => p.color.toUpperCase()));
    const tricolour =
      def.family === 'rocket' &&
      colours.has(TRICOLOUR.saffron.toUpperCase()) &&
      colours.has(TRICOLOUR.white.toUpperCase()) &&
      colours.has(TRICOLOUR.green.toUpperCase());
    const glow = Object.values(recipe.paint).some((p) => p.finish === 'glow');
    await saveCreation({
      kind: def.family === 'planet' ? 'planet' : 'craft',
      image: img,
      recipe,
      modelId: def.id,
      meta: { tricolour, glow, rings: !!recipe.options.rings, moons: Number(recipe.options.moons ?? 0) },
    });
  }, [def, capture]);
}

/** A speech-bubble fact about the part the child just painted: learning in the flow of play. */
function PartFact({ def }: { def: ModelDefinition }) {
  const selected = useHangar((s) => s.selected);
  const selectedAt = useHangar((s) => s.selectedAt);
  const color = useHangar((s) => (s.selected ? s.paint[s.selected]?.color : undefined));
  const select = useHangar((s) => s.select);
  const phase = useHangar((s) => s.phase);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!selected) return setVisible(false);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 7000);
    return () => clearTimeout(t);
  }, [selected, selectedAt]);
  const part = def.parts.find((p) => p.id === selected);
  if (!visible || !part || phase !== 'idle') return null;
  return (
    <div className="hangar__fact" role="status">
      <strong>
        <span className="dot" style={{ background: color }} />
        {part.label}
      </strong>
      <p>{part.fact}</p>
      <button aria-label="Close fact" onClick={() => select(null)}>
        <Icon name="close" size={20} />
      </button>
    </div>
  );
}

function ActionButton({ def }: { def: ModelDefinition }) {
  const phase = useHangar((s) => s.phase);
  const setPhase = useHangar((s) => s.setPhase);
  const select = useHangar((s) => s.select);
  const explode = useHangar((s) => s.explode);
  const toggleExplode = useHangar((s) => s.toggleExplode);
  const icon = def.action.kind === 'launch' ? 'rocket' : def.action.kind === 'spin' ? 'reset' : 'play';
  return (
    <button
      className="hangar__action"
      disabled={phase !== 'idle'}
      onClick={() => {
        select(null);
        if (explode) toggleExplode();
        setPhase(def.action.kind === 'launch' ? 'countdown' : 'running');
      }}
    >
      <Icon name={icon} size={30} />
      {def.action.label}
    </button>
  );
}

function Countdown() {
  const phase = useHangar((s) => s.phase);
  const setPhase = useHangar((s) => s.setPhase);
  const [n, setN] = useState(3);
  useEffect(() => {
    if (phase === 'idle') setN(3);
    if (phase !== 'countdown') return;
    setN(3);
    const timers = [
      setTimeout(() => setN(2), 800),
      setTimeout(() => setN(1), 1600),
      setTimeout(() => setN(0), 2400),
      setTimeout(() => setPhase('running'), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase, setPhase]);
  if (phase !== 'countdown' && !(phase === 'running' && n === 0)) return null;
  if (phase === 'running' && n === 0) return <LiftoffFlash />;
  return (
    <div className="countdown" aria-live="assertive">
      <span key={n}>{n}</span>
    </div>
  );
}

function LiftoffFlash() {
  const [show, setShow] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, []);
  if (!show) return null;
  return (
    <div className="countdown" aria-live="assertive" style={{ fontSize: 'clamp(3rem, 16vw, 7rem)' }}>
      <span>Liftoff!</span>
    </div>
  );
}

function Result({ def, capture }: { def: ModelDefinition; capture: React.MutableRefObject<CaptureFn | null> }) {
  const phase = useHangar((s) => s.phase);
  const setPhase = useHangar((s) => s.setPhase);
  const options = useHangar((s) => s.options);
  const tracked = useRef(false);
  const save = useSave(def, capture);

  useEffect(() => {
    if (phase !== 'done') {
      tracked.current = false;
      return;
    }
    if (tracked.current) return;
    tracked.current = true;
    const k = def.action.kind;
    if (k === 'launch') track({ type: 'launch', modelId: def.id, boosters: Number(options.boosters ?? (def.id === 'lvm3' ? 2 : 0)) });
    else if (k === 'land') track({ type: 'land' });
    else if (k === 'orbit') track({ type: 'orbit' });
    else track({ type: 'spin' });
    if (k === 'spin') {
      const t = setTimeout(() => setPhase('idle'), 400);
      return () => clearTimeout(t);
    }
  }, [phase, def, options, setPhase]);

  if (phase !== 'done' || def.action.kind === 'spin') return null;
  return (
    <div className="card result" role="status">
      <h3>{def.action.success}</h3>
      <div className="row" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn" onClick={() => setPhase('idle')}>
          <Icon name="reset" /> Again
        </button>
        <button className="btn btn--green" onClick={async () => { resetActionClock(); setPhase('idle'); setTimeout(() => void save(), 450); }}>
          <Icon name="camera" /> Save it
        </button>
      </div>
    </div>
  );
}
