import {decodeSecretContents, encodeSecretContents} from './Secret';
import {sha512} from '../util';

export function SecretSettings({masterPassword, settings, secret, onChange}) {
  const update = (changes) => {
    onChange({...secret, ...changes});
  };

  const updateContents = (text) => {
    onChange({...secret, contents: encodeSecretContents(masterPassword, text), sha512: sha512(text)});
  };

  const removeSecret = () => {
    if (window.confirm('Are you really sure you want ot delete this secret forever?')) {
      onChange(secret.id);
    }
  };

  let contents = decodeSecretContents(masterPassword, secret.contents);
  let decryptionOk = secret.sha512 === sha512(contents);

  return <div className="secret-settings">
    <div className="row">
      <label htmlFor={secret.id + '-name'}>Name</label>
      <input type="text" id={secret.id + '-name'}
             value={secret.name} name="name"
             onChange={e => update({name: e.target.value})}
      />
    </div>

    <div className="row vertical">
      <label htmlFor={secret.id + '-name'}>Contents</label>
      <textarea name="secret" id={'secret-' + secret.id}
                className="secret-contents"
                cols="30" rows={Math.max(1, contents.split('\n').length)}
                value={decryptionOk ? contents : '<Unable to decrypt>'}
                onChange={e => updateContents(e.target.value)}
                placeholder="<empty>"
                readOnly={!decryptionOk}
      />
    </div>

    <button className="btn remove-btn" onClick={removeSecret}>Remove secret</button>
  </div>;
}