// @flow

export type State = {
  isLoading: bool,
  fullName: ?string,
};

export const initialState: State = {
  isLoading: false,
  fullName: null,
};

export type Action = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  fullName: string,
};

export function reduce(state: State, action: Action): State {
  switch (action.type) {
  case 'LoadStart':
    return {
      ...state,
      isLoading: true,
    };
  case 'LoadSuccess':
    return {
      ...state,
      isLoading: false,
      fullName: action.fullName,
    };
  default:
    return state;
  }
}
