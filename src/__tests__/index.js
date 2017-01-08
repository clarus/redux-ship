// @flow
import * as Ship from '../index';

type Store<Commit, State> = {
  dispatch: (commit: Commit) => void | Promise<void>,
  getState: () => State,
};

function createStore<Commit, State>(
  reduce: (state: State, commit: Commit) => State,
  initialState: State
): Store<Commit, State> {
  let state = initialState;
  return {
    dispatch(commit) {
      state = reduce(state, commit);
    },
    getState() {
      return state;
    }
  };
}

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

function eyeReduce(state: EyeState, commit: EyeCommit): EyeState {
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

const initialState: State = {
  eye: initialEyeState,
};

type Commit = {
  type: 'Eye',
  commit: EyeCommit,
};

function reduce(state: State, commit: Commit): State {
  switch (commit.type) {
  case 'Eye':
    return {
      ...state,
      eye: eyeReduce(state.eye, commit.commit),
    };
  default:
    return state;
  }
}

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
  test('without eye', async () => {
    const store = createStore(eyeReduce, initialEyeState);
    await Ship.run(runEffect, store, eyeControl());
    expect(store.getState()).toMatchSnapshot();
  });

  test('twice', async () => {
    const store = createStore(eyeReduce, initialEyeState);
    await Ship.run(runEffect, store, eyeControl());
    await Ship.run(runEffect, store, eyeControl());
    expect(store.getState()).toMatchSnapshot();
  });
});

function testSimulateAndSnap<Commit, State>(
  name: string,
  store: Store<Commit, State>,
  control: () => Ship.Ship<Effect, Commit, State, void>
): void {
  test(name, async () => {
    const {snapshot} = await Ship.run(runEffect, store, Ship.snap(control()));
    expect(snapshot).toMatchSnapshot();
    expect(Ship.simulate(control(), snapshot)).toEqual(snapshot);
  });
}

describe('simulate and snap', () => {
  testSimulateAndSnap(
    'without eye',
    createStore(eyeReduce, initialEyeState),
    eyeControl
  );

  testSimulateAndSnap(
    'with eye',
    createStore(eyeReduce, {...initialEyeState, color: 'red'}),
    eyeControl
  );

  testSimulateAndSnap(
    'with map',
    createStore(reduce, initialState),
    control
  );
});
