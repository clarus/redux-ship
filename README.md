# ![Logo](https://raw.githubusercontent.com/clarus/icons/master/rocket-48.png) Redux Ship
> Scalable, testable and typable side effects for Redux

Redux Ship is a side effects handler for [Redux](https://github.com/reactjs/redux) which focuses on:

* **scalability:** you can reuse and compose sub-stores, thanks to the [`Ship.map`](https://clarus.github.io/redux-ship/docs/api.html) primitive;
* **testing:** you can run unit tests of your side effects, by taking snapshots of their live execution traces;
* **typing:** you can type check your code with (almost) full coverage in [Flow](https://flowtype.org/).

Inspired by:

* [Elm](http://elm-lang.org/) for the composition mechanism and type checking;
* [Redux Saga](https://github.com/yelouafi/redux-saga) for the use of generators to test side-effects;
* [Jest](https://facebook.github.io/jest/) for the idea of [snapshot testing](http://facebook.github.io/jest/docs/tutorial-react.html#snapshot-testing).

See a [demo with reusable components and shared state](http://clarus.github.io/redux-ship/examples/gifs/).

Redux Ship with [redux-ship-logger](https://github.com/clarus/redux-ship-logger):

<img src='https://raw.githubusercontent.com/clarus/redux-ship-logger/master/logger.png' alt='Screenshot' width='700px'>

## Install
Run:
```
npm install --save redux-ship
```
or
```
yarn add redux-ship
```

You can optionally install [Flow](https://flowtype.org/) to get type checking and [redux-ship-logger](https://github.com/clarus/redux-ship-logger) to get logging.

## Gist
Write side effects with the generator notation as in [Redux Saga](https://github.com/yelouafi/redux-saga):
```js
const gifUrls = yield* Ship.all(['cat', 'minion', 'dog'].map(function* (tag) {
  const result = yield* Effect.httpRequest(
    `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${tag}`
  );
  return JSON.parse(result).data.image_url;
}));
```

Compose and type-check components with side effects as in [Elm](http://elm-lang.org/):
```js
// 100% Flow type coverage in this example
return yield* Ship.map(
  commit => ({type: 'Movies', commit}),
  state => state.movies,
  MoviesController.control(action.action)
);
```

Test side effects with snapshots of their complete execution:
```js
const liveSnapshot =
  {"action":{"type":"Load"},"snapshot":[{"type":"Commit","commit":{"type":"LoadStart"}},{"type":"Effect","effect":{"type":"HttpRequest","url":"http://swapi.co/api/people/3/"},"result":"{\"name\":\"R2-D2\",\"height\":\"96\",\"mass\":\"32\",\"hair_color\":\"n/a\",\"skin_color\":\"white, blue\",\"eye_color\":\"red\",\"birth_year\":\"33BBY\",\"gender\":\"n/a\",\"homeworld\":\"http://swapi.co/api/planets/8/\",\"films\":[\"http://swapi.co/api/films/5/\",\"http://swapi.co/api/films/4/\",\"http://swapi.co/api/films/6/\",\"http://swapi.co/api/films/3/\",\"http://swapi.co/api/films/2/\",\"http://swapi.co/api/films/1/\",\"http://swapi.co/api/films/7/\"],\"species\":[\"http://swapi.co/api/species/2/\"],\"vehicles\":[],\"starships\":[],\"created\":\"2014-12-10T15:11:50.376000Z\",\"edited\":\"2014-12-20T21:17:50.311000Z\",\"url\":\"http://swapi.co/api/people/3/\"}"},{"type":"Commit","commit":{"type":"LoadSuccess","color":"red"}}]};

test('controller with live snapshot', () => {
  const {action, snapshot} = liveSnapshot;
  expect(Ship.simulate(Controller.control(action), snapshot)).toEqual(snapshot);
});
```

## Documentation
* [Tutorial](https://clarus.github.io/redux-ship/docs/tutorial/)
* [Architecture](https://clarus.github.io/redux-ship/docs/architecture.html)
* [API Reference](https://clarus.github.io/redux-ship/docs/api.html)

## License
MIT
