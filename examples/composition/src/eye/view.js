// @flow
import React, { PureComponent } from 'react';
import * as EyeController from './controller';
import * as EyeModel from './model';

type Props = {
  dispatch: (action: EyeController.Action) => void,
  state: EyeModel.State,
};

export default class Eye extends PureComponent<void, Props, void> {
  handleClickLoad = (): void => {
    this.props.dispatch({type: 'Load'});
  };

  render() {
    return (
      <div>
        {this.props.state.color && <p>{this.props.state.color}</p>}
        <button disabled={this.props.state.isLoading} onClick={this.handleClickLoad}>
          {this.props.state.isLoading ? 'Loading...' : 'Get color'}
        </button>
      </div>
    );
  }
}
