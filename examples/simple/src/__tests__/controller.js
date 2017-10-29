// @flow
import 'babel-polyfill';
import {createStore} from 'redux';
import * as Ship from 'redux-ship';
import * as Effect from '../effect';
import * as Controller from '../controller';
import * as Model from '../model';

function runEffect(effect: Effect.Effect) {
  switch (effect.type) {
  case 'HttpRequest':
    if (effect.url === 'https://swapi.co/api/people/3/') {
      return JSON.stringify({
        films: [
          'https://swapi.co/api/films/2/', 
          'https://swapi.co/api/films/5/', 
          'https://swapi.co/api/films/4/', 
          'https://swapi.co/api/films/6/', 
          'https://swapi.co/api/films/3/', 
          'https://swapi.co/api/films/1/', 
          'https://swapi.co/api/films/7/'
        ]
      });
    }
    return JSON.stringify({title: `Title of ${effect.url}`});
  default:
    return;
  }
}

test('list the movies', async () => {
  const action = {type: 'Load'};
  const store = createStore(Model.reduce, Model.initialState);
  const ship = Ship.snap(Controller.control(action));
  const snapshot = await Ship.run(runEffect, store, ship);
  expect(snapshot).toMatchSnapshot();
});

