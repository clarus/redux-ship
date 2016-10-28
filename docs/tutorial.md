# Tutorial

For now the tutorial is the [examples folder](https://github.com/clarus/redux-ship/tree/master/examples).

## Testing
To see how to test side effects with Redux Ship, you can look at the [`examples/http-request/src/eye/__tests__/controller.js`](https://github.com/clarus/redux-ship/blob/master/examples/http-request/src/eye/__tests__/controller.js) file:
```js
// @flow
import 'babel-polyfill';
import {createStore} from 'redux';
import * as Ship from 'redux-ship';
import * as Effect from '../../effect';
import * as EyeController from '../controller';
import * as EyeModel from '../model';

const liveSnapshot =
  {"action":{"type":"Load"},"snapshot":[{"type":"Commit","commit":{"type":"LoadStart"}},{"type":"Effect","effect":{"type":"HttpRequest","url":"http://swapi.co/api/people/3/"},"result":"{\"name\":\"R2-D2\",\"height\":\"96\",\"mass\":\"32\",\"hair_color\":\"n/a\",\"skin_color\":\"white, blue\",\"eye_color\":\"red\",\"birth_year\":\"33BBY\",\"gender\":\"n/a\",\"homeworld\":\"http://swapi.co/api/planets/8/\",\"films\":[\"http://swapi.co/api/films/5/\",\"http://swapi.co/api/films/4/\",\"http://swapi.co/api/films/6/\",\"http://swapi.co/api/films/3/\",\"http://swapi.co/api/films/2/\",\"http://swapi.co/api/films/1/\",\"http://swapi.co/api/films/7/\"],\"species\":[\"http://swapi.co/api/species/2/\"],\"vehicles\":[],\"starships\":[],\"created\":\"2014-12-10T15:11:50.376000Z\",\"edited\":\"2014-12-20T21:17:50.311000Z\",\"url\":\"http://swapi.co/api/people/3/\"}"},{"type":"Commit","commit":{"type":"LoadSuccess","color":"red"}}]};

test('controller with live snapshot', () => {
  const {action, snapshot} = liveSnapshot;
  expect(Ship.simulate(EyeController.control(action), snapshot)).toEqual(snapshot);
});

function runEffect(effect: Effect.Effect): any {
  switch (effect.type) {
  case 'HttpRequest':
    return JSON.stringify({eye_color: 'red'});
  default:
    return;
  }
}

test('controller with generated snapshot', async () => {
  const action = {type: 'Load'};
  const store = createStore(EyeModel.reduce, EyeModel.initialState);
  const ship = Ship.snap(EyeController.control(action));
  const snapshot = await Ship.run(runEffect, store.dispatch, store.getState, ship);
  expect(snapshot).toMatchSnapshot();
});

```

## Composition
We compose two controllers in [`examples/http-request/src/controller.js`](https://github.com/clarus/redux-ship/blob/master/examples/http-request/src/controller.js):
```js
export function* control(action: Action): Ship.Ship<*, Commit, State, void> {
  switch (action.type) {
  case 'Eye':
    return yield* Ship.map(
      commit => ({type: 'Eye', commit}),
      state => state.eye,
      EyeController.control(action.action)
    );
  case 'Movies':
    return yield* Ship.map(
      commit => ({type: 'Movies', commit}),
      state => state.movies,
      MoviesController.control(action.action)
    );
  default:
    return;
  }
}
```
