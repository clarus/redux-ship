// @flow

export type State = {
  color: ?string,
  isLoading: bool,
};

export const initialState: State = {
  color: null,
  isLoading: false,
};

export type Commit = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  color: string,
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
      color: commit.color,
      isLoading: false,
    };
  default:
    return state;
  }
}
