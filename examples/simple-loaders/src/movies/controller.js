// @flow
import * as Ship from 'redux-ship';
import * as Effect from '../effect';
import * as MoviesModel from './model';

export type Action = {
  type: 'Load',
};

export type Commit = MoviesModel.Patch;

export type State = MoviesModel.State;

export function* control(action: Action): Ship.Ship<*, Commit, State, void> {
  switch (action.type) {
  case 'Load': {
    yield* Ship.commit({type: 'LoadStart'});
    const r2d2 = yield* Effect.httpRequest('http://swapi.co/api/people/3/');
    const movieUrls: string[] = JSON.parse(r2d2).films;
    const movieTitles = yield* Ship.all(movieUrls.map(function* (movieUrl) {
      const movie = yield* Effect.httpRequest(movieUrl);
      return JSON.parse(movie).title;
    }));
    yield* Ship.commit({type: 'LoadSuccess', movies: movieTitles});
    return;
  }
  default:
    return;
  }
}
