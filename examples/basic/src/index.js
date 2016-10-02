// @flow
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import * as Ship from 'redux-ship';
import App from './App';
import './index.css';
import store from './store';
import * as Controller from './controller';
import * as Effect from './effect';

function* controlWithLog(action: Controller.Action) {
  const {snapshot} = yield* Ship.snapshot(Controller.control(action));
  console.group('ship');
  console.log('action', action);
  console.log('snapshot', snapshot);
  console.groupEnd();
}

function dispatch(action: Controller.Action): void {
  Ship.run(Effect.run, store.dispatch, store.getState, controlWithLog(action));
}

function render() {
  ReactDOM.render(
    <App
      dispatch={dispatch}
      state={store.getState()}
    />,
    document.getElementById('root')
  );
}

store.subscribe(render);
render();
