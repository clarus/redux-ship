// @flow
import React, { PureComponent } from 'react';
import logo from './logo.svg';
import './view.css';
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
      <div className="Index">
        <div className="Index-header">
          <img src={logo} className="Index-logo" alt="logo" />
          <h2>R2-D2</h2>
        </div>
        <p>Open the console to see the logs.</p>
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
