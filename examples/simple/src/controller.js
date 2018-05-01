// @flow
// The controller is where we put all the Redux Ship related code.
import * as Ship from 'redux-ship';
import * as Effect from './effect';
import * as Model from './model';

// The type of actions which can be dispatched by the React components.
export type Action = {
  type: 'Load',
};

type Control<A> = Ship.Ship<Effect.Effect, Model.Commit, Model.State, A>;

// The main function to handle the actions.
// Try to modify the code (by removing a line, ...) and re-run the tests
// with `npm test`. You should see a difference in the Jest snapshot.
export function* control(action: Action): Control<void> {
  switch (action.type) {
  // There is only the `Load` action in this example.
  case 'Load': {
    // Check if we already have the list of movies in the Redux store.
    const currentMovies = yield* Ship.getState(state => state.movies);
    if (!currentMovies) {
      // If not, notify Redux that we start loading the movies.
      yield* Ship.commit({type: 'LoadStart'});
      // Just to show we can wait :)
      yield* Effect.delay(500);
      // Get the description of R2D2 with an API call.
      const r2d2 = yield* Effect.httpRequest('https://swapi.co/api/people/3/');
      const movies = yield* Ship.all(JSON.parse(r2d2).films.map(function* (movieUrl) {
        // Get the movie title with an API call.
        const movie = yield* Effect.httpRequest(movieUrl);
        return JSON.parse(movie).title;
      }));
      // Write the list of movies in the Redux store.
      yield* Ship.commit({type: 'LoadSuccess', movies});
    }
    return;
  }
  default:
    return;
  }
}
