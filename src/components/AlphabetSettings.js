import {ReactComponent as WarningIcon} from '../icons/warning.svg';

export function AlphabetSettings({alphabet, onChange}) {
  const update = (changes) => {
    onChange({...alphabet, ...changes});
  };

  const removeService = () => {
    if (window.confirm('Are you really sure you want ot delete this alphabet forever?')) {
      onChange(alphabet.id);
    }
  };

  return <div className="alphabet-settings">
    <div className="row">
      <label htmlFor={alphabet.id + '-name'}>Name</label>
      <input type="text" id={alphabet.id + '-name'}
             value={alphabet.name} name="name"
             onChange={e => update({name: e.target.value})}
      />
    </div>
    <div className="row">
      <label htmlFor={alphabet.id + '-chars'}>Characters<WarningIcon
        title="Changing this value will change the generated passwords"/></label>
      <input type="text" id={alphabet.id + '-chars'}
             value={alphabet.chars} name="chars"
             onChange={e => update({chars: e.target.value})}
      />
    </div>
    <div className="row">
      <label htmlFor={alphabet.id + '-summary'}>Summary</label>
      <input type="text" id={alphabet.id + '-summary'}
             value={alphabet.summary} name="summary"
             onChange={e => update({summary: e.target.value})}
      />
    </div>

    <button className="btn remove-btn" onClick={removeService}>Remove alphabet</button>
  </div>;
}