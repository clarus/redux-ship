// @flow
// In this file we define the type of the state of our application and how it
// can evolve. This is basically where we put all our Redux code. We prefer
// to name the actions `commit`. Thus we differentiate the commits from the
// actions dispatched by the React components, which are given to the Ship
// middleware. Then the Ship middleware generates commits which are evaluated
// by the reducer.

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
