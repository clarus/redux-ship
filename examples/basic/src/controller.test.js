// @flow
import 'babel-polyfill';
import {createStore} from 'redux';
import {run, simulate, snap} from 'redux-ship';
import * as Effect from './effect';
import * as Controller from './controller';
import * as Model from './model';

it('gets the full name (by hand)', () => {
  const ship = Controller.control({
    type: 'Load',
  });
  {
    const {value} = ship.next();
    expect(value).toEqual({
      type: 'Command',
      command: {
        type: 'Dispatch',
        action: {
          type: 'LoadStart',
        },
      },
    });
  }
  {
    const {value} = ship.next();
    expect(value).toEqual({
      type: 'Command',
      command: {
        type: 'Effect',
        effect: {
          type: 'HttpRequest',
          url: 'http://swapi.co/api/people/1/',
        },
      },
    });
  }
  {
    const {value} = ship.next(JSON.stringify({
      name: 'Luke Skywalker',
    }));
    expect(value).toEqual({
      type: 'Command',
      command: {
        type: 'Dispatch',
        action: {
          type: 'LoadSuccess',
          fullName: 'Luke Skywalker'
        },
      },
    });
  }
  {
    const {done} = ship.next();
    expect(done).toBe(true);
  }
});

it('gets the full name (by live snapshot)', () => {
  const ship = Controller.control({
    type: 'Load',
  });
  const snapshot = [{"type":"Dispatch","action":{"type":"LoadStart"}},{"type":"Effect","effect":{"type":"HttpRequest","url":"http://swapi.co/api/people/1/"},"result":"{\"name\":\"Luke Skywalker\",\"height\":\"172\",\"mass\":\"77\",\"hair_color\":\"blond\",\"skin_color\":\"fair\",\"eye_color\":\"blue\",\"birth_year\":\"19BBY\",\"gender\":\"male\",\"homeworld\":\"http://swapi.co/api/planets/1/\",\"films\":[\"http://swapi.co/api/films/6/\",\"http://swapi.co/api/films/3/\",\"http://swapi.co/api/films/2/\",\"http://swapi.co/api/films/1/\",\"http://swapi.co/api/films/7/\"],\"species\":[\"http://swapi.co/api/species/1/\"],\"vehicles\":[\"http://swapi.co/api/vehicles/14/\",\"http://swapi.co/api/vehicles/30/\"],\"starships\":[\"http://swapi.co/api/starships/12/\",\"http://swapi.co/api/starships/22/\"],\"created\":\"2014-12-09T13:50:51.644000Z\",\"edited\":\"2014-12-20T21:17:56.891000Z\",\"url\":\"http://swapi.co/api/people/1/\"}"},{"type":"Dispatch","action":{"type":"LoadSuccess","fullName":"Luke Skywalker"}}];
  expect(simulate(ship, snapshot)).toEqual(snapshot);
});

it('gets the full name (by generated snapshot)', async () => {
  const ship = Controller.control({
    type: 'Load',
  });
  const store = createStore(Model.reduce, Model.initialState);
  const runEffect = (effect: Effect.Effect): any => {
    switch (effect.type) {
    case 'HttpRequest':
      return JSON.stringify({
        name: 'Luke Skywalker',
      });
    default:
      return;
    }
  };
  const {snapshot} = await run(runEffect, store.dispatch, store.getState, snap(ship));
  expect(snapshot).toMatchSnapshot();
});
