# API Reference
* [`Ship<Effect, Commit, State, A>`](#shipeffect-commit-state-a)
* [`Snapshot<Effect, Commit>`](#snapshoteffect-commit)
* [`all`](#all)
* [`call`](#call)
* [`commit`](#commit)
* [`getState`](#getstate)
* [`map`](#map)
* [`run`](#run)
* [`simulate`](#simulate)
* [`snap`](#snap)

## `Ship<Effect, Commit, State, A>`

The type of a ship. A ship is a generator and can be defined using the `function*` syntax.

* `Effect` the type of the side effects the ship can call. We often use a single `Effect` type for a whole program
* `Commit` the type of the commits the ship can commit
* `State` the type of the state as visible from the ship
* `A` the type of the value returned by the ship (often `void`)

### Example
A controller to load a random gif:
```js
export function* control(action: Action): Ship.Ship<*, Commit, State, void> {
  switch (action.type) {
  case 'Load': {
    yield* Ship.commit({
      type: 'LoadStart',
    });
    const result = yield* Effect.httpRequest(
      `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${action.tag}`
    );
    const gifUrl: string = JSON.parse(result).data.image_url;
    yield* Ship.commit({
      type: 'LoadSuccess',
      gifUrl,
    });
    return;
  }
  default:
    return;
  }
}
```

## `Snapshot<Effect, Commit>`

The type of the snapshot of an execution of a ship. A snapshot includes the side effects ran by a ship, as well as their execution order (sequential or concurrent). You can take a snapshot with the [redux-ship-logger](https://github.com/clarus/redux-ship-logger) dev tools or with the [`snap`](#snap) function.

* `Effect` the type of effects in the snapshot
* `Commit` the type of commits in the snapshot

### Example
The snapshot of a controller loading a random gif:
```js
[
  {
    "type": "Commit",
    "commit": {
      "type": "LoadStart"
    }
  },
  {
    "type": "Effect",
    "effect": {
      "type": "HttpRequest",
      "url": "http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=minion"
    },
    "result": [...]
  },
  {
    "type": "Commit",
    "commit": {
      "type": "LoadSuccess",
      "gifUrl": "http://media3.giphy.com/media/HyanD1KpfzPiw/giphy.gif"
    }
  }
]
```

## `all`
```js
<Effect, Commit, State, A>(
  ships: Ship<Effect, Commit, State, A>[]
) => Ship<Effect, Commit, State, A[]>
```

Returns the array of results of the `ships` by running them in parallel. This is the equivalent of `Promise.all` in Ship.

* `ships` an array of ships to execute concurrently

If you have a fixed number of tasks with different types of result to run in parallel, you can use:
```js
all2(ship1, ship2)
all3(ship1, ship2, ship3)
...
all7(ship1, ship2, ship3, ship4, ship5, ship6, ship7)
```

### Example
To concurrently get three random gifs:
```js
const gifUrls = yield* Ship.all(['cat', 'minion', 'dog'].map(function* (tag) {
  const result = yield* Effect.httpRequest(
    `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${tag}`
  );
  return JSON.parse(result).data.image_url;
}));
```

## `call`
```js
<Effect, Commit, State>(
  effect: Effect
): Ship<Effect, Commit, State, any>
```

Calls the serialized effect `effect`. The type of the result is `any` because it depends on the value of the effect.

* `effect` the effect to call

### Example
To prevent type errors, we recommend to wrap your calls to `call` with one wrapper per kind of effect. For example, if you have an effect `HttpRequest` which always returns a `string`:

```js
export function httpRequest<Commit, State>(url: string): Ship<*, Commit, State, string> {
  return Ship.call({
    type: 'HttpRequest',
    url,
  });
}
```

## `commit`
```js
<Effect, Commit, State>(
  commit: Commit
): Ship<Effect, Commit, State, void>
```

Commits a commit of type `Commit` and waits for its termination.

* `commit` the commit to apply

### Example
To commit the result of a successful HTTP request:
```js
yield* Ship.commit({
  type: 'LoadSuccess',
  gifUrl,
});
```

## `getState`
```js
<Effect, Commit, State, A>(
  selector: (state: State) => A
): Ship<Effect, Commit, State, A>
```

Returns a part of the current state by applying a selector.

* `selector` a selector to extract the useful part of the current state

### Example
To get the current gif in the store:
```js
const currentGif = yield* Ship.getState(state => state.randomGif.gifUrl);
```

## `map`
```js
<Effect, Commit1, State1, Commit2, State2, A>(
  liftCommit: (commit: Commit1) => Commit2,
  extractState: (state2: State2) => State1,
  ship: Ship<Effect, Commit1, State1, A>
): Ship<Effect, Commit2, State2, A>
```

A function useful to compose nested components. Lifts a `ship` with access to "small set" of commits `Commit1` and a "small set" of states `State1` to a ship with access to the "larger sets" `Commit2` and `State2`. This function iterates through the `ship` and replace each `getState()` by `getState(state => selector(extractState(state)))` and each `commit(commit1)` by `commit(liftCommit(commit1))`.

* `liftCommit` lifts a local commit
* `extractState` extract the local state
* `ship` the ship to map

### Example
To lift a controller to retrieve one random gif to a controller to retrieve two random gifs:
```js
return yield* Ship.map(
  commit => ({type: 'First', commit}),
  state => ({
    counter: state.counter,
    randomGif: state.randomGifPair.first,
  }),
  RandomGifController.control(action.action)
);
```

## `run`
```js
<Effect, Commit, State, A>(
  runEffect: (effect: Effect) => any | Promise<any>,
  store: {
    dispatch: (commit: Commit) => void | Promise<void>,
    getState: () => State
  },
  ship: Ship<Effect, Commit, State, A>
) => Promise<A>
```

Runs a ship and its side effects by evaluating each primitive effect with `runEffect` and interpreting each call to Redux with the `store`.

* `runEffect` the function to evaluate a serialized side effect
* `store` the current Redux store
* `ship` the ship to execute

### Example
To connect Redux Ship to a Redux `store`, you can do:
```js
Ship.run(runEffect, store, ship);
```
where `runEffect` is your function to evaluate your side effects:
```js
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
```

## `simulate`
```js
<Effect, Commit, State, A>(
  ship: Ship<Effect, Commit, State, A>,
  snapshot: Snapshot<Effect, Commit, State>
): Snapshot<Effect, Commit, State>
```

Simulates a `ship` in the context of a `snapshot` and returns the snapshot of the simulation. A simulation is a purely functional (with no side effects) execution of a ship. Useful for regression testing.

To simulate a ship, we need a snapshot of a previous live execution because there are many ways to execute a ship. For example, if the ship starts an API request, we do not know which API answer to provide. In this case, we use the snapshot which already contains an API answer. Since the simulation always gives the same API answers as in the snapshot, the `ship` should behave the same as when its the snapshot was taken. In particular, the result of `simulate` should be equal to `snapshot`, unless `ship` had a regression since its snapshot was taken.

* `ship` the ship to simulate
* `snapshot` a snapshot of a previous execution of the ship

### Example
In a unit test of a controller:
```js
expect(Ship.simulate(control(action), snapshot)).toEqual(snapshot);
```

## `snap`
```js
<Effect, Commit, State, A>(
  ship: Ship<Effect, Commit, State, A>
) => Ship<Effect, Commit, State, {
  result: A,
  snapshot: Snapshot<Effect, Commit, State>
}>
```

Returns a ship taking the snapshot and returning the result of `ship`. You can also get snapshots of your controllers with [redux-ship-logger](https://github.com/clarus/redux-ship-logger).

* `ship` the ship to take in picture

### Example
To take the snapshot of a ship:
```js
const {result, snapshot} = yield* snap(ship);
```

To take the snapshot of a controller (the `result` should always be `undefined`):
```js
const {snapshot} = yield* snap(control(action));
```
