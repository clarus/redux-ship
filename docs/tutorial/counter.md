# Counter
We start by the simple example of a counter. A counter does not have asynchronous actions so Redux Ship is not necessary here, but it helps to get started.

<img src='https://raw.githubusercontent.com/clarus/redux-ship/master/docs/tutorial/counter.png' alt='Screenshot' width='150px'>

* [Create a React application](#create-a-react-application)
* [Model](#model)
* [View](#view)
* [Controller](#controller)
* [Wrapping everything up](#wrapping-everything-up)
* [Snapshots](#snapshots)

## Create a React application
Use [`create-react-app`](https://github.com/facebookincubator/create-react-app#getting-started) to create a `counter` application:
```
create-react-app counter
```
You should have the following files in `src/`:
```
App.css
App.js
App.test.js
index.css
index.js
logo.svg
```
Install [Redux](http://redux.js.org/) and Redux Ship with their dev tools:
```
npm install --save redux redux-ship redux-logger redux-ship-logger babel-polyfill
```
Optionally setup the [Flow](https://flowtype.org/) type system:
```
npm install -g flow-bin
flow init
flow
```

## Model
We add a `model.js` file to describe the "Redux part" of the counter:
```js
// @flow
export type State = number;

export const initialState = 0;

export type Patch = {
  type: 'Increment',
} | {
  type: 'Decrement',
};

export function reduce(state: State, patch: Patch): State {
  switch (patch.type) {
  case 'Increment':
    return state + 1;
  case 'Decrement':
    return state - 1;
  default:
    return state;
  }
}
```
This describes a quite standard reducer with typing. Notice that we name the actions `Patch`. This is to make clear that these actions are used to modify the state, by opposition to asynchronous actions.

## View
In `App.js` we add the view of the counter:
```js
// @flow
import React, { PureComponent } from 'react';
import './App.css';
import * as Controller from './controller';
import * as Model from './model';

type Props = {
  dispatch: (action: Controller.Action) => void,
  state: Model.State,
};

export default class App extends PureComponent<void, Props, void> {
  handleClickIncrement = (): void => {
    this.props.dispatch({type: 'ClickIncrement'});
  };

  handleClickDecrement = (): void => {
    this.props.dispatch({type: 'ClickDecrement'});
  };

  render() {
    return (
      <div className="App">
        <p>{this.props.state}</p>
        <button onClick={this.handleClickIncrement}>
          +1
        </button>
        <button onClick={this.handleClickDecrement}>
          -1
        </button>
      </div>
    );
  }
}
```
We display the value of the counter with `<p>{this.props.state}</p>`. To handle the clicks on the buttons `+1` and `-1` we dispatch actions to the controller.

## Controller
We define the controller in `controller.js`:
```js
// @flow
import * as Ship from 'redux-ship';
import * as Model from './model';

export type Action = {
  type: 'ClickIncrement',
} | {
  type: 'ClickDecrement',
};

export function* control(action: Action): Ship.Ship<*, Model.Patch, Model.State, void> {
  switch (action.type) {
  case 'ClickIncrement':
    yield* Ship.commit({type: 'Increment'});
    return;
  case 'ClickDecrement':
    yield* Ship.commit({type: 'Decrement'});
    return;
  default:
    return;
  }
}
```
The controller describes how to react to the application events, here a click on `+1` or `-1`. We define a type `Action` which is the type of all these application events. The function `control` handles an action by returning a ship.

A ship is the description of a side effect, including API calls, modifications of the Redux state, timers, url update, or calls to third-party libraries with side effects. By side effect we mean "anything which is not purely functional". We define a ship with a generator and Redux Ship primitives.

We call:
```js
yield* Ship.commit({type: 'Increment'});
```
to commit a patch to the Redux state. All functions in Redux Ship are called with `yield*`, you should never encounter a `yield`. We avoid the `yield` operator because it is a difficult to type in Flow, and instead call proxy functions with `yield*`.

The return type of `control` is:
```js
Ship.Ship<*, Model.Patch, Model.State, void>
```
meaning that this controller is attached to our model. We could not for example run:
```js
yield* Ship.commit({type: 'Foo'}); // error
```
as this would result in a Flow type error since `{type: 'Foo'}` is not of type `Model.Patch`.

## Wrapping everything up
We instantiate a Redux store in `store.js`:
```js
// @flow
import {applyMiddleware, createStore} from 'redux';
import createLogger from 'redux-logger';
import * as Model from './model';

export default createStore(
  Model.reduce,
  Model.initialState,
  applyMiddleware(createLogger())
);
```
and bootstrap the application in `index.js`:
```js
// @flow
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import * as Ship from 'redux-ship';
import {logControl} from 'redux-ship-logger';
import App from './App';
import './index.css';
import * as Controller from './controller';
import store from './store';

function runEffect() {}

function dispatch(action: Controller.Action): void {
  Ship.run(runEffect, store, logControl(Controller.control)(action));
}

function render(): void {
  ReactDOM.render(
    <App dispatch={dispatch} state={store.getState()} />,
    document.getElementById('root')
  );
}

store.subscribe(render);
render();
```
We define a [React](https://facebook.github.io/react/) `render` function to render the application. We subscribe to the `store` to re-render when the Redux store is updated.

We define the function `dispatch` with `Ship.run`:
```js
function runEffect() {}

function dispatch(action: Controller.Action): void {
  Ship.run(runEffect, store, logControl(Controller.control)(action));
}
```
This function effectively runs the side effects described by the `Controller.control` function using the Redux store `store`. The function `runEffect` is empty for now, as we have asynchronous actions. We call `logControl` to add logging to the controller.

## Snapshots
When we look at our browser's console we see something like:

<img src='https://raw.githubusercontent.com/clarus/redux-ship/master/docs/tutorial/counter-logs.png' alt='Logs' width='600px'>

We have an action `{type: 'Increment'}` which takes us from the state `0` to the state `1`. This action is logged by [redux-logger](https://github.com/evgenyrodionov/redux-logger). We also have a line:
```
control @ 19:35:41.214 ClickIncrement
```
which is the log of our controller as given by [redux-ship-logger](https://github.com/clarus/redux-ship-logger). We see the snapshot of our controller:
```js
[
  {
    type: 'Commit',
    commit: {type: 'Increment'}
  }
]
```
which is an array of one element, the commit of `{type: 'Increment'}`, describing all what the controller has done. Nothing fancy there, but the snapshots of our controllers will become increasingly useful as we design more complex controllers.

Let us move to the [HTTP Request](http-request.html) section to see how to make asynchronous actions.
