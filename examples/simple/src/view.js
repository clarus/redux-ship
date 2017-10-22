// @flow
import React, {PureComponent} from 'react';
import {connect} from 'react-redux';
import logo from './logo.svg';
import './view.css';
import * as Controller from './controller';
import * as Model from './model';

type Props = {
  dispatch: (action: Controller.Action) => void,
  state: Model.State
};

class Index extends PureComponent<Props> {
  handleClickLoad = (): void => {
    this.props.dispatch({type: 'Load'});
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">R2-D2</h1>
        </header>
        <h2>Movies</h2>
        <div>
          {this.props.state.movies && this.props.state.movies.map(movie =>
            <p key={movie}>{movie}</p>
          )}
          <button disabled={this.props.state.isLoading} onClick={this.handleClickLoad}>
            {this.props.state.isLoading ? 'Loading...' : 'Get movies'}
          </button>
        </div>
      </div>
    );
  }
}

export default connect(state => ({state}))(Index);
