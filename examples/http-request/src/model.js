// @flow
import * as EyeModel from './eye/model';
import * as MoviesModel from './movies/model';

export type State = {
  eye: EyeModel.State,
  movies: MoviesModel.State,
};

export const initialState: State = {
  eye: EyeModel.initialState,
  movies: MoviesModel.initialState,
};

export type Commit = {
  type: 'Eye',
  commit: EyeModel.Commit,
} | {
  type: 'Movies',
  commit: MoviesModel.Commit,
};

export function reduce(state: State, commit: Commit): State {
  switch (commit.type) {
  case 'Eye':
    return {
      ...state,
      eye: EyeModel.reduce(state.eye, commit.commit),
    };
  case 'Movies':
    return {
      ...state,
      movies: MoviesModel.reduce(state.movies, commit.commit),
    };
  default:
    return state;
  }
}
