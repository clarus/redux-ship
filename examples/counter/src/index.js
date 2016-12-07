// @flow
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import store from './store';

function render(): void {
  ReactDOM.render(
    <App dispatch={store.dispatch} state={store.getState()} />,
    document.getElementById('root')
  );
}

store.subscribe(render);
render();
