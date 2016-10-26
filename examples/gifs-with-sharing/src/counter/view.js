// @flow
import React, { PureComponent } from 'react';
import * as CounterModel from './model';

type Props = {
  state: CounterModel.State,
};

export default class Counter extends PureComponent<void, Props, void> {
  render() {
    return (
      <div>
        <p>Count: {this.props.state.count}</p>
      </div>
    );
  }
}
