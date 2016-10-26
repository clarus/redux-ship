// @flow

export type State = {
  gifUrl: ?string,
  isLoading: bool,
};

export const initialState: State = {
  gifUrl: null,
  isLoading: false,
};

export type Patch = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  gifUrl: string,
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
      gifUrl: patch.gifUrl,
    };
  default:
    return state;
  }
}
