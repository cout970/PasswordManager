import {nukeAllData} from '../storage';

export function AppSettings({settings, setSettings}) {
  const update = (changes) => {
    setSettings({...settings, ...changes});
  };

  const nuke = () => {
    if (window.confirm('Are you sure you want to permanently delete all data stored in by this app?')) {
      nukeAllData();
      setSettings({});
    }
  };

  return <div className="app-settings">
    <h2>Settings</h2>

    <div className="row checkbox">
      <label htmlFor="storeSettings">Store settings</label>
      <input type="checkbox" id="storeSettings"
             checked={settings.storeSettings} name="storeSettings"
             onChange={e => update({storeSettings: e.target.checked})}
      />
    </div>

    {settings.storeSettings ? <>

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

    </> : ''}

    <button className="btn btn-danger nuke-btn" onClick={nuke}>Nuke all stored data</button>
  </div>;
}