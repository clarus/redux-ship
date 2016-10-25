// @flow
import * as Ship from 'redux-ship';
import * as EyeController from './eye/controller';
import * as MoviesController from './movies/controller';
import * as Model from './model';

export type Action = {
  type: 'Eye',
  action: EyeController.Action,
} | {
  type: 'Movies',
  action: MoviesController.Action,
};

export type Commit = {
  type: 'Eye',
  commit: EyeController.Commit,
} | {
  type: 'Movies',
  commit: MoviesController.Commit,
};

export type State = Model.State;

export type Patch = Model.Patch;

export function applyCommit(state: State, commit: Commit): Patch {
  switch (commit.type) {
  case 'Eye':
    return {eye: commit.commit};
  case 'Movies':
    return {movies: commit.commit};
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
  case 'Movies':
    return yield* Ship.map(
      commit => ({type: 'Movies', commit}),
      state => state.movies,
      MoviesController.control(action.action)
    );
  default:
    return;
  }
}
