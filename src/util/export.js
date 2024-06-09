import {checkPasswordWithSalt, decrypt, encrypt, hashPasswordWithSalt, sha512} from "./util";
import {
  deserializeAlphabets, deserializeSecrets, deserializeServices, deserializeSettings,
  serializeAlphabets,
  serializeSecrets,
  serializeServices,
  serializeSettings
} from "./serialize";
import {t} from "./i18n";
import {retrievePaste} from "./api";
import {notifications} from "@mantine/notifications";
import {report_error} from "./log";

/**
 * Create a JSON string containing all the data of the account.
 *
 * @param {Account} account
 * @returns {string}
 */
export function exportAccount(account) {
  let date = (new Date()).toISOString();
  let data = {
    exportDate: date,
    masterPasswordHash: hashPasswordWithSalt(account.masterPassword),
    alphabets: encrypt(serializeAlphabets(account.alphabets), account.masterPassword),
    services: encrypt(serializeServices(account.services), account.masterPassword),
    secrets: encrypt(serializeSecrets(account.secrets), account.masterPassword),
    settings: encrypt(serializeSettings(account.settings), account.masterPassword),
  };
  data = JSON.stringify(data, null, 2);

  return data;
}

/**
 * Load the data from a JSON string.
 *
 * @param {string} masterPassword
 * @param {string} rawData
 * @returns {[boolean, string|Account]}
 */
export function importAccount(masterPassword, rawData) {
  const data = JSON.parse(rawData);

  if (!data) {
    return [true, t("Invalid data")];
  }

  if (!verifyMasterPasswordHash(masterPassword, data.masterPasswordHash)) {
    return [true, t(`Incorrect master password`)];
  }

  let account = {};

  if (data.alphabets) {
    let alphabets = decrypt(data.alphabets, masterPassword);
    account.alphabets = deserializeAlphabets(alphabets);
  }
  if (data.services) {
    let services = decrypt(data.services, masterPassword);
    account.services = deserializeServices(services);
  }
  if (data.secrets) {
    let services = decrypt(data.secrets, masterPassword);
    account.secrets = deserializeSecrets(services);
  }
  if (data.settings) {
    let settings = decrypt(data.settings, masterPassword);
    account.settings = deserializeSettings(settings);
  }

  return [false, account];
}

/**
 * Verify that the master password is valid for the given hash.
 *
 * @param {string} masterPassword
 * @param {string} masterPasswordHash
 * @returns {boolean}
 */
export function verifyMasterPasswordHash(masterPassword, masterPasswordHash) {
  // Empty password is always invalid
  if (masterPassword === '') {
    return false;
  }

  // No hash, we cannot verify
  if (!masterPasswordHash) {
    return true;
  }

  if (masterPasswordHash.includes(':')) {
    return checkPasswordWithSalt(masterPasswordHash, masterPassword);
  }

  // Compatibility with previous versions
  return masterPasswordHash === sha512(masterPassword);
}

/**
 * Given a download link, download the data and import the settings on it.
 *
 * @param {string} url
 * @param {string} masterPassword
 * @param {(object)=>void} loadSettings
 */
export function loadExternalSettings(url, masterPassword, loadSettings) {
  if (!window.confirm(t("Are you sure you want to override the current settings with the new settings?"))) {
    return;
  }

  const run = async () => {
    const data = await retrievePaste(url);
    const [error, items] = importAccount(masterPassword, data);
    if (error) {
      throw items;
    }
    if (!items) {
      throw t("Empty settings");
    }
    return items;
  }

  run().then(res => {
    loadSettings(res);
    notifications.show({
      title: t("Success"),
      message: t("Settings loaded"),
      color: 'green',
    });
  }, err => {
    report_error(err);
    notifications.show({
      title: t("Error"),
      message: t("Error loading settings from external service: ") + err,
      color: 'red',
    });
  });
}
