// @flow
import {applyMiddleware, createStore} from 'redux';
import {logCommit} from 'redux-ship-logger';
import * as Controller from './controller';
import * as Model from './model';

const middlewares = [
  logCommit(Controller.applyCommit),
];

function reduce(state, commit) {
  return Model.reduce(state, Controller.applyCommit(state, commit));
}

export default createStore(reduce, Model.initialState, applyMiddleware(...middlewares));
