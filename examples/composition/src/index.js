// @flow
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Index from './view';
import './index.css';
import store from './store';
import {Provider} from 'react-redux';
import registerServiceWorker from './registerServiceWorker';

const root = document.getElementById('root');
if (root) {
  ReactDOM.render(<Provider store={store}><Index /></Provider>, root);
}
registerServiceWorker();
