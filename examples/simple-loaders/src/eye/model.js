// @flow

export type State = {
  color: ?string,
  isLoading: bool,
};

export const initialState: State = {
  color: null,
  isLoading: false,
};

export type Patch = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  color: string,
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
      color: patch.color,
      isLoading: false,
    };
  default:
    return state;
  }
}
