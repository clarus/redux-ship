// @flow

export type State = {
  isLoading: bool,
  movies: ?(string[]),
};

export const initialState: State = {
  isLoading: false,
  movies: null,
};

export type Patch = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  movies: string[],
};

export function reduce(state: State, patch: Patch): State {
  switch (patch.type) {
  case 'LoadStart':
    return {
      ...state,
      isLoading: true,
    };
  case 'LoadSuccess':
    return {
      ...state,
      isLoading: false,
      movies: patch.movies,
    };
  default:
    return state;
  }
}
