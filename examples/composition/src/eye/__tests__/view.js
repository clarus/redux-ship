// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import Eye from '../view';

function dispatch() {}

const states = [{
  color: null,
  isLoading: false,
}, {
  color: null,
  isLoading: true,
}, {
  color: 'red',
  isLoading: false,
}, {
  color: 'red',
  isLoading: true,
}];

test('view', () => {
  states.forEach(state => {
    const tree = renderer.create(<Eye dispatch={dispatch} state={state} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
