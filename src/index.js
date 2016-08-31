// @flow
/* eslint-disable no-undef */

export type Effect<Action, State> = {
  type: 'Wait',
  args: any[],
  fn: (...args: any[]) => Promise<any>,
} | {
  type: 'Call',
  args: any[],
  fn: (...args: any[]) => Generator<Effect<Action, State>, any, any>,
} | {
  type: 'Impure',
  args: any[],
  fn: (...args: any[]) => any,
} | {
  type: 'All',
  ships: Generator<Effect<Action, State>, any, any>[],
} | {
  type: 'Dispatch',
  action: Action,
} | {
  type: 'GetState',
};

export type t<Action, State, A> = Generator<Effect<Action, State>, A, any>;

function run<Action, State, A>(
  dispatch: (action: Action) => void | Promise<void>,
  getState: () => State,
  ship: t<Action, State, A>,
  answer?: any)
  : Promise<A> {
  const result = ship.next(answer);
  if (result.done) {
    return Promise.resolve(result.value);
  }
  switch (result.value.type) {
  case 'Wait':
    return result.value.fn(...result.value.args).then(newAnswer =>
      run(dispatch, getState, ship, newAnswer)
    );
  case 'Call':
    return run(dispatch, getState, result.value.fn(...result.value.args)).then(newAnswer =>
      run(dispatch, getState, ship, newAnswer)
    );
  case 'Impure': {
    const newAnswer = result.value.fn(...result.value.args);
    return run(dispatch, getState, ship, newAnswer);
  }
  case 'All':
    return Promise.all(result.value.ships.map(currentShip =>
      run(dispatch, getState, currentShip))
    ).then(newAnswer =>
      run(dispatch, getState, ship, newAnswer)
    );
  case 'Dispatch':
    return Promise.resolve(dispatch(result.value.action)).then(() =>
      run(dispatch, getState, ship)
    );
  case 'GetState': {
    const newAnswer = getState();
    return run(dispatch, getState, ship, newAnswer);
  }
  default:
    return result.value;
  }
}

type ReduxStore<Action, State> = {
  dispatch: (action: Action) => void | Promise<void>,
  getState: () => State,
};

type ReduxMiddleware<Action, State> =
  (store: ReduxStore<Action, State>) =>
  (next: (action: Action) => any) =>
  (action: Action) =>
  any;

export function middleware<Action, State>(
  actionToShip: (action: Action) => ?t<Action, State, void>
): ReduxMiddleware<Action, State> {
  return store => next => action => {
    const ship = actionToShip(action);
    if (ship) {
      return run(store.dispatch, store.getState, ship);
    }
    return next(action);
  };
}

function* untypedWait(fn: any, ...args: any[]) {
  const result = yield {
    type: 'Wait',
    args,
    fn: args.length === 0 ? () => fn : fn,
  };
  return (result: any);
}

export const wait:
  (<Action, State, B>(
    promise: Promise<B>
  ) => t<Action, State, B>) &
  (<Action, State, A1, B>(
    fn: (arg1: A1) => Promise<B>,
    arg1: A1
  ) => t<Action, State, B>) &
  (<Action, State, A1, A2, B>(
    fn: (arg1: A1, arg2: A2) => Promise<B>,
    arg1: A1, arg2: A2
  ) => t<Action, State, B>) &
  (<Action, State, A1, A2, A3, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3) => Promise<B>,
    arg1: A1, arg2: A2, arg3: A3
  ) => t<Action, State, B>) &
  (<Action, State, A1, A2, A3, A4, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Promise<B>,
    arg1: A1, arg2: A2, arg3: A3, arg4: A4
  ) => t<Action, State, B>) =
  untypedWait;

function* untypedCall(fn: any, ...args: any[]) {
  const result = yield {
    type: 'Call',
    args,
    fn: args.length === 0 ? () => fn : fn,
  };
  return (result: any);
}

export const call:
  (<Action, State, B>(
    ship: t<Action, State, B>
  ) => t<Action, State, B>) &
  (<Action, State, A1, B>(
    fn: (arg1: A1) => t<Action, State, B>,
    arg1: A1
  ) => t<Action, State, B>) &
  (<Action, State, A1, A2, B>(
    fn: (arg1: A1, arg2: A2) => t<Action, State, B>,
    arg1: A1, arg2: A2
  ) => t<Action, State, B>) &
  (<Action, State, A1, A2, A3, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3) => t<Action, State, B>,
    arg1: A1, arg2: A2, arg3: A3
  ) => t<Action, State, B>) &
  (<Action, State, A1, A2, A3, A4, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => t<Action, State, B>,
    arg1: A1, arg2: A2, arg3: A3, arg4: A4
  ) => t<Action, State, B>) =
  untypedCall;

function* untypedImpure(fn: any, ...args: any[]) {
  const result = yield {
    type: 'Impure',
    args,
    fn: args.length === 0 ? () => fn : fn,
  };
  return (result: any);
}

export const impure:
  (<Action, State, B>(
    value: B
  ) => t<Action, State, B>) &
  (<Action, State, A1, B>(
    fn: (arg1: A1) => B,
    arg1: A1
  ) => t<Action, State, B>) &
  (<Action, State, A1, A2, B>(
    fn: (arg1: A1, arg2: A2) => B,
    arg1: A1, arg2: A2
  ) => t<Action, State, B>) &
  (<Action, State, A1, A2, A3, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3) => B,
    arg1: A1, arg2: A2, arg3: A3
  ) => t<Action, State, B>) &
  (<Action, State, A1, A2, A3, A4, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => B,
    arg1: A1, arg2: A2, arg3: A3, arg4: A4
  ) => t<Action, State, B>) =
  untypedImpure;

function* untypedAll(...ships: any[]) {
  const result = yield {
    type: 'All',
    ships,
  };
  return (result: any);
}

export const all:
  (<Action, State, A>(
    ...ships: t<Action, State, A>[]
  ) => t<Action, State, A[]>) &
  (<Action, State, A1, A2>(
    ship1: t<Action, State, A1>,
    ship2: t<Action, State, A2>
  ) => t<Action, State, [A1, A2]>) &
  (<Action, State, A1, A2, A3>(
    ship1: t<Action, State, A1>,
    ship2: t<Action, State, A2>,
    ship3: t<Action, State, A3>
  ) => t<Action, State, [A1, A2, A3]>) &
  (<Action, State, A1, A2, A3, A4>(
    ship1: t<Action, State, A1>,
    ship2: t<Action, State, A2>,
    ship3: t<Action, State, A3>,
    ship4: t<Action, State, A4>
  ) => t<Action, State, [A1, A2, A3, A4]>) =
  untypedAll;

export function* dispatch<Action, State>(action: Action): t<Action, State, void> {
  yield {
    type: 'Dispatch',
    action,
  };
}

export function* getState<Action, State>(): t<Action, State, State> {
  const state: any = yield {
    type: 'GetState',
  };
  return state;
}

function* mapWithAnswer<Action1, State1, Action2, State2, A>(
  ship: t<Action1, State1, A>,
  mapAction: (action1: Action1) => Action2,
  mapState: (state2: State2) => State1,
  answer?: any
): t<Action2, State2, A> {
  const result = ship.next(answer);
  if (result.done) {
    return (result.value: any);
  }
  switch (result.value.type) {
  case 'Wait': {
    const newAnswer = yield result.value;
    return yield* mapWithAnswer(ship, mapAction, mapState, newAnswer);
  }
  case 'Impure': {
    const newAnswer = yield result.value;
    return yield* mapWithAnswer(ship, mapAction, mapState, newAnswer);
  }
  case 'Call': {
    const {value} = result;
    const newAnswer = yield {
      type: 'Call',
      args: value.args,
      fn: (...args) => mapWithAnswer(value.fn(args), mapAction, mapState),
    };
    return yield* mapWithAnswer(ship, mapAction, mapState, newAnswer);
  }
  case 'All': {
    const newAnswer = yield {
      type: 'All',
      ships: result.value.ships.map((currentShip) =>
        mapWithAnswer(currentShip, mapAction, mapState)),
    };
    return yield* mapWithAnswer(ship, mapAction, mapState, newAnswer);
  }
  case 'Dispatch':
    yield {
      type: 'Dispatch',
      action: mapAction(result.value.action),
    };
    return yield* mapWithAnswer(ship, mapAction, mapState);
  case 'GetState': {
    const newAnswer: any = yield {
      type: 'GetState',
    };
    return yield* mapWithAnswer(ship, mapAction, mapState, mapState(newAnswer));
  }
  default:
    return result.value;
  }
}

export function map<Action1, State1, Action2, State2, A>(
  ship: ?t<Action1, State1, A>,
  mapAction: (action1: Action1) => Action2,
  mapState: (state2: State2) => State1
): ?t<Action2, State2, A> {
  return ship && mapWithAnswer(ship, mapAction, mapState);
}

function delayPromise(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function* delay<Action, State>(ms: number): t<Action, State, void> {
  yield* wait(delayPromise, ms);
}
