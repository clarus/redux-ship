// @flow

// eslint-disable-next-line no-unused-vars
export type Command<Effect, Action, State> = {
  type: 'Effect',
  effect: Effect,
} | {
  type: 'Dispatch',
  action: Action,
} | {
  type: 'GetState',
};

export type Yield<Effect, Action, State> = {
  type: 'Command',
  command: Command<Effect, Action, State>,
} | {
  type: 'All',
  ships: Generator<Yield<Effect, Action, State>, any, any>[],
};

export type t<Effect, Action, State, A> = Generator<Yield<Effect, Action, State>, A, any>;

function runCommand<Effect, Action, State>(
  runEffect: (effect: Effect) => any,
  runDispatch: (action: Action) => void | Promise<void>,
  runGetState: () => State,
  command: Command<Effect, Action, State>
): Promise<any> {
  return Promise.resolve((() => {
    switch (command.type) {
    case 'Effect':
      return runEffect(command.effect);
    case 'Dispatch':
      return runDispatch(command.action);
    case 'GetState':
      return runGetState();
    default:
      return command.type;
    }
  })());
}

function runWithAnswer<Effect, Action, State, A>(
  runEffect: (effect: Effect) => any,
  runDispatch: (action: Action) => void | Promise<void>,
  runGetState: () => State,
  ship: t<Effect, Action, State, A>,
  answer?: any
): Promise<A> {
  const result = ship.next(answer);
  if (result.done) {
    return Promise.resolve((result.value: any));
  }
  switch (result.value.type) {
  case 'Command':
    return runCommand(runEffect, runDispatch, runGetState, result.value.command).then((newAnswer) =>
      runWithAnswer(runEffect, runDispatch, runGetState, ship, newAnswer)
    );
  case 'All':
    return Promise.all(result.value.ships.map(currentShip =>
      runWithAnswer(runEffect, runDispatch, runGetState, currentShip))
    ).then(newAnswer =>
      runWithAnswer(runEffect, runDispatch, runGetState, ship, newAnswer)
    );
  default:
    return result.value.type;
  }
}

type ReduxStore<Action, State> = {
  dispatch: (action: Action) => void | Promise<void>,
  getState: () => State,
};

type ReduxMiddleware<Action, NextAction, State> =
  (store: ReduxStore<Action, State>) =>
  (next: (nextAction: NextAction) => void | Promise<void>) =>
  (action: Action) =>
  Promise<void>;

export function middleware<ShipAction, Effect, Action, State>(
  runEffect: (effect: Effect) => any,
  actionToShip: (shipAction: ShipAction) => t<Effect, Action, State, void>
): ReduxMiddleware<ShipAction, Action, State> {
  return store => next => shipAction => {
    const ship = actionToShip(shipAction);
    return runWithAnswer(runEffect, next, store.getState, ship);
  };
}

export function* call<Effect, Action, State>(effect: Effect): t<Effect, Action, State, any> {
  const result: any = yield {
    type: 'Command',
    command: {
      type: 'Effect',
      effect,
    },
  };
  return result;
}

function* allAny<Effect, Action, State>(
  ...ships: t<Effect, Action, State, any>[]
): t<Effect, Action, State, any[]> {
  const result: any = yield {
    type: 'All',
    ships,
  };
  return result;
}

export function all<Effect, Action, State, A>(
  ships: t<Effect, Action, State, A>[]
): t<Effect, Action, State, A[]> {
  return allAny(...ships);
}

/* eslint-disable no-undef */
export const all2: <Effect, Action, State, A1, A2>(
  ship1: t<Effect, Action, State, A1>,
  ship2: t<Effect, Action, State, A2>
) => t<Effect, Action, State, [A1, A2]> =
  allAny;

export const all3: <Effect, Action, State, A1, A2, A3>(
  ship1: t<Effect, Action, State, A1>,
  ship2: t<Effect, Action, State, A2>,
  ship3: t<Effect, Action, State, A3>
) => t<Effect, Action, State, [A1, A2, A3]> =
  allAny;

export const all4: <Effect, Action, State, A1, A2, A3, A4>(
  ship1: t<Effect, Action, State, A1>,
  ship2: t<Effect, Action, State, A2>,
  ship3: t<Effect, Action, State, A3>,
  ship4: t<Effect, Action, State, A4>
) => t<Effect, Action, State, [A1, A2, A3, A4]> =
  allAny;

export const all5: <Effect, Action, State, A1, A2, A3, A4, A5>(
  ship1: t<Effect, Action, State, A1>,
  ship2: t<Effect, Action, State, A2>,
  ship3: t<Effect, Action, State, A3>,
  ship4: t<Effect, Action, State, A4>,
  ship4: t<Effect, Action, State, A5>
) => t<Effect, Action, State, [A1, A2, A3, A4, A5]> =
  allAny;

export const all6: <Effect, Action, State, A1, A2, A3, A4, A5, A6>(
  ship1: t<Effect, Action, State, A1>,
  ship2: t<Effect, Action, State, A2>,
  ship3: t<Effect, Action, State, A3>,
  ship4: t<Effect, Action, State, A4>,
  ship4: t<Effect, Action, State, A5>,
  ship4: t<Effect, Action, State, A6>
) => t<Effect, Action, State, [A1, A2, A3, A4, A5, A6]> =
  allAny;

export const all7: <Effect, Action, State, A1, A2, A3, A4, A5, A6, A7>(
  ship1: t<Effect, Action, State, A1>,
  ship2: t<Effect, Action, State, A2>,
  ship3: t<Effect, Action, State, A3>,
  ship4: t<Effect, Action, State, A4>,
  ship4: t<Effect, Action, State, A5>,
  ship4: t<Effect, Action, State, A6>,
  ship4: t<Effect, Action, State, A7>
) => t<Effect, Action, State, [A1, A2, A3, A4, A5, A6, A7]> =
  allAny;
/* eslint-enable no-undef */

export function* dispatch<Effect, Action, State>(action: Action): t<Effect, Action, State, void> {
  yield {
    type: 'Command',
    command: {
      type: 'Dispatch',
      action,
    },
  };
}

export function* getState<Effect, Action, State>(): t<Effect, Action, State, State> {
  const state: any = yield {
    type: 'Command',
    command: {
      type: 'GetState',
    },
  };
  return state;
}

function* mapWithAnswer<Action1, State1, Effect1, Action2, State2, Effect2, A>(
  ship: t<Action1, State1, Effect1, A>,
  mapAction: (action1: Action1) => Action2,
  mapState: (state2: State2) => State1,
  mapEffect: (effect1: Effect1) => Effect2,
  answer?: any
): t<Action2, State2, Effect2, A> {
  const result = ship.next(answer);
  if (result.done) {
    return (result.value: any);
  }
  switch (result.value.type) {
  case 'Call': {
    const newAnswer = yield {
      type: 'Call',
      effect: mapEffect(result.value.effect),
    };
    return yield* mapWithAnswer(ship, mapAction, mapState, mapEffect, newAnswer);
  }
  case 'All': {
    const newAnswer = yield {
      type: 'All',
      mapWithAnswer(currentShip, mapAction, mapState, mapEffect),
      ships: result.value.ships.map((currentShip) =>
    };
    return yield* mapWithAnswer(ship, mapAction, mapState, mapEffect, newAnswer);
  }
  case 'Next':
    yield {
      type: 'Next',
      action: mapAction(result.value.action),
    };
    return yield* mapWithAnswer(ship, mapAction, mapState, mapEffect);
  case 'GetState': {
    const newAnswer: any = yield result.value;
    return yield* mapWithAnswer(ship, mapAction, mapState, mapEffect, mapState(newAnswer));
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

export type Event<Action, State> = {
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
