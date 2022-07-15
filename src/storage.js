import {decrypt, encrypt, randomBytes} from './util';
import {
  deserializeAlphabets,
  deserializeSecrets,
  deserializeServices,
  deserializeSettings,
  serializeAlphabets,
  serializeSecrets,
  serializeServices,
} from './serialize';
import {defaultAlphabets} from './components/AlphabetList';

/**
 * Container of data with the same interface as LocalStorage
 */
class Storage {
  constructor(name) {
    this.storage = {};
    this.name = name;
  }

  save() {
    const local = getLocalStorage();
    if (local === this) return;

    local.setItem(this.name, JSON.stringify(this.storage));
  }

  load() {
    const local = getLocalStorage();
    if (local === this) return;

    if (local.getItem(this.name)) {
      this.storage = JSON.parse(local.getItem(this.name));
    }
  }

  copyFrom(storage) {
    for (let i = 0; i < storage.length.length; i++) {
      const key = storage.key(i);
      this.storage[key] = storage.getItem(key);
    }
  }

  get length() {
    return Object.keys(this.storage).length;
  }

  key(index) {
    return Object.keys(this.storage)[index];
  }

  getItem(name) {
    return this.storage[name];
  }

  setItem(name, item) {
    this.storage[name] = item;
    return this;
  }

  clear() {
    this.storage = {};
  }
}

/**
 * Gets the list of storages that are saved on LocalStorage
 * @returns {string[]}
 */
export function getStorageNames() {
  const local = getLocalStorage();
  const list = [];

  for (let i = 0; i < local.length; i++) {
    const key = local.key(i);

    if (key.startsWith('storage-')) {
      list.push(key);
    }
  }

  return list;
}

/**
 * Gets a storage instance by its name, if it doesn't exist, one is created
 *
 * @param name
 * @returns {*}
 */
export function getStorage(name) {
  window.customStorage = window.customStorage ?? {};
  const id = name ?? 'storage-default';
  let storage = window.customStorage[id];

  if (!storage) {
    storage = new Storage(id);
    window.customStorage[id] = storage;

    const local = getLocalStorage();

    // Copy settings from old versión
    if (local.getItem('services')) {
      storage.copyFrom(local);
      storage.save();
      local.removeItem('services');
    } else {
      storage.load();
    }
  }

  return storage;
}

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
  let json = getStorage().getItem('settings');
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
  getStorage().setItem('settings', serializeServices(settings)).save();
}

/**
 * Attempt to retrieve the saved alphabets
 * @returns {[]}
 */
export function loadAlphabets() {
  let json = getStorage().getItem('alphabets');
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
  getStorage().setItem('alphabets', serializeAlphabets(alphabets) || '').save();
}

/**
 * Attempt to retrieve the saved services
 * @returns {[]}
 */
export function loadServices() {
  let json = getStorage().getItem('services');
  return deserializeServices(json) || [];
}

export function saveServices(services) {
  if (!getSettings().storeSettings) {
    return;
  }
  getStorage().setItem('services', serializeServices(services) || '').save();
}

/**
 * Attempt to retrieve the saved secrets
 * @returns {[]}
 */
export function loadSecrets() {
  let json = getStorage().getItem('secrets');
  return deserializeSecrets(json) || [];
}

export function saveSecrets(secrets) {
  getStorage().setItem('secrets', serializeSecrets(secrets) || '').save();
}

/**
 * Attempt to retrieve the selected tab
 * @returns {string}
 */
export function loadSelectedTab() {
  return getStorage().getItem('selectedTab');
}

export function saveSelectedTab(tab) {
  getStorage().setItem('selectedTab', tab).save();
}

/**
 * Attempt to retrieve the saved master password
 * @returns {string}
 */
export function loadMasterPassword() {
  let key = getStorage().getItem('master-key');
  let text = getStorage().getItem('master');
  if (!text || !key) return '';
  return decrypt(text, key) || '';
}

/**
 * Save an encrypted version of the master password, but only if allowed by the config
 *
 * @param text {string}
 * @param settings {{storeSettings: boolean, storeMasterPassword: boolean}}
 */
export function saveMasterPassword(text, settings) {
  if (!settings.storeSettings) {
    return;
  }

  if (!settings.storeMasterPassword) {
    text = '';
  }

  try {
    let key = getStorage().getItem('master-key');
    if (!key) {
      key = randomBytes(16);
      getStorage().setItem('master-key', key);
    }
    let pass = encrypt(text || '', key);
    getStorage().setItem('master', pass).save();
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
  let curr = getStorage().getItem('sequence-' + name) || 0;
  // Force integer
  curr = curr | 0;
  if (isNaN(curr)) curr = 0;
  getStorage().setItem('sequence-' + name, (curr + 1) + '').save();
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
      window.localStorageFallback = new Storage();
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
      window.sessionStorageFallback = new Storage('fallback');
    }
    return window.sessionStorageFallback;
  }
}