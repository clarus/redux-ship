# ![Logo](https://raw.githubusercontent.com/clarus/icons/master/rocket-48.png) Redux Ship
> Composable, typable and testable Redux middleware

Redux Ship is a [Redux](https://github.com/reactjs/redux) [middleware](http://redux.js.org/docs/advanced/Middleware.html) for side effects which focuses on:

* **composition:** you can duplicate and reuse sub-stores, as you would do with [React](https://facebook.github.io/react/) components;
* **typing:** you can type check your code with 100% coverage in [Flow](https://flowtype.org/);
* **testing:** you can run unit tests of your side effects, by taking snapshots of their execution traces.

## Getting started
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

## FAQ
### How does Redux Ship compare to X?
You may not need Redux Ship. To help your choice, here is an *opinionated* comparison of Redux Ship with some alternatives. These libraries were a great source of inspiration, and are probably better suited for you depending on your needs. If you find something wrong, feel free to open an issue!
* **[Redux Thunk:](https://github.com/gaearon/redux-thunk)** you dispatch promises rather than plain objects to run side effects, thus logging and testing can be complex. The `getState` function of a thunk always gives access to the global Redux state. Same thing for the `dispatch` function, which can dispatch actions to any reducer. In contrast, Redux Ship let you chose to only access the local store or to share some parts with other stores. As a result, composition with Ship is simplified.
* **[Redux Sagas:](https://github.com/yelouafi/redux-saga)** like in Redux Ship, side effects are represented as plain objects which map to generators in order to simplify the testing process. However, there are no snapshot mechanisms with Sagas so tests must be written by hand. Like in Redux Thunk, composing Sagas is difficult because the `select` / `put` functions only relate to the global state / actions. The Sagas cannot be completly typed, due to the use of the `yield` keyword (instead of `yield*`) and the destructuring of actions with `take` (instead of plain `switch`).
* **[Elm:](http://elm-lang.org/)** very similar to Redux Ship, as much composable and typable (using Flow). The `Task` and `Cmd` are the equivalent in Elm of the `Ship.t` type to represent side effects. We use the `function*` notation instead of the [`andThen`](http://package.elm-lang.org/packages/elm-lang/core/4.0.5/Task#andThen) operator to avoid the ["callback hell"](https://medium.com/@wavded/managing-node-js-callback-hell-1fe03ba8baf#.wt1ga0ocv). There seem to be no snapshot mechanisms to test side effects in Elm.
* **[Choo:](https://github.com/yoshuawuyts/choo)** has a restricted form of composition with the namespaces, but is probably not typable because of it (type checkers cannot understand the `'namespace:action'` convention). The side effects are represented with callbacks, hence subject to the "callback hell" effect and hard to test.

### License
MIT
