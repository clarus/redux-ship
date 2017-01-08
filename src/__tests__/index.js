// @flow
import * as Ship from '../index';

type Effect = {
  type: 'HttpRequest',
  url: string,
};

function httpRequest<Commit, State>(url: string): Ship.Ship<Effect, Commit, State, string> {
  return Ship.call({
    type: 'HttpRequest',
    url,
  });
}

type EyeState = {
  color: ?string,
  isLoading: bool,
};

const initialEyeState: EyeState = {
  color: null,
  isLoading: false,
};

type EyeCommit = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  color: string,
};

type EyeControl<A> = Ship.Ship<*, EyeCommit, EyeState, A>;

function* eyeControl(): EyeControl<void> {
  const currentEyeColor = yield* Ship.getState(state => state.color);
  if (!currentEyeColor) {
    yield* Ship.commit({type: 'LoadStart'});
    const r2d2 = yield* httpRequest('http://swapi.co/api/people/3/');
    const eyeColor = JSON.parse(r2d2).eye_color;
    yield* Ship.commit({type: 'LoadSuccess', color: eyeColor});
  }
}

type State = {
  eye: EyeState,
};

const initialState: State = {
  eye: initialEyeState,
};

type Commit = {
  type: 'Eye',
  commit: EyeCommit,
};

type Control<A> = Ship.Ship<*, Commit, State, A>;

function* control(): Control<void> {
  yield* Ship.map(
    commit => ({type: 'Eye', commit}),
    state => state.eye,
    eyeControl()
  );
}

describe('map', () => {
  test('without eye', () => {
    const snapshot = [{"type":"GetState"},{"type":"Commit","commit":{"type":"Eye","commit":{"type":"LoadStart"}}},{"type":"Effect","effect":{"type":"HttpRequest","url":"http://swapi.co/api/people/3/"},"result":"{\"name\":\"R2-D2\",\"eye_color\":\"red\"}"},{"type":"Commit","commit":{"type":"Eye","commit":{"type":"LoadSuccess","color":"red"}}}];
    expect(Ship.simulate(control(), snapshot)).toEqual(snapshot);
  });
  test('with eye', () => {
    const snapshot = [{"type":"GetState",state:"red"}];
    expect(Ship.simulate(control(), snapshot)).toEqual(snapshot);
  });
});
