// @flow
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import * as Ship from 'redux-ship';
import {logControl} from 'redux-ship-logger';
import App from './App';
import './index.css';
import * as Controller from './controller';
import store from './store';

function dispatch(action: Controller.Action): void {
  Ship.run(() => {}, store.dispatch, store.getState, logControl(Controller.control)(action));
}

function render(): void {
  ReactDOM.render(
    <App dispatch={dispatch} state={store.getState()} />,
    document.getElementById('root')
  );
}

store.subscribe(render);
render();
