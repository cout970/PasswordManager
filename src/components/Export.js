import {useRef, useState} from 'react';
import {checkPasswordWithSalt, decrypt, downloadAsFile, encrypt, hashPasswordWithSalt, randId, sha512} from '../util';
import {
  deserializeAlphabets,
  deserializeSecrets,
  deserializeServices,
  deserializeSettings,
  serializeAlphabets,
  serializeSecrets,
  serializeServices,
  serializeSettings,
} from '../serialize';
import {externalStoreSettings, retrievePaste} from '../api';

export default function Export({masterPassword, alphabets, services, secrets, settings, setSettings, onDataImport}) {
  const [text, setText] = useState('');
  const [override, setOverride] = useState(false);
  const [exportResult, setExportResult] = useState('');
  const [exportIsError, setExportIsError] = useState(false);
  const auxInput = useRef();

  const exportData = (target) => {
    let date = (new Date()).toISOString();
    let data = {
      exportDate: date,
      masterPasswordHash: hashPasswordWithSalt(masterPassword),
      alphabets: encrypt(serializeAlphabets(alphabets), masterPassword),
      services: encrypt(serializeServices(services), masterPassword),
      secrets: encrypt(serializeSecrets(secrets), masterPassword),
      settings: encrypt(serializeSettings(settings), masterPassword),
    };
    data = JSON.stringify(data, null, 2);

    if (target === 'file') {
      downloadAsFile(`settings-${date}.json`, data);
      setExportResult('Successfully exported settings');
      setExportIsError(false);
      return;
    }

    if (target === 'textarea') {
      setText(data);
      setExportResult('Successfully exported settings');
      setExportIsError(false);
      return;
    }

    if (target === 'external') {
      externalStoreSettings(settings, data).then(url => {
        setExportResult('Successfully exported settings');
        setExportIsError(false);
        setSettings({...settings, externalServiceUrl: url});
      }, e => {
        console.error(e);
        setExportResult('Unable to store setting in external service');
        setExportIsError(true);
      });
      return;
    }

    console.error('Invalid target: ' + target);
  };

  const importData = async (target) => {
    let data;
    try {
      if (target === 'textarea') {
        data = text;
      } else if (target === 'file') {
        data = await askUserForFile();
      } else if (target === 'external') {
        data = await retrievePaste(settings.externalServiceUrl);
      }

      data = JSON.parse(data);

      if (!data) {
        setExportResult('Invalid data');
        setExportIsError(true);
        return;
      }

      let masterPasswordHash = data.masterPasswordHash;

      if (masterPasswordHash.includes(':')) {
        if (!checkPasswordWithSalt(masterPasswordHash, masterPassword)) {
          setExportResult('Incorrect master password');
          setExportIsError(true);
          return;
        }
      } else {
        // Compatibility with previous versions
        if (masterPasswordHash !== sha512(masterPassword)) {
          setExportResult('Incorrect master password');
          setExportIsError(true);
          return;
        }
      }

      let items = {};

      if (data.alphabets) {
        let alphabets = decrypt(data.alphabets, masterPassword);
        items.alphabets = deserializeAlphabets(alphabets);
      }
      if (data.services) {
        let services = decrypt(data.services, masterPassword);
        items.services = deserializeServices(services);
      }
      if (data.secrets) {
        let services = decrypt(data.secrets, masterPassword);
        items.secrets = deserializeSecrets(services);
      }
      if (data.settings) {
        let settings = decrypt(data.settings, masterPassword);
        items.settings = deserializeSettings(settings);
      }

      if (override) {
        if (window.confirm('Are you sure you want to override the current settings with the new settings?')) {
          onDataImport(items);
          setExportResult('Successfully importer settings');
          setExportIsError(false);
          return;
        }
      } else {
        if (window.confirm('Are you sure you want to merge the current settings with the new settings?')) {
          let newItems = mergeSettings(items, {alphabets, services, secrets, settings});
          onDataImport(newItems);
          setExportResult('Successfully importer settings');
          setExportIsError(false);
          return;
        }
      }

      setExportResult('Importation cancelled');
      setExportIsError(false);
    } catch (e) {
      console.error(e);
      setExportResult('Error: ' + e.message);
      setExportIsError(true);
    }
  };

  return <div className="export">
    <h2>Export/Import</h2>
    <div className="export-import">
      {exportResult
        ? <div className={exportIsError ? 'export-result error' : 'export-result success'}>{exportResult}</div>
        : ''}

      <div className="actions export-settings">
        <h3>Import from</h3>
        <div className="actions-import">
          <button className="btn"
                  onClick={_ => importData('textarea')}
                  title="Load config from the textarea"
                  disabled={!text || !masterPassword}>
            Textarea
          </button>
          <button className="btn"
                  onClick={_ => importData('file')}
                  title="Load config from a file"
                  disabled={!masterPassword}>
            File
          </button>
          <button className="btn"
                  onClick={_ => importData('external')}
                  title="Load config from the external service"
                  disabled={!settings.externalServiceLoad || !settings.externalServiceUrl || !masterPassword}>
            External service
          </button>
        </div>

        <div className="row checkbox centered">
          <label htmlFor="override">Override instead of merge configs</label>
          <input id="override" type="checkbox" name="override"
                 checked={override}
                 onChange={e => setOverride(e.target.checked)}/>
        </div>

        <h3>Export to</h3>
        <div className="actions-export">
          <button className="btn"
                  onClick={_ => exportData('textarea')}
                  title="Export config into the textarea">
            Textarea
          </button>
          <button className="btn"
                  onClick={_ => exportData('file')}
                  title="Export config into a file and download the file">
            File
          </button>
          <button className="btn"
                  onClick={_ => exportData('external')}
                  disabled={!settings.externalServiceStore || !settings.externalServiceAccount}
                  title="Export config to the configured external service">
            External service
          </button>

          <input id="file-input" type="file" name="aux-file-upload" style={{display: 'none'}} ref={auxInput}/>
        </div>
      </div>

      <div className="textarea-wrapper">
        <textarea name="export-import"
                  id="export-import"
                  cols="30" rows="10"
                  value={text}
                  onChange={e => setText(e.target.value)}
        />
      </div>
      <small>Export data is encrypted with AES using the master password</small>
    </div>
  </div>;
}

function mergeSettings(a, b) {
  let res = {};
  // alphabets, services, secrets, settings

  if (a.alphabets) {
    res.alphabets = mergeLists(a.alphabets, b.alphabets, 'name', (a1, a2) => {
      return a1.summary === a2.summary
        && a1.chars === a2.chars;
    });
  }

  if (a.services) {
    res.services = mergeLists(a.services, b.services, 'name', (a1, a2) => {
      return a1.code === a2.code
        && a1.username === a2.username
        && a1.alphabet === a2.alphabet
        && a1.passLen === a2.passLen
        && a1.allGroups === a2.allGroups
        && a1.useRandomSeed === a2.useRandomSeed
        && a1.masterCheck === a2.masterCheck;
    });
  }

  if (a.secrets) {
    res.secrets = mergeLists(a.secrets, b.secrets, 'name', (a1, a2) => {
      return a1.name === a2.name
        && a1.contents === a2.contents
        && a1.sha512 === a2.sha512;
    });
  }

  if (a.settings) {
    res.settings = {
      ...b.settings,
      defaultPasswordLength: a.settings.defaultPasswordLength,
      defaultShowPassword: a.settings.defaultShowPassword,
      defaultAllGroups: a.settings.defaultAllGroups,
      defaultRandomSeed: a.settings.defaultRandomSeed,
      darkTheme: a.settings.darkTheme,
    };
  }

  return res;
}

function mergeLists(a, b, keyProp, cmp) {
  let byKey = new Map();

  b.forEach(alpha => {
    alpha.id = randId();
    byKey.set(alpha[keyProp], alpha);
  });

  a.forEach(alpha => {
    alpha.id = randId();

    if (byKey.has(alpha[keyProp])) {
      let other = byKey.get(alpha[keyProp]);

      if (!cmp(alpha, other)) {
        // Different value, cannot ignore
        let i = 0;
        let newProp = `${alpha[keyProp]} (new ${i})`;
        while (byKey.has(newProp)) {
          i++;
          newProp = `${alpha[keyProp]} (new ${i})`;
        }
        alpha[keyProp] = newProp;
        byKey.set(alpha[keyProp], alpha);
      }
    } else {
      byKey.set(alpha[keyProp], alpha);
    }
  });

  return [...byKey.values()];
}

function askUserForFile() {
  let input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json, text/plain';

  let promise = new Promise((resolve, reject) => {
    input.onchange = e => {
      let file = e.target.files[0];

      let reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = readerEvent => {
        let content = readerEvent.target.result;
        resolve(content);
      };
      reader.onerror = e => {
        reject(e);
      }
    };
  });
  input.click();
  return promise;
}