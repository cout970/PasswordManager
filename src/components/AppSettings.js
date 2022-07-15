import {nukeAllData} from '../storage';
import QRCode from 'react-qr-code';
import {useState} from 'react';

export function AppSettings({settings, setSettings}) {
  const [showQr, setShowQr] = useState(false);

  const update = (changes) => {
    setSettings({...settings, ...changes});
  };

  const nuke = () => {
    if (window.confirm('Are you sure you want to permanently delete all data stored in by this app?')) {
      nukeAllData();
      setSettings({});
    }
  };

  const url = showQr ? 'https://nss.cout970.net/?cfg=' + encodeURIComponent(JSON.stringify(settings)) : '';

  return <div className="app-settings">
    <h2>Settings</h2>

    <div className="row checkbox">
      <label htmlFor="storeSettings">
        Store settings on
        <a href="https://www.w3schools.com/html/html5_webstorage.asp" target="_blank" rel="noreferrer">
          Local Storage
        </a>
      </label>
      <input type="checkbox" id="storeSettings"
             checked={settings.storeSettings} name="storeSettings"
             onChange={e => update({storeSettings: e.target.checked})}
      />
    </div>

    {settings.storeSettings ? <div className="sub-settings">

      <div className="row checkbox">
        <label htmlFor="darkTheme">Dark theme</label>
        <input type="checkbox" id="darkTheme"
               checked={settings.darkTheme} name="darkTheme"
               onChange={e => update({darkTheme: e.target.checked})}
        />
      </div>

      <div className="row checkbox">
        <label htmlFor="storeMasterPassword">Store master password</label>
        <input type="checkbox" id="storeMasterPassword"
               checked={settings.storeMasterPassword} name="storeMasterPassword"
               onChange={e => update({storeMasterPassword: e.target.checked})}
        />
      </div>

      <div className="row">
        <label htmlFor="defaultPasswordLength">Default password length</label>
        <input type="number" min="1" max="255" id="defaultPasswordLength"
               value={settings.defaultPasswordLength} name="defaultPasswordLength"
               onChange={e => update({defaultPasswordLength: e.target.value | 0})}
        />
      </div>

      <div className="row checkbox">
        <label htmlFor="defaultShowPassword">Default show passwords</label>
        <input type="checkbox" id="defaultShowPassword"
               checked={settings.defaultShowPassword} name="defaultShowPassword"
               onChange={e => update({defaultShowPassword: e.target.checked})}
        />
      </div>

      <div className="row checkbox">
        <label htmlFor="defaultAllGroups">Default force all characters</label>
        <input type="checkbox" id="defaultAllGroups"
               checked={settings.defaultAllGroups} name="defaultAllGroups"
               onChange={e => update({defaultAllGroups: e.target.checked})}
        />
      </div>

      <div className="row checkbox">
        <label htmlFor="defaultRandomSeed">Default use random-seed algorithm</label>
        <input type="checkbox" id="defaultRandomSeed"
               checked={settings.defaultRandomSeed} name="defaultRandomSeed"
               onChange={e => update({defaultRandomSeed: e.target.checked})}
        />
      </div>

    </div> : ''}

    <div className="row checkbox">
      <label htmlFor="externalServiceLoad">Load settings from an external service</label>
      <input type="checkbox" id="externalServiceLoad"
             checked={settings.externalServiceLoad} name="externalServiceLoad"
             onChange={e => update({externalServiceLoad: e.target.checked})}
      />
    </div>

    {settings.externalServiceLoad ? <div className="sub-settings">

      <div className="row">
        <label htmlFor="externalServiceUrl">Settings URL</label>
        <input type="text" id="externalServiceUrl"
               value={settings.externalServiceUrl} name="externalServiceUrl"
               onChange={e => update({externalServiceUrl: e.target.value})}
        />
      </div>

    </div> : ''}

    <div className="row checkbox">
      <label htmlFor="externalServiceStore">Store settings on an external service</label>
      <input type="checkbox" id="externalServiceStore"
             checked={settings.externalServiceStore} name="externalServiceStore"
             onChange={e => update({externalServiceStore: e.target.checked})}
      />
    </div>

    {settings.externalServiceStore ? <div className="sub-settings">

      <div className="row">
        <label htmlFor="externalServiceHost">Host</label>
        <input type="text" id="externalServiceHost"
               value={settings.externalServiceHost} name="externalServiceHost"
               onChange={e => update({externalServiceHost: e.target.value})}
        />
      </div>

      <div className="row">
        <label htmlFor="externalServiceAccount">Account name</label>
        <input type="text" id="externalServiceAccount"
               value={settings.externalServiceAccount} name="externalServiceAccount"
               onChange={e => update({externalServiceAccount: e.target.value})}
        />
      </div>

      <div className="row">
        <label htmlFor="externalServicePassword">Account password</label>
        <input type="text" id="externalServicePassword"
               value={settings.externalServicePassword} name="externalServicePassword"
               onChange={e => update({externalServicePassword: e.target.value})}
        />
      </div>

      <div className="row checkbox">
        <label htmlFor="externalServiceRegister">Create account if not exists</label>
        <input type="checkbox" id="externalServiceRegister"
               checked={settings.externalServiceRegister} name="externalServiceRegister"
               onChange={e => update({externalServiceRegister: e.target.checked})}
        />
      </div>

      <div className="row checkbox">
        <label htmlFor="externalServiceUpdate">Override remote file</label>
        <input type="checkbox" id="externalServiceUpdate"
               checked={settings.externalServiceUpdate} name="externalServiceUpdate"
               onChange={e => update({externalServiceUpdate: e.target.checked})}
        />
      </div>

    </div> : ''}


    <div className="keep-apart mt">
      <button className="btn btn-danger nuke-btn" onClick={nuke}>
        Nuke all locally stored data
      </button>

      <button className="btn" onClick={_ => setShowQr(!showQr)}>
        {!showQr ? 'Show settings qr' : 'Hide settings qr'}
      </button>
    </div>

    {showQr ?
      <div className="qrcode-wrapper mt">
        <div className="qrcode-background">
          <QRCode value={url} title={url} size={256}/>
        </div>
      </div>
      : ''}
  </div>;
}