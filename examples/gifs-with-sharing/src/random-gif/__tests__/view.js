// @flow
import React from 'react';
import * as Test from '../../test';
import * as RandomGifModel from '../model';
import RandomGif from '../view';

const defaultProps = {
  dispatch: Test.dispatch,
  state: RandomGifModel.initialState,
  tag: 'cat',
};

Test.snapshotComponent(RandomGif, {
  'default': defaultProps,
  loaded: {
    ...defaultProps,
    state: {
      ...defaultProps.state,
      gifUrl: 'https://media2.giphy.com/media/m7ychnf9zOVm8/giphy.gif',
      isLoading: false,
    },
  },
  loading: {
    ...defaultProps,
    state: {
      ...defaultProps.state,
      isLoading: true,
    },
  },
});
