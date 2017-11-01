// @flow
import * as Ship from 'redux-ship';
import * as Effect from './effect';
import * as Model from './model';

export type Action = {
  type: 'Load',
};

type Control<A> = Ship.Ship<Effect.Effect, Model.Commit, Model.State, A>;

export function* control(action: Action): Control<void> {
  switch (action.type) {
  case 'Load': {
    const currentMovies = yield* Ship.getState(state => state.movies);
    if (!currentMovies) {
      yield* Ship.commit({type: 'LoadStart'});
      yield* Effect.delay(500); // just to show we can :)
      const r2d2 = yield* Effect.httpRequest('https://swapi.co/api/people/3/');
      const movies = yield* Ship.all(JSON.parse(r2d2).films.map(function* (movieUrl) {
        const movie = yield* Effect.httpRequest(movieUrl);
        return JSON.parse(movie).title;
      }));
      yield* Ship.commit({type: 'LoadSuccess', movies});
    }
    return;
  }
  default:
    return;
  }
}
