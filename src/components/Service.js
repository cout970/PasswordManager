import {useState} from 'react';
import {
  checkPasswordWithSalt,
  copyToClipboard,
  getPassword,
  getPasswordSeed,
  getPasswordSeedWithAllGroups,
  ints2hex,
} from '../util';
import {ReactComponent as ClipboardCheckIcon} from '../icons/clipboard_check.svg';
import {ReactComponent as ClipboardIcon} from '../icons/clipboard.svg';
import {ReactComponent as HideIcon} from '../icons/hide.svg';
import {ReactComponent as ShowIcon} from '../icons/show.svg';
import {ReactComponent as GearIcon} from '../icons/gear.svg';
import {ServiceSettings} from './ServiceSettings';

export function Service({service, masterPassword, alphabets, settings, onChange}) {
  const [show, setShow] = useState(settings.defaultShowPassword);
  const [copyAnim, setCopyAnim] = useState(false);
  const [editing, setEditing] = useState(false);

  const alphabet = findAlphabetChars(service.alphabet, alphabets);
  let pass = '';
  let passSeed = '';
  let validated = true;

  if (masterPassword) {
    let seed;

    if (service.allGroups) {
      seed = getPasswordSeedWithAllGroups(masterPassword, service.code, service.passLen, alphabet, service.useRandomSeed);
    } else {
      seed = getPasswordSeed(masterPassword, service.code, service.passLen, service.useRandomSeed, alphabet.length);
    }

    pass = getPassword(seed, alphabet);
    passSeed = ints2hex(seed);

    if (service.masterCheck) {
      validated = checkPasswordWithSalt(service.masterCheck, masterPassword);
    }
  }

  const copy = () => {
    copyToClipboard(pass).then(() => {
      setCopyAnim(true);
      setTimeout(() => {
        setCopyAnim(false);
      }, 500);
    });
  };

  return <div className={editing ? 'service editing' : 'service'} key={service.id}>
    <div className="first-row">
      <div className="service-name">{service.name}</div>
      <div className={validated ? 'service-inputs' : 'service-inputs invalid'}>
        <button className="copy-btn icon-btn" onClick={copy} title="Copy to clipboard">
          {copyAnim
            ? <ClipboardCheckIcon key="clipboard-check-icon" className="checked"/>
            : <ClipboardIcon key="clipboard-icon"/>
          }
        </button>

        <input className="pass-input" type={show ? 'text' : 'password'} readOnly={true} value={pass}/>
        <input type="hidden" value={passSeed}/>

        <button className="show-btn icon-btn" onClick={_ => setShow(!show)} title="Show/Hide password">
          {show
            ? <HideIcon key="hide-icon"/>
            : <ShowIcon key="show-icon"/>}
        </button>

        <button className="edit-btn icon-btn" onClick={_ => setEditing(!editing)} title="Edit">
          <GearIcon key="gear-icon"/>
        </button>
      </div>
    </div>

    {editing ? <ServiceSettings key="settings" service={service} alphabets={alphabets} onChange={onChange}/> : ''}
  </div>;
}

function findAlphabetChars(alphabetName, alphabets) {
  for (let alphabet of alphabets) {
    if (alphabet.code === alphabetName) {
      return alphabet.chars;
    }
  }

  return alphabets[0].chars;
}