// @flow
import * as Ship from 'redux-ship';
import * as Effect from './effect';
import * as Model from './model';

export type Action = {
  type: 'Load',
};

function* load() {
  yield* Ship.dispatch({
    type: 'LoadStart',
  });
  const obiWan = yield* Effect.httpRequest('http://swapi.co/api/people/10/');
  const starShipUrls: string[] = JSON.parse(obiWan).starships;
  const starShipNames = yield* Ship.all(starShipUrls.map(function* (starShipUrl) {
    const starShip = yield* Effect.httpRequest(starShipUrl);
    return JSON.parse(starShip).name;
  }));
  yield* Ship.dispatch({
    type: 'LoadSuccess',
    names: starShipNames,
  });
}

export function* control(action: Action): Ship.t<Effect.t, Model.Action, Model.State, void> {
  switch (action.type) {
  case 'Load': {
    return yield* load();
  }
  default:
    return;
  }
}
