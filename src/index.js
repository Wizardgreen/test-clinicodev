import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { worker } from './mocks/worker'

worker.start()

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

