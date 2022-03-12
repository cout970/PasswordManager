import {MasterPassword} from './MasterPassword';
import {ServiceList} from './ServiceList';
import {useEffect, useState} from 'react';
import Export from './Export';
import {AlphabetList} from './AlphabetList';
import {AppSettings} from './AppSettings';
import {
  getSettings,
  loadAlphabets,
  loadMasterPassword,
  loadSecrets,
  loadSelectedTab,
  loadServices,
  saveAlphabets,
  saveMasterPassword,
  saveSecrets,
  saveSelectedTab,
  saveServices,
  setSettings,
} from '../storage';
import {SecretList} from './SecretList';

export default function App() {
  const [masterPassword, setMasterPassword] = useState(loadMasterPassword());
  const [alphabets, setAlphabets] = useState(loadAlphabets());
  const [services, setServices] = useState(loadServices());
  const [secrets, setSecrets] = useState(loadSecrets());
  const [currentSettings, setCurrentSettings] = useState(getSettings);
  const [tab, setTab] = useState(loadSelectedTab() || 'services');

  useEffect(_ => {
    saveMasterPassword(masterPassword);
    saveAlphabets(alphabets);
    saveServices(services);
    saveSecrets(secrets);
    saveSelectedTab(tab);
  }, [masterPassword, alphabets, services, secrets, tab]);

  useEffect(_ => {
    if (currentSettings.darkTheme) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
    }
  }, [currentSettings]);

  const onDataImport = data => {
    if (data.alphabets) {
      setAlphabets(data.alphabets);
      saveAlphabets(data.alphabets);
    }
    if (data.services) {
      setServices(data.services);
      saveServices(data.services);
    }
    if (data.secrets) {
      setSecrets(data.secrets);
      saveSecrets(data.secrets);
    }

    if (data.settings) {
      updateSettings(data.settings);
    }
  };

  const updateSettings = (n) => {
    setSettings(n);
    setCurrentSettings(getSettings());
    // erase password if the settings change
    saveMasterPassword(masterPassword);
    setAlphabets(loadAlphabets());
    setServices(loadServices());
    setSecrets(loadSecrets());
  };

  return <div className="app">
    <h1>PASSWORD MANAGER</h1>

    <MasterPassword key="master"
                    value={masterPassword}
                    onChange={setMasterPassword}/>

    {masterPassword !== '' ? <>

        <div className="tabs">
          <div className="inner">
            <button className={tab === 'services' ? 'btn selected' : 'btn'}
                    onClick={_ => setTab('services')}>
              Services
            </button>

            <button className={tab === 'secrets' ? 'btn selected' : 'btn'}
                    onClick={_ => setTab('secrets')}>
              Secrets
            </button>

            <button className={tab === 'alphabets' ? 'btn selected' : 'btn'}
                    onClick={_ => setTab('alphabets')}>
              Alphabets
            </button>

            <button className={tab === 'export' ? 'btn selected' : 'btn'}
                    onClick={_ => setTab('export')}>
              Export/Import
            </button>

            <button className={tab === 'settings' ? 'btn selected' : 'btn'}
                    onClick={_ => setTab('settings')}>
              Settings
            </button>
          </div>
        </div>

        {tab === 'services' ?
          <ServiceList key="service-list"
                       masterPassword={masterPassword}
                       alphabets={alphabets}
                       settings={currentSettings}
                       services={services}
                       setServices={setServices}/>
          : ''}

        {tab === 'alphabets' ?
          <AlphabetList key="alphabet-list"
                        alphabets={alphabets}
                        setAlphabets={setAlphabets}/>
          : ''}

        {tab === 'secrets' ?
          <SecretList key="secret-list"
                      masterPassword={masterPassword}
                      settings={currentSettings}
                      secrets={secrets}
                      setSecrets={setSecrets}/>
          : ''}

        {tab === 'export' ?
          <Export key="export"
                  masterPassword={masterPassword}
                  alphabets={alphabets}
                  services={services}
                  secrets={secrets}
                  settings={currentSettings}
                  setSettings={updateSettings}
                  onDataImport={onDataImport}/>
          : ''}

        {tab === 'settings' ?
          <AppSettings key="settings"
                       settings={currentSettings}
                       setSettings={updateSettings}
          />
          : ''}
      </>
      : <div className="help">
        <h3>Help</h3>
        <p>This service doesn't store any password or sensitive data, all passwords are derived from the master password
          and each service name.</p>
        <p>To start using this app you need to fill the master password and add services.</p>
        <p>Services and alphabets are stores in you browser cache (localstorage). To share this settings between
          browsers/devices check the Import/Export tab.</p>

        <p>
          Make sure your master password has good strength. Check out <a
          href="https://www.passwordmonster.com/">passwordmonster.com</a> to see the time needed to brute force you
          password.
        </p>
      </div>
    }
  </div>;
}