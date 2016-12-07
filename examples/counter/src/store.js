// @flow
import {applyMiddleware, createStore} from 'redux';
import * as Ship from 'redux-ship';
import createLogger from 'redux-logger';
import {logControl} from 'redux-ship-logger';
import * as Controller from './controller';
import * as Model from './model';

function runEffect() {}

const middlewares = [
  Ship.middleware(runEffect, logControl(Controller.control)),
  createLogger(),
];

export default createStore(Model.reduce, Model.initialState, applyMiddleware(...middlewares));
