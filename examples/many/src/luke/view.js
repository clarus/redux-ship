// @flow
import React, { Component } from 'react';
import './view.css';
import * as Controller from './controller';
import * as Model from './model';

type Props = {
  dispatch: (action: Controller.Action) => void,
  state: Model.State,
};

class Luke extends Component<void, Props, void> {
  handleClick: () => void = () => {
    this.props.dispatch({
      type: 'Load',
    });
  };

  render() {
    return (
      <div className="Luke">
        <button
          disabled={this.props.state.isLoading}
          onClick={this.handleClick}
        >
          {this.props.state.isLoading ? 'Loading' : 'Get Luke\'s full name'}
        </button>
        <p>
          {this.props.state.fullName}
        </p>
      </div>
    );
  }
}

export default Luke;
