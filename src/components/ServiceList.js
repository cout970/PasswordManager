import {randId} from '../util';
import {getAndIncrementId} from '../storage';
import {Service} from './Service';

export function ServiceList({masterPassword, alphabets, services, setServices}) {
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

  let content = <div>There are no stored services</div>;
  if (services.length) {
    content = services.map(s =>
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
    <button className="add-service" onClick={addService}>Add service</button>
    {content}
  </div>;
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

  if (!service.name) {
    let index = getAndIncrementId('service-index');
    service.name = 'Service #' + index;
  }

  if (!service.code) {
    service.code = service.name
      .toLowerCase()
      .replaceAll(' ', '-')
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
  return service;
}