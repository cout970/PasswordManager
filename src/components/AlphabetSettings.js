import {ReactComponent as WarningIcon} from '../icons/warning.svg';

export function AlphabetSettings({alphabet, alphabets, onChange}) {
  const update = (changes) => {
    onChange({...alphabet, ...changes});
  };

  const removeService = () => {
    if (window.confirm('Are you really sure you want ot delete this alphabet forever?')) {
      onChange(alphabet.id);
    }
  };

  let numDuplicates = alphabets.filter(a => a.id !== alphabet.id && a.code === alphabet.code).length;

  return <div className="alphabet-settings">
    <div className="row">
      <label htmlFor={alphabet.id + '-name'}>Name</label>
      <input type="text" id={alphabet.id + '-name'}
             value={alphabet.name} name="name"
             onChange={e => update({name: e.target.value})}
      />
    </div>
    <div className={numDuplicates > 0 ? 'row invalid' : 'row'}>
      <label htmlFor={alphabet.id + '-code'}>
        ID <WarningIcon className="help-icon" title="Changing this value will break passwords that use this alphabet"/>
        {numDuplicates > 0 ?
          <div className="warning-label" title={'There are ' + (numDuplicates + 1) + ' alphabets with this ID'}>
            Not unique
          </div> : ''}
      </label>
      <input type="text" id={alphabet.id + '-code'}
             value={alphabet.code} name="code"
             onChange={e => update({code: e.target.value})}
      />
    </div>
    <div className="row">
      <label htmlFor={alphabet.id + '-chars'}>
        Characters <WarningIcon className="help-icon" title="Changing this value will change the generated passwords"/>
      </label>
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