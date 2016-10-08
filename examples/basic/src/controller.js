// @flow
import type {Ship} from 'redux-ship';
import {dispatch} from 'redux-ship';
import * as Effect from './effect';
import * as Model from './model';

export type Action = {
  type: 'Load',
};

export function* control(action: Action): Ship<Effect.Effect, Model.Action, Model.State, void> {
  switch (action.type) {
  case 'Load': {
    yield* dispatch({
      type: 'LoadStart',
    });
    const result = yield* Effect.httpRequest('http://swapi.co/api/people/1/');
    const fullName: ?string = JSON.parse(result).name;
    if (fullName) {
      yield* dispatch({
        type: 'LoadSuccess',
        fullName,
      });
    }
    return;
  }
  default:
    return;
  }
}
