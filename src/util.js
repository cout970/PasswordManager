import js_sha512 from 'js-sha512';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';
import {create} from 'random-seed';

/**
 * Hash Sha512
 * @param text any plaintext
 * @returns {string} string with hash bytes in hex (64 chars)
 */
export function sha512(text) {
  return js_sha512.sha512(text);
}

/**
 * Generates a random integer between 0 and 99999999
 * @returns {string}
 */
export function randId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  // Fallback if crypto is not supported
  return ((Math.random() * 99999999) | 0) + '';
}

/**
 * Extracts a list of character groups that are present on the alphabet
 * @param alphabet {string}
 * @returns {string[]}
 */
export function getCharacterGroups(alphabet) {
  let types = [];

  if (/[A-Z]/.test(alphabet)) {
    types.push('uppercase');
  }

  if (/[a-z]/.test(alphabet)) {
    types.push('lowercase');
  }

  if (/[0-9]/.test(alphabet)) {
    types.push('digit');
  }

  // eslint-disable-next-line no-useless-escape
  if (/[!@#$%*()_+=\-?\[\]\{\}",./<>|]/.test(alphabet)) {
    types.push('special');
  }

  // eslint-disable-next-line no-useless-escape
  if (/[^A-Za-z0-9!@#$%*()_+=\-?\[\]\{\}",./<>|]/.test(alphabet)) {
    types.push('unicode');
  }

  return types;
}

/**
 * Checks if the plaintext contains any character from a character group
 * @param text {string}
 * @param type {string}
 * @returns {boolean}
 */
export function containsCharacterGroup(text, type) {
  if (type === 'uppercase') {
    return /[A-Z]/.test(text);
  }
  if (type === 'lowercase') {
    return /[a-z]/.test(text);
  }
  if (type === 'digit') {
    return /[0-9]/.test(text);
  }
  if (type === 'special') {
    // eslint-disable-next-line no-useless-escape
    return /[!@#$%*()_+=\-?\[\]\{\}",./<>|]/.test(text);
  }
  if (type === 'unicode') {
    // eslint-disable-next-line no-useless-escape
    return /[^A-Za-z0-9!@#$%*()_+=\-?\[\]\{\}",./<>|]/.test(text);
  }
  return false;
}

/**
 * Generates a password from a seed and an alphabet
 * @param seed {number[]}
 * @param alphabet {string}
 * @returns {string}
 */
export function getPassword(seed, alphabet) {
  let str = '';
  for (let byte of seed) {
    str += alphabet[byte % alphabet.length];
  }
  return str;
}

/**
 * Generates a password seed from a master password and the code of a service
 * @param password {string}
 * @param service {string}
 * @param length {number}
 * @param useRandomSeed {boolean} use legacy generation algorithm
 * @param alphabetLen {number} use legacy generation algorithm
 * @returns {number[]}
 */
export function getPasswordSeed(password, service, length, useRandomSeed, alphabetLen) {
  // Check if the service code matches a fixed seed pattern and return that seed instead
  let fixedSeed = getFixedSeed(service);
  if (fixedSeed) {
    return fixedSeed;
  }

  let passSeed = [];

  if (useRandomSeed) {
    const seed = sha512(password + sha512(service));
    const random = create(seed);

    for (let i = 0; i < length; i++) {
      passSeed.push(random(alphabetLen));
    }
  } else {
    const randSeed = sha512(sha512(password) + sha512(service));
    const random = randomInit(randSeed);
    for (let i = 0; i < length; i++) {
      passSeed.push(nextRandom(random));
    }
  }

  return passSeed;
}

/**
 * Parses a service code to find a pattern like 'seed:ff00ff1a' which will be used as a seed
 * @param service
 * @returns {null}
 */
export function getFixedSeed(service) {
  let fixedSeedRegex = /seed:(([0-9a-f]{2})+)/;
  let match = fixedSeedRegex.exec(service);
  return match ? hex2ints(match[1]) : null;
}

/**
 * Initializes a random number generator based on multiple sha512 applications over a seed
 * @param seed {string}
 * @returns {{}}
 */
function randomInit(seed) {
  return {
    seed: seed, last: sha512(seed),
  };
}

/**
 * Generates the next random byte using this seeded random generator
 * @param state {{}}
 * @returns {number}
 */
function nextRandom(state) {
  let value = sha512(state.last + state.seed);
  state.last = value;
  let first_byte = value.substring(0, 2);
  return parseInt(first_byte, 16);
}

/**
 * Tries to copy a string into the user's clipboard
 * The promise never fails but returns false if copying to the clipboard is not supported
 * @param text {string}
 * @returns {Promise<boolean>}
 */
export function copyToClipboard(text) {
  return new Promise(resolve => {
    if (!navigator.clipboard) {
      const textArea = document.createElement('textarea');
      textArea.value = text;

      // Avoid scrolling to bottom
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const result = document.execCommand('copy');
        document.body.removeChild(textArea);
        resolve(result);
      } catch (err) {
        document.body.removeChild(textArea);
        resolve(false);
      }
    } else {
      navigator.clipboard.writeText(text)
        .then(() => resolve(true), () => resolve(false));
    }
  });
}

/**
 * Encrypts a string using AES256
 * @param message {string}
 * @param key {string}
 * @returns {string}
 */
export function encrypt(message = '', key = '') {
  return AES.encrypt(message, sha512(key)).toString();
}

/**
 * Decrypts a string using AES256, if fails returns undefined
 * @param message {string}
 * @param key {string}
 * @returns {string}
 */
export function decrypt(message = '', key = '') {
  return AES.decrypt(message, sha512(key)).toString(Utf8);
}

/**
 * Decodes a string of hex codes into a JS string, uses 4 digits to encode 1 js character in UTF-16
 * @param text {string}
 * @returns {string}
 */
export function hex2bin(text) {
  const hexes = text.match(/.{1,4}/g) || [];
  let result = '';

  for (let j = 0; j < hexes.length; j++) {
    result += String.fromCharCode(parseInt(hexes[j], 16));
  }

  return result;
}

/**
 * Encodes a JS string into hex codes, uses 4 digits to encode 1 js character in UTF-16
 * @param text {string}
 * @returns {string}
 */
export function bin2hex(text) {
  let result = '';

  for (let i = 0; i < text.length; i++) {
    let hex = text.charCodeAt(i).toString(16);
    result += ('000' + hex).slice(-4);
  }

  return result;
}

/**
 * Encodes a JS array of integers (0-255) into hex codes, uses 2 digits to encode 1 byte
 * @param list {number[]}
 * @returns {string}
 */
export function ints2hex(list) {
  let result = '';

  for (let i = 0; i < list.length; i++) {
    let hex = (list[i] | 0).toString(16);
    result += ('00' + hex).slice(-2);
  }

  return result;
}

/**
 * Decodes a string of hex codes into a JS array of integers, uses 2 digits to encode 1 byte (0-255)
 * @param text {string}
 * @returns {number[]}
 */
export function hex2ints(text) {
  const hexes = text.match(/.{1,2}/g) || [];
  let result = [];

  for (let j = 0; j < hexes.length; j++) {
    result.push(parseInt(hexes[j], 16));
  }

  return result;
}

/**
 * Generates a password using all input settings
 * @param masterPassword {string}
 * @param code {string}
 * @param len {number}
 * @param alphabet {string}
 * @param allGroups {boolean}
 * @param useRandomSeed {boolean}
 * @returns {string}
 */
export function generatePassword(masterPassword, code, len, alphabet, allGroups, useRandomSeed) {
  let seed;

  if (allGroups) {
    seed = getPasswordSeedWithAllGroups(masterPassword, code, len, alphabet, useRandomSeed);
  } else {
    seed = getPasswordSeed(masterPassword, code, len, useRandomSeed, alphabet.length);
  }

  return getPassword(seed, alphabet);
}

/**
 * Generate a password seed, such that the generated password will contain characters from all character groups
 * @param masterPassword
 * @param code
 * @param len
 * @param alphabet
 * @param useRandomSeed
 * @returns {number[]}
 */
export function getPasswordSeedWithAllGroups(masterPassword, code, len, alphabet, useRandomSeed) {
  let seed = getPasswordSeed(masterPassword, code, len, useRandomSeed, alphabet.length);
  let groups = getCharacterGroups(alphabet);
  let index = 0;

  // If there are more groups that the length of the password is impossible
  // to include characters from all groups
  if (groups.length > len) {
    return seed;
  }

  // Regen the password until it has characters from all groups
  // Limit to 20 trys
  while (index < 20) {
    let pass = getPassword(seed, alphabet);
    let passes = true;

    for (let group of groups) {
      if (!containsCharacterGroup(pass, group)) {
        passes = false;
        break;
      }
    }

    if (passes) {
      break;
    }

    seed = getPasswordSeed(masterPassword, index + ':' + code, len, useRandomSeed, alphabet.length);
    index++;
  }

  return seed;
}

/**
 * Downloads a text file named [filename] with the content [text]
 * @param filename
 * @param text
 */
export function downloadAsFile(filename, text) {
  const element = document.createElement('a');
  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Perform a search into a list of entities
 *
 * @param list {array} list of entities
 * @param field {string} field of the entity to search
 * @param search {string} text input to match
 * @returns {*}
 */
export function searchBy(list, field, search) {
  // Get search weight of each item
  list = list.map(s => [s, matches(s[field], search)]);
  // Remove items that don't match
  list = list.filter(([_, b]) => b > 0);
  // Sort by search weight
  list.sort(([_a, a], [_b, b]) => b - a);
  // Return list of the same type as input
  return list.map(([a, _]) => a);
}

/**
 * Compares a string with a search term and returns the similarity
 * Returns 0 if the text doesn't match the search term
 *
 * @param text {string}
 * @param search {string}
 * @returns {number}
 */
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