// @flow
import * as Ship from 'redux-ship';
import * as Model from './model';

export type Action = {
  type: 'ClickIncrement',
} | {
  type: 'ClickDecrement',
};

export function* control(action: Action): Ship.Ship<*, Model.Patch, Model.State, void> {
  switch (action.type) {
  case 'ClickIncrement':
    yield* Ship.commit({type: 'Increment'});
    return;
  case 'ClickDecrement':
    yield* Ship.commit({type: 'Decrement'});
    return;
  default:
    return;
  }
}
