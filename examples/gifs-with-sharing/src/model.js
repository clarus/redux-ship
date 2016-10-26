// @flow
import * as CounterModel from './counter/model';
import * as RandomGifModel from './random-gif/model';

const tags = [
  'cat',
  'minion',
  'dog',
  'gify'
];

export type State = {
  counter: CounterModel.State,
  randomGifs: {[tag: string]: RandomGifModel.State},
};

export const initialState: State = {
  counter: CounterModel.initialState,
  randomGifs: tags.reduce((accumulator, tag) => ({
    ...accumulator,
    [tag]: RandomGifModel.initialState,
  }), {}),
};

export type Patch = {
  counter?: CounterModel.Patch,
  randomGifs?: {
    patch: RandomGifModel.Patch,
    tag: string,
  },
};

export function reduce(state: State, patch: Patch): State {
  return {
    ...state,
    ...patch.counter && {counter: CounterModel.reduce(state.counter, patch.counter)},
    ...patch.randomGifs && {
      randomGifs: {
        ...state.randomGifs,
        [patch.randomGifs.tag]: RandomGifModel.reduce(
          state.randomGifs[patch.randomGifs.tag],
          patch.randomGifs.patch
        ),
      }
    },
  };
}
