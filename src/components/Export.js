import {useState} from 'react';
import {decrypt, encrypt} from '../util';
import {deserializeAlphabets, deserializeServices, serializeAlphabets, serializeServices} from '../serialize';

export default function Export({masterPassword, alphabets, services, onDataImport}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [exportResult, setExportResult] = useState('');

  const exportData = () => {
    let data = [serializeAlphabets(alphabets), serializeServices(services)];
    data = JSON.stringify(data);
    data = encrypt(data, masterPassword);
    setText(data);
    setExportResult('Successfully exported settings');
  };

  const importData = () => {
    let data = decrypt(text, masterPassword);
    data = data ? JSON.parse(data) : null;

    if (!data) {
      setExportResult('Invalid data');
      return;
    }

    let items = {
      'alphabets': deserializeAlphabets(data[0]),
      'services': deserializeServices(data[1]),
    };

    if (window.confirm('Are you sure you want to override the current settings with the new settings?')) {
      onDataImport(items);
      setExportResult('Successfully importer settings');
    } else {
      setExportResult('Importation cancelled');
    }
  };

  return <div className="export">
    <button onClick={_ => setOpen(!open)}>Export/Import</button>

    {open ? <div className="export-import">

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
        <button onClick={exportData} title="Export the current config into the textarea">Export</button>
        <button onClick={importData} title="Override current config from the textarea"
                disabled={!text || !masterPassword}>Import
        </button>
      </div>
    </div> : ''}
  </div>;
}