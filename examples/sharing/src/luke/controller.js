// @flow
import * as Ship from 'redux-ship';
import * as Effect from '../effect';
import * as Model from './model';
import * as ModelTotal from '../model/total';

export type Action = {
  type: 'Load',
};

export type ModelAction = {
  type: 'Luke',
  action: Model.Action,
} | {
  type: 'Total',
  action: ModelTotal.Action,
};

export type ModelState = {
  luke: Model.State,
  total: ModelTotal.State,
};

export function* control(action: Action): Ship.Ship<Effect.t, ModelAction, ModelState, void> {
  switch (action.type) {
  case 'Load': {
    yield* Ship.dispatch({
      type: 'Luke',
      action: {
        type: 'LoadStart',
      },
    });
    yield* Ship.dispatch({
      type: 'Total',
      action: {
        type: 'Increment',
      },
    });
    const result = yield* Effect.httpRequest('http://swapi.co/api/people/1/');
    const fullName: ?string = JSON.parse(result).name;
    if (fullName) {
      yield* Ship.dispatch({
        type: 'Luke',
        action: {
          type: 'LoadSuccess',
          fullName,
        },
      });
    }
    return;
  }
  default:
    return;
  }
}
