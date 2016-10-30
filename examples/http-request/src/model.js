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
  type: 'Eye',
  patch: EyeModel.Patch,
} | {
  type: 'Movies',
  patch: MoviesModel.Patch,
};

export function reduce(state: State, patch: Patch): State {
  switch (patch.type) {
  case 'Eye':
    return {
      ...state,
      eye: EyeModel.reduce(state.eye, patch.patch),
    };
  case 'Movies':
    return {
      ...state,
      movies: MoviesModel.reduce(state.movies, patch.patch),
    };
  default:
    return state;
  }
}
