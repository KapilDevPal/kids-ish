import { useState } from 'react';
import './onboarding.css';
import { makeCallSigns, PATCH_COLOURS } from '@/content/callsigns';
import { useProgress } from '@/state/progressStore';
import { BrandMark } from '@/ui/Nav';
import { Icon } from '@/ui/Icon';
import { Patch } from '@/ui/Patch';

/** A 20-second welcome: pick a call sign and a patch colour, then straight into space. */
export default function Onboarding() {
  const [options, setOptions] = useState(() => makeCallSigns());
  const [pick, setPick] = useState(options[0]);
  const [colour, setColour] = useState(PATCH_COLOURS[0]);
  const setProfile = useProgress((s) => s.setProfile);
  return (
    <main className="onboard">
      <div className="onboard__card">
        <div className="onboard__brand"><BrandMark size={72} /></div>
        <p className="onboard__kicker">Welcome to</p>
        <h1>Indian Space Hub</h1>
        <p className="muted onboard__lede">Build rockets, invent planets, draw space and fly India's missions.</p>

        <div className="onboard__patch">
          <Patch colour={colour} callSign={pick} size={112} />
        </div>

        <h2 className="onboard__h" id="cs-label">Pick your astronaut call sign</h2>
        <div className="onboard__options" role="radiogroup" aria-labelledby="cs-label">
          {options.map((o) => (
            <button key={o} role="radio" aria-checked={pick === o} className="chip onboard__opt" aria-pressed={pick === o} onClick={() => setPick(o)}>{o}</button>
          ))}
          <button className="icon-btn icon-btn--round" aria-label="Show new call signs" onClick={() => { const n = makeCallSigns(); setOptions(n); setPick(n[0]); }}>
            <Icon name="dice" />
          </button>
        </div>

        <h2 className="onboard__h" id="pc-label">Choose your patch colour</h2>
        <div className="row onboard__colours" role="radiogroup" aria-labelledby="pc-label">
          {PATCH_COLOURS.map((c) => (
            <button key={c} role="radio" aria-checked={colour === c} aria-pressed={colour === c} aria-label={`Patch colour ${c}`} className="swatch" style={{ background: c }} onClick={() => setColour(c)} />
          ))}
        </div>

        <button className="btn btn--big onboard__go" onClick={() => setProfile({ callSign: pick, patch: colour })}>
          <Icon name="rocket" /> Start my mission
        </button>
        <p className="onboard__note">Everything you make stays on this device.</p>
      </div>
    </main>
  );
}
