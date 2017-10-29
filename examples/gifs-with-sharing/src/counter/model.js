// @flow

export type State = {
  count: number,
};

export const initialState: State = {
  count: 0,
};

export type Patch = {
  type: 'IncrementByOne',
} | {
  type: 'IncrementByTwo',
};

export function reduce(state: State, patch: Patch): State {
  switch (patch.type) {
  case 'IncrementByOne':
    return {
      ...state,
      count: state.count + 1,
    };
  case 'IncrementByTwo':
    return {
      ...state,
      count: state.count + 2,
    };
  default:
    return state;
  }
}
