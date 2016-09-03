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
    return Promise.resolve((result.value: any));
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

export function* waitAny<Action, State, A>(fn: (...args: any[]) => Promise<A>, ...args: any[])
  : t<Action, State, A> {
  const result: any = yield {
    type: 'Wait',
    args,
    fn,
  };
  return result;
}

export function wait0<Action, State, A>(promise: Promise<A>): t<Action, State, A> {
  return waitAny(() => promise);
}

export const wait1: <Action, State, A1, B>(
  fn: (arg1: A1) => Promise<B>,
  arg1: A1
) => t<Action, State, B> =
  waitAny;

export const wait2: <Action, State, A1, A2, B>(
  fn: (arg1: A1, arg2: A2) => Promise<B>,
  arg1: A1, arg2: A2
) => t<Action, State, B> =
  waitAny;

export const wait3: <Action, State, A1, A2, A3, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3) => Promise<B>,
  arg1: A1, arg2: A2, arg3: A3
) => t<Action, State, B> =
  waitAny;

export const wait4: <Action, State, A1, A2, A3, A4, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => Promise<B>,
  arg1: A1, arg2: A2, arg3: A3, arg4: A4
) => t<Action, State, B> =
  waitAny;

export function* callAny<Action, State, A>(
  fn: (...args: any[]) => t<Action, State, A>, ...args: any[]
): t<Action, State, A> {
  const result: any = yield {
    type: 'Call',
    args,
    fn,
  };
  return result;
}

export function call0<Action, State, A>(ship: t<Action, State, A>): t<Action, State, A> {
  return callAny(() => ship);
}

export const call1: <Action, State, A1, B>(
  fn: (arg1: A1) => t<Action, State, B>,
  arg1: A1
) => t<Action, State, B> =
  callAny;

export const call2: <Action, State, A1, A2, B>(
  fn: (arg1: A1, arg2: A2) => t<Action, State, B>,
  arg1: A1, arg2: A2
) => t<Action, State, B> =
  callAny;

export const call3: <Action, State, A1, A2, A3, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3) => t<Action, State, B>,
  arg1: A1, arg2: A2, arg3: A3
) => t<Action, State, B> =
  callAny;

export const call4: <Action, State, A1, A2, A3, A4, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => t<Action, State, B>,
  arg1: A1, arg2: A2, arg3: A3, arg4: A4
) => t<Action, State, B> =
  callAny;

export function* impureAny<Action, State, A>(fn: (...args: any[]) => A, ...args: any[])
  : t<Action, State, A> {
  const result: any = yield {
    type: 'Impure',
    args,
    fn,
  };
  return result;
}

export function impure0<Action, State, A>(value: A): t<Action, State, A> {
  return impureAny(() => value);
}

export const impure1: <Action, State, A1, B>(
  fn: (arg1: A1) => B,
  arg1: A1
) => t<Action, State, B> =
  impureAny;

export const impure2: <Action, State, A1, A2, B>(
  fn: (arg1: A1, arg2: A2) => B,
  arg1: A1, arg2: A2
) => t<Action, State, B> =
  impureAny;

export const impure3: <Action, State, A1, A2, A3, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3) => B,
  arg1: A1, arg2: A2, arg3: A3
) => t<Action, State, B> =
  impureAny;

export const impure4: <Action, State, A1, A2, A3, A4, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) => B,
  arg1: A1, arg2: A2, arg3: A3, arg4: A4
) => t<Action, State, B> =
  impureAny;

export function* allAny<Action, State>(...ships: t<Action, State, any>[]): t<Action, State, any[]> {
  const result: any = yield {
    type: 'All',
    ships,
  };
  return result;
}

export const all: <Action, State, A>(...ships: t<Action, State, A>[]) => t<Action, State, A[]> =
  allAny;

export const all2: <Action, State, A1, A2>(
  ship1: t<Action, State, A1>,
  ship2: t<Action, State, A2>
) => t<Action, State, [A1, A2]> =
  allAny;

export const all3: <Action, State, A1, A2, A3>(
  ship1: t<Action, State, A1>,
  ship2: t<Action, State, A2>,
  ship3: t<Action, State, A3>
) => t<Action, State, [A1, A2, A3]> =
  allAny;

export const all4: <Action, State, A1, A2, A3, A4>(
  ship1: t<Action, State, A1>,
  ship2: t<Action, State, A2>,
  ship3: t<Action, State, A3>,
  ship4: t<Action, State, A4>
) => t<Action, State, [A1, A2, A3, A4]> =
  allAny;

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
  case 'Call': {
    const {value} = result;
    const newAnswer = yield {
      type: 'Call',
      args: value.args,
      fn: (...args) => mapWithAnswer(value.fn(...args), mapAction, mapState),
    };
    return yield* mapWithAnswer(ship, mapAction, mapState, newAnswer);
  }
  case 'Impure': {
    const newAnswer = yield result.value;
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
    const newAnswer: any = yield result.value;
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

export type Trace<Action, State> = {
  type: 'Done',
  result: any,
} | {
  type: 'Wait',
  args: any[],
  next: Trace<Action, State>,
  result: any,
} | {
  type: 'Call',
  args: any[],
  next: Trace<Action, State>,
  trace: Trace<Action, State>,
} | {
  type: 'Impure',
  args: any[],
  next: Trace<Action, State>,
  result: any,
} | {
  type: 'All',
  next: Trace<Action, State>,
  traces: Trace<Action, State>[],
} | {
  type: 'Dispatch',
  action: Action,
  next: Trace<Action, State>,
} | {
  type: 'GetState',
  next: Trace<Action, State>,
  state: State,
};

export function* trace<Action, State, A>(ship: t<Action, State, A>, answer?: any)
  : t<Action, State, {result: A, trace: Trace<Action, State>}> {
  const result = ship.next(answer);
  if (result.done) {
    return {
      result: (result.value: any),
      trace: {
        type: 'Done',
        result: result.value,
      },
    };
  }
  switch (result.value.type) {
  case 'Wait': {
    const {value} = result;
    const newAnswer = yield value;
    const next = yield* trace(ship, newAnswer);
    return {
      result: next.result,
      trace: {
        type: 'Wait',
        args: value.args,
        next: next.trace,
        result: newAnswer,
      },
    };
  }
  case 'Call': {
    const {value} = result;
    const newAnswer: any = yield {
      type: 'Call',
      args: value.args,
      fn: (...args) => trace(value.fn(...args)),
    };
    const next = yield* trace(ship, newAnswer.result);
    return {
      result: next.result,
      trace: {
        type: 'Call',
        args: value.args,
        next: next.trace,
        trace: newAnswer.trace,
      },
    };
  }
  case 'Impure': {
    const {value} = result;
    const newAnswer = yield value;
    const next = yield* trace(ship, newAnswer);
    return {
      result: next.result,
      trace: {
        type: 'Impure',
        args: value.args,
        next: next.trace,
        result: newAnswer,
      },
    };
  }
  case 'All': {
    const newAnswer: any = yield {
      type: 'All',
      ships: result.value.ships.map(trace),
    };
    const next = yield* trace(ship, newAnswer.map((currentAnswer) => currentAnswer.result));
    return {
      result: next.result,
      trace: {
        type: 'All',
        next: next.trace,
        traces: newAnswer.map((currentAnswer) => currentAnswer.trace),
      },
    };
  }
  case 'Dispatch': {
    const {value} = result;
    yield value;
    const next = yield* trace(ship);
    return {
      result: next.result,
      trace: {
        type: 'Dispatch',
        action: value.action,
        next: next.trace,
      },
    };
  }
  case 'GetState': {
    const newAnswer: any = yield result.value;
    const next = yield* trace(ship, newAnswer);
    return {
      result: next.result,
      trace: {
        type: 'GetState',
        next: next.trace,
        state: newAnswer,
      },
    };
  }
  default:
    return result.value;
  }
}

function delayPromise(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function delay<Action, State>(ms: number): t<Action, State, void> {
  return wait1(delayPromise, ms);
}
