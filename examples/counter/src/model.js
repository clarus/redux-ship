// @flow
export type State = number;

export const initialState = 0;

export type Patch = {
  type: 'Increment',
} | {
  type: 'Decrement',
};

export function reduce(state: State, patch: Patch): State {
  switch (patch.type) {
  case 'Increment':
    return state + 1;
  case 'Decrement':
    return state - 1;
  default:
    return state;
  }
}
