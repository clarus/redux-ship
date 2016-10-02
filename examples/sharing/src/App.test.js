import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as Model from './model';

function dispatch() {
}

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App dispatch={dispatch} state={Model.initialState} />, div);
});
