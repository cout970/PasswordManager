import js_sha512 from 'js-sha512';
import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

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
 * @returns {number}
 */
export function randId() {
  return (Math.random() * 99999999) | 0;
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
    return /[!@#$%*()_+=\-?\[\]\{\}",./<>|]/.test(text);
  }
  if (type === 'unicode') {
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
 * @returns {number[]}
 */
export function getPasswordSeed(password, service, length) {
  let passSeed = [];

  const randSeed = sha512(sha512(password) + sha512(service));
  const random = randomInit(randSeed);
  for (let i = 0; i < length; i++) {
    passSeed.push(nextRandom(random));
  }

  return passSeed;
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
 * Generates a password using all input settings
 * @param masterPassword {string}
 * @param code {string}
 * @param len {number}
 * @param alphabet {string}
 * @param allGroups {boolean}
 * @returns {string}
 */
export function generatePassword(masterPassword, code, len, alphabet, allGroups) {
  const seed = getPasswordSeed(masterPassword, code, len);
  let pass = getPassword(seed, alphabet);

  if (allGroups) {
    let groups = getCharacterGroups(alphabet);
    let index = 0;

    // Regen the password until it has characters from all groups
    while (true) {
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

      console.log(index);
      const seed = getPasswordSeed(masterPassword, index + ':' + code, len);
      pass = getPassword(seed, alphabet);
      index++;
    }
  }

  return pass;
}