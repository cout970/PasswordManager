import {decrypt, encrypt, hex2bin, randId, randomBytes} from './util';
import {
  deserializeAlphabets, deserializeSecrets,
  deserializeServices,
  deserializeSettings,
  serializeAlphabets, serializeSecrets,
  serializeServices,
} from './serialize';
import {defaultAlphabets} from './components/AlphabetList';

/**
 * Get current app settings
 * @returns {{
 *   storeSettings: boolean,
 *   storeMasterPassword: boolean,
 *   defaultPasswordLength: number,
 *   defaultAllGroups: boolean,
 *   defaultRandomSeed: boolean,
 *   darkTheme: boolean,
 * }}
 */
export function getSettings() {
  let json = getLocalStorage().getItem('settings');
  let settings = deserializeSettings(json) || {};

  if (typeof settings.storeSettings !== 'boolean') {
    // By default, store most settings
    settings.storeSettings = true;
  }

  if (typeof settings.storeMasterPassword !== 'boolean') {
    // By default, don't store the master password
    settings.storeMasterPassword = false;
  }

  if (typeof settings.defaultPasswordLength !== 'number') {
    settings.defaultPasswordLength = 16;
  }

  if (typeof settings.defaultShowPassword !== 'boolean') {
    settings.defaultShowPassword = false;
  }

  if (typeof settings.defaultAllGroups !== 'boolean') {
    settings.defaultAllGroups = true;
  }

  if (typeof settings.defaultRandomSeed !== 'boolean') {
    settings.defaultRandomSeed = false;
  }

  if (typeof settings.darkTheme !== 'boolean') {
    settings.darkTheme = true;
  }

  if (typeof settings.externalServiceLoad !== 'boolean') {
    settings.externalServiceLoad = false;
  }

  if (typeof settings.externalServiceStore !== 'boolean') {
    settings.externalServiceStore = false;
  }

  if (typeof settings.externalServiceUrl !== 'string') {
    settings.externalServiceUrl = '';
  }

  if (typeof settings.externalServiceHost !== 'string') {
    settings.externalServiceHost = 'https://ps.cout970.net';
  }

  if (typeof settings.externalServiceAccount !== 'string') {
    settings.externalServiceAccount = '';
  }

  if (typeof settings.externalServicePassword !== 'string') {
    settings.externalServicePassword = '';
  }

  if (typeof settings.externalServiceRegister !== 'boolean') {
    settings.externalServiceRegister = true;
  }

  if (typeof settings.externalServiceUpdate !== 'boolean') {
    settings.externalServiceUpdate = false;
  }

  return settings;
}

/**
 * Update the app settings
 * @returns {{}}
 */
export function setSettings(newSettings) {
  let settings = {...getSettings(), ...newSettings};
  getLocalStorage().setItem('settings', serializeServices(settings));
}

/**
 * Attempt to retrieve the saved alphabets
 * @returns {[]}
 */
export function loadAlphabets() {
  let json = getLocalStorage().getItem('alphabets');
  let alphabets = deserializeAlphabets(json);
  if (!alphabets) {
    alphabets = defaultAlphabets();
  }
  return alphabets;
}

export function saveAlphabets(alphabets) {
  if (!getSettings().storeSettings) {
    return;
  }
  getLocalStorage().setItem('alphabets', serializeAlphabets(alphabets) || '');
}

/**
 * Attempt to retrieve the saved services
 * @returns {[]}
 */
export function loadServices() {
  let json = getLocalStorage().getItem('services');
  return deserializeServices(json) || [];
}

export function saveServices(services) {
  if (!getSettings().storeSettings) {
    return;
  }
  getLocalStorage().setItem('services', serializeServices(services) || '');
}

/**
 * Attempt to retrieve the saved secrets
 * @returns {[]}
 */
export function loadSecrets() {
  let json = getLocalStorage().getItem('secrets');
  return deserializeSecrets(json) || [];
}

export function saveSecrets(secrets) {
  getLocalStorage().setItem('secrets', serializeSecrets(secrets) || '');
}

/**
 * Attempt to retrieve the selected tab
 * @returns {string}
 */
export function loadSelectedTab() {
  return getLocalStorage().getItem('selectedTab');
}

export function saveSelectedTab(tab) {
  getLocalStorage().setItem('selectedTab', tab);
}

/**
 * Attempt to retrieve the saved master password
 * @returns {string}
 */
export function loadMasterPassword() {
  let key = getLocalStorage().getItem('master-key');
  let text = getLocalStorage().getItem('master');
  if (!text || !key) return '';
  return decrypt(text, key) || '';
}

export function saveMasterPassword(text) {
  if (!getSettings().storeSettings) {
    return;
  }

  if (!getSettings().storeMasterPassword) {
    text = '';
  }

  try {
    let key = getLocalStorage().getItem('master-key');
    if (!key) {
      key = randomBytes(16);
      getLocalStorage().setItem('master-key', key);
    }
    let pass = encrypt(text || '', key);
    getLocalStorage().setItem('master', pass);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Get next value in a sequence, sequences are stored in the browser local storage
 * @param name
 * @returns {number}
 */
export function getAndIncrementId(name) {
  let curr = getLocalStorage().getItem('sequence-' + name) || 0;
  // Force integer
  curr = curr | 0;
  if (isNaN(curr)) curr = 0;
  getLocalStorage().setItem('sequence-' + name, (curr + 1) + '');
  return curr;
}

/**
 * Remove all stored data by this application, same a clearing cookies/storage
 */
export function nukeAllData() {
  getLocalStorage().clear();
  getSessionStorage().clear();
}

/**
 * Gets the window local storage, if the user has disabled this feature a fallback will be provided
 * @returns {Storage}
 */
function getLocalStorage() {
  try {
    return window.localStorage;
  } catch (e) {
    console.error(e);
    // Using fallback
    if (!window.localStorageFallback) {
      let storage = {};
      window.localStorageFallback = {
        getItem: (name) => storage[name],
        setItem: (name, item) => storage[name] = item,
        clear: () => storage = {},
      };
    }
    return window.localStorageFallback;
  }
}

/**
 * Gets the window session storage, if the user has disabled this feature a fallback will be provided
 * @returns {Storage}
 */
function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch (e) {
    console.error(e);
    // Using fallback
    if (!window.sessionStorageFallback) {
      let storage = {};
      window.sessionStorageFallback = {
        getItem: (name) => storage[name],
        setItem: (name, item) => storage[name] = item,
        clear: () => storage = {},
      };
    }
    return window.sessionStorageFallback;
  }
}