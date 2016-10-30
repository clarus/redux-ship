// @flow
import * as Ship from 'redux-ship';
import * as EyeController from './eye/controller';
import * as MoviesController from './movies/controller';
import * as Model from './model';

export type Action = {
  type: 'Eye',
  action: EyeController.Action,
} | {
  type: 'Movies',
  action: MoviesController.Action,
};

export function* control(action: Action): Ship.Ship<*, Model.Patch, Model.State, void> {
  switch (action.type) {
  case 'Eye':
    return yield* Ship.map(
      patch => ({type: 'Eye', patch}),
      state => state.eye,
      EyeController.control(action.action)
    );
  case 'Movies':
    return yield* Ship.map(
      patch => ({type: 'Movies', patch}),
      state => state.movies,
      MoviesController.control(action.action)
    );
  default:
    return;
  }
}
