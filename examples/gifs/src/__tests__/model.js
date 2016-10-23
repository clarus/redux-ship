// @flow
import * as Test from '../test';
import * as Model from '../model';

Test.snapshotReduce(Model.reduce, {
  counter: {
    patch: {counter: {type: 'IncrementByOne'}},
    state: Model.initialState,
  },
  randomGifs: {
    patch: {randomGifs: {
      patch: {type: 'LoadStart'},
      tag: Object.keys(Model.initialState.randomGifs)[0],
    }},
    state: Model.initialState,
  },
});
