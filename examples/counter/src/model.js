// @flow
export type State = number;

export const initialState = 0;

export type Commit = {
  type: 'Increment',
} | {
  type: 'Decrement',
};

export function reduce(state: State, commit: Commit): State {
  switch (commit.type) {
  case 'Increment':
    return state + 1;
  case 'Decrement':
    return state - 1;
  default:
    return state;
  }
}
