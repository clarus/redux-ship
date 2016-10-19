// @flow
import React, { PureComponent } from 'react';
import './view.css';
import logo from '../logo.svg';
import * as Controller from './controller';
import * as Model from './model';

type Props = {
  dispatch: (action: Controller.Action) => void,
  state: Model.State,
  tag: string,
};

export default class RandomGif extends PureComponent<void, Props, void> {
  handleClickButton: () => void = () => {
    this.props.dispatch({
      type: 'Load',
      tag: this.props.tag,
    });
  };

  renderGif() {
    const src = this.props.state.gifUrl && !this.props.state.isLoading ?
      this.props.state.gifUrl :
      logo;
    return (
      <img
        alt="waiting logo"
        className="RandomGif-picture"
        src={src}
      />
    );
  }

  render() {
    return (
      <div className="RandomGif">
        {this.renderGif()}
        <button
          disabled={this.props.state.isLoading}
          onClick={this.handleClickButton}
        >
          {this.props.state.isLoading ? 'Loading...' : `New ${this.props.tag}`}
        </button>
      </div>
    );
  }
}
