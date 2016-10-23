// @flow
import React from 'react';
import * as Test from '../test';
import * as Model from '../model';
import Index from '../view';

const defaultProps = {
  dispatch: Test.dispatch,
  state: Model.initialState,
};

Test.snapshotComponent(Index, {
  'default': defaultProps,
});
