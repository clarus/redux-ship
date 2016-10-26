// @flow
import React from 'react';
import * as Test from '../../test';
import * as CounterModel from '../model';
import Counter from '../view';

const defaultProps = {
  state: CounterModel.initialState,
};

Test.snapshotComponent(Counter, {
  'default': defaultProps,
});
