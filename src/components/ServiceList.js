import {randId} from '../util';
import {getAndIncrementId} from '../storage';
import {Service} from './Service';
import {useState} from 'react';

export function ServiceList({masterPassword, alphabets, services, setServices}) {
  const [search, setSearch] = useState('');

  const addService = () => {
    setServices([...services, createService()]);
  };

  const setService = (newValue) => {
    if (Number.isInteger(newValue)) {
      setServices(services.filter(service => service.id !== newValue));
    } else {
      setServices(services.map(service => service.id === newValue.id ? validateService(newValue) : service));
    }
  };

  let content = <div className='no-results'>There are no matching services</div>;
  const displayServices = services.filter(s => matches(s.name, search));

  if (displayServices.length) {
    content = displayServices.map(s =>
      <Service
        key={'service-' + s.id}
        service={s}
        masterPassword={masterPassword}
        alphabets={alphabets}
        onChange={setService}
      />,
    );
  }

  return <div className="service-list">
    <h2>Services</h2>
    <div className='list-header'>
      <button className="btn add-service" onClick={addService}>Add service</button>
      <input className="search" type="text" placeholder="Search by name" value={search} onChange={e => setSearch(e.target.value)}/>
    </div>
    {content}
  </div>;
}

function matches(text, search) {
  return text.includes(search);
}

/**
 * Creates a new service
 * @returns {{code: string, name: string, id: number, alphabet: string, passLen: number}}
 */
export function createService() {
  let index = getAndIncrementId('service-index');

  return {
    id: randId(),
    name: 'Service #' + index,
    code: 'service-' + index,
    passLen: 16,
    alphabet: 'default',
    allGroups: true,
    useRandomSeed: false,
  };

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
  return service;
}