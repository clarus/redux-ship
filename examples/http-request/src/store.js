// @flow
import {applyMiddleware, createStore} from 'redux';
import createLogger from 'redux-logger';
import * as Model from './model';

export default createStore(Model.reduce, Model.initialState, applyMiddleware(createLogger()));
