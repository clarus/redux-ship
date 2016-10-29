# HTTP Request
**work in progress**

For now, you can look at the [`http-request`](https://github.com/clarus/redux-ship/tree/master/examples/http-request) example. The key parts are the definition of effects in `effect.js`:
```js
// @flow
import type {Ship} from 'redux-ship';
import {call} from 'redux-ship';

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
and the use of these effects in the controller:
```js
export function* control(action: Action): Ship.Ship<*, Commit, State, void> {
  switch (action.type) {
  case 'Load': {
    yield* Ship.commit({type: 'LoadStart'});
    const r2d2 = yield* Effect.httpRequest('http://swapi.co/api/people/3/');
    const eyeColor = JSON.parse(r2d2).eye_color;
    yield* Ship.commit({type: 'LoadSuccess', color: eyeColor});
    return;
  }
  default:
    return;
  }
}
```
