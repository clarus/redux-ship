# ![Logo](https://raw.githubusercontent.com/clarus/icons/master/rocket-48.png) Redux Ship
> Scalable, testable and typable side effects for Redux

Redux Ship is a side effects handler for [Redux](https://github.com/reactjs/redux) [middleware](http://redux.js.org/docs/advanced/Middleware.html) which focuses on:

* **scalability:** you can reuse and compose sub-stores even with sharing, thanks to the *commit* and *patch* mechanism;
* **testing:** you can run unit tests of your side effects, by taking snapshots of their live execution traces;
* **typing:** you can type check your code with (almost) full coverage in [Flow](https://flowtype.org/).

Redux Ship with [redux-ship-logger](https://github.com/clarus/redux-ship-logger):

<img src='https://raw.githubusercontent.com/clarus/redux-ship-logger/master/logger.png' alt='Screenshot' width='700px'>

## Getting started
### Install
Run:
```
npm install --save redux-ship
```

You can optionally install [Flow](https://flowtype.org/) to get type checking.

### The Gist
This Gist gets the full name of Luke using the [Star Wars API](https://swapi.co/) (the full code is in [`example/basic`](https://github.com/clarus/redux-ship/tree/master/examples/basic)). In this example, we follow the [MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) pattern.

The controller is in Redux Ship:
```
export type Action = {
  type: 'Load',
};

export function* control(action: Action): Ship<Effect.Effect, Model.Action, Model.State, void> {
  switch (action.type) {
  case 'Load': {
    yield* dispatch({
      type: 'LoadStart',
    });
    const result = yield* Effect.httpRequest('http://swapi.co/api/people/1/');
    const fullName: ?string = JSON.parse(result).name;
    if (fullName) {
      yield* dispatch({
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

The model is in Redux:
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

The view is in [React](https://facebook.github.io/react/):
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

The definition of the side effects (you should keep this part minimal):
```
export type Effect = {
  type: 'HttpRequest',
  url: string,
};

export async function run(effect: Effect): Promise<any> {
  switch (effect.type) {
  case 'HttpRequest': {
    const response = await fetch(effect.url);
    return await response.text();
  }
  default:
    return;
  }
}

export function httpRequest<Action, State>(url: string): Ship<Effect, Action, State, string> {
  return call({
    type: 'HttpRequest',
    url,
  });
}
```

## API
* [`Ship<Effect, Action, State, A>`](#shipeffect-action-state-a)
* [`Snapshot<Effect, Action, State>`](#snapshoteffect-action-state)
* [`all`](#all)
* [`call`](#call)
* [`dispatch`](#dispatch)
* [`getState`](#getState)
* [`map`](#map)
* [`run`](#run)
* [`simulate`](#simulate)
* [`snap`](#snap)

#### `Ship<Effect, Action, State, A>`

The type of a ship returning a value of type `A` and using some side effects of type `Effect`, a Redux store with actions of type `Action` and a state of type `State`. A ship is a generator and can be defined using the `function*` syntax.

#### `Snapshot<Effect, Action, State>`

The type of the snapshot of an execution of a ship. A snapshot includes the side effects ran by a ship, as well as their execution order (sequential or concurrent).

#### `all`
```
<Effect, Action, State, A>(
  ships: Ship<Effect, Action, State, A>[]
) => Ship<Effect, Action, State, A[]>
```

Returns the array of results of the `ships` by running them in parallel. If you have a fixed number of tasks with different types of result to run in parallel, you can use:
```
all2(ship1, ship2)
all3(ship1, ship2, ship3)
...
all7(ship1, ship2, ship3, ship4, ship5, ship6, ship7)
```

#### `call`
```
<Effect, Action, State>(effect: Effect): Ship<Effect, Action, State, any>
```

Calls the effect `effect`. The type of the result is `any` because it depends on the value of the effect. Thus, to prevent type errors, we recommend to wrap your calls with one wrapper per kind of effect. For example, if the effects `HttpRequest` always return a `string`:

```
export function httpRequest<Action, State>(url: string): Ship<t, Action, State, string> {
  return Ship.call({
    type: 'HttpRequest',
    url,
  });
}
```

#### `dispatch`
```
<Effect, Action, State>(action: Action): Ship<Effect, Action, State, void>
```

Dispatches an action of type `Action` and waits for its termination.

#### `getState`
```
<Effect, Action, State>() => Ship<Effect, Action, State, State>
```

Returns the current state of type `State`.

#### `map`
```
<Effect, Action1, State1, Action2, State2, A>(
  liftAction: (action1: Action1) => Action2,
  liftState: (state2: State2) => State1,
  ship: Ship<Effect, Action1, State1, A>
): Ship<Effect, Action2, State2, A>
```

A function useful to compose nested stores. Lifts a `ship` with access to "small set" of actions `Action1` and a "small set" of states `State1` to a ship with access to the "larger sets" `Action2` and `State2`. This function iterates through the `ship` and replace each `getState()` by `liftState(getState())` and each `dispatch(action1)` by `dispatch(liftAction(action1))`.

#### `run`
```
<Effect, Action, State, A>(
  runEffect: (effect: Effect) => any,
  runDispatch: (action: Action) => void | Promise<void>,
  runGetState: () => State,
  ship: Ship<Effect, Action, State, A>
) => Promise<A>
```

Run a ship by evaluating each `call`, `dispatch` and `getState` with `runEffect`, `runDispatch` and `runGetState` respectively. To connect Redux Ship to a Redux `store`, you can do:

```
run(runEffect, store.dispatch, store.getState, ship);
```

#### `simulate`
```
<Effect, Action, State, A>(
  ship: Ship<Effect, Action, State, A>,
  snapshot: Snapshot<Effect, Action, State>
): Snapshot<Effect, Action, State>
```

Simulates a `ship` in the context of a `snapshot` and returns the snapshot of the simulation. A simulation is a purely functional (with no side effects) execution of a ship. Since there are many ways to execute a ship, we need a snapshot a previous live execution of the ship (with side effects). For example, if the ship runs an API request, the snapshot is used to give an answer to the API request. The result of `simulate` should be equal to `snapshot`, unless your ship was changed since its snapshot was taken.

#### `snap`
```
<Effect, Action, State, A>(
  ship: Ship<Effect, Action, State, A>
) => Ship<Effect, Action, State, {
  result: A,
  snapshot: Snapshot<Effect, Action, State>
}>
```

Returns a ship taking the snapshot and returning the result of `ship`.

## How does Redux Ship compare to X?
You might not need Redux Ship, especially for small projects. Here is an *opinionated* comparison of Redux Ship with some alternatives.

| | [Redux Thunk](https://github.com/gaearon/redux-thunk) | [Redux Sagas](https://github.com/yelouafi/redux-saga) | [Elm](http://elm-lang.org/) | Redux Ship |
|:---:|:---:|:---:|:---:|:---:|
| composition | - | - | ✔ | ✔ |
| testing | ~ | ✔ | - | ✔ |
| snapshots | - | - | - | ✔ |
| typing | ✔ | ~ | ✔ | ✔ |

* **composition:** the key to compose sub-parts of an application is the [`map`](#map) function. In Elm, the equivalent is the [`Cmd.map`](http://package.elm-lang.org/packages/elm-lang/core/4.0.5/Platform-Cmd#map) primitive;
* **testing:** we can test side effects with Redux Sagas and Redux Ship since both are generators. Using mocking, we can also test Thunks actions but with less control. We do not know how to test side effects in Elm;
* **snapshots:** the ability to take snapshots of executions of side effects is specific to Redux Ship;
* **typing:** there are type declarations for Redux Sagas, but in a typical instruction like `const state = yield select(selector);` you cannot get the type of `answer`. This limitation is due to the use of the `yield` keyword. In contrast, in Redux Ship, we only use the `yield*` keyword to get typing.

## License
MIT
