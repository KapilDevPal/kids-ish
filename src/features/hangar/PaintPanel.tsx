import { PAINT_SWATCHES, swatchName } from '@/content/palette';
import type { ModelDefinition } from '@/engine3d/types';
import { useHangar } from '@/state/hangarStore';
import type { Finish } from '@/state/types';
import { Icon } from '@/ui/Icon';
import { ModelOptions } from './ModelOptions';
import { track } from '@/state/gameplay';

const FINISHES: { id: Finish; label: string; look: string }[] = [
  { id: 'gloss', label: 'Shiny', look: 'radial-gradient(circle at 30% 30%, #fff 0 12%, var(--c) 30%)' },
  { id: 'metal', label: 'Metal', look: 'linear-gradient(135deg, #fff 0%, var(--c) 35%, #222 60%, var(--c) 85%)' },
  { id: 'matte', label: 'Chalky', look: 'var(--c)' },
  { id: 'glow', label: 'Glow', look: 'radial-gradient(circle, #fff 0 10%, var(--c) 45%, transparent 72%)' },
];

export function Swatches() {
  const brush = useHangar((s) => s.brush);
  const setColor = useHangar((s) => s.setBrushColor);
  return (
    <div className="scroll-x" role="group" aria-label="Paint colours">
      {PAINT_SWATCHES.map((s) => (
        <button
          key={s.hex}
          className="swatch"
          style={{ background: s.hex }}
          aria-pressed={brush.color === s.hex}
          aria-label={s.name}
          title={s.name}
          onClick={() => setColor(s.hex)}
        />
      ))}
    </div>
  );
}

export function FinishPicker() {
  const brush = useHangar((s) => s.brush);
  const setFinish = useHangar((s) => s.setBrushFinish);
  return (
    <div className="finishes" role="group" aria-label="Paint finish">
      {FINISHES.map((f) => (
        <button key={f.id} className="finish" aria-pressed={brush.finish === f.id} onClick={() => setFinish(f.id)}>
          <i style={{ background: f.look.replace(/var\(--c\)/g, brush.color) }} />
          {f.label}
        </button>
      ))}
    </div>
  );
}

/** The full paint panel body: finishes, magic presets, model options and a tappable parts list. */
export function PaintPanelBody({ def }: { def: ModelDefinition }) {
  const paint = useHangar((s) => s.paint);
  const paintPart = useHangar((s) => s.paintPart);
  const surprise = useHangar((s) => s.surprise);
  const tricolour = useHangar((s) => s.tricolour);
  const brush = useHangar((s) => s.brush);
  const ids = def.parts.map((p) => p.id);
  return (
    <>
      <div className="paint-section">
        <h4>Finish</h4>
        <FinishPicker />
      </div>
      <div className="paint-section">
        <h4>Quick paint</h4>
        <div className="magic-row">
          <button className="btn btn--ghost" onClick={() => { surprise(ids); track({ type: 'paint', modelId: def.id, finish: 'gloss' }); }}>
            <Icon name="dice" /> Surprise me
          </button>
          <button className="btn btn--ghost" onClick={() => { tricolour(ids); track({ type: 'paint', modelId: def.id, finish: 'gloss' }); }}>
            <span aria-hidden="true" style={{ display: 'inline-flex', flexDirection: 'column', width: 18, height: 18, borderRadius: 4, overflow: 'hidden' }}>
              <i style={{ flex: 1, background: '#FF9933' }} />
              <i style={{ flex: 1, background: '#fff' }} />
              <i style={{ flex: 1, background: '#138808' }} />
            </span>
            Tiranga
          </button>
        </div>
      </div>
      {def.options?.length ? (
        <div className="paint-section">
          <h4>Build</h4>
          <ModelOptions def={def} />
        </div>
      ) : null}
      <div className="paint-section">
        <h4>Parts: tap a name to paint it {swatchName(brush.color).toLowerCase()}</h4>
        <div className="parts-list">
          {def.parts.map((p) => (
            <button key={p.id} className="chip part-chip" onClick={() => { paintPart(p.id); track({ type: 'paint', modelId: def.id, finish: brush.finish }); }}>
              <span className="dot" style={{ background: paint[p.id]?.color }} />
              {p.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
