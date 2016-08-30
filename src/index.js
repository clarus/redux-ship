// @flow
/* eslint-disable no-undef */

export type Effect<Action, Model> = {
  type: 'Wait',
  args: any[],
  fn: (...args: any[]) => Promise<any>,
} | {
  type: 'Call',
  args: any[],
  fn: (...args: any[]) => Generator<Effect<Action, Model>, any, any>,
} | {
  type: 'Impure',
  args: any[],
  fn: (...args: any[]) => any,
} | {
  type: 'All',
  ships: Generator<Effect<Action, Model>, any, any>[],
} | {
  type: 'Dispatch',
  action: Action,
} | {
  type: 'GetState',
};

export type t<Action, Model, A> = Generator<Effect<Action, Model>, A, any>;

function run<Action, Model, A>(
  dispatch: (action: Action) => void | Promise<void>,
  getState: () => Model,
  ship: t<Action, Model, A>,
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

type ReduxStore<Action, Model> = {
  dispatch: (action: Action) => void | Promise<void>,
  getState: () => Model,
};

export function middleware<Action, Model>(
  actionToShip: (action: Action) => t<Action, Model, void>) {
  // eslint-disable-next-line no-unused-vars
  return (store: ReduxStore<Action, Model>) => (next: mixed) => (action: Action): Promise<void> => {
    const ship = actionToShip(action);
    return run(store.dispatch, store.getState, ship);
  };
}

export const wait:
  (<Action, Model, B>(
    promise: Promise<B>
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, B>(
    fn: (arg1: A1) => Promise<B>,
    arg1: A1
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, A2, B>(
    fn: (arg1: A1, arg2: A2) => Promise<B>,
    arg1: A1, arg2: A2
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, A2, A3, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3) => Promise<B>,
    arg1: A1, arg2: A2, arg3: A3
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, A2, A3, A4, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Promise<B>,
    arg1: A1, arg2: A2, arg3: A3, arg4: A4
  ) => t<Action, Model, B>) =
  function* (fn: any, ...args: any[]) {
    const result = yield {
      type: 'Wait',
      args,
      fn: args.length === 0 ? () => fn : fn,
    };
    return (result: any);
  };

export const call:
  (<Action, Model, B>(
    ship: t<Action, Model, B>
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, B>(
    fn: (arg1: A1) => t<Action, Model, B>,
    arg1: A1
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, A2, B>(
    fn: (arg1: A1, arg2: A2) => t<Action, Model, B>,
    arg1: A1, arg2: A2
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, A2, A3, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3) => t<Action, Model, B>,
    arg1: A1, arg2: A2, arg3: A3
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, A2, A3, A4, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => t<Action, Model, B>,
    arg1: A1, arg2: A2, arg3: A3, arg4: A4
  ) => t<Action, Model, B>) =
  function* (fn: any, ...args: any[]) {
    const result = yield {
      type: 'Call',
      args,
      fn: args.length === 0 ? () => fn : fn,
    };
    return (result: any);
  };

export const impure:
  (<Action, Model, B>(
    value: B
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, B>(
    fn: (arg1: A1) => B,
    arg1: A1
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, A2, B>(
    fn: (arg1: A1, arg2: A2) => B,
    arg1: A1, arg2: A2
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, A2, A3, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3) => B,
    arg1: A1, arg2: A2, arg3: A3
  ) => t<Action, Model, B>) &
  (<Action, Model, A1, A2, A3, A4, B>(
    fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => B,
    arg1: A1, arg2: A2, arg3: A3, arg4: A4
  ) => t<Action, Model, B>) =
  function* (fn: any, ...args: any[]) {
    const result = yield {
      type: 'Call',
      args,
      fn: args.length === 0 ? () => fn : fn,
    };
    return (result: any);
  };

export const all:
  (<Action, Model, A>(
    ...ships: t<Action, Model, A>[]
  ) => t<Action, Model, A[]>) &
  (<Action, Model, A1, A2>(
    ship1: t<Action, Model, A1>,
    ship2: t<Action, Model, A2>
  ) => t<Action, Model, [A1, A2]>) &
  (<Action, Model, A1, A2, A3>(
    ship1: t<Action, Model, A1>,
    ship2: t<Action, Model, A2>,
    ship3: t<Action, Model, A3>
  ) => t<Action, Model, [A1, A2, A3]>) &
  (<Action, Model, A1, A2, A3, A4>(
    ship1: t<Action, Model, A1>,
    ship2: t<Action, Model, A2>,
    ship3: t<Action, Model, A3>,
    ship4: t<Action, Model, A4>
  ) => t<Action, Model, [A1, A2, A3, A4]>) =
  function* (...ships: any[]) {
    const result = yield {
      type: 'All',
      ships,
    };
    return (result: any);
  };

export function* dispatch<Action, Model>(action: Action): t<Action, Model, void> {
  yield {
    type: 'Dispatch',
    action,
  };
}

export function* getState<Action, Model>(): t<Action, Model, Model> {
  const model = yield {
    type: 'GetState',
  };
  return (model: any);
}
