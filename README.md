# ![Logo](https://raw.githubusercontent.com/clarus/icons/master/rocket-48.png) Redux Ship
> Composable, typable and testable Redux middleware

Redux Ship is a [Redux](https://github.com/reactjs/redux) [middleware](http://redux.js.org/docs/advanced/Middleware.html) for side effects which focuses on:

* composition: you can duplicate and reuse sub-stores, as you would do with [React](https://facebook.github.io/react/) components;
* typing: you can type check your code with 100% coverage in [Flow](https://flowtype.org/);
* testing: you can run unit tests of your side effects, by taking snapshots of their execution traces.

### Install
Run:
```
npm install --save redux-ship
```

You may also need to install [Flow](https://flowtype.org/) if you want to get type checking.

### The Gist
A counter, with a `SlowIncrement` action:
```
// @flow
// counter.js
import * as Ship from 'redux-ship';

export type State = {
  counter: number,
};

export const initialState: State = {
  counter: 0,
};

export type Action = {
  type: 'Increment',
} | {
  type: 'Decrement',
} | {
  type: 'SlowIncrement',
};

export function reduce(state: State, action: Action): State {
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

function showState(state: State): void {
  console.log('Hi, this is the current state: ', state);
}

function* slowIncrement(): Shipt.t<Action, State, void> {
  const state = yield* Ship.getState();
  yield* Ship.impure1(showState, state);
  yield* Ship.delay(1000);
  yield* Ship.dispatch({
    type: 'Increment',
  });
}

export function actionToShip(action: Action): ?Ship.t<Action, State, void> {
  switch (action.type) {
    case 'SlowIncrement':
      return slowIncrement();
    default:
      return null;
  }
}
```

Instanciate your Redux store with:
```
// @flow
// store.js
import * as Redux from 'redux';
import * as Ship from 'redux-ship';
import * as Counter from './counter';

const middlewares = [
  Ship.middleware(Counter.actionToShip),
];

export default Redux.createStore(
  Counter.reduce,
  Counter.initialState,
  Redux.applyMiddleware(...middlewares),
);
```

### Influences
Redux Ship is mainly influenced by the [Elm architecture](http://guide.elm-lang.org/architecture/) and [Redux Sagas](https://github.com/yelouafi/redux-saga).

### License
MIT
