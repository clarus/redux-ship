// @flow
import * as CounterModel from './counter/model';
import * as RandomGifModel from './random-gif/model';

export type State = {
  counter: CounterModel.State,
  randomGif: RandomGifModel.State,
};

export const initialState: State = {
  counter: CounterModel.initialState,
  randomGif: RandomGifModel.initialState,
};

export type Patch = {
  counter?: CounterModel.Patch,
  randomGif?: RandomGifModel.Patch,
};

export function reduce(state: State, patch: Patch): State {
  return {
    ...state,
    ...patch.counter && {counter: CounterModel.reduce(state.counter, patch.counter)},
    ...patch.randomGif && {randomGif: RandomGifModel.reduce(state.randomGif, patch.randomGif)},
  };
}
