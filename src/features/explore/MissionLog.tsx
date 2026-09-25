import { useState } from 'react';
import { MISSIONS, type Mission } from '@/content/missions';
import { useProgress } from '@/state/progressStore';
import { track } from '@/state/gameplay';
import { Glyph } from '@/ui/Glyph';
import { Icon } from '@/ui/Icon';

/**
 * India's space story as a timeline of discoverable cards.
 * Tapping a card "discovers" it (unlocking crafts, stamps and backgrounds) and reveals a one-question quiz.
 */
export function MissionLog() {
  const discovered = useProgress((s) => s.discovered);
  const found = MISSIONS.filter((m) => discovered.includes(m.id)).length;
  return (
    <div className="missions">
      <div className="missions__inner">
        <div className="missions__intro">
          <h2>India in space</h2>
          <p className="muted">
            Tap a mission to discover it. You have found {found} of {MISSIONS.length}.
          </p>
        </div>
        <ol className="timeline" style={{ listStyle: 'none', margin: 0 }}>
          {MISSIONS.map((m) => (
            <MissionItem key={m.id} m={m} open={discovered.includes(m.id)} />
          ))}
        </ol>
      </div>
    </div>
  );
}

function MissionItem({ m, open }: { m: Mission; open: boolean }) {
  const quizzed = useProgress((s) => s.quizzed.includes(m.id));
  const [picked, setPicked] = useState<number | null>(null);
  const style = { ['--m' as string]: m.accent };
  return (
    <li className="mission" style={style}>
      <span className="mission__year" aria-hidden="true" />
      <div
        className="mission__card"
        role={open ? undefined : 'button'}
        tabIndex={open ? undefined : 0}
        aria-expanded={open}
        onClick={() => !open && track({ type: 'discover', id: m.id, group: 'mission' })}
        onKeyDown={(e) => {
          if (!open && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            track({ type: 'discover', id: m.id, group: 'mission' });
          }
        }}
      >
        <span className="mission__art">
          <Glyph name={m.glyph} size={50} accent={m.accent} />
        </span>
        <span>
          <span className="mission__when">{m.year}</span>
          <h3>{m.name}</h3>
          <span className="mission__tag">{m.tagline}</span>
          {!open && (
            <span className="mission__locked" style={{ display: 'flex' }}>
              <Icon name="sparkle" size={18} /> Tap to discover
            </span>
          )}
        </span>
        {open && (
          <div className="mission__detail">
            <p>{m.story}</p>
            <p className="mission__wow">{m.wow}</p>
            <a className="chip mission__colour" href={`#/draw/library/mission/${m.id}`}><Icon name="book" size={18} /> Colour this mission</a>
            {m.unlocks && (
              <div className="unlock-note">
                <Icon name="check" size={20} /> Unlocked: {m.unlocks.label}
                <a className="chip" href={m.unlocks.model ? `#/hangar/${m.unlocks.model}` : '#/draw'} style={{ textDecoration: 'none', marginLeft: 'auto' }}>
                  {m.unlocks.model ? 'Open hangar' : 'Open Draw'}
                </a>
              </div>
            )}
            <div className="quiz" role="group" aria-label="Question">
              <p className="quiz__q">{m.question.q}</p>
              {quizzed ? (
                <p className="muted"><Icon name="star" size={16} style={{ verticalAlign: '-2px', color: 'var(--gold)' }} /> You got this one right: {m.question.options[m.question.answer]}</p>
              ) : (
                <div className="quiz__opts">
                  {m.question.options.map((o, i) => {
                    const state = picked == null ? '' : i === m.question.answer ? 'right' : i === picked ? 'wrong' : '';
                    return (
                      <button
                        key={o}
                        className={`chip quiz__opt ${state}`}
                        disabled={picked != null && picked === m.question.answer}
                        onClick={() => {
                          setPicked(i);
                          track({ type: 'quiz', id: m.id, correct: i === m.question.answer });
                        }}
                      >
                        {o}
                      </button>
                    );
                  })}
                  {picked != null && picked !== m.question.answer && (
                    <p className="muted" role="status">Nice try! The right answer is shown in green. Read the story again and give another one a go.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
