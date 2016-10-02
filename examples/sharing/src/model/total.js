// @flow

export type State = number;

export const initialState: State = 0;

export type Action = {
  type: 'Increment',
};

export function reduce(state: State, action: Action): State {
  switch (action.type) {
  case 'Increment':
    return state + 1;
  default:
    return state;
  }
}
