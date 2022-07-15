import {
  capitalize,
  copyToClipboard, findAlphabetChars,
  getPassword,
  getPasswordSeed,
  getPasswordSeedWithAllGroups,
  ints2hex,
} from '../util';
import {useState} from 'react';
import {ReactComponent as ClipboardCheckIcon} from '../icons/clipboard_check.svg';
import {ReactComponent as ClipboardIcon} from '../icons/clipboard.svg';
import {ReactComponent as HideIcon} from '../icons/hide.svg';
import {ReactComponent as ShowIcon} from '../icons/show.svg';
import {createService, updateValidationChecks} from './ServiceList';

export function SingleUse({masterPassword, alphabets, settings, services, setServices}) {
  const [alphabet, setAlphabet] = useState('default');
  const [code, setCode] = useState('');
  const [passLen, setPassLen] = useState(settings.defaultPasswordLength);
  // const [allGroups, setAllGroups] = useState(true);
  // const [useRandomSeed, setUseRandomSeed] = useState(false);
  const allGroups = true;
  const useRandomSeed = false;

  const [show, setShow] = useState(true);
  const [copyAnim, setCopyAnim] = useState(false);

  const alphabetChars = findAlphabetChars(alphabet, alphabets);
  let pass = '';
  let passSeed = '';

  if (masterPassword && code) {
    let seed;

    if (allGroups) {
      seed = getPasswordSeedWithAllGroups(masterPassword, code, passLen, alphabetChars, useRandomSeed);
    } else {
      seed = getPasswordSeed(masterPassword, code, passLen, useRandomSeed, alphabetChars.length);
    }

    pass = getPassword(seed, alphabetChars);
    passSeed = ints2hex(seed);
  }

  const copy = () => {
    if (pass) {
      copyToClipboard(pass).then(() => {
        setCopyAnim(true);
        setTimeout(() => {
          setCopyAnim(false);
        }, 500);
      });
    }
  };

  const createNewService = () => {
    let service = createService();
    service.name = capitalize(code);
    service.code = code;
    service.passLen = passLen;
    service.alphabet = alphabet;
    updateValidationChecks(service, masterPassword);
    setServices([service, ...services]);
  };

  return <div className="single-use">
    <h2>Single use</h2>

    <div className="single-use-contents">
      <div className="first-row">
        <button className="copy-btn icon-btn" onClick={copy} title="Copy to clipboard">
          {copyAnim
            ? <ClipboardCheckIcon key="clipboard-check-icon" className="checked"/>
            : <ClipboardIcon key="clipboard-icon"/>
          }
        </button>

        <input className="pass-input"
               type={show ? 'text' : 'password'}
               readOnly={true}
               value={pass}
               placeholder={'Fill the fields below'}
        />
        <input type="hidden" value={passSeed}/>

        <button className="show-btn icon-btn" onClick={_ => setShow(!show)} title="Show/Hide password">
          {show
            ? <HideIcon key="hide-icon"/>
            : <ShowIcon key="show-icon"/>}
        </button>
      </div>

      <div className="second-row">

        <div className="row">
          <label htmlFor={'single-use-code'}>Identifier</label>
          <input type="text"
                 id={'single-use-code'}
                 placeholder="Enter web/name for the password"
                 value={code}
                 onChange={e => setCode(e.target.value)}/>
        </div>

        <div className="row">
          <label htmlFor={'single-use-alphabet'}>Alphabet</label>
          <select id={'single-use--alphabet'}
                  value={alphabet}
                  onChange={e => setAlphabet(e.target.value)}
          >
            {alphabets.map(value =>
              <option key={'alphabet-' + value.id} value={value.code}>
                {value.name} "{value.summary}"
              </option>,
            )}
          </select>
        </div>

        <div className="row">
          <label htmlFor={'single-use-passLen'}>Password length</label>
          <input type="number"
                 id={'single-use-passLen'}
                 min="1"
                 max="255"
                 value={passLen + ''}
                 onChange={e => setPassLen(e.target.value | 0)}
          />
        </div>
      </div>

      <div className="list-footer">
        <button className="btn add-service"
                onClick={createNewService}>
          Save as service
        </button>
      </div>
    </div>
  </div>;
}