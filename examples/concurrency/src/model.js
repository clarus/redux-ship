// @flow

export type State = {
  isLoading: bool,
  names: ?(string[]),
};

export const initialState: State = {
  isLoading: false,
  names: null,
};

export type Action = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  names: string[],
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
      names: action.names,
    };
  default:
    return state;
  }
}
