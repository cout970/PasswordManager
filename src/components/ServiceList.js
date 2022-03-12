import {hashPasswordWithSalt, randId, searchBy} from '../util';
import {getAndIncrementId, getSettings} from '../storage';
import {Service} from './Service';
import {useState} from 'react';

export function ServiceList({masterPassword, alphabets, settings, services, setServices}) {
  const [search, setSearch] = useState('');

  const addService = () => {
    let service = createService();
    updateValidationChecks(service, masterPassword);
    setServices([...services, service]);
    setSearch('');
  };

  const setService = (newValue) => {
    if (typeof newValue === 'string') {
      setServices(services.filter(service => service.id !== newValue));
    } else {
      newValue = validateService(newValue);
      updateValidationChecks(newValue, masterPassword);
      setServices(services.map(service => service.id === newValue.id ? newValue : service));
    }
  };

  let content = <div className="no-results">There are no matching services</div>;
  const displayServices = search ? searchBy(services, 'name', search) : services;

  if (displayServices.length) {
    content = displayServices.map(s =>
      <Service
        key={'service-' + s.id}
        service={s}
        masterPassword={masterPassword}
        alphabets={alphabets}
        settings={settings}
        onChange={setService}
      />);
  }

  return <div className="service-list">
    <h2>Services</h2>
    <div className="list-header">
      <button className="btn add-service" onClick={addService}>Add service</button>
      <input className="search" type="text" placeholder="Search by name" value={search}
             onChange={e => setSearch(e.target.value)}/>
    </div>
    {content}
  </div>;
}

/**
 * Creates a new service
 * @returns {{
 * id: string,
 * code: string,
 * name: string,
 * alphabet: string,
 * passLen: number,
 * useRandomSeed:boolean,
 * allGroups:boolean,
 * }}
 */
export function createService() {
  let index = getAndIncrementId('service-index');

  let settings = getSettings();
  return {
    id: randId(),
    name: 'Service #' + index,
    code: 'service-' + index,
    username: '',
    passLen: settings.defaultPasswordLength,
    alphabet: 'default',
    allGroups: settings.defaultAllGroups,
    useRandomSeed: settings.defaultRandomSeed,
    masterCheck: '',
  };
}

/**
 * Store a hash of the password to check if there are mismatches in the future
 * @param service
 * @param masterPassword
 */
export function updateValidationChecks(service, masterPassword) {
  service.masterCheck = hashPasswordWithSalt(masterPassword);
}

/**
 * Replaces invalid fields and adds missing values
 * @param service_input {{}}
 * @returns {{}}
 */
export function validateService(service_input) {
  let service = service_input || {};

  if (!service.id) {
    service.id = randId();
  }

  if (typeof service.name !== 'string') {
    let index = getAndIncrementId('service-index');
    service.name = 'Service #' + index;
  }

  if (typeof service.code !== 'string') {
    service.code = service.name
      .toLowerCase()
      .replaceAll(' ', '-')
      // eslint-disable-next-line no-useless-escape
      .replaceAll(/[^a-z0-9\-]/, '-');
  }

  if (typeof service.username !== 'string') {
    service.username = '';
  }

  if (!service.passLen || isNaN(service.passLen) || service.passLen < 0 || service.passLen > 255) {
    service.passLen = 16;
  }

  if (!service.alphabet) {
    service.alphabet = 'default';
  }

  if (service.allGroups !== true && service.allGroups !== false) {
    service.allGroups = false;
  }

  if (service.useRandomSeed !== true && service.useRandomSeed !== false) {
    service.useRandomSeed = false;
  }

  if (service.masterCheck) {
    service.masterCheck = '';
  }

  return service;
}