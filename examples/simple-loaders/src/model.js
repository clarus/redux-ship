// @flow
import * as EyeModel from './eye/model';

export type State = {
  eye: EyeModel.State,
};

export const initialState: State = {
  eye: EyeModel.initialState,
};

export type Patch = {
  eye?: EyeModel.Patch,
};

export function reduce(state: State, patch: Patch): State {
  return {
    ...state,
    ...patch.eye && {eye: EyeModel.reduce(state.eye, patch.eye)},
  };
}
