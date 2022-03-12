import {ReactComponent as GearIcon} from '../icons/gear.svg';
import {useState} from 'react';
import {AlphabetSettings} from './AlphabetSettings';

export function Alphabet({alphabet, alphabets, onChange}) {
  const [editing, setEditing] = useState(false);

  return <div className={editing ? 'alphabet editing' : 'alphabet'}>
    <div className="first-row">
      <span className="alphabet-name">{alphabet.name}</span>
      <div className="alphabet-inputs">
        <span className="alphabet-summary">{alphabet.summary}</span>

        <button className="edit-btn icon-btn" onClick={_ => setEditing(!editing)}>
          <GearIcon key="gear-icon"/>
        </button>
      </div>
    </div>
    {editing ? <AlphabetSettings key="settings" alphabet={alphabet} alphabets={alphabets} onChange={onChange}/> : ''}
  </div>;
}