// @flow
import * as Test from '../../test';
import * as CounterModel from '../model';

Test.snapshotReduce(CounterModel.reduce, {
  IncrementByOne: {
    patch: {type: 'IncrementByOne'},
    state: CounterModel.initialState,
  },
  IncrementByTwo: {
    patch: {type: 'IncrementByTwo'},
    state: CounterModel.initialState,
  },
});
