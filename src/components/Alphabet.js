import {ReactComponent as GearIcon} from '../icons/gear.svg';
import {useState} from 'react';
import {AlphabetSettings} from './AlphabetSettings';

export function Alphabet({alphabet, onChange}) {
  const [editing, setEditing] = useState(false);

  return <div className={editing ? 'alphabet editing' : 'alphabet'}>
    <div className="first-row">
      <span className="alphabet-name">{alphabet.name}</span> <span className='alphabet-summary'>{alphabet.summary}</span>

      <button className="edit-btn icon-btn" onClick={_ => setEditing(!editing)}>
        <GearIcon key="gear-icon"/>
      </button>
    </div>
    {editing ? <AlphabetSettings key="settings" alphabet={alphabet} onChange={onChange}/> : ''}
  </div>;
}