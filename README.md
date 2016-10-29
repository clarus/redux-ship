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

You can optionally install [Flow](https://flowtype.org/) to get type checking and [redux-ship-logger](https://github.com/clarus/redux-ship-logger) to get logging.

## Documentation
* [Tutorial](https://clarus.github.io/redux-ship/docs/tutorial/)
* [Architecture](https://clarus.github.io/redux-ship/docs/architecture.html)
* [API Reference](https://clarus.github.io/redux-ship/docs/api.html)

## License
MIT
