import {sha512} from '../util/util';
import '../style/master-password.scss';
import {FocusTrap, PasswordInput} from "@mantine/core";
import {t} from "../util/i18n";

/**
 * Single field asking for the master password.
 *
 * @param {string} value
 * @param {(string) => void} onChange
 * @param {() => void} onEnter
 * @param {boolean} trapFocus
 * @returns {JSX.Element}
 * @constructor
 */
export function MasterPasswordInput({value, onChange, onEnter, trapFocus}) {
  return <div className="master-password">
    <label htmlFor="master-password">{t("Master password")}</label>
    <div className="field">
      <div className="text-input">
        <FocusTrap active={trapFocus}>
          <PasswordInput
            placeholder={t("Enter your master password")}
            name="password"
            autoComplete="current-password"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && onEnter) {
                onEnter();
              }
            }}
          />
        </FocusTrap>
      </div>
      <MasterPasswordColorBox value={value}/>
    </div>
  </div>;
}

export function MasterPasswordColorBox({value}) {
  const hash = getMasterPasswordHash(value);

  return <div
    className="master-password-color-box"
    title="Visual representation of the text, if you type the wrong password the colors will be different than expected"
  >
    <div className="background">
      {colorBox(hash, 0)}
      {colorBox(hash, 1)}
      {colorBox(hash, 2)}
      {colorBox(hash, 3)}
    </div>
  </div>;
}

function colorBox(hash, index) {
  const rand = hash.substring(index * 2, index * 2 + 2);
  const byte = parseInt(rand, 16);

  // HSL: https://www.w3schools.com/colors/colors_hsl.asp
  const h = (((byte / 255 * 360) / 5) | 0) * 5;
  const s = 100;
  const l = 50;
  const color = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  return <div className="color-box" style={{background: color}}>{rand}</div>;
}

/**
 * Creates a SHA512 hash of the master password
 *
 * @param {string} masterPassword
 * @returns {string}
 */
export function getMasterPasswordHash(masterPassword) {
  return sha512(masterPassword).toUpperCase();
}
