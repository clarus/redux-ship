# Testing
In Redux Ship the testing of side effects is central, as effectful funtions are often where critical operations happen. The main idea is to use snapshot testing to simplify and automate the creation of tests. The two involved primitives are:
* `Ship.snap` to take the snapshot of a full execution trace;
* `Ship.simulate` to simulate a ship against an existing snapshot.

We present three kinds of snapshot testing with Redux Ship and the [Jest](https://facebook.github.io/jest/) test runner. Use the method which better fits your needs.

<img src='https://raw.githubusercontent.com/clarus/redux-ship/master/docs/tutorial/testing.png' alt='Screenshot' width='350px'>

* [Test by live snapshots](#test-by-live-snapshots)
* [Test by generated snapshots](#test-by-generated-snapshots)
* [Test by step-by-step snapshots](#test-by-step-by-step-snapshots)

## Test by live snapshots
The idea of test by live snapshots is:
* to generate the snapshot of a live execution of a ship (clicking on the submit button of a running application for example);
* to check by simulation that the snapshot is still valid as we modify our application.

If we take the [`http-request`](https://github.com/clarus/redux-ship/tree/master/examples/http-request) example and click on the button to get the color of the eye of R2-D2:

<img src='https://raw.githubusercontent.com/clarus/redux-ship/master/docs/tutorial/http-request.png' alt='Screenshot' width='150px'>

we obtain the following snapshot in the console logs (using [redux-ship-logger](https://github.com/clarus/redux-ship-logger)):
```js
{"action":{"type":"Eye","action":{"type":"Load"}},"snapshot":[{"type":"Commit","commit":{"type":"Eye","patch":{"type":"LoadStart"}}},{"type":"Effect","effect":{"type":"HttpRequest","url":"http://swapi.co/api/people/3/"},"result":"{\"name\":\"R2-D2\",\"height\":\"96\",\"mass\":\"32\",\"hair_color\":\"n/a\",\"skin_color\":\"white, blue\",\"eye_color\":\"red\",\"birth_year\":\"33BBY\",\"gender\":\"n/a\",\"homeworld\":\"http://swapi.co/api/planets/8/\",\"films\":[\"http://swapi.co/api/films/5/\",\"http://swapi.co/api/films/4/\",\"http://swapi.co/api/films/6/\",\"http://swapi.co/api/films/3/\",\"http://swapi.co/api/films/2/\",\"http://swapi.co/api/films/1/\",\"http://swapi.co/api/films/7/\"],\"species\":[\"http://swapi.co/api/species/2/\"],\"vehicles\":[],\"starships\":[],\"created\":\"2014-12-10T15:11:50.376000Z\",\"edited\":\"2014-12-20T21:17:50.311000Z\",\"url\":\"http://swapi.co/api/people/3/\"}"},{"type":"Commit","commit":{"type":"Eye","patch":{"type":"LoadSuccess","color":"red"}}}]}
```
This describes what happened in response to the `{"type":"Eye","action":{"type":"Load"}}` action. To test it with Jest, we create a file [`src/__tests__/controller.js`](https://github.com/clarus/redux-ship/blob/master/examples/http-request/src/__tests__/controller.js) containing:
```js
// @flow
import 'babel-polyfill';
import * as Controller from '../controller';
import * as Ship from 'redux-ship';

const liveSnapshot = {"action":{"type":"Eye","action":{"type":"Load"}},"snapshot":[{"type":"Commit","commit":{"type":"Eye","patch":{"type":"LoadStart"}}},{"type":"Effect","effect":{"type":"HttpRequest","url":"http://swapi.co/api/people/3/"},"result":"{\"name\":\"R2-D2\",\"height\":\"96\",\"mass\":\"32\",\"hair_color\":\"n/a\",\"skin_color\":\"white, blue\",\"eye_color\":\"red\",\"birth_year\":\"33BBY\",\"gender\":\"n/a\",\"homeworld\":\"http://swapi.co/api/planets/8/\",\"films\":[\"http://swapi.co/api/films/5/\",\"http://swapi.co/api/films/4/\",\"http://swapi.co/api/films/6/\",\"http://swapi.co/api/films/3/\",\"http://swapi.co/api/films/2/\",\"http://swapi.co/api/films/1/\",\"http://swapi.co/api/films/7/\"],\"species\":[\"http://swapi.co/api/species/2/\"],\"vehicles\":[],\"starships\":[],\"created\":\"2014-12-10T15:11:50.376000Z\",\"edited\":\"2014-12-20T21:17:50.311000Z\",\"url\":\"http://swapi.co/api/people/3/\"}"},{"type":"Commit","commit":{"type":"Eye","patch":{"type":"LoadSuccess","color":"red"}}}]};

test('controller with live snapshot', () => {
  const {action, snapshot} = liveSnapshot;
  expect(Ship.simulate(Controller.control(action), snapshot)).toEqual(snapshot);
});
```
We use the primitive `Ship.simulate` to replay our controller and check that it replays as described by the snapshot. Notice that `Ship.simulate` is a pure function, that is to say the effects are not actually run but simulated. If later on we introduce an error in our code like:
```js
case 'Load': {
  yield* Ship.commit({type: 'LoadStart'});
  const r2d2 = yield* Effect.httpRequest('http://swapi.co/api/people/3/');
  // `skin_color` instead of `eye_color`
  const eyeColor = JSON.parse(r2d2).skin_color;
  yield* Ship.commit({type: 'LoadSuccess', color: eyeColor});
  return;
}
```
we would get the following test error:
```js
Expected value to equal:
      [{"commit": {"patch": {"type": "LoadStart"}, "type": "Eye"}, "type": "Commit"}, {"effect": {"type": "HttpRequest", "url": "http://swapi.co/api/people/3/"}, "result": "{\"name\":\"R2-D2\",\"height\":\"96\",\"mass\":\"32\",\"hair_color\":\"n/a\",\"skin_color\":\"white, blue\",\"eye_color\":\"red\",\"birth_year\":\"33BBY\",\"gender\":\"n/a\",\"homeworld\":\"http://swapi.co/api/planets/8/\",\"films\":[\"http://swapi.co/api/films/5/\",\"http://swapi.co/api/films/4/\",\"http://swapi.co/api/films/6/\",\"http://swapi.co/api/films/3/\",\"http://swapi.co/api/films/2/\",\"http://swapi.co/api/films/1/\",\"http://swapi.co/api/films/7/\"],\"species\":[\"http://swapi.co/api/species/2/\"],\"vehicles\":[],\"starships\":[],\"created\":\"2014-12-10T15:11:50.376000Z\",\"edited\":\"2014-12-20T21:17:50.311000Z\",\"url\":\"http://swapi.co/api/people/3/\"}", "type": "Effect"}, {"commit": {"patch": {"color": "red", "type": "LoadSuccess"}, "type": "Eye"}, "type": "Commit"}]
    Received:
      [{"commit": {"patch": {"type": "LoadStart"}, "type": "Eye"}, "type": "Commit"}, {"effect": {"type": "HttpRequest", "url": "http://swapi.co/api/people/3/"}, "result": "{\"name\":\"R2-D2\",\"height\":\"96\",\"mass\":\"32\",\"hair_color\":\"n/a\",\"skin_color\":\"white, blue\",\"eye_color\":\"red\",\"birth_year\":\"33BBY\",\"gender\":\"n/a\",\"homeworld\":\"http://swapi.co/api/planets/8/\",\"films\":[\"http://swapi.co/api/films/5/\",\"http://swapi.co/api/films/4/\",\"http://swapi.co/api/films/6/\",\"http://swapi.co/api/films/3/\",\"http://swapi.co/api/films/2/\",\"http://swapi.co/api/films/1/\",\"http://swapi.co/api/films/7/\"],\"species\":[\"http://swapi.co/api/species/2/\"],\"vehicles\":[],\"starships\":[],\"created\":\"2014-12-10T15:11:50.376000Z\",\"edited\":\"2014-12-20T21:17:50.311000Z\",\"url\":\"http://swapi.co/api/people/3/\"}", "type": "Effect"}, {"commit": {"patch": {"color": "white, blue", "type": "LoadSuccess"}, "type": "Eye"}, "type": "Commit"}]

    Difference:

    - Expected
    + Received

      Array [
        Object {
          "commit": Object {
            "patch": Object {
              "type": "LoadStart",
            },
            "type": "Eye",
          },
          "type": "Commit",
        },
        Object {
          "effect": Object {
            "type": "HttpRequest",
            "url": "http://swapi.co/api/people/3/",
          },
          "result": "{\"name\":\"R2-D2\",\"height\":\"96\",\"mass\":\"32\",\"hair_color\":\"n/a\",\"skin_color\":\"white, blue\",\"eye_color\":\"red\",\"birth_year\":\"33BBY\",\"gender\":\"n/a\",\"homeworld\":\"http://swapi.co/api/planets/8/\",\"films\":[\"http://swapi.co/api/films/5/\",\"http://swapi.co/api/films/4/\",\"http://swapi.co/api/films/6/\",\"http://swapi.co/api/films/3/\",\"http://swapi.co/api/films/2/\",\"http://swapi.co/api/films/1/\",\"http://swapi.co/api/films/7/\"],\"species\":[\"http://swapi.co/api/species/2/\"],\"vehicles\":[],\"starships\":[],\"created\":\"2014-12-10T15:11:50.376000Z\",\"edited\":\"2014-12-20T21:17:50.311000Z\",\"url\":\"http://swapi.co/api/people/3/\"}",
          "type": "Effect",
        },
        Object {
          "commit": Object {
            "patch": Object {
    -         "color": "red",
    +         "color": "white, blue",
              "type": "LoadSuccess",
            },
            "type": "Eye",
          },
          "type": "Commit",
        },
      ]

```
The snapshots also contain information about the concurrency of the effects. For example, if we concurrently run several ships with `Ship.all` we get a node:
```js
{
  "type":"All",
  "snapshots": [...]
}
```
in the logs. Being explicit about the concurrency ensures deterministic tests.

We have taken the snapshot from the point of view of the whole application. Thus this snapshot tests the application controller. It can also be interesting to only test the controller of the eye component. In order to do so, we need to log the snapshots from the point of view of the eye controller by doing this modification:
```js
// export function* control(action: Action): Ship.Ship<*, EyeModel.Patch, EyeModel.State, void> {
export function* control2(action: Action): Ship.Ship<*, EyeModel.Patch, EyeModel.State, void> {
  switch (action.type) {
  case 'Load': {
    [...]
  }
  default:
    return;
  }
}

import {logControl} from 'redux-ship-logger';
export const control = logControl(control2);
```
Then we can add a test by generated snapshot for the eye controller, as illustrated in [`src/eye/__tests__/controller.js`](https://github.com/clarus/redux-ship/blob/master/examples/http-request/src/eye/__tests__/controller.js).

## Test by generated snapshots
The idea of test by generated snapshots is:
* to write a mock of the side-effects;
* to run the ships with the mock and take a snapshot of the execution.

We have at least two options to mock the effects:
* to use standard tools like [nock](https://github.com/node-nock/nock);
* to write our own `runEffect` function.

In this example we decide to write our own `runEffect` function to test the controller of the eye component (see [`src/eye/__tests__/controller.js`](https://github.com/clarus/redux-ship/blob/master/examples/http-request/src/eye/__tests__/controller.js)):
```js
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
  const store = Redux.createStore(EyeModel.reduce, EyeModel.initialState);
  const ship = Ship.snap(EyeController.control(action));
  const snapshot = await Ship.run(runEffect, store, ship);
  expect(snapshot).toMatchSnapshot();
});
```
We define the `runEffect` function such that the HTTP requests always answer `{eye_color: 'red'}`. Since all our side-effects should be serialized and of type `Effect.Effect`, we are sure to handle all the effects with the `runEffect` function. We use a real Redux store to handle the state in the test. Then we use and `Ship.run` and `Ship.snap` to run our controller and take its snapshot. Notice that we have to do an `await` as `Ship.run` always returns a promise, even if in this case the promise resolves immediately. Finally, we save and compare the snapshot using the snapshot testing mechanism of Jest.

For information, the generated snapshot of the eye controller is the following:
```js
exports[`test controller with generated snapshot 1`] = `
Object {
  "result": undefined,
  "snapshot": Array [
    Object {
      "commit": Object {
        "type": "LoadStart",
      },
      "type": "Commit",
    },
    Object {
      "effect": Object {
        "type": "HttpRequest",
        "url": "http://swapi.co/api/people/3/",
      },
      "result": "{\"eye_color\":\"red\"}",
      "type": "Effect",
    },
    Object {
      "commit": Object {
        "color": "red",
        "type": "LoadSuccess",
      },
      "type": "Commit",
    },
  ],
}
`;
```

## Test by step-by-step snapshots
The idea of test step-by-step snapshots is to take a snapshot at each step of a ship. This technique was suggested by [Gael du Plessix](https://github.com/gaelduplessix) in this [Gist](https://gist.github.com/gaelduplessix/46ffe7d9b90d8b527db2a631c4ae7393). It also works with Redux Saga. This approach is more manual than taking the complete snapshot of a ship at once, but can provide more control. Here is an example to test the controller of the eye component:
```js
test('controller step by step', () => {
  const action = {type: 'Load'};
  const gen = EyeController.control(action);
  expect(gen.next()).toMatchSnapshot(); // -> Commit
  expect(gen.next()).toMatchSnapshot(); // -> HTTP request
  expect(gen.next(JSON.stringify({eye_color: 'red'}))).toMatchSnapshot(); // -> Commit
  expect(gen.next()).toMatchSnapshot(); // -> Done
});
```
The snapshot file is the following:
```js
exports[`test controller step by step 1`] = `
Object {
  "done": false,
  "value": Object {
    "command": Object {
      "commit": Object {
        "type": "LoadStart",
      },
      "type": "Commit",
    },
    "type": "Command",
  },
}
`;

exports[`test controller step by step 2`] = `
Object {
  "done": false,
  "value": Object {
    "command": Object {
      "effect": Object {
        "type": "HttpRequest",
        "url": "http://swapi.co/api/people/3/",
      },
      "type": "Effect",
    },
    "type": "Command",
  },
}
`;

exports[`test controller step by step 3`] = `
Object {
  "done": false,
  "value": Object {
    "command": Object {
      "commit": Object {
        "color": "red",
        "type": "LoadSuccess",
      },
      "type": "Commit",
    },
    "type": "Command",
  },
}
`;

exports[`test controller step by step 4`] = `
Object {
  "done": true,
  "value": undefined,
}
`;
```
