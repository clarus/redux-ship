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

export function eyeReduce(state: EyeState, commit: EyeCommit): EyeState {
  switch (commit.type) {
  case 'LoadStart':
    return {
      ...state,
      isLoading: true,
    };
  case 'LoadSuccess':
    return {
      ...state,
      color: commit.color,
      isLoading: false,
    };
  default:
    return state;
  }
}

type EyeControl<A> = Ship.Ship<*, EyeCommit, EyeState, A>;

function* eyeControl(): EyeControl<void> {
  const currentEyeColor = yield* Ship.getState(state => state.color);
  if (!currentEyeColor) {
    yield* Ship.commit({type: 'LoadStart'});
    const [r2d2] = yield* Ship.all2(
      httpRequest('http://swapi.co/api/people/3/'),
      httpRequest('http://swapi.co/api/people/4/')
    );
    const eyeColor = JSON.parse(r2d2).eye_color;
    yield* Ship.commit({type: 'LoadSuccess', color: eyeColor});
  }
}

type State = {
  eye: EyeState,
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
    const effectSnapshot = (id, name, eyeColor) => ({
      type: 'Effect',
      effect: {
        type: 'HttpRequest',
        url: `http://swapi.co/api/people/${id}/`,
      },
      result: JSON.stringify({
        eye_color: eyeColor,
        name,
      }),
    });
    const snapshot = [
      {type: 'GetState'},
      {type: 'Commit', commit: {type: 'Eye', commit: {type: 'LoadStart'}}},
      {
        type: 'All',
        snapshots: [
          [effectSnapshot('3', 'R2-D2', 'red')],
          [effectSnapshot('4', 'Darth Vader', 'yellow')],
        ],
      },
      {type: 'Commit', commit: {type: 'Eye', commit: {type: 'LoadSuccess', color: 'red'}}},
    ];
    expect(Ship.simulate(control(), snapshot)).toEqual(snapshot);
  });
  test('with eye', () => {
    const snapshot = [
      {type: 'GetState', state: 'red'}
    ];
    expect(Ship.simulate(control(), snapshot)).toEqual(snapshot);
  });
});

describe('run', () => {
  function runEffect(effect: Effect) {
    switch (effect.type) {
    case 'HttpRequest':
      return JSON.stringify({
        eye_color: 'red',
        name: 'R2-D2',
      });
    default:
      return;
    }
  }

  function createStore(initialState: EyeState) {
    let state = initialState;
    return {
      dispatch(commit) {
        state = eyeReduce(state, commit);
      },
      getState() {
        return state;
      }
    };
  }

  test('without eye', async () => {
    const store = createStore(initialEyeState);
    await Ship.run(runEffect, store, eyeControl());
    expect(store.getState()).toMatchSnapshot();
  });

  test('twice', async () => {
    const store = createStore(initialEyeState);
    await Ship.run(runEffect, store, eyeControl());
    await Ship.run(runEffect, store, eyeControl());
    expect(store.getState()).toMatchSnapshot();
  });
});
