import {bin2hex, hex2bin} from './util';

export function serializeServices(service) {
  return service ? JSON.stringify(service) : null;
}

export function deserializeServices(json) {
  return json ? JSON.parse(json) : null;
}

export function serializeAlphabets(alphabets) {
  if (!alphabets) return null;

  let entries = Array.isArray(alphabets) ? alphabets : Object.values(alphabets);
  let alphabetsSerializable = entries.map(value => {
    return {
      ...value,
      summary: bin2hex(value.summary),
      chars: bin2hex(value.chars),
    };
  });

  return JSON.stringify(alphabetsSerializable);
}

export function deserializeAlphabets(json) {
  if (!json) return null;

  let alphabetsSerializable = JSON.parse(json);
  if (!Array.isArray(alphabetsSerializable)) {
    return null;
  }

  return alphabetsSerializable.map(value => {
    return {
      ...value,
      summary: hex2bin(value.summary),
      chars: hex2bin(value.chars),
    };
  });
}

export function serializeSettings(settings) {
  return settings ? JSON.stringify(settings) : null;
}

export function deserializeSettings(json) {
  return json ? JSON.parse(json) : null;
}