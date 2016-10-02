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
      (action) => {
        switch (action.type) {
        case 'Luke':
          return {
            type: 'First',
            action: action.action,
          };
        case 'Total':
          return {
            type: 'Total',
            action: action.action,
          };
        default:
          return action;
        }
      },
      (state) => ({
        luke: state.first,
        total: state.total,
      }),
      LukeController.control(action.action)
    );
  case 'Second':
    return yield* Ship.map(
      (action) => {
        switch (action.type) {
        case 'Luke':
          return {
            type: 'Second',
            action: action.action,
          };
        case 'Total':
          return {
            type: 'Total',
            action: action.action,
          };
        default:
          return action;
        }
      },
      (state) => ({
        luke: state.second,
        total: state.total,
      }),
      LukeController.control(action.action)
    );
  default:
    return;
  }
}
