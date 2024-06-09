import React from 'react';
import * as Util from './util/util';
import * as Storage from './util/storage';
import * as Serialize from './util/serialize';
import {createRoot} from 'react-dom/client';
import {loadSettings, getStorage, saveSettings, getLocalStorage} from './util/storage';
import Main from './layout/Main';
import {report_error} from "./util/log";

// Copy settings from URL
const params = new URLSearchParams(window.location.search);

// This parameter is added to the web url for QR codes, see AppSettings
if (params.has('cfg')) {
  try {
    const config = JSON.parse(params.get('cfg'));
    const local = getLocalStorage();
    const selected_account = local.getItem("selected_account") || null;

    if (selected_account && window.confirm('Do you want to replace the current settings?')) {
      const storage = getStorage(selected_account);

      // We keep a hidden backup, just in case
      getStorage('storage-backup')
        .setItem('settings', JSON.stringify(loadSettings(storage)))
        .save();

      // Override the config, keeping default values
      saveSettings(config, storage);
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
    report_error(e);
  }
}

const root = createRoot(document.getElementById('root'));
root.render(<React.StrictMode>
  <Main/>
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
