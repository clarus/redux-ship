import {createStore} from 'redux';
import * as Model from './model';

export default createStore(Model.reduce, Model.initialState);
