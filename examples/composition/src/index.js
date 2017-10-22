// @flow
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import * as Ship from 'redux-ship';
import * as ShipDevTools from 'redux-ship-devtools';
import Index from './view';
import './index.css';
import store from './store';
import * as Controller from './controller';
import * as Effect from './effect';
import registerServiceWorker from './registerServiceWorker';

function dispatch(action: Controller.Action): void {
  Ship.run(Effect.run, store, ShipDevTools.inspect(Controller.control)(action));
}

function render() {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.render(
      <Index
        dispatch={dispatch}
        state={store.getState()}
      />,
      root
    );
  }
}

store.subscribe(render);
render();
registerServiceWorker();
