import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './components/App';
import * as Util from './util';
import * as Storage from './storage';
import * as Serialize from './serialize';

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root'),
);

// Cli utilities
// Expose utilities to the global environment
window['Util'] = {};
Object.entries(Util).forEach(([key, value]) => {
  window['Util'][key] = value;
});

window['Storage'] = {};
Object.entries(Storage).forEach(([key, value]) => {
  window['Storage'][key] = value;
});

window['Serialize'] = {};
Object.entries(Serialize).forEach(([key, value]) => {
  window['Serialize'][key] = value;
});