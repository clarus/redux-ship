// @flow
import React, { PureComponent } from 'react';
import logo from './logo.svg';
import './view.css';
import Counter from './counter/view';
import * as RandomGifController from './random-gif/controller';
import RandomGif from './random-gif/view';
import * as Controller from './controller';
import * as Model from './model';

type Props = {
  dispatch: (action: Controller.Action) => void,
  state: Model.State,
};

export default class Index extends PureComponent<void, Props, void> {
  handleDispatchRandomGif = (action: RandomGifController.Action, tag: string): void => {
    this.props.dispatch({type: 'RandomGif', action, tag});
  };

  render() {
    return (
      <div className="Index">
        <div className="Index-header">
          <img src={logo} className="Index-logo" alt="logo" />
          <h2>Redux Ship</h2>
        </div>
        <p>
          Open the console to see the logs. Sources are <a href="https://github.com/clarus/redux-ship/tree/master/examples/gifs">on GitHub</a>.
        </p>
        <h1>Counter</h1>
        <Counter
          state={this.props.state.counter}
        />
        <h1>Gifs</h1>
        <div className="Index-randomGif">
          {Object.keys(this.props.state.randomGifs).map(tag =>
            <RandomGif
              dispatch={action => this.handleDispatchRandomGif(action, tag)}
              key={tag}
              state={this.props.state.randomGifs[tag]}
              tag={tag}
            />
          )}
        </div>
      </div>
    );
  }
}
