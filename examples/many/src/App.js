// @flow
import React, { Component } from 'react';
import './App.css';
import Luke from './luke/view';
import * as Controller from './controller';
import * as LukeController from './luke/controller';
import * as Model from './model';

type Props = {
  dispatch: (action: Controller.Action) => void,
  state: Model.State,
};

class App extends Component<void, Props, void> {
  handleFirstDispatch: (action: LukeController.Action) => void = (action) => {
    this.props.dispatch({
      type: 'First',
      action,
    });
  };

  handleSecondDispatch: (action: LukeController.Action) => void = (action) => {
    this.props.dispatch({
      type: 'Second',
      action,
    });
  };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h1>Redux Ship</h1>
          <h2>Basic example</h2>
        </div>
        <div className="App-content">
          <h3>First</h3>
          <Luke
            dispatch={this.handleFirstDispatch}
            state={this.props.state.first}
          />
          <h3>Second</h3>
          <Luke
            dispatch={this.handleSecondDispatch}
            state={this.props.state.second}
          />
        </div>
      </div>
    );
  }
}

export default App;
