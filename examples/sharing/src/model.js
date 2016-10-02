// @flow
import * as LukeModel from './luke/model';
import * as ModelTotal from './model/total';

export type State = {
  first: LukeModel.State,
  second: LukeModel.State,
  total: ModelTotal.State,
};

export const initialState: State = {
  first: LukeModel.initialState,
  second: LukeModel.initialState,
  total: ModelTotal.initialState,
};

export type Action = {
  type: 'First',
  action: LukeModel.Action,
} | {
  type: 'Second',
  action: LukeModel.Action,
} | {
  type: 'Total',
  action: ModelTotal.Action,
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
  case 'Total':
    return {
      ...state,
      total: ModelTotal.reduce(state.total, action.action),
    };
  default:
    return state;
  }
}
