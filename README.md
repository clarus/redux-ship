# ![Logo](https://raw.githubusercontent.com/clarus/icons/master/rocket-48.png) Redux Ship
> Scalable, testable and typable side effects for Redux

Redux Ship is a side effects handler for [Redux](https://github.com/reactjs/redux) [middleware](http://redux.js.org/docs/advanced/Middleware.html) which focuses on:

* **scalability:** you can reuse and compose sub-stores even with sharing, thanks to the *commit* and *patch* mechanism;
* **testing:** you can run unit tests of your side effects, by taking snapshots of their live execution traces;
* **typing:** you can type check your code with (almost) full coverage in [Flow](https://flowtype.org/).

Redux Ship with [redux-ship-logger](https://github.com/clarus/redux-ship-logger):

<img src='https://raw.githubusercontent.com/clarus/redux-ship-logger/master/logger.png' alt='Screenshot' width='700px'>

## Install
Run:
```
npm install --save redux-ship
```

You can optionally install [Flow](https://flowtype.org/) to get type checking and [redux-ship-logger](https://github.com/clarus/redux-ship-logger) to get logging.

## Architecture
Redux Ship is based on the [Model–view–controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) and the [Flux](https://facebook.github.io/flux/docs/overview.html) architecture.

<img src='https://cdn.rawgit.com/clarus/redux-ship/master/architecture.svg' alt='Architecture' width='500px'>

This architecture is composable and applies both to the whole application and to each component.

### Model
The current state of the component / application, handled by Redux. We modify the model by applying serializable *patches*.

### View
The HTML displayed by the component / application, handled by React. Updates automatically when the model changes. We only have dumb components (without logics). The view dispatches serializable *actions* to the controller in response to user events.

### Controller
Manages side effects like interactions with the server. Written with Redux Ship. The controller handles an action by calling some side effects and by emitting some serializable *commits* to the model. A commit may be formed of one or several patches if it is destined to one or several models. Think commits in Git which can have several patches on different files. A Ship controller is implemented as a generator and each execution is serializable as a *snapshot*.

## How does Redux Ship compare to X?
You might not need Redux Ship, especially for small projects. Here is an *opinionated* comparison of Redux Ship with some alternatives.

| | [Redux Thunk](https://github.com/gaearon/redux-thunk) | [Redux Sagas](https://github.com/yelouafi/redux-saga) | [Elm](http://elm-lang.org/) | Redux Ship |
|:---:|:---:|:---:|:---:|:---:|
| scalability | ~ | ~ | ~ | ✔ |
| testing | ~ | ✔ | ~ | ✔ |
| snapshots | - | - | - | ✔ |
| typing | ✔ | ~ | ✔ | ✔ |

* **scalability:** we can easily compose components with a shared global state in Redux Thunk or Redux Sagas. The Elm architecture is more suited for components with independent local states. Thanks to the [`map`](#map) primitive and the commit / patch mechanism, Redux Ship offers a built-in solution to compose component with both a shared and a local state.
* **testing:** we can test side effects with Redux Sagas and Redux Ship since both are generators. Using mocking, we can also test Thunks actions but with less control. In Elm, we can use [elm-testable](http://package.elm-lang.org/packages/avh4/elm-testable/latest), but this requires to rewrite everything using `Testable.Cmd` instead of the standard `Cmd`.
* **snapshots:** the ability to take snapshots of the execution of side effects is specific to Redux Ship. We believe this is a key feature to make tests of side effects simple and reproducible.
* **typing:** Elm has excellent typing. We can add typing to Redux Thunk with Flow. There are type declarations for Redux Sagas, but in a typical instruction like `const state = yield select(selector);` we cannot get the type of `answer`. This limitation is due to the use of the `yield` keyword in the generators. In contrast, in Redux Ship, we only use the `yield*` keyword to get full typing.

## API
* [`Ship<Effect, Commit, State, A>`](#shipeffect-commit-state-a)
* [`Snapshot<Effect, Commit>`](#snapshoteffect-commit)
* [`all`](#all)
* [`call`](#call)
* [`commit`](#commit)
* [`getState`](#getState)
* [`map`](#map)
* [`run`](#run)
* [`simulate`](#simulate)
* [`snap`](#snap)

### `Ship<Effect, Commit, State, A>`

The type of a ship returning a value of type `A` and using some side effects of type `Effect`, a Redux store with commits of type `Commit` and a state of type `State`. A ship is a generator and can be defined using the `function*` syntax.

### `Snapshot<Effect, Commit>`

The type of the snapshot of an execution of a ship. A snapshot includes the side effects ran by a ship, as well as their execution order (sequential or concurrent).

### `all`
```js
<Effect, Commit, State, A>(
  ships: Ship<Effect, Commit, State, A>[]
) => Ship<Effect, Commit, State, A[]>
```

Returns the array of results of the `ships` by running them in parallel. If you have a fixed number of tasks with different types of result to run in parallel, you can use:
```js
all2(ship1, ship2)
all3(ship1, ship2, ship3)
...
all7(ship1, ship2, ship3, ship4, ship5, ship6, ship7)
```

### `call`
```js
<Effect, Commit, State>(effect: Effect): Ship<Effect, Commit, State, any>
```

Calls the effect `effect`. The type of the result is `any` because it depends on the value of the effect. Thus, to prevent type errors, we recommend to wrap your calls with one wrapper per kind of effect. For example, if the effects `HttpRequest` always return a `string`:

```js
export function httpRequest<Commit, State>(url: string): Ship<t, Commit, State, string> {
  return Ship.call({
    type: 'HttpRequest',
    url,
  });
}
```

### `commit`
```js
<Effect, Commit, State>(commit: Commit): Ship<Effect, Commit, State, void>
```

Commits a commit of type `Commit` and waits for its termination.

### `getState`
```js
<Effect, Commit, State>() => Ship<Effect, Commit, State, State>
```

Returns the current state of type `State`.

### `map`
```js
<Effect, Commit1, State1, Commit2, State2, A>(
  liftCommit: (commit: Commit1) => Commit2,
  liftState: (state2: State2) => State1,
  ship: Ship<Effect, Commit1, State1, A>
): Ship<Effect, Commit2, State2, A>
```

A function useful to compose nested stores. Lifts a `ship` with access to "small set" of commits `Commit1` and a "small set" of states `State1` to a ship with access to the "larger sets" `Commit2` and `State2`. This function iterates through the `ship` and replace each `getState()` by `liftState(getState())` and each `commit(commit1)` by `commit(liftCommit(commit1))`.

### `run`
```js
<Effect, Commit, State, A>(
  runEffect: (effect: Effect) => any,
  runCommit: (commit: Commit) => void | Promise<void>,
  runGetState: () => State,
  ship: Ship<Effect, Commit, State, A>
) => Promise<A>
```

Run a ship by evaluating each `call`, `commit` and `getState` with `runEffect`, `runCommit` and `runGetState` respectively. To connect Redux Ship to a Redux `store`, you can do:

```js
run(runEffect, store.dispatch, store.getState, ship);
```

### `simulate`
```js
<Effect, Commit, State, A>(
  ship: Ship<Effect, Commit, State, A>,
  snapshot: Snapshot<Effect, Commit, State>
): Snapshot<Effect, Commit, State>
```

Simulates a `ship` in the context of a `snapshot` and returns the snapshot of the simulation. A simulation is a purely functional (with no side effects) execution of a ship. Since there are many ways to execute a ship, we need a snapshot a previous live execution of the ship (with side effects). For example, if the ship runs an API request, the snapshot is used to give an answer to the API request. The result of `simulate` should be equal to `snapshot`, unless your ship was changed since its snapshot was taken.

### `snap`
```js
<Effect, Commit, State, A>(
  ship: Ship<Effect, Commit, State, A>
) => Ship<Effect, Commit, State, {
  result: A,
  snapshot: Snapshot<Effect, Commit, State>
}>
```

Returns a ship taking the snapshot and returning the result of `ship`.

## License
MIT
