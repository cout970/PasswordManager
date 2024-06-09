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
import {report_error} from "./log";
import {defaultAlphabets, defaultFolders, defaultSettings} from "./entities";

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
    for (let i = 0; i < storage.length; i++) {
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

    if (local.getItem(id)) {
      // Load settings
      storage.load();
    } else if (local.getItem('services')) {
      // Copy settings from old version
      storage.copyFrom(local);
      storage.save();
    }
  }

  return storage;
}

/**
 * Load the current app folders
 * @param storage {Storage}
 * @returns {Folder[]}
 */
export function loadFolders(storage) {
  let json = storage.getItem('folders');
  return (json ? JSON.parse(json) : false) || defaultFolders();
}

/**
 * Save the current app folders
 * @param {Folder[]} folders
 * @param {Storage} storage
 */
export function saveFolders(folders, storage) {
  storage.setItem('folders', JSON.stringify(folders)).save();
}

/**
 * Get current app settings
 * @param storage {Storage}
 * @returns {Settings}
 */
export function loadSettings(storage) {
  let json = storage.getItem('settings');
  let settings = deserializeSettings(json) || {};
  return defaultSettings(settings);
}


/**
 * Update the app settings
 * @param storage {Storage}
 * @param {Settings} newSettings
 */
export function saveSettings(newSettings, storage) {
  let settings = {...loadSettings(storage), ...newSettings};
  storage.setItem('settings', serializeServices(settings)).save();
}

/**
 * Attempt to retrieve the saved alphabets
 * @param storage {Storage}
 * @returns {Alphabet[]}
 */
export function loadAlphabets(storage) {
  let json = storage.getItem('alphabets');
  let alphabets = deserializeAlphabets(json);
  if (!alphabets) {
    alphabets = defaultAlphabets();
  }
  return alphabets;
}

/**
 * @param {Alphabet[]} alphabets
 * @param storage {Storage}
 */
export function saveAlphabets(alphabets, storage) {
  if (!loadSettings(storage).storeSettings) {
    return;
  }
  storage.setItem('alphabets', serializeAlphabets(alphabets) || '').save();
}

/**
 * Attempt to retrieve the saved services
 * @param storage {Storage}
 * @returns {Service[]}
 */
export function loadServices(storage) {
  let json = storage.getItem('services');
  return deserializeServices(json) || [];
}

/**
 * @param {Service[]} services
 * @param storage {Storage}
 */
export function saveServices(services, storage) {
  if (!loadSettings(storage).storeSettings) {
    return;
  }
  storage.setItem('services', serializeServices(services) || '').save();
}

/**
 * Attempt to retrieve the saved secrets
 * @param storage {Storage}
 * @returns {Secret[]}
 */
export function loadSecrets(storage) {
  let json = storage.getItem('secrets');
  return deserializeSecrets(json) || [];
}

/**
 * @param {Secret[]} secrets
 * @param storage {Storage}
 */
export function saveSecrets(secrets, storage) {
  storage.setItem('secrets', serializeSecrets(secrets) || '').save();
}

/**
 * Attempt to retrieve the selected tab
 * @param storage {Storage}
 * @returns {string}
 */
export function loadSelectedTab(storage) {
  return storage.getItem('selectedTab');
}

/**
 * @param {string} tab
 * @param storage {Storage}
 */
export function saveSelectedTab(tab, storage) {
  storage.setItem('selectedTab', tab).save();
}

/**
 * Attempt to retrieve the saved master password
 * @param storage {Storage}
 * @returns {string}
 */
export function loadMasterPassword(storage) {
  let key = storage.getItem('master-key');
  let text = storage.getItem('master');
  if (!text || !key) return '';
  return decrypt(text, key) || '';
}

/**
 * Save an encrypted version of the master password, but only if allowed by the config
 *
 * @param masterPassword {string}
 * @param hash {string}
 * @param settings {Settings}
 * @param storage {Storage}
 */
export function saveMasterPassword(masterPassword, hash, settings, storage) {
  if (!settings.storeSettings) {
    return;
  }

  if (!settings.storeMasterPassword) {
    masterPassword = '';
  }

  try {
    let key = storage.getItem('master-key');
    if (!key) {
      key = randomBytes(16);
      storage.setItem('master-key', key);
    }
    let pass = encrypt(masterPassword || '', key);
    storage.setItem('master', pass);
    storage.setItem('master-hash', hash ?? '');
    storage.save();
  } catch (e) {
    report_error(e);
  }
}

/**
 * Get next value in a sequence, sequences are stored in the browser local storage
 * @param {string} name
 * @returns {number}
 */
export function getAndIncrementId(name) {
  let storage = getStorage('shared');
  let curr = storage.getItem('sequence-' + name) || 0;
  // Force integer
  curr = curr | 0;
  if (isNaN(curr)) curr = 0;
  storage.setItem('sequence-' + name, (curr + 1) + '').save();
  return curr;
}

/**
 * Get last value in a sequence, sequences are stored in the browser local storage
 * @param {string} name
 * @returns {number}
 */
export function getLastId(name) {
  let storage = getStorage('shared');
  let curr = storage.getItem('sequence-' + name) || 0;
  // Force integer
  curr = curr | 0;
  if (isNaN(curr)) curr = 0;
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
export function getLocalStorage() {
  try {
    return window.localStorage;
  } catch (e) {
    report_error(e);
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
export function getSessionStorage() {
  try {
    return window.sessionStorage;
  } catch (e) {
    report_error(e);
    // Using fallback
    if (!window.sessionStorageFallback) {
      window.sessionStorageFallback = new Storage('fallback');
    }
    return window.sessionStorageFallback;
  }
}
