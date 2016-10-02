import {applyMiddleware, createStore} from 'redux';
import createLogger from 'redux-logger';
import * as Model from './model';

const middlewares = [
  createLogger(),
];

export default createStore(Model.reduce, Model.initialState, applyMiddleware(...middlewares));
