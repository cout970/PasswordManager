import {useState} from 'react';
import {decrypt, downloadAsFile, encrypt, sha512} from '../util';
import {deserializeAlphabets, deserializeServices, serializeAlphabets, serializeServices} from '../serialize';

export default function Export({masterPassword, alphabets, services, onDataImport}) {
  const [text, setText] = useState('');
  const [exportResult, setExportResult] = useState('');

  const exportData = (target) => {
    let date = (new Date()).toISOString();
    let data = {
      exportDate: date,
      masterPasswordHash: sha512(masterPassword),
      alphabets: encrypt(serializeAlphabets(alphabets), masterPassword),
      services: encrypt(serializeServices(services), masterPassword),
    };
    data = JSON.stringify(data, null, 2);
    if (target === 'file') {
      downloadAsFile(`settings-${date}.txt`, data);
    } else {
      setText(data);
    }
    setExportResult('Successfully exported settings');
  };

  const importData = () => {
    try {
      let data = JSON.parse(text);

      if (!data) {
        setExportResult('Invalid data');
        return;
      }

      let masterPasswordHash = data.masterPasswordHash;
      if (masterPasswordHash !== sha512(masterPassword)) {
        setExportResult('Incorrect master password');
        return;
      }

      let alphabets = decrypt(data.alphabets, masterPassword);
      let services = decrypt(data.services, masterPassword);

      let items = {
        'alphabets': deserializeAlphabets(alphabets),
        'services': deserializeServices(services),
      };

      if (window.confirm('Are you sure you want to override the current settings with the new settings?')) {
        onDataImport(items);
        setExportResult('Successfully importer settings');
      } else {
        setExportResult('Importation cancelled');
      }
    } catch (e) {
      console.error(e);
      setExportResult('Error: ' + e.message);
    }
  };

  return <div className="export">
    <h2>Export/Import</h2>
    <div className="export-import">
      {exportResult ? <div className="export-result">{exportResult}</div> : ''}

      <div className="textarea-wrapper">
        <textarea name="export-import"
                  id="export-import"
                  cols="30" rows="10"
                  value={text}
                  onChange={e => setText(e.target.value)}
        />
      </div>
      <small>Export data is encrypted with AES using the master password</small>
      <div className="actions">
        <button className="btn"
                onClick={importData}
                title="Override current config from the textarea"
                disabled={!text || !masterPassword}>
          Import
        </button>
        <button className="btn"
                onClick={exportData.bind(null, 'text')}
                title="Export the current config into the textarea">
          Export to textarea
        </button>
        <button className="btn"
                onClick={exportData.bind(null, 'file')}
                title="Export and download the current config">
          Export to file
        </button>
      </div>
    </div>
  </div>;
}