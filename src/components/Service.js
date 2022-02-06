import {useState} from 'react';
import {copyToClipboard, generatePassword} from '../util';
import {ReactComponent as ClipboardCheckIcon} from '../icons/clipboard_check.svg';
import {ReactComponent as ClipboardIcon} from '../icons/clipboard.svg';
import {ReactComponent as HideIcon} from '../icons/hide.svg';
import {ReactComponent as ShowIcon} from '../icons/show.svg';
import {ReactComponent as GearIcon} from '../icons/gear.svg';
import {ServiceSettings} from './ServiceSettings';

export function Service({service, masterPassword, alphabets, onChange}) {
  const [show, setShow] = useState(false);
  const [copyAnim, setCopyAnim] = useState(false);
  const [editing, setEditing] = useState(false);

  const alphabet = alphabets[service.alphabet].chars;
  let pass = '';

  if (masterPassword) {
    pass = generatePassword(masterPassword, service.code, service.passLen, alphabet, service.allGroups);
  }

  const copy = () => {
    copyToClipboard(pass).then(() => {
      setCopyAnim(true);
      setTimeout(() => {
        setCopyAnim(false);
      }, 1000);
    });
  };

  return <div className={editing ? 'service editing' : 'service'} key={service.id}>
    <div className="first-row">
      <div className="service-name">{service.name}</div>

      <button className="copy-btn icon-btn" onClick={copy}>
        {copyAnim
          ? <ClipboardCheckIcon key="clipboard-check-icon"/>
          : <ClipboardIcon key="clipboard-icon"/>
        }
      </button>

      <input className="pass-input" type={show ? 'text' : 'password'} readOnly={true} value={pass}/>

      <button className="show-btn icon-btn" onClick={_ => setShow(!show)}>
        {show
          ? <HideIcon key="hide-icon"/>
          : <ShowIcon key="show-icon"/>}
      </button>

      <button className="edit-btn icon-btn" onClick={_ => setEditing(!editing)}>
        <GearIcon key="gear-icon"/>
      </button>
    </div>

    {editing ? <ServiceSettings key="settings" service={service} alphabets={alphabets} onChange={onChange}/> : ''}
  </div>;
}