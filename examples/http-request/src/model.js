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

export type Patch = {
  eye?: EyeModel.Patch,
  movies?: MoviesModel.Patch,
};

export function reduce(state: State, patch: Patch): State {
  return {
    ...state,
    ...patch.eye && {eye: EyeModel.reduce(state.eye, patch.eye)},
    ...patch.movies && {movies: MoviesModel.reduce(state.movies, patch.movies)},
  };
}
