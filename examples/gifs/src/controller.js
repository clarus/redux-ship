// @flow
import * as Ship from 'redux-ship';
import * as RandomGifController from './random-gif/controller';
import * as Model from './model';

export type Action = {
  type: 'RandomGif',
  action: RandomGifController.Action,
  tag: string,
};

export type Commit = {
  type: 'RandomGif',
  commit: RandomGifController.Commit,
  tag: string,
};

export type State = Model.State;

export type Patch = Model.Patch;

export function applyCommit(state: State, commit: Commit): Patch {
  switch (commit.type) {
  case 'RandomGif': {
    const patch = RandomGifController.applyCommit(
      {
        counter: state.counter,
        randomGif: state.randomGifs[commit.tag],
      },
      commit.commit
    );
    return {
      ...patch.counter && {counter: patch.counter},
      ...patch.randomGif && {
        randomGifs: {
          patch: patch.randomGif,
          tag: commit.tag,
        },
      },
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
      commit => ({type: 'RandomGif', commit, tag: action.tag}),
      state => ({
        counter: state.counter,
        randomGif: state.randomGifs[action.tag],
      }),
      RandomGifController.control(action.action)
    );
  default:
    return;
  }
}
