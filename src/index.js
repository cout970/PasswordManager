import React from 'react';
import './index.scss';
import App from './components/App';
import * as Util from './util';
import * as Storage from './storage';
import * as Serialize from './serialize';
import {createRoot} from 'react-dom/client';
import {getSettings, getStorage, setSettings} from './storage';

// Copy settings from URL
const params = new URLSearchParams(window.location.search);

// This parameter is added to the web url for QR codes, see AppSettings
if (params.has('cfg')) {
  try {
    const config = JSON.parse(params.get('cfg'));

    if (window.confirm('Do you want to replace the current settings?')) {
      // We keep a hidden backup, just in case
      getStorage('storage-backup')
        .setItem('settings', JSON.stringify(getSettings()))
        .save();

      // Override the config, keeping default values
      setSettings(config);
    }

    // Remove the parameter from the url to prevent future activations
    let url = window.location.href;
    let index = url.indexOf('?');
    let start = url.substring(0, index);

    params.delete('cfg');
    start += params.toString();

    window.history.pushState('', '', start);
  } catch (e) {
    // Something went wrong, probably the url was wrong
    console.error(e);
  }
}

const root = createRoot(document.getElementById('root'));
root.render(<React.StrictMode>
  <App/>
</React.StrictMode>);

// Cli utilities
// Expose utilities to the global environment
window['Util'] = {};
Object.entries(Util).forEach(([key, value]) => {
  window['Util'][key] = value;
});

window['Storage'] = {};
Object.entries(Storage).forEach(([key, value]) => {
  window['Storage'][key] = value;
});

window['Serialize'] = {};
Object.entries(Serialize).forEach(([key, value]) => {
  window['Serialize'][key] = value;
});