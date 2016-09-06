// @flow
import test from 'tape';
import * as Redux from 'redux';
import * as Ship from '../src/index';

type State = {
  counter: number,
};

const initialState: State = {
  counter: 0,
};

type Action = {
  type: 'Increment',
} | {
  type: 'Decrement',
} | {
  type: 'SlowIncrement',
};

function reduce(state: State, action: Action): State {
  switch (action.type) {
  case 'Increment':
    return {
      ...state,
      counter: state.counter + 1,
    };
  case 'Decrement':
    return {
      ...state,
      counter: state.counter - 1,
    };
  default:
    return state;
  }
}

function* slowIncrement(): Ship.t<Action, State, void> {
  yield* Ship.delay(1000);
  yield* Ship.next({
    type: 'Increment',
  });
}

function actionToShip(action: Action): Ship.t<Action, State, void> {
  switch (action.type) {
  case 'SlowIncrement':
    return slowIncrement();
  default:
    return Ship.next(action);
  }
}

const store = Redux.createStore(
  reduce,
  initialState,
  Redux.applyMiddleware(Ship.middleware(actionToShip))
);

test((t) => {
  t.deepEqual(store.getState(), initialState);
  t.end();
});
