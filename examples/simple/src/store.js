// @flow
import {applyMiddleware, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import * as Ship from 'redux-ship';
import * as ShipDevTools from 'redux-ship-devtools';
import * as Controller from './controller';
import * as Effect from './effect';
import * as Model from './model';

// Create a Redux store with the Ship middleware, the Ship dev-tools and the Redux logger.
export default createStore(
  Model.reduce,
  Model.initialState,
  applyMiddleware(
    Ship.middleware(Effect.run, ShipDevTools.inspect(Controller.control)),
    createLogger()
  )
);
