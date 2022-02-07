import {sha512} from '../util';

export function MasterPassword({value, onChange}) {
  return <div className="master-password">
    <label htmlFor="master-password">Master password</label>
    <div className="field">
      <div className="text-input">
        <input id="master-password"
               type="password"
               placeholder="master password"
               name="password"
               autoComplete="current-password"
               value={value}
               onChange={e => onChange(e.target.value)}
        />
      </div>
      <div className="text-hash" title="Visual representation of the text, if you type the wrong password the colors will be different than expected">
        <div className="background">
          {colorBox(value, 0)}
          {colorBox(value, 1)}
          {colorBox(value, 2)}
          {colorBox(value, 3)}
        </div>
      </div>
    </div>
  </div>;
}

function colorBox(text, index) {
  const rand = sha512(text).substring(index * 2, index * 2 + 2).toUpperCase();
  const byte = parseInt(rand, 16);

  // HSL: https://www.w3schools.com/colors/colors_hsl.asp
  const h = (((byte / 255 * 360) / 5) | 0) * 5;
  const s = 100;
  const l = 50;
  const color = 'hsl(' + h + ', ' + s + '%, ' + l + '%)';
  return <div className="color-box" style={{background: color}}>{rand}</div>;
}