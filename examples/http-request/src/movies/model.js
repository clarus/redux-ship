// @flow

export type State = {
  isLoading: bool,
  movies: ?(string[]),
};

export const initialState: State = {
  isLoading: false,
  movies: null,
};

export type Commit = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  movies: string[],
};

export function reduce(state: State, commit: Commit): State {
  switch (commit.type) {
  case 'LoadStart':
    return {
      ...state,
      isLoading: true,
    };
  case 'LoadSuccess':
    return {
      ...state,
      isLoading: false,
      movies: commit.movies,
    };
  default:
    return state;
  }
}
