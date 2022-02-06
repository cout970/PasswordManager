import {ReactComponent as WarningIcon} from '../icons/warning.svg';

export function ServiceSettings({service, alphabets, onChange}) {
  const update = (changes) => {
    onChange({...service, ...changes});
  };

  const removeService = () => {
    if (window.confirm('Are you really sure you want ot delete this service forever?')) {
      onChange(service.id);
    }
  };

  return <div className="service-settings">
    <div className="row">
      <label htmlFor={service.id + '-name'}>Name</label>
      <input type="text" id={service.id + '-name'}
             value={service.name} name="name"
             onChange={e => update({name: e.target.value})}
      />
    </div>
    <div className="row">
      <label htmlFor={service.id + '-code'}>ID <WarningIcon
        title="Changing this value will change the generated passwords"/></label>
      <input type="text" id={service.id + '-code'}
             value={service.code} name="code"
             onChange={e => update({code: e.target.value})}
      />
    </div>
    <div className="row">
      <label htmlFor={service.id + '-passLen'}>Password length</label>
      <input type="number" min="1" max="255" id={service.id + '-passLen'}
             value={service.passLen} name="passLen"
             onChange={e => update({passLen: e.target.value | 0})}
      />
    </div>
    <div className="row">
      <label htmlFor={service.id + '-alphabet'}>Alphabet</label>
      <select name="alphabet" id={service.id + '-alphabet'}
              value={service.alphabet}
              onChange={e => update({alphabet: e.target.value})}
      >
        {Object.entries(alphabets).map(([key, value]) => {
          return <option key={key} value={key}>{value.name} "{value.summary}"</option>;
        })}
      </select>
    </div>
    <div className="row">
      <label htmlFor={service.id + '-allGroups'}>Force all character groups</label>
      <input type="checkbox" id={service.id + '-allGroups'}
             checked={service.allGroups} name="allGroups"
             onChange={e => update({allGroups: e.target.checked})}
      />
    </div>

    <button className="remove-btn" onClick={removeService}>Remove service</button>
  </div>;
}