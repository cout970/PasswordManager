import {useState} from 'react';
import {ReactComponent as HideIcon} from '../icons/hide.svg';
import {ReactComponent as ShowIcon} from '../icons/show.svg';
import {ReactComponent as GearIcon} from '../icons/gear.svg';
import {SecretSettings} from './SecretSettings';
import {decrypt, encrypt, randId, sha512} from '../util';

export function Secret({masterPassword, settings, secret, onChange}) {
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(false);

  let contents = decodeSecretContents(masterPassword, secret.contents);
  let decryptionOk = secret.sha512 === sha512(contents);

  return <div className={editing ? 'secret editing' : 'secret'} key={secret.id}>
    <div className="first-row">
      <div className="secret-name">{secret.name}</div>
      <div className="secret-inputs">
        <button className="show-btn icon-btn" onClick={_ => setShow(!show)} title="Show/Hide password">
          {show
            ? <HideIcon key="hide-icon"/>
            : <ShowIcon key="show-icon"/>}
        </button>

        <button className="edit-btn icon-btn"
                onClick={_ => setEditing(!editing)}
                title="Edit">
          <GearIcon key="gear-icon"/>
        </button>
      </div>
    </div>

    {show && !editing ?
      <div className="show-secret">
        <textarea name="secret" id={'secret-' + secret.id}
                  className="secret-contents"
                  cols="30" rows={Math.max(1, contents.split('\n').length)}
                  value={decryptionOk ? contents : '<Unable to decrypt>'}
                  placeholder="<empty>"
                  readOnly={true}
        />
      </div>
      : ''}

    {editing ?
      <SecretSettings key="settings"
                      masterPassword={masterPassword}
                      settings={settings}
                      secret={secret}
                      onChange={onChange}/>
      : ''}
  </div>;
}

/**
 *
 * @param masterPassword
 * @param contents
 * @returns {string|string}
 */
export function decodeSecretContents(masterPassword, contents) {
  if (!contents) return '';
  const [salt, cyphertext] = contents.split(':', 2);
  let key = sha512(masterPassword + ':' + salt);
  return decrypt(cyphertext, key) || '';
}

/**
 *
 * @param masterPassword
 * @param text
 * @returns {string}
 */
export function encodeSecretContents(masterPassword, text) {
  let salt = randId();
  let key = sha512(masterPassword + ':' + salt);
  let cyphertext = encrypt(text, key);
  return salt + ':' + cyphertext;
}