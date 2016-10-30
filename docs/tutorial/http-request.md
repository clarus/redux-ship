# HTTP Request
Most useful Javascript applications run asynchronous actions with side effects. To see how to make it in Redux Ship, we take the example of an application retreiving the color of the eye of R2-D2 with the [Star Wars API](https://swapi.co/).

<img src='https://raw.githubusercontent.com/clarus/redux-ship/master/docs/tutorial/http-request.png' alt='Screenshot' width='150px'>

## Model
We start by the definition of the `model.js`:
```js
// @flow
export type State = {
  color: ?string,
  isLoading: bool,
};

export const initialState: State = {
  color: null,
  isLoading: false,
};

export type Patch = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  color: string,
};

export function reduce(state: State, patch: Patch): State {
  switch (patch.type) {
  case 'LoadStart':
    return {
      ...state,
      isLoading: true,
    };
  case 'LoadSuccess':
    return {
      ...state,
      color: patch.color,
      isLoading: false,
    };
  default:
    return state;
  }
}
```
The state is formed of:
* a `color`, which is either a `string` if color is known or `null`;
* a flag `isLoading` to know if a request is pending.

We can change the state by beginning of finishing a request.

## View
We define a view based on this model:
```js
// @flow
import React, { PureComponent } from 'react';
import * as Controller from './controller';
import * as Model from './model';

type Props = {
  dispatch: (action: Controller.Action) => void,
  state: Model.State,
};

export default class Eye extends PureComponent<void, Props, void> {
  handleClickLoad = (): void => {
    this.props.dispatch({type: 'ClickLoad'});
  };

  render() {
    return (
      <div>
        <h2>Eye</h2>
        {this.props.state.color && <p>{this.props.state.color}</p>}
        <button disabled={this.props.state.isLoading} onClick={this.handleClickLoad}>
          {this.props.state.isLoading ? 'Loading...' : 'Get color'}
        </button>
      </div>
    );
  }
}
```
We dispatch the action `{type: 'ClickLoad'}` each time we click on the button.

## Controller
Our controller `controller.js` implements the `ClickLoad` action:
```js
import * as Ship from 'redux-ship';
import * as Effect from './effect';
import * as Model from './model';

export type Action = {
  type: 'ClickLoad',
};

export function* control(action: Action): Ship.Ship<*, Model.Patch, Model.State, void> {
  switch (action.type) {
  case 'ClickLoad': {
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
We successively:
* commit that we are starting the request with `yield* Ship.commit({type: 'LoadStart'})`;
* make the HTTP request with `yield* Effect.httpRequest('http://swapi.co/api/people/3/')`;
* commit the result with `yield* Ship.commit({type: 'LoadSuccess', color: eyeColor})`

The function `Effect.httpRequest` is user-defined, and we now see how to define it.

## Effect
One of the aims of Redux Ship is to serialize all the side effects to get better programming tools. In particular, we serialize the primitives effects of our application in a file `effect.js`:
```js
export type Effect = {
  type: 'HttpRequest',
  url: string,
};
```
Our example only runs HTTP requests parametrized by a string, but we could have as many different kinds of effects as needed.

We give meaning to these effects by defining how to run them:
```js
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
The `run` function must return the promise of the expected result of each effect.

To make the use of the effects easier, we create functions to wrap the calls to our effects. In our case, we only have the HTTP request:
```js
export function httpRequest<Commit, State>(
  url: string
): Ship<Effect, Commit, State, string> {
  return Ship.call({
    type: 'HttpRequest',
    url,
  });
}
```
Notice the type of `httpRequest`. It means that for any Redux store with commits (or patches) of type `Commit` and states of type `State`, an HTTP request is a ship wich returns a `string` doing some primitive effects of type `Effect`.

In contrast, the type of `Ship.call`:
```js
<Effect, Commit, State>(
  effect: Effect
): Ship<Effect, Commit, State, any>
```
returns a result of type `any`. Thus, by defining the function `httpRequest` we specify the return type of the effect `HttpRequest` to be a `string`. For consistency, this *must* be the same type as the return type of the function `run` on a `HttpRequest` effect. If the types are not the same, then you may get type errors at runtime.

A general recommendation is to try to have the smallest possible type for `Effect` to reduce the number of primitives. For example, make one primitive effect for the HTTP requests and then define the different API calls on top of it, rather than one primitive effect per API call.
