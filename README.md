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
  yield* Ship.call1(showState, state);
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

## API
Import all the functions with:
```
import * as Ship from 'redux-ship';
```
* `Ship.t<Action, State, A>`

The type of a Redux Ship side effect returning a value of type `A` and using a Redux store with actions of type `Action` and a state of type `State`. A Ship is a generator and is usually defined using the `function*` syntax.

* `getState: <Action, State>() => Ship.t<Action, State, State>`

Returns the current state of type `State`.

* `dispatch: <Action, State>(action: Action) => Ship.t<Action, State, void>`

Dispatches an action of type `Action` and waits for its termination.

* `call1: <Action, State, A1, B>(fn: (arg1: A1) => B | Promise<B> | Ship.t<Action, State, B>, arg1: A1) => Ship.t<Action, State, B>`

The expression `call1(fn, arg1)` returns the result of `fn(arg1)`. During testing, you can check for both the value of `arg1` and `fn(arg1)`. Similarly, there are the functions:
```
call2(fn, arg1, arg2)
call3(fn, arg1, arg2, arg3)
...
call7(fn, arg1, arg2, arg3, arg4, arg5, arg6, arg7)
```

* `all: <Action, State, A>(ships: t<Action, State, A>[]) => t<Action, State, A[]>`

Returns the array of results of the `ships` by running them in parallel. If you have a fixed number of tasks with different types of result to run in parallel, you can use:
```
all2(ship1, ship2)
all3(ship1, ship2, ship3)
...
all7(ship1, ship2, ship3, ship4, ship5, ship6, ship7)
```

* `map: <Action1, State1, Action2, State2, A>(ship: ?Ship.t<Action1, State1, A>, mapAction: (action1: Action1) => Action2, mapState: (state2: State2) => State1) => ?Ship.t<Action2, State2, A>`

A function useful to compose nested stores. Lifts a `ship` with access to "small set" of actions `Action1` and a "small set" of states `State1` to a ship with access to the "larger sets" `Action2` and `State2`. This function iterates through the `ship` and replace each `getState()` by `mapState(getState())` and each `dispatch(action1)` by `dispatch(mapAction(action1))`. For convenience, returns `null` if `ship` is `null`.

* `middleware: <Action, State>(actionToShip: (action: Action) => ?Ship.t<Action, State, void>) => ReduxMiddleware<Action, State>`

Creates a Redux Ship middleware for a store with actions of type `Action` and a state of type `State`. The parameter `actionToShip` maps an `action` to either a Ship side effect or `null`. If `actionToShip(action)` is a Ship effect, then `dispatch(action)` returns a promise of type `Promise<void>` terminating when the side effect terminates, so that you can wait for the Ship effect to complete. If `actionToShip(action)` is `null`, then `dispatch(action)` returns the result of the next middleware.

## FAQ
### How does Redux Ship compare to X?
You may not need Redux Ship. To help your choice, here is an *opinionated* comparison of Redux Ship with some alternatives. These libraries were a great source of inspiration, and are probably better suited for you depending on your needs. If you find a mistake, feel free to open an issue!
* **[Redux Thunk:](https://github.com/gaearon/redux-thunk)**
you dispatch promises instead of plain objects to run side effects, thus logging and testing can be complex. The `getState` function of a thunk always gives access to the global Redux state. Similarly, the `dispatch` function can dispatch actions to any reducer. In contrast, Redux Ship let you chose to either only access to the local store or share some data with other stores. As a result, composition with Ship is simplified.
* **[Redux Sagas:](https://github.com/yelouafi/redux-saga)**
like in Redux Ship, side effects are represented as plain objects which map to generators in order to simplify the testing process. However, there are no snapshot mechanisms with Sagas so tests must be written by hand. Like in Redux Thunk, composing Sagas is difficult because the `select` / `put` functions only relate to the global state / actions. The Sagas cannot be completly typed, due to the use of the `yield` keyword (instead of `yield*`) and the destructuring of actions with `take` (instead of plain `switch`).
* **[Elm:](http://elm-lang.org/)**
very similar to Redux Ship, as much composable and typable (using Flow). The `Task` and `Cmd` are the equivalent in Elm of the `Ship.t` type to represent side effects. We use the `function*` notation instead of the [`andThen`](http://package.elm-lang.org/packages/elm-lang/core/4.0.5/Task#andThen) operator to avoid the ["callback hell"](https://medium.com/@wavded/managing-node-js-callback-hell-1fe03ba8baf#.wt1ga0ocv). There seem to be no snapshot mechanisms to test side effects in Elm.
* **[Choo:](https://github.com/yoshuawuyts/choo)**
has a restricted form of composition with namespaces, but is probably not typable because of it (type checkers cannot understand the `'namespace:action'` convention). The side effects are represented with callbacks, hence subject to the "callback hell" effect and hard to test.

### Is there a subscription mechanism?
Elm and Choo provide a [Subscription](http://www.elm-tutorial.org/en/03-subs-cmds/01-subs.html) mechanism to listen to a source of actions. Redux Sagas provides the [Channel](https://yelouafi.github.io/redux-saga/docs/advanced/Channels.html) system.

In contrast, Redux Ship only listens to Redux actions. To subscribe to, for example, a real time API, you need to make Redux subscribe to that API by calling a `store.dispatch` each time a new value is received. See for example [Real time data flow with Redux and Socket.io](http://spraso.com/real-time-data-flow-with-redux-and-socket-io/).

## License
MIT
