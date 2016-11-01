# Composition
Most Javascript applications contain many components. Each of the components can have its own view, its own local state and run some asynchronous actions like API requests. We present how to compose isolated components in Redux Ship as in [Elm](http://elm-lang.org/), thanks to the [`Ship.map`](https://clarus.github.io/redux-ship/docs/api.html) primitive. The code of this tutorial is in [`examples/http-request`](https://github.com/clarus/redux-ship/tree/master/examples/http-request).

<img src='https://raw.githubusercontent.com/clarus/redux-ship/master/docs/tutorial/composition.png' alt='Screenshot' width='200px'>

## Components
We compose two components with some API calls to [SWAPI](http://swapi.co/):
* `eye` which gets the color of the eye of R2-D2;
* `movies` which gets the list of movies of R2-D2.

Each component has its own folder with three files:
* `model.js` (the Redux part);
* `view.js` (the React part);
* `controller.js` (the Redux Ship part).

See [`src/eye`](https://github.com/clarus/redux-ship/tree/master/examples/http-request/src/eye) and [`src/movies`](https://github.com/clarus/redux-ship/tree/master/examples/http-request/src/movies) for the sources of the components.

## Model
The model of the main application regroups the model of each component.
```js
// @flow
import * as EyeModel from './eye/model';
import * as MoviesModel from './movies/model';

export type State = {
  eye: EyeModel.State,
  movies: MoviesModel.State,
};

export const initialState: State = {
  eye: EyeModel.initialState,
  movies: MoviesModel.initialState,
};

export type Patch = {
  type: 'Eye',
  patch: EyeModel.Patch,
} | {
  type: 'Movies',
  patch: MoviesModel.Patch,
};

export function reduce(state: State, patch: Patch): State {
  switch (patch.type) {
  case 'Eye':
    return {
      ...state,
      eye: EyeModel.reduce(state.eye, patch.patch),
    };
  case 'Movies':
    return {
      ...state,
      movies: MoviesModel.reduce(state.movies, patch.patch),
    };
  default:
    return state;
  }
}
```
The state of the main application is a plain object with two fields containing the states of the `eye` component *and* of the `movies` component. A patch of the main application is either a patch for the `eye` component *or* for the `movies` component. The job of the reducer is to call the right sub-reducer on the right sub-state.

## View
The main view includes the view of each sub-component.
```js
// @flow
import React, { PureComponent } from 'react';
import * as EyeController from './eye/controller';
import Eye from './eye/view';
import * as MoviesController from './movies/controller';
import Movies from './movies/view';
import * as Controller from './controller';
import * as Model from './model';

type Props = {
  dispatch: (action: Controller.Action) => void,
  state: Model.State,
};

export default class Index extends PureComponent<void, Props, void> {
  handleDispatchEye = (action: EyeController.Action): void => {
    this.props.dispatch({type: 'Eye', action});
  };

  handleDispatchMovies = (action: MoviesController.Action): void => {
    this.props.dispatch({type: 'Movies', action});
  };

  render() {
    return (
      <div>
        <h1>Eye</h1>
        <Eye
          dispatch={this.handleDispatchEye}
          state={this.props.state.eye}
        />
        <h1>Movies</h1>
        <Movies
          dispatch={this.handleDispatchMovies}
          state={this.props.state.movies}
        />
      </div>
    );
  }
}
```
The composition of the views is simplified by the use of React. However, we must be cautious to provide the correct `props` to the children components. We compute the `state` property by extracting the sub-state the component is interested in. We compute the `dispatch` property by lifting actions of the component to actions of the application. This brings use to the definition of the controller.

## Controller
We compose the controllers of `eye` and `movies` in one controller for the whole application:
```js
// @flow
import * as Ship from 'redux-ship';
import * as EyeController from './eye/controller';
import * as MoviesController from './movies/controller';
import * as Model from './model';

export type Action = {
  type: 'Eye',
  action: EyeController.Action,
} | {
  type: 'Movies',
  action: MoviesController.Action,
};

export function* control(action: Action): Ship.Ship<*, Model.Patch, Model.State, void> {
  switch (action.type) {
  case 'Eye':
    return yield* Ship.map(
      patch => ({type: 'Eye', patch}),
      state => state.eye,
      EyeController.control(action.action)
    );
  case 'Movies':
    return yield* Ship.map(
      patch => ({type: 'Movies', patch}),
      state => state.movies,
      MoviesController.control(action.action)
    );
  default:
    return;
  }
}
```

We define an application action as being either an action for the `eye` component *or* an action for the `Movies` component. The `control` function takes care to dispatch the right action to the right sub-controller. Because the sub-controllers does not have access to the same state and patches, we need to wrap them with the [`Ship.map`](https://clarus.github.io/redux-ship/docs/api.html) primitive. Indeed, the ship:
```js
EyeController.control(action.action)
```
is of type:
```js
Ship.Ship<*, EyeModel.Patch, EyeModel.State, void>
```
but we want to return a controller of the following type:
```js
Ship.Ship<*, Model.Patch, Model.State, void>
```

With the `Ship.map` primitive, we lift the `eye` controller to the right type:
```js
Ship.map(
  patch => ({type: 'Eye', patch}),
  state => state.eye,
  EyeController.control(action.action)
)
```
We declare:
* how to lift a patch of the `eye` controller to a patch of the application controller;
* how to extract the state of the `eye` controller from the state of the application controller.
