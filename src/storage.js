import {hex2bin} from './util';
import {deserializeAlphabets, deserializeServices, serializeAlphabets, serializeServices} from './serialize';

export function loadAlphabets() {
  let json = getLocalStorage().getItem('alphabets');
  let alphabets = deserializeAlphabets(json);
  if (!alphabets) {
    alphabets = [
      {
        id: 'default',
        name: 'Default',
        summary: 'Letters, digits and special characters',
        // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%*()_+=-?[]{}",./<>| '
        chars: hex2bin('004100420043004400450046004700480049004a004b004c004d004e004f0050005100520053005400550056005700580059005a006100620063006400650066006700680069006a006b006c006d006e006f0070007100720073007400750076007700780079007a003100320033003400350036003700380039003000210040002300240025002a00280029005f002b003d002d003f005b005d007b007d0022002c002e002f003c003e007c0020'),
      },
      {
        id: 'legacy',
        name: 'Legacy',
        summary: 'A-Z a-z 0-9 without E/e',
        chars: 'ABCDFGHIJKLMNOPQRSTUVWXYZabdfghijklmnopqrstuvwxyz1234567890',
      },
      {
        id: 'crazy',
        name: 'Unicode madness',
        summary: 'Uncommon unicode characters',
        // 'ꓯꓭꓛꓷꓱꓞꓨꓩꓘꓶꟽИꟼꓤƧꓕꓵꓥ༽᚛᚜‹›⁅⁆⁽⁾₍₎⅀∁∂∃∄∈∉∊∋∌∍∑∕∖√∛∜∝∟∠∡∢∤∦∫∬∭∮∯∰∱∲∳∹∻∼∽∾∿≀≁≂≃≄≅≆≇≈≉≊≋≌≒≓≔≕≟≠≢≤≥≦≧≨≩≪≫≮≯≰≱≲≳≴≵≶≷≸≹≺≻≼≽≾≿⊀⊁⊂⊃'
        chars: hex2bin('a4efa4eda4dba4f7a4f1a4dea4e8a4e9a4d8a4f6a7fd0418a7fca4e401a7a4d5a4f5a4e50f3d169b169c2039203a20452046207d207e208d208e2140220122022203220422082209220a220b220c220d221122152216221a221b221c221d221f22202221222222242226222b222c222d222e222f22302231223222332239223b223c223d223e223f2240224122422243224422452246224722482249224a224b224c2252225322542255225f22602262226422652266226722682269226a226b226e226f2270227122722273227422752276227722782279227a227b227c227d227e227f2280228122822283'),
      },
      {
        id: 'simple',
        name: 'Letters and numbers',
        summary: 'A-Z a-z 0-9',
        chars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890',
      },
      {
        id: 'digits',
        name: 'Only digits',
        summary: '0-9',
        chars: '1234567890',
      },
      {
        id: 'bug',
        name: 'Compatibility with older versions',
        summary: 'Default plus ñ Ñ € ¡ ¿ ç',
        // 'ABCDEFGHIJKLMNÃ‘OPQRSTUVWXYZabcdefghijklmnÃ±opqrstuvwxyz1234567890!@#$%*()_+=-â‚¬Â¡?Â¿[]{}",./Ã§<>| '
        chars: hex2bin('004100420043004400450046004700480049004a004b004c004d004e00c32018004f0050005100520053005400550056005700580059005a006100620063006400650066006700680069006a006b006c006d006e00c300b1006f0070007100720073007400750076007700780079007a003100320033003400350036003700380039003000210040002300240025002a00280029005f002b003d002d00e2201a00ac00c200a1003f00c200bf005b005d007b007d0022002c002e002f00c300a7003c003e007c0020'),
      },
    ];
  }
  return alphabets;
}

export function saveAlphabets(alphabets) {
  getLocalStorage().setItem('alphabets', serializeAlphabets(alphabets) || '');
}

export function saveServices(services) {
  getLocalStorage().setItem('services', serializeServices(services) || '');
}

export function loadServices() {
  let json = getLocalStorage().getItem('services');
  return deserializeServices(json) || [];
}

export function saveMasterPassword(text) {
  getLocalStorage().setItem('master', text || '');
}

export function loadMasterPassword() {
  return getLocalStorage().getItem('master') || '';
}

export function getAndIncrementId(name) {
  let curr = getLocalStorage().getItem('sequence-' + name) || 0;
  // Force integer
  curr = curr | 0;
  if (isNaN(curr)) curr = 0;
  getLocalStorage().setItem('sequence-' + name, (curr + 1) + '');
  return curr;
}

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
      };
    }
    return window.localStorageFallback;
  }
}