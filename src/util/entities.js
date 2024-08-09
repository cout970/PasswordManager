import {hex2bin, randId, recursiveCollect, sha512} from "./util";
import {getLastId} from "./storage";

/**
 * Create a new account
 *
 * @param {string} masterPassword
 * @param {string} name
 * @returns {Account}
 */
export function createAccount(masterPassword, name) {
  return {
    id: randId(),
    type: 'account',
    masterPassword: masterPassword,
    alphabets: defaultAlphabets(),
    services: [],
    secrets: [],
    folders: defaultFolders(),
    settings: defaultSettings({accountName: name}),
  };
}

/**
 * Creates a new service
 *
 * @param {Settings} settings
 * @returns {Service}
 */
export function createService(settings) {
  let index = getLastId('service-index');

  return {
    id: randId(),
    type: 'service',
    name: 'Service #' + index,
    code: 'service-' + index,
    username: '',
    icon: '',
    passLen: settings.defaultPasswordLength,
    alphabet: settings.defaultAlphabet || 'default',
    allGroups: settings.defaultAllGroups,
    useRandomSeed: settings.defaultRandomSeed,
    masterCheck: '',
    folder: undefined,
    lastUse: 0,
    uses: 0,
  };
}

/**
 * Replaces invalid fields and adds missing values
 *
 * @param {undefined|Partial<Service>} initial
 * @returns {Service}
 */
export function validateService(initial) {
  /** @type {Service} */
  let service = initial || {};

  if (!service.id) {
    service.id = randId();
  }

  service.type = 'service';

  if (typeof service.name !== 'string') {
    let index = getLastId('service-index');
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

  if (!service.masterCheck) {
    service.masterCheck = '';
  }

  if (!service.lastUse) {
    service.lastUse = 0;
  }

  if (!service.uses) {
    service.uses = 0;
  }

  return service;
}

/**
 * Creates a new secret
 *
 * @returns {Secret}
 */
export function createSecret() {
  let index = getLastId('secret-index');

  return {
    id: randId(),
    type: 'secret',
    name: 'Secret #' + index,
    contents: '',
    decodedContents: null,
    description: '',
    icon: '',
    sha512: sha512(''),
    lastUse: 0,
    uses: 0,
  };
}

/**
 * Replaces invalid fields and adds missing values
 *
 * @param {undefined|Partial<Secret>} initial
 * @returns {Secret}
 */
export function validateSecret(initial) {
  /** @type {Secret} */
  let secret = initial || {};

  if (!secret.id) {
    secret.id = randId();
  }

  secret.type = 'secret';

  if (typeof secret.name !== 'string') {
    let index = getLastId('secret-index');
    secret.name = 'Secret #' + index;
  }

  if (typeof secret.contents !== 'string') {
    secret.contents = '';
  }

  if (typeof secret.description !== 'string') {
    secret.description = '';
  }

  if (typeof secret.sha512 !== 'string') {
    secret.sha512 = sha512('');
  }

  if (secret.decodedContents !== null) {
    secret.decodedContents = null;
  }

  if (secret.folder !== undefined && typeof secret.folder !== 'string') {
    secret.folder = undefined;
  }

  if (!secret.lastUse) {
    secret.lastUse = 0;
  }

  if (!secret.uses) {
    secret.uses = 0;
  }

  return secret;
}

/**
 * Creates a new empty folder
 *
 * @returns {Folder}
 */
export function createFolder() {
  return {
    id: randId(),
    type: 'folder',
    name: 'New folder ' + getLastId('folder-index'),
    children: []
  };
}

export function validateFolder(initial) {
  /** @type {Folder} */
  let folder = initial || {};

  if (!folder.id) {
    folder.id = randId();
  }

  folder.type = 'folder';

  if (typeof folder.name !== 'string') {
    folder.name = 'New folder ' + getLastId('folder-index');
  }

  if (!folder.children || !Array.isArray(folder.children)) {
    folder.children = [];
  }

  return folder;
}

/**
 * Creates or sets the default values for the settings
 *
 * @param {undefined|Partial<Settings>} initial
 * @returns {Settings}
 */
export function defaultSettings(initial) {
  /** @type {Settings} */
  const settings = initial ?? {};

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
    settings.externalServiceUpdate = true;
  }

  return settings;
}


/**
 * Creates a new alphabet
 *
 * @returns {{}}
 */
export function createAlphabet() {
  let index = getLastId('alphabet-index');

  return {
    id: randId(),
    type: 'alphabet',
    code: 'alphabet-' + index,
    name: 'Alphabet #' + index,
    icon: '',
    summary: '',
    chars: '',
  };
}

export function validateAlphabet(initial) {
  /** @type {Alphabet} */
  let alphabet = initial || {};

  if (!alphabet.id) {
    alphabet.id = randId();
  }

  alphabet.type = 'alphabet';

  if (typeof alphabet.code !== 'string') {
    let index = getLastId('alphabet-index');
    alphabet.code = 'alphabet-' + index;
  }

  if (typeof alphabet.name !== 'string') {
    let index = getLastId('alphabet-index');
    alphabet.name = 'Alphabet #' + index;
  }

  if (typeof alphabet.summary !== 'string') {
    alphabet.summary = '';
  }

  if (typeof alphabet.chars !== 'string') {
    alphabet.chars = '';
  }

  if (alphabet.folder !== undefined && typeof alphabet.folder !== 'string') {
    alphabet.folder = undefined;
  }

  return alphabet;
}

/**
 * Returns a list of default alphabets
 *
 * @returns {Alphabet[]}
 */
export function defaultAlphabets() {
  return [
    {
      id: randId(),
      type: 'alphabet',
      code: 'simple',
      name: 'Letters and numbers',
      summary: 'A-Z a-z 0-9',
      chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890',
      folder: 'default-alphabets-folder',
    },
    {
      id: randId(),
      type: 'alphabet',
      code: 'default',
      name: 'Default',
      summary: 'Letters, digits and special characters',
      // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%*()_+=-?[]{}",./<>| '
      chars: hex2bin('004100420043004400450046004700480049004a004b004c004d004e004f0050005100520053005400550056005700580059005a006100620063006400650066006700680069006a006b006c006d006e006f0070007100720073007400750076007700780079007a003100320033003400350036003700380039003000210040002300240025002a00280029005f002b003d002d003f005b005d007b007d0022002c002e002f003c003e007c0020'),
      folder: 'default-alphabets-folder',
    },
    {
      id: randId(),
      type: 'alphabet',
      code: 'legacy',
      name: 'Legacy 1',
      summary: 'A-Z a-z 0-9 without E/e',
      chars: 'ABCDFGHIJKLMNOPQRSTUVWXYZabdfghijklmnopqrstuvwxyz1234567890',
      folder: 'default-alphabets-folder',
    },
    {
      id: randId(),
      type: 'alphabet',
      code: 'bug',
      name: 'Legacy 2',
      summary: 'Default plus ñÑ€¡¿ç and broken utf-8 to windows-1252 conversion',
      // 'ABCDEFGHIJKLMNÃ‘OPQRSTUVWXYZabcdefghijklmnÃ±opqrstuvwxyz1234567890!@#$%*()_+=-â‚¬Â¡?Â¿[]{}",./Ã§<>| '
      chars: hex2bin('004100420043004400450046004700480049004a004b004c004d004e00c32018004f0050005100520053005400550056005700580059005a006100620063006400650066006700680069006a006b006c006d006e00c300b1006f0070007100720073007400750076007700780079007a003100320033003400350036003700380039003000210040002300240025002a00280029005f002b003d002d00e2201a00ac00c200a1003f00c200bf005b005d007b007d0022002c002e002f00c300a7003c003e007c0020'),
      folder: 'default-alphabets-folder',
    },
    {
      id: randId(),
      type: 'alphabet',
      code: 'crazy',
      name: 'Unicode madness',
      summary: 'Uncommon unicode characters',
      // 'ꓯꓭꓛꓷꓱꓞꓨꓩꓘꓶꟽИꟼꓤƧꓕꓵꓥ༽᚛᚜‹›⁅⁆⁽⁾₍₎⅀∁∂∃∄∈∉∊∋∌∍∑∕∖√∛∜∝∟∠∡∢∤∦∫∬∭∮∯∰∱∲∳∹∻∼∽∾∿≀≁≂≃≄≅≆≇≈≉≊≋≌≒≓≔≕≟≠≢≤≥≦≧≨≩≪≫≮≯≰≱≲≳≴≵≶≷≸≹≺≻≼≽≾≿⊀⊁⊂⊃'
      chars: hex2bin('a4efa4eda4dba4f7a4f1a4dea4e8a4e9a4d8a4f6a7fd0418a7fca4e401a7a4d5a4f5a4e50f3d169b169c2039203a20452046207d207e208d208e2140220122022203220422082209220a220b220c220d221122152216221a221b221c221d221f22202221222222242226222b222c222d222e222f22302231223222332239223b223c223d223e223f2240224122422243224422452246224722482249224a224b224c2252225322542255225f22602262226422652266226722682269226a226b226e226f2270227122722273227422752276227722782279227a227b227c227d227e227f2280228122822283'),
      folder: 'default-alphabets-folder',
    },
    {
      id: randId(),
      type: 'alphabet',
      code: 'digits',
      name: 'Only digits',
      summary: '0-9',
      chars: '1234567890',
      folder: 'default-alphabets-folder',
    },
  ];
}

export function defaultFolders() {
  return [
    {
      id: 'default-services-folder',
      type: 'folder',
      name: 'Services',
      children: [],
    },
    {
      id: 'default-secrets-folder',
      type: 'folder',
      name: 'Secrets',
      children: [],
    },
    {
      id: 'default-alphabets-folder',
      type: 'folder',
      name: 'Alphabets',
      children: [],
    },
  ];
}

export function validateFolderLinks(account) {
  // Sanitize folder ids
  const validFolderIds = recursiveCollect(account.folders, f => [f.id, f.children], []);

  return {
    ...account,
    services: account.services.map(service => {
      return {
        ...service,
        folder: (service.folder !== undefined && !validFolderIds.includes(service.folder)) ? undefined : service.folder,
      };
    }),
    secrets: account.secrets.map(secret => {
      return {
        ...secret,
        folder: (secret.folder !== undefined && !validFolderIds.includes(secret.folder)) ? undefined : secret.folder,
      };
    }),
    alphabets: account.alphabets.map(alphabet => {
      return {
        ...alphabet,
        folder: (alphabet.folder !== undefined && !validFolderIds.includes(alphabet.folder)) ? undefined : alphabet.folder,
      };
    }),
  };
}

/**
 * Removes items that were duplicated by the merging of settings
 * @param account
 * @param updateAccount
 * @param type
 */
export function removeDuplicates(account, updateAccount, type) {
  const items = account[type];
  const newList = items.filter(item => !/\(new \d+\)/.test(item.name));

  const diff = items.length - newList.length;

  if (diff > 0) {
    updateAccount({...account, [type]: newList});
  }
}
