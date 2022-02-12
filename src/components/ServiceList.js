import {randId} from '../util';
import {getAndIncrementId, getSettings} from '../storage';
import {Service} from './Service';
import {useState} from 'react';

export function ServiceList({masterPassword, alphabets, services, setServices}) {
  const [search, setSearch] = useState('');

  const addService = () => {
    setServices([...services, createService()]);
    setSearch('');
  };

  const setService = (newValue) => {
    if (Number.isInteger(newValue)) {
      setServices(services.filter(service => service.id !== newValue));
    } else {
      setServices(services.map(service => service.id === newValue.id ? validateService(newValue) : service));
    }
  };

  let content = <div className="no-results">There are no matching services</div>;
  const displayServices = search ? searchBy(services, 'name', search) : services;

  if (displayServices.length) {
    content = displayServices.map(s => <Service
      key={'service-' + s.id}
      service={s}
      masterPassword={masterPassword}
      alphabets={alphabets}
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

function searchBy(list, field, search) {
  // Get search weight of each item
  list = list.map(s => [s, matches(s[field], search)]);
  // Remove items that don't match
  list = list.filter(([_, b]) => b > 0);
  // Sort by search weight
  list.sort(([_a, a], [_b, b]) => b - a);
  // Return list of the same type as input
  return list.map(([a, _]) => a);
}

function matches(text, search) {
  // Split text into tokens
  let tokens = text.toLowerCase().split(' ').filter(s => !!s);
  let keywords = search.toLowerCase().split(' ').filter(s => !!s);
  let weight = 0;

  for (const kw of keywords) {
    let count = 0;

    for (const tk of tokens) {
      if (tk.includes(kw)) {
        weight += kw.length * 100 / tk.length;
        count++;
      }
    }

    // If one keyword doesn't match we reject the text
    if (count === 0) {
      return 0;
    }
  }

  return weight;
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

  return service;
}