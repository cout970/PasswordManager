import {MasterPassword} from './MasterPassword';
import {ServiceList} from './ServiceList';
import {
  loadAlphabets,
  loadMasterPassword,
  loadServices,
  saveAlphabets,
  saveMasterPassword,
  saveServices,
} from '../storage';
import {useEffect, useState} from 'react';
import Export from './Export';
import {AlphabetList} from './AlphabetList';

export default function App() {
  const [masterPassword, setMasterPassword] = useState(loadMasterPassword());
  const [alphabets, setAlphabets] = useState(loadAlphabets());
  const [services, setServices] = useState(loadServices());
  const [tab, setTab] = useState('services');

  useEffect(_ => {
    saveMasterPassword(masterPassword);
    saveAlphabets(alphabets);
    saveServices(services);
  }, [masterPassword, alphabets, services]);

  const onDataImport = data => {
    setAlphabets(data.alphabets);
    setServices(data.services);
  };

  return <div className="app">
    <h1>Password manager</h1>

    <MasterPassword key="master"
                    value={masterPassword}
                    onChange={setMasterPassword}/>

    {masterPassword !== '' ? <>

        <div className="tabs">
          <button className={tab === 'services' ? 'btn selected' : 'btn'}
                  onClick={_ => setTab('services')}>
            Services
          </button>

          <button className={tab === 'alphabets' ? 'btn selected' : 'btn'}
                  onClick={_ => setTab('alphabets')}>
            Alphabets
          </button>

          <button className={tab === 'export' ? 'btn selected' : 'btn'}
                  onClick={_ => setTab('export')}>
            Export/Import
          </button>
        </div>

        {tab === 'services' ?
          <ServiceList key="service-list"
                       masterPassword={masterPassword}
                       alphabets={alphabets}
                       services={services}
                       setServices={setServices}/>
          : ''}

        {tab === 'alphabets' ?
          <AlphabetList key="alphabet-list"
                        alphabets={alphabets}
                        setAlphabets={setAlphabets}/>
          : ''}

        {tab === 'export' ?
          <Export key="export"
                  masterPassword={masterPassword}
                  alphabets={alphabets}
                  services={services}
                  onDataImport={onDataImport}/>
          : ''}

      </>
      : <div className="help">
        <h3>Help</h3>
        <p>This service doesn't store any password or sensitive data, all passwords are derived from the master password and each service name.</p>
        <p>To start using this app you need to fill the master password and add services.</p>
        <p>Services and alphabets are stores in you browser cache (localstorage). To share this settings between browsers/devices check the Import/Export tab.</p>

        <p>
          Make sure your master password has good strength. Check out <a href="https://www.passwordmonster.com/">passwordmonster.com</a> to see the time needed to brute force you password.
        </p>
      </div>
    }
  </div>;
}