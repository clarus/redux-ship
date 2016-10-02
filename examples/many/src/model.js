// @flow
import * as LukeModel from './luke/model';

export type State = {
  first: LukeModel.State,
  second: LukeModel.State,
};

export const initialState: State = {
  first: LukeModel.initialState,
  second: LukeModel.initialState,
};

export type Action = {
  type: 'First',
  action: LukeModel.Action,
} | {
  type: 'Second',
  action: LukeModel.Action,
};

export function reduce(state: State, action: Action): State {
  switch (action.type) {
  case 'First':
    return {
      ...state,
      first: LukeModel.reduce(state.first, action.action),
    };
  case 'Second':
    return {
      ...state,
      second: LukeModel.reduce(state.second, action.action),
    };
  default:
    return state;
  }
}
