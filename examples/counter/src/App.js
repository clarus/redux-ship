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
