// @flow
import * as Ship from 'redux-ship';
import * as Effect from '../effect';
import * as EyeModel from './model';

export type Action = {
  type: 'Load',
};

export type Commit = EyeModel.Patch;

export type State = EyeModel.State;

export function* control(action: Action): Ship.Ship<*, Commit, State, void> {
  switch (action.type) {
  case 'Load': {
    yield* Ship.commit({type: 'LoadStart'});
    const r2d2 = yield* Effect.httpRequest('http://swapi.co/api/people/3/');
    const eyeColor = JSON.parse(r2d2).eye_color;
    yield* Ship.commit({type: 'LoadSuccess', color: eyeColor});
    return;
  }
  default:
    return;
  }
}
