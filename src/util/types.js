/**
 * @typedef Account
 * @property {string} id
 * @property {string} type
 * @property {string} masterPassword
 * @property {?string} masterPasswordHash
 * @property {Alphabet[]} alphabets
 * @property {Service[]} services
 * @property {Secret[]} secrets
 * @property {Folder[]} folders
 * @property {Settings} settings
 */

/**
 * @typedef Alphabet
 * @property {string} id
 * @property {string} type
 * @property {string} code
 * @property {string} name
 * @property {string} summary
 * @property {string} chars
 * @property {string} icon
 * @property {?string} folder
 */

/**
 * @typedef Service
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {string} code
 * @property {string} username
 * @property {string} icon
 * @property {number} passLen
 * @property {string} alphabet
 * @property {boolean} allGroups
 * @property {boolean} useRandomSeed
 * @property {string} masterCheck
 * @property {?string} folder
 * @property {?number} lastUse
 * @property {?number} uses
 */

/**
 * @typedef Secret
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {string} contents
 * @property {?string} decodedContents
 * @property {?string} description
 * @property {string} sha512
 * @property {?string} folder
 * @property {?number} lastUse
 * @property {?number} uses
 */

/**
 * @typedef Folder
 * @property {string} id
 * @property {string} type
 * @property {string} name
 * @property {Folder[]} children
 */

/**
 * @typedef Settings
 * @property {string} accountName
 * @property {boolean} storeSettings
 * @property {boolean} storeMasterPassword
 * @property {boolean} defaultShowPassword
 * @property {boolean} storeSettings
 * @property {boolean} storeMasterPassword
 * @property {number}  defaultPasswordLength
 * @property {boolean} defaultAllGroups
 * @property {boolean} defaultAlphabet
 * @property {boolean} defaultRandomSeed
 * @property {boolean} darkTheme
 * @property {boolean} enableSingleUse
 * @property {boolean} enableRecentShortcuts
 * @property {boolean} externalServiceLoad
 * @property {boolean} externalServiceStore
 * @property {string} externalServiceUrl
 * @property {string} externalServiceHost
 * @property {string} externalServiceAccount
 * @property {string} externalServicePassword
 * @property {boolean} externalServiceRegister
 * @property {boolean} externalServiceUpdate
 */
