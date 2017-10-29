// @flow
import React, { PureComponent } from 'react';
import * as MoviesController from './controller';
import * as MoviesModel from './model';

type Props = {
  dispatch: (action: MoviesController.Action) => void,
  state: MoviesModel.State,
};

export default class Movies extends PureComponent<void, Props, void> {
  handleClickLoad = (): void => {
    this.props.dispatch({type: 'Load'});
  };

  render() {
    return (
      <div>
        {this.props.state.movies && this.props.state.movies.map(movie =>
          <p key={movie}>{movie}</p>
        )}
        <button disabled={this.props.state.isLoading} onClick={this.handleClickLoad}>
          {this.props.state.isLoading ? 'Loading...' : 'Get movies'}
        </button>
      </div>
    );
  }
}
