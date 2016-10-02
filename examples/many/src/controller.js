// @flow
import * as Ship from 'redux-ship';
import * as Effect from './effect';
import * as LukeController from './luke/controller';
import * as Model from './model';

export type Action = {
  type: 'First',
  action: LukeController.Action,
} | {
  type: 'Second',
  action: LukeController.Action,
};

export function* control(action: Action): Ship.t<Effect.t, Model.Action, Model.State, void> {
  switch (action.type) {
  case 'First':
    return yield* Ship.map(
      (action) => ({
        type: 'First',
        action,
      }),
      (state) => state.first,
      LukeController.control(action.action)
    );
  case 'Second':
    return yield* Ship.map(
      (action) => ({
        type: 'Second',
        action,
      }),
      (state) => state.second,
      LukeController.control(action.action)
    );
  default:
    return;
  }
}
