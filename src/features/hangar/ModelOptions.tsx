import type { ModelDefinition } from '@/engine3d/types';
import { useHangar } from '@/state/hangarStore';
import { Icon } from '@/ui/Icon';

/** Renders any model's option schema generically, so new models get controls for free. */
export function ModelOptions({ def }: { def: ModelDefinition }) {
  const options = useHangar((s) => s.options);
  const setOption = useHangar((s) => s.setOption);
  const busy = useHangar((s) => s.phase === 'running' || s.phase === 'countdown');
  if (!def.options?.length) return null;
  return (
    <div>
      {def.options.map((o) => (
        <div className="opt" key={o.id} role="group" aria-label={o.label}>
          <span className="opt__label">{o.label}</span>
          {o.type === 'choice' &&
            o.choices.map((c) => (
              <button key={String(c.value)} className="chip" disabled={busy} aria-pressed={options[o.id] === c.value} onClick={() => setOption(o.id, c.value)} title={c.hint}>
                {c.label}
                {c.hint && <span className="sr-only">, {c.hint}</span>}
              </button>
            ))}
          {o.type === 'toggle' && (
            <button className="chip" disabled={busy} aria-pressed={!!options[o.id]} onClick={() => setOption(o.id, !options[o.id])}>
              {options[o.id] ? <Icon name="check" size={20} /> : null}
              {options[o.id] ? 'On' : 'Off'}
            </button>
          )}
          {o.type === 'stepper' && (
            <span className="stepper">
              <button className="icon-btn icon-btn--round" aria-label={`Fewer ${o.label.toLowerCase()}`} disabled={busy || Number(options[o.id]) <= o.min} onClick={() => setOption(o.id, Number(options[o.id]) - 1)}>
                <Icon name="minus" />
              </button>
              <span aria-live="polite">{String(options[o.id])}</span>
              <button className="icon-btn icon-btn--round" aria-label={`More ${o.label.toLowerCase()}`} disabled={busy || Number(options[o.id]) >= o.max} onClick={() => setOption(o.id, Number(options[o.id]) + 1)}>
                <Icon name="plus" />
              </button>
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
