import {generatePassword, sha512} from '../util/util';

test('Generates same passwords', () => {
  let alphabet1 = 'ABCDFGHIJKLMNOPQRSTUVWXYZabdfghijklmnopqrstuvwxyz1234567890';
  let alphabet2 = 'ABCDEFGHIJKLMNÃ‘OPQRSTUVWXYZabcdefghijklmnÃ±opqrstuvwxyz1234567890!@#$%*()_+=-â‚¬Â¡?Â¿[]{}",./Ã§<>| ';
  let alphabet3 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890!@#$%*()_+=-?[]{}",./<>| ';

  expect(generatePassword('1234', '1234', 16, alphabet1, true, true))
    .toBe('vbzK4Pb7ggPpsg4H');

  expect(generatePassword('1234', '1234', 16, alphabet2, true, true))
    .toBe('_oÂ‘}XpÃtuW0*t}L');

  expect(generatePassword('1234', '1234', 16, alphabet1, true, false))
    .toBe('Jf2YXVZaFhRaQL5H');

  expect(generatePassword('1234', '1234', 16, alphabet2, true, false))
    .toBe('YaJnm>ÃXE}/±v]M0');

  expect(generatePassword('1234', '1234', 16, alphabet3, false, false))
    .toBe('ncW32X4ZECT5{NZ$');

  expect(generatePassword('1234', '1234', 16, alphabet3, true, false))
    .toBe('1B 5C*R1W)s$fhm$');
});

// ---
// Old tests from super-secret-settings (https://github.com/pagoru/super-secret-settings)
// ---

test('sha512() should return the proper sha512', () => {
  // Check https://emn178.github.io/online-tools/sha512.html
  expect(sha512('sha512')).toBe('1f9720f871674c18e5fecff61d92c1355cd4bfac25699fb7ddfe7717c9669b4d085193982402156122dfaa706885fd64741704649795c65b2a5bdec40347e28a');
  expect(sha512('1234')).toBe('d404559f602eab6fd602ac7680dacbfaadd13630335e951f097af3900e9de176b6db28512f2e000b9d04fba5133e8b1c6e8df59db3a8ab9d60be4b97cc9e81db');
  expect(sha512('root')).toBe('99adc231b045331e514a516b4b7680f588e3823213abe901738bc3ad67b2f6fcb3c64efb93d18002588d3ccc1a49efbae1ce20cb43df36b38651f11fa75678e8');
  expect(sha512('0')).toBe('31bca02094eb78126a517b206a88c73cfa9ec6f704c7030d18212cace820f025f00bf0ea68dbf3f3a5436ca63b53bf7bf80ad8d5de7d8359d0b7fed9dbc3ab99');
  expect(sha512('0000')).toBe('c6001d5b2ac3df314204a8f9d7a00e1503c9aba0fd4538645de4bf4cc7e2555cfe9ff9d0236bf327ed3e907849a98df4d330c4bea551017d465b4c1d9b80bcb0');
  expect(sha512('')).toBe('cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e');
  expect(sha512('cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e')).toBe('8fb29448faee18b656030e8f5a8b9e9a695900f36a3b7d7ebb0d9d51e06c8569d81a55e39b481cf50546d697e7bde1715aa6badede8ddc801c739777be77f166');
});

// Redefined with the defaults from super-secret-settings
const getPassword = (master, service, length, alphabet) => {
  length = length || 12;
  alphabet = alphabet || 'ABCDFGHIJKLMNOPQRSTUVWXYZabdfghijklmnopqrstuvwxyz1234567890';
  return generatePassword(master, service, length, alphabet, false, true);
};

test('getPassword() should return the same value as previous versions', () => {
  // Check https://sss.pagoru.es/
  expect(getPassword('1234', 'youtube')).toBe('ZVzFIo8TXTHi');
  expect(getPassword('1234', 'twitter')).toBe('a9L1XgqdRa0G');
  expect(getPassword('password', 'youtube')).toBe('F46agthlSVVO');
  expect(getPassword('password', 'twitter')).toBe('WiqM7LVhjxuo');
});

test('getPassword() with different lengths', () => {
  // Check https://sss.pagoru.es/
  expect(getPassword('1234', 'youtube', 32)).toBe('ZVzFIo8TXTHirNAzoPRYJLB1bJ6fqfkd');
  expect(getPassword('1234', 'twitter', 16)).toBe('a9L1XgqdRa0GvRHi');
  expect(getPassword('password', 'youtube', 4)).toBe('F46a');
  expect(getPassword('password', 'twitter', 64)).toBe('WiqM7LVhjxuoiLPBqib36YzmgQsfhbViBv6j8g0nfYPwty8T8JdxGU4OBTJWs5S1');
});

test('getPassword() with different alphabet', () => {
  const numbers = '123456789';
  const weak = 'abdfghijklmnopqrstuvwxyz';
  const strong = 'ABCDFGHIJKLMNOPQRSTUVWXYZabdfghijklmnopqrstuvwxyz1234567890!@#$%*()_+{}<>,./ ';
  expect(getPassword('1234', 'youtube', 32, numbers)).toBe('44812693432572186334221842957565');
  expect(getPassword('password', 'youtube', 32, weak)).toBe('bxymntoqjkkhktrpjnobbigtfgzmhvoz');
  expect(getPassword('F46agthlSVVO', 'youtube', 32, strong)).toBe('{6 +0%# D968MqvytC<bMh)<1vLhF>wu');
});
