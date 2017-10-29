// @flow
import * as Test from '../../test';
import * as RandomGifModel from '../model';

Test.snapshotReduce(RandomGifModel.reduce, {
  LoadStart: {
    patch: {type: 'LoadStart'},
    state: RandomGifModel.initialState,
  },
  LoadSuccess: {
    patch: {
      type: 'LoadSuccess',
      gifUrl: 'https://media2.giphy.com/media/m7ychnf9zOVm8/giphy.gif',
    },
    state: RandomGifModel.initialState,
  },
});
