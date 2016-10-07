# ![Logo](https://raw.githubusercontent.com/clarus/icons/master/rocket-48.png) Redux Ship
> Composable, testable and typable side effects for Redux

Redux Ship is a side effects handler for [Redux](https://github.com/reactjs/redux) [middleware](http://redux.js.org/docs/advanced/Middleware.html) which focuses on:

* **composition:** you can reuse and compose sub-stores, as you would do with [React](https://facebook.github.io/react/) components;
* **testing:** you can run unit tests of your side effects, by taking snapshots of their live execution traces;
* **typing:** you can type check your code with 100% coverage in [Flow](https://flowtype.org/).

## Getting started
### Install
Run:
```
npm install --save redux-ship
```

You may also need to install [Flow](https://flowtype.org/) if you want to get type checking.

### The Gist
This Gist gets the full name of Luke using the [Star Wars API](https://swapi.co/) (the full code is in `example/basic`).

The controller in Redux Ship:
```
export type Action = {
  type: 'Load',
};

export function* control(action: Action): Ship.t<Effect.t, Model.Action, Model.State, void> {
  switch (action.type) {
  case 'Load': {
    yield* Ship.dispatch({
      type: 'LoadStart',
    });
    const result = yield* Effect.httpRequest('http://swapi.co/api/people/1/');
    const fullName: ?string = JSON.parse(result).name;
    if (fullName) {
      yield* Ship.dispatch({
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
```

The model in Redux:
```
export type State = {
  isLoading: bool,
  fullName: ?string,
};

export const initialState: State = {
  isLoading: false,
  fullName: null,
};

export type Action = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  fullName: string,
};

export function reduce(state: State, action: Action): State {
  switch (action.type) {
  case 'LoadStart':
    return {
      ...state,
      isLoading: true,
    };
  case 'LoadSuccess':
    return {
      ...state,
      isLoading: false,
      fullName: action.fullName,
    };
  default:
    return state;
  }
}
```

The view in [React](https://facebook.github.io/react/):
```
type Props = {
  dispatch: (action: Controller.Action) => void,
  state: Model.State,
};

export default class App extends Component<void, Props, void> {
  handleClick: () => void = () => {
    this.props.dispatch({
      type: 'Load',
    });
  };

  render() {
    return (
      <div className="App-content">
        <button
          disabled={this.props.state.isLoading}
          onClick={this.handleClick}
        >
          {this.props.state.isLoading ? 'Loading' : 'Get Luke\'s full name'}
        </button>
        <p>
          {this.props.state.fullName}
        </p>
      </div>
    );
  }
}
```

The effects (declared once for the whole program):
```
export type t = {
  type: 'HttpRequest',
  url: string,
};

export async function run(effect: t): Promise<any> {
  switch (effect.type) {
  case 'HttpRequest': {
    const response = await fetch(effect.url);
    return await response.text();
  }
  default:
    return;
  }
}

export function httpRequest<Action, State>(url: string): Ship.t<t, Action, State, string> {
  return Ship.call({
    type: 'HttpRequest',
    url,
  });
}
```

## API
Import all the functions with:
```
import * as Ship from 'redux-ship';
```

#### `Ship.t<Effect, Action, State, A>`

The type of a Redux Ship side effect returning a value of type `A` and using some side effects of type `Effect`, a Redux store with actions of type `Action` and a state of type `State`. A Ship is a generator and can be defined using the `function*` syntax.

#### `dispatch`
```
<Effect, Action, State>(action: Action): Ship.t<Effect, Action, State, void>
```

Dispatches an action of type `Action` and waits for its termination.

#### `getState`
```
<Effect, Action, State>() => Ship.t<Effect, Action, State, State>
```

Returns the current state of type `State`.

#### `call`
```
<Effect, Action, State>(effect: Effect): Ship.t<Effect, Action, State, any>
```

Calls the effect `effect`. The type of the result is `any` because it depends on the value of the effect. Thus, to prevent type errors, we recommend to wrap your calls with one wrapper per kind of effect. For example, if the effects `HttpRequest` always return a `string`:

```
export function httpRequest<Action, State>(url: string): Ship.t<t, Action, State, string> {
  return Ship.call({
    type: 'HttpRequest',
    url,
  });
}
```

#### `all`
```
<Effect, Action, State, A>(
  ships: Ship.t<Effect, Action, State, A>[]
) => Ship.t<Effect, Action, State, A[]>
```

Returns the array of results of the `ships` by running them in parallel. If you have a fixed number of tasks with different types of result to run in parallel, you can use:
```
all2(ship1, ship2)
all3(ship1, ship2, ship3)
...
all7(ship1, ship2, ship3, ship4, ship5, ship6, ship7)
```

#### `map`
```
<Effect, Action1, State1, Action2, State2, A>(
  liftAction: (action1: Action1) => Action2,
  liftState: (state2: State2) => State1,
  ship: Ship.t<Effect, Action1, State1, A>
): Ship.t<Effect, Action2, State2, A>
```

A function useful to compose nested stores. Lifts a `ship` with access to "small set" of actions `Action1` and a "small set" of states `State1` to a ship with access to the "larger sets" `Action2` and `State2`. This function iterates through the `ship` and replace each `getState()` by `liftState(getState())` and each `dispatch(action1)` by `dispatch(liftAction(action1))`.

#### `run`
```
<Effect, Action, State, A>(
  runEffect: (effect: Effect) => any,
  runDispatch: (action: Action) => void | Promise<void>,
  runGetState: () => State,
  ship: Ship.t<Effect, Action, State, A>
) => Promise<A>
```

Run a ship by evaluating each `call`, `dispatch` and `getState` with `runEffect`, `runDispatch` and `runGetState` respectively. To connect Redux Ship to a Redux `store`, you can do:

```
run(runEffect, store.dispatch, store.getState, ship);
```


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
