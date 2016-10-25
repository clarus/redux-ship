// @flow
import * as Ship from 'redux-ship';
import * as EyeController from './eye/controller';
import * as Model from './model';

export type Action = {
  type: 'Eye',
  action: EyeController.Action,
};

export type Commit = {
  type: 'Eye',
  commit: EyeController.Commit,
};

export type State = Model.State;

export type Patch = Model.Patch;

export function applyCommit(state: State, commit: Commit): Patch {
  switch (commit.type) {
  case 'Eye':
    return {eye: commit.commit};
  default:
    return {};
  }
}

export function* control(action: Action): Ship.Ship<*, Commit, State, void> {
  switch (action.type) {
  case 'Eye':
    return yield* Ship.map(
      commit => ({type: 'Eye', commit}),
      state => state.eye,
      EyeController.control(action.action)
    );
  default:
    return;
  }
}
