import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './components/App';
import * as Utilities from './util';

ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById('root'),
);

// Cli utilities
// Expose utilities to the global environment
Object.entries(Utilities).forEach(([key, value]) => {
  window[key] = value;
})