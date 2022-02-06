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

export default function App() {
  const [masterPassword, setMasterPassword] = useState(loadMasterPassword());
  const [alphabets, setAlphabets] = useState(loadAlphabets());
  const [services, setServices] = useState(loadServices());

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
    <MasterPassword key="master"
                    value={masterPassword}
                    onChange={setMasterPassword}/>

    <ServiceList key="service-list"
                 masterPassword={masterPassword}
                 alphabets={alphabets}
                 services={services}
                 setServices={setServices}/>

    <Export key="export"
            masterPassword={masterPassword}
            alphabets={alphabets}
            services={services}
            onDataImport={onDataImport}/>
  </div>;
}