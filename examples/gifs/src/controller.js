// @flow
import * as Ship from 'redux-ship';
import * as RandomGifController from './random-gif/controller';
import * as Model from './model';

export type Action = {
  type: 'RandomGif',
  action: RandomGifController.Action,
};

export type Commit = {
  type: 'RandomGif',
  commit: RandomGifController.Commit,
};

export type State = Model.State;

export type Patch = Model.Patch;

export function applyCommit(state: State, commit: Commit): Patch {
  switch (commit.type) {
  case 'RandomGif': {
    const patch = RandomGifController.applyCommit(
      {
        counter: state.counter,
        randomGif: state.randomGif
      },
      commit.commit
    );
    return {
      ...patch.counter && {counter: patch.counter},
      ...patch.randomGif && {randomGif: patch.randomGif},
    };
  }
  default:
    return {};
  }
}

export function* control(action: Action): Ship.Ship<*, Commit, State, void> {
  switch (action.type) {
  case 'RandomGif':
    return yield* Ship.map(
      commit => ({type: 'RandomGif', commit}),
      state => ({
        counter: state.counter,
        randomGif: state.randomGif,
      }),
      RandomGifController.control(action.action)
    );
  default:
    return;
  }
}
