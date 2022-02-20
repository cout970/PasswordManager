import {randId, searchBy, sha512} from '../util';
import {getAndIncrementId} from '../storage';
import {useState} from 'react';
import {Secret} from './Secret';

export function SecretList({masterPassword, settings, secrets, setSecrets}) {
  const [search, setSearch] = useState('');

  const addSecret = () => {
    setSecrets([...secrets, createSecret()]);
    setSearch('');
  };

  const setSecret = (newValue) => {
    if (typeof newValue === 'string') {
      setSecrets(secrets.filter(secret => secret.id !== newValue));
    } else {
      setSecrets(secrets.map(secret => secret.id === newValue.id ? validateSecret(newValue) : secret));
    }
  };

  let content = <div className="no-results">There are no matching secrets</div>;
  const displaySecrets = search ? searchBy(secrets, 'name', search) : secrets;

  if (displaySecrets.length) {
    content = displaySecrets.map(s =>
      <Secret
        key={'secret-' + s.id}
        masterPassword={masterPassword}
        settings={settings}
        secret={s}
        onChange={setSecret}
      />);
  }

  return <div className="service-list">
    <h2>Secrets</h2>
    <div className="list-header">
      <button className="btn add-secret" onClick={addSecret}>Add secret</button>
      <input className="search" type="text" placeholder="Search by name" value={search}
             onChange={e => setSearch(e.target.value)}/>
    </div>
    {content}
  </div>;
}

/**
 * Creates a new secret
 * @returns {{
 * id: string,
 * name: string,
 * contents: string,
 * }}
 */
export function createSecret() {
  let index = getAndIncrementId('secret-index');

  return {
    id: randId(),
    name: 'Secret #' + index,
    contents: '',
    sha512: sha512(''),
  };
}

/**
 * Replaces invalid fields and adds missing values
 * @param secret_input {{}}
 * @returns {{}}
 */
export function validateSecret(secret_input) {
  let secret = secret_input || {};

  if (!secret.id) {
    secret.id = randId();
  }

  if (typeof secret.name !== 'string') {
    let index = getAndIncrementId('secret-index');
    secret.name = 'Secret #' + index;
  }

  if (typeof secret.contents !== 'string') {
    secret.contents = '';
  }

  if (typeof secret.sha512 !== 'string') {
    secret.sha512 = sha512('');
  }

  return secret;
}