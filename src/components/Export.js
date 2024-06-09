import {useRef, useState} from 'react';
import {downloadAsFile, randId} from '../util/util';
import {externalStoreSettings, retrievePaste} from '../util/api';
import {exportAccount, importAccount} from "../util/export";
import {report_error} from "../util/log";

export default function Export({masterPassword, alphabets, services, secrets, settings, setSettings, onDataImport}) {
  const [text, setText] = useState('');
  const [override, setOverride] = useState(false);
  const [exportResult, setExportResult] = useState('');
  const [exportIsError, setExportIsError] = useState(false);
  const auxInput = useRef();

  const exportData = (target) => {
    let date = (new Date()).toISOString();
    const data = exportAccount({masterPassword, alphabets, services, secrets, settings});

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
        report_error(e);
        setExportResult('Unable to store setting in external service');
        setExportIsError(true);
      });
      return;
    }

    report_error('Invalid target: ' + target);
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

      const [error, items] = importAccount(masterPassword, data);

      if (error) {
        setExportResult(items);
        setExportIsError(true);
        return;
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
      report_error(e);
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
    res.alphabets = mergeLists(a.alphabets, b.alphabets, 'name');
  }

  if (a.services) {
    res.services = mergeLists(a.services, b.services, 'name');
  }

  if (a.secrets) {
    res.secrets = mergeLists(a.secrets, b.secrets, 'name');
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

function mergeLists(listA, listB, key, cmp) {
  let map = new Map();

  listB.forEach(B => {
    B.id = randId();
    map.set(B[key], B);
  });

  listA.forEach(A => {
    A.id = randId();

    // If there is an item in A that is not in B, add it to the map
    if (!map.has(A[key])) {
      map.set(A[key], A);
    }
  });

  return [...map.values()];
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
