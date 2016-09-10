// @flow
/* eslint-disable no-undef */

export type Effect<Action, State> = {
  type: 'Call',
  args: any[],
  fn: (...args: any[]) => Promise<any>,
} | {
  type: 'All',
  ships: Generator<Effect<Action, State>, any, any>[],
} | {
  type: 'Next',
  action: Action,
} | {
  type: 'GetState',
};

export type t<Action, State, A> = Generator<Effect<Action, State>, A, any>;

function runWithAnswer<Action, State, A>(
  next: (action: Action) => void | Promise<void>,
  getState: () => State,
  ship: t<Action, State, A>,
  answer?: any)
  : Promise<A> {
  const result = ship.next(answer);
  if (result.done) {
    return Promise.resolve((result.value: any));
  }
  switch (result.value.type) {
  case 'Call': {
    const fnResult = result.value.fn(...result.value.args);
    return fnResult.then(newAnswer =>
      runWithAnswer(next, getState, ship, newAnswer)
    );
  }
  case 'All':
    return Promise.all(result.value.ships.map(currentShip =>
      runWithAnswer(next, getState, currentShip))
    ).then(newAnswer =>
      runWithAnswer(next, getState, ship, newAnswer)
    );
  case 'Next':
    return Promise.resolve(next(result.value.action)).then(() =>
      runWithAnswer(next, getState, ship)
    );
  case 'GetState': {
    const newAnswer = getState();
    return runWithAnswer(next, getState, ship, newAnswer);
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
  (next: (action: Action) => void | Promise<void>) =>
  (action: Action) =>
  any;

export function middleware<Action, State>(
  actionToShip: (action: Action) => t<Action, State, void>
): ReduxMiddleware<Action, State> {
  return store => next => action => {
    const ship = actionToShip(action);
    runWithAnswer(next, store.getState, ship);
    return next(action);
  };
}

function* callAny<Action, State, A>(
  fn: (...args: any[]) => A | Promise<A>, ...args: any[]
): t<Action, State, A> {
  const result: any = yield {
    type: 'Call',
    args,
    fn: (...args) => Promise.resolve(fn(...args)),
  };
  return result;
}

export function call0<Action, State, A>(value: A | Promise<A>)
  : t<Action, State, A> {
  return callAny(() => value);
}

export const call1: <Action, State, A1, B>(
  fn: (arg1: A1) =>
    B | Promise<B>,
  arg1: A1
) => t<Action, State, B> =
  callAny;

export const call2: <Action, State, A1, A2, B>(
  fn: (arg1: A1, arg2: A2) =>
    B | Promise<B>,
  arg1: A1, arg2: A2
) => t<Action, State, B> =
  callAny;

export const call3: <Action, State, A1, A2, A3, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3) =>
    B | Promise<B>,
  arg1: A1, arg2: A2, arg3: A3
) => t<Action, State, B> =
  callAny;

export const call4: <Action, State, A1, A2, A3, A4, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4) =>
    B | Promise<B>,
  arg1: A1, arg2: A2, arg3: A3, arg4: A4
) => t<Action, State, B> =
  callAny;

export const call5: <Action, State, A1, A2, A3, A4, A5, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5) =>
    B | Promise<B>,
  arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5
) => t<Action, State, B> =
  callAny;

export const call6: <Action, State, A1, A2, A3, A4, A5, A6, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6) =>
    B | Promise<B>,
  arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6
) => t<Action, State, B> =
  callAny;

export const call7: <Action, State, A1, A2, A3, A4, A5, A6, A7, B>(
  fn: (arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6, arg7: A7) =>
    B | Promise<B>,
  arg1: A1, arg2: A2, arg3: A3, arg4: A4, arg5: A5, arg6: A6, arg7: A7
) => t<Action, State, B> =
  callAny;

function* allAny<Action, State>(...ships: t<Action, State, any>[]): t<Action, State, any[]> {
  const result: any = yield {
    type: 'All',
    ships,
  };
  return result;
}

export function all<Action, State, A>(ships: t<Action, State, A>[]): t<Action, State, A[]> {
  return allAny(...ships);
}

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

export const all5: <Action, State, A1, A2, A3, A4, A5>(
  ship1: t<Action, State, A1>,
  ship2: t<Action, State, A2>,
  ship3: t<Action, State, A3>,
  ship4: t<Action, State, A4>,
  ship4: t<Action, State, A5>
) => t<Action, State, [A1, A2, A3, A4, A5]> =
  allAny;

export const all6: <Action, State, A1, A2, A3, A4, A5, A6>(
  ship1: t<Action, State, A1>,
  ship2: t<Action, State, A2>,
  ship3: t<Action, State, A3>,
  ship4: t<Action, State, A4>,
  ship4: t<Action, State, A5>,
  ship4: t<Action, State, A6>
) => t<Action, State, [A1, A2, A3, A4, A5, A6]> =
  allAny;

export const all7: <Action, State, A1, A2, A3, A4, A5, A6, A7>(
  ship1: t<Action, State, A1>,
  ship2: t<Action, State, A2>,
  ship3: t<Action, State, A3>,
  ship4: t<Action, State, A4>,
  ship4: t<Action, State, A5>,
  ship4: t<Action, State, A6>,
  ship4: t<Action, State, A7>
) => t<Action, State, [A1, A2, A3, A4, A5, A6, A7]> =
  allAny;

export function* next<Action, State>(action: Action): t<Action, State, void> {
  yield {
    type: 'Next',
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
  case 'Call': {
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
  case 'Next':
    yield {
      type: 'Next',
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

export const map: <Action1, State1, Action2, State2, A>(
  ship: t<Action1, State1, A>,
  mapAction: (action1: Action1) => Action2,
  mapState: (state2: State2) => State1
) => t<Action2, State2, A> =
  mapWithAnswer;

type Event<Action, State> = {
  type: 'Return',
  result: any,
} | {
  type: 'Call',
  args: any[],
  result?: any,
} | {
  type: 'All',
  snapshots: (Event<Action, State>[])[],
} | {
  type: 'Dispatch',
  action: Action
} | {
  type: 'GetState',
  state: State,
}

export type Snapshot<Action, State> = Event<Action, State>[];

function* snapshotWithAnswer<Action, State, A>(ship: t<Action, State, A>, answer?: any)
  : t<Action, State, {result: A, snapshot: Snapshot<Action, State>}> {
  const result = ship.next(answer);
  if (result.done) {
    return {
      result: (result.value: any),
      snapshot: result.value === undefined ? [] : [{
        type: 'Return',
        result: result.value,
      }],
    };
  }
  switch (result.value.type) {
  case 'Call': {
    const {value} = result;
    const newAnswer: any = yield value;
    const next = yield* snapshotWithAnswer(ship, newAnswer);
    return {
      result: next.result,
      snapshot: [
        {
          type: 'Call',
          args: value.args,
          result: newAnswer,
        },
        ...next.snapshot,
      ],
    };
  }
  case 'All': {
    const newAnswer: any = yield {
      type: 'All',
      ships: result.value.ships.map(snapshotWithAnswer),
    };
    const next = yield* snapshotWithAnswer(ship, newAnswer.map((currentAnswer) => currentAnswer.result));
    return {
      result: next.result,
      snapshot: [
        {
          type: 'All',
          snapshots: newAnswer.map((currentAnswer) => currentAnswer.snapshot),
        },
        ...next.snapshot,
      ],
    };
  }
  case 'Next': {
    const {value} = result;
    yield value;
    const next = yield* snapshotWithAnswer(ship);
    return {
      result: next.result,
      snapshot: [
        {
          type: 'Dispatch',
          action: value.action,
        },
        ...next.snapshot,
      ],
    };
  }
  case 'GetState': {
    const newAnswer: any = yield result.value;
    const next = yield* snapshotWithAnswer(ship, newAnswer);
    return {
      result: next.result,
      snapshot: [
        {
          type: 'GetState',
          state: newAnswer,
        },
        ...next.snapshot,
      ],
    };
  }
  default:
    return result.value;
  }
}

export const snapshot: <Action, State, A>(
  ship: t<Action, State, A>
) => t<Action, State, {result: A, snapshot: Snapshot<Action, State>}> =
  snapshotWithAnswer;

export type Trace<Action, State> = {
  type: 'Done',
  result?: any,
} | {
  type: 'Call',
  args: any[],
  next: Trace<Action, State>,
  result?: any,
} | {
  type: 'All',
  next: Trace<Action, State>,
  traces: Trace<Action, State>[],
} | {
  type: 'Next',
  action: Action,
  next: Trace<Action, State>,
} | {
  type: 'GetState',
  next: Trace<Action, State>,
  state: State,
};

function* traceWithAnswer<Action, State, A>(ship: t<Action, State, A>, answer?: any)
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
  case 'Call': {
    const {value} = result;
    const newAnswer: any = yield value;
    const next = yield* traceWithAnswer(ship, newAnswer);
    return {
      result: next.result,
      trace: {
        type: 'Call',
        args: value.args,
        next: next.trace,
        result: newAnswer,
      },
    };
  }
  case 'All': {
    const newAnswer: any = yield {
      type: 'All',
      ships: result.value.ships.map(traceWithAnswer),
    };
    const next = yield* traceWithAnswer(ship, newAnswer.map((currentAnswer) => currentAnswer.result));
    return {
      result: next.result,
      trace: {
        type: 'All',
        next: next.trace,
        traces: newAnswer.map((currentAnswer) => currentAnswer.trace),
      },
    };
  }
  case 'Next': {
    const {value} = result;
    yield value;
    const next = yield* traceWithAnswer(ship);
    return {
      result: next.result,
      trace: {
        type: 'Next',
        action: value.action,
        next: next.trace,
      },
    };
  }
  case 'GetState': {
    const newAnswer: any = yield result.value;
    const next = yield* traceWithAnswer(ship, newAnswer);
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

export const trace: <Action, State, A>(
  ship: t<Action, State, A>
) => t<Action, State, {result: A, trace: Trace<Action, State>}> =
  traceWithAnswer;

function simulationError<Action, State>(actual: string, expected: string): Trace<Action, State> {
  return {
    type: 'Done',
    result: {
      actual,
      expected,
      message: 'Simulation error',
    },
  };
}

function simulateWithAnswer<Action, State, A>(
  ship: t<Action, State, A>,
  trace: Trace<Action, State>,
  answer?: any
): Trace<Action, State> {
  const result = ship.next(answer);
  if (result.done) {
    return {
      type: 'Done',
      result: result.value,
    };
  }
  switch (result.value.type) {
  case 'Call': {
    if (trace.type === 'Call') {
      const newAnswer = trace.result;
      return {
        type: 'Call',
        args: result.value.args,
        next: simulateWithAnswer(ship, trace.next, newAnswer),
        result: newAnswer,
      };
    }
    return simulationError(trace.type, 'Call');
  }
  case 'All': {
    if (trace.type === 'All') {
      const {traces} = trace;
      const newAnswer = result.value.ships.map((ship, shipIndex) =>
        simulateWithAnswer(ship, traces[shipIndex])
      );
      return {
        type: 'All',
        next: simulateWithAnswer(ship, trace.next, newAnswer),
        traces: newAnswer,
      };
    }
    return simulationError(trace.type, 'All');
  }
  case 'Next': {
    if (trace.type === 'Next') {
      return {
        type: 'Next',
        action: result.value.action,
        next: simulateWithAnswer(ship, trace.next),
      };
    }
    return simulationError(trace.type, 'Next');
  }
  case 'GetState': {
    if (trace.type === 'GetState') {
      const newAnswer = trace.state;
      return {
        type: 'GetState',
        next: simulateWithAnswer(ship, trace.next, newAnswer),
        state: newAnswer,
      };
    }
    return simulationError(trace.type, 'GetState');
  }
  default:
    return result.value;
  }
}

export const simulate: <Action, State, A>(
  ship: t<Action, State, A>,
  trace: Trace<Action, State>
) => Trace<Action, State> =
  simulateWithAnswer;

function delayPromise(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function delay<Action, State>(ms: number): t<Action, State, void> {
  return call1(delayPromise, ms);
}
