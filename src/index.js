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
      return command;
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
    return result.value;
  }
}

/* eslint-disable no-undef */
export const run: <Effect, Action, State, A>(
  runEffect: (effect: Effect) => any,
  runDispatch: (action: Action) => void | Promise<void>,
  runGetState: () => State,
  ship: t<Effect, Action, State, A>
) => Promise<A> =
  runWithAnswer;
/* eslint-enable no-undef */

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

function* mapCommand<Effect1, Action1, State1, Effect2, Action2, State2>(
  liftEffect: (effect1: Effect1) => t<Effect2, Action2, State2, any>,
  liftAction: (action1: Action1) => Action2,
  liftState: (state2: State2) => State1,
  command: Command<Effect1, Action1, State1>
): t<Effect2, Action2, State2, any> {
  switch (command.type) {
  case 'Effect':
    return yield* liftEffect(command.effect);
  case 'Dispatch':
    return yield* dispatch(liftAction(command.action));
  case 'GetState':
    return liftState(yield* getState());
  default:
    return command;
  }
}

function* mapWithAnswer<Effect1, Action1, State1, Effect2, Action2, State2, A>(
  liftEffect: (effect1: Effect1) => t<Effect2, Action2, State2, any>,
  liftAction: (action1: Action1) => Action2,
  liftState: (state2: State2) => State1,
  ship: t<Effect1, Action1, State1, A>,
  answer?: any
): t<Effect2, Action2, State2, A> {
  const result = ship.next(answer);
  if (result.done) {
    return (result.value: any);
  }
  switch (result.value.type) {
  case 'Command': {
    const newAnswer = yield* mapCommand(liftEffect, liftAction, liftState, result.value.command);
    return yield* mapWithAnswer(liftEffect, liftAction, liftState, ship, newAnswer);
  }
  case 'All': {
    const newAnswer = yield* allAny(...result.value.ships.map((currenyShip) =>
      mapWithAnswer(liftEffect, liftAction, liftState, currenyShip)
    ));
    return yield* mapWithAnswer(liftEffect, liftAction, liftState, ship, newAnswer);
  }
  default:
    return result.value;
  }
}

export function map<Effect, Action1, State1, Action2, State2, A>(
  liftAction: (action1: Action1) => Action2,
  liftState: (state2: State2) => State1,
  ship: t<Effect, Action1, State1, A>
): t<Effect, Action2, State2, A> {
  return mapWithAnswer((effect) => call(effect), liftAction, liftState, ship);
}

export type SnapshotItem<Effect, Action, State> = {
  type: 'Return',
  result: any,
} | {
  type: 'Effect',
  effect: Effect,
  result?: any,
} | {
  type: 'Dispatch',
  action: Action
} | {
  type: 'GetState',
  state: State,
} | {
  type: 'All',
  snapshots: (SnapshotItem<Effect, Action, State>[])[],
}

export type Snapshot<Effect, Action, State> = SnapshotItem<Effect, Action, State>[];

function* snapshotCommand<Effect, Action, State>(
  command: Command<Effect, Action, State>
): t<Effect, Action, State, {result: any, snapshotItem: SnapshotItem<Effect, Action, State>}> {
  switch (command.type) {
  case 'Effect': {
    const result = yield* call(command.effect);
    return {
      result,
      snapshotItem: result === undefined ? {
        type: 'Effect',
        effect: command.effect,
      } : {
        type: 'Effect',
        effect: command.effect,
        result,
      },
    };
  }
  case 'Dispatch': {
    yield* dispatch(command.action);
    return {
      result: undefined,
      snapshotItem: {
        type: 'Dispatch',
        action: command.action,
      },
    };
  }
  case 'GetState': {
    const state = yield* getState();
    return {
      result: state,
      snapshotItem: {
        type: 'GetState',
        state,
      },
    };
  }
  default:
    return command;
  }
}

function* snapshotWithAnswer<Effect, Action, State, A>(
  ship: t<Effect, Action, State, A>,
  answer?: any
): t<Effect, Action, State, {result: A, snapshot: Snapshot<Effect, Action, State>}> {
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
  case 'Command': {
    const newAnswer = yield* snapshotCommand(result.value.command);
    const next = yield* snapshotWithAnswer(ship, newAnswer.result);
    return {
      result: next.result,
      snapshot: [
        newAnswer.snapshotItem,
        ...next.snapshot,
      ],
    };
  }
  case 'All': {
    const newAnswer = yield* allAny(...result.value.ships.map((currentShip) =>
      snapshotWithAnswer(currentShip)
    ));
    const next = yield* snapshotWithAnswer(ship, newAnswer.map((currentAnswer) =>
      currentAnswer.result
    ));
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
  default:
    return result.value;
  }
}

/* eslint-disable no-undef */
export const snapshot: <Effect, Action, State, A>(
  ship: t<Effect, Action, State, A>
) => t<Effect, Action, State, {result: A, snapshot: Snapshot<Effect, Action, State>}> =
  snapshotWithAnswer;
/* eslint-enable no-undef */

function snapshotItemError<Effect, Action, State>(
  error: mixed
): SnapshotItem<Effect, Action, State> {
  return ({error}: any);
}

function simulateCommand<Effect, Action, State>(
  command: Command<Effect, Action, State>,
  snapshotItem: SnapshotItem<Effect, Action, State>
): {result: ?{value: any}, snapshotItem: SnapshotItem<Effect, Action, State>} {
  switch (command.type) {
  case 'Effect':
    if (snapshotItem.type === 'Effect') {
      return {
        result: {value: snapshotItem.result},
        snapshotItem: snapshotItem.result ? {
          type: 'Effect',
          effect: command.effect,
          result: snapshotItem.result,
        } : {
          type: 'Effect',
          effect: command.effect,
        },
      };
    }
    break;
  case 'Dispatch':
    if (snapshotItem.type === 'Dispatch') {
      return {
        result: {value: undefined},
        snapshotItem: {
          type: 'Dispatch',
          action: command.action,
        },
      };
    }
    break;
  case 'GetState':
    if (snapshotItem.type === 'GetState') {
      return {
        result: {value: snapshotItem.state},
        snapshotItem,
      };
    }
    break;
  default:
    return command;
  }
  return {
    result: null,
    snapshotItem: snapshotItemError({
      expected: snapshotItem.type,
      got: command,
    }),
  };
}

function simulateWithAnswer<Effect, Action, State, A>(
  ship: t<Effect, Action, State, A>,
  snapshot: Snapshot<Effect, Action, State>,
  answer?: any
): {result: ?{value: A}, snapshot: Snapshot<Effect, Action, State>} {
  const result = ship.next(answer);
  if (result.done) {
    return {
      result: {value: (result.value: any)},
      snapshot: result.value === undefined ? [] : [{
        type: 'Return',
        result: result.value,
      }],
    };
  }
  const [snapshotItem, ...nextSnapshot] = snapshot;
  if (snapshotItem === undefined) {
    return {
      result: null,
      snapshot: [snapshotItemError({
        expected: 'terminated',
        got: result.value,
      })],
    };
  }
  switch (result.value.type) {
  case 'Command': {
    const newAnswer = simulateCommand(result.value.command, snapshotItem);
    if (newAnswer.result) {
      const next = simulateWithAnswer(ship, nextSnapshot, newAnswer.result.value);
      return {
        result: next.result,
        snapshot: [
          newAnswer.snapshotItem,
          ...next.snapshot
        ],
      };
    }
    return {
      result: null,
      snapshot: [newAnswer.snapshotItem],
    };
  }
  case 'All': {
    if (snapshotItem.type === 'All') {
      const newAnswers = result.value.ships.reduce((accumulator, currentShip, shipIndex) => {
        const currentSnapshot = snapshotItem.snapshots[shipIndex];
        if (currentSnapshot) {
          const currentAnswer = simulateWithAnswer(currentShip, currentSnapshot);
          if (currentAnswer.result) {
            return {
              results: accumulator.results && [...accumulator.results, currentAnswer.result.value],
              snapshots: [...accumulator.snapshots, currentAnswer.snapshot],
            };
          }
          return {
            results: null,
            snapshots: [...accumulator.snapshots, currentAnswer.snapshot],
          };
        }
        return {
          results: null,
          snapshots: accumulator.snapshots,
        };
      }, {
        results: [],
        snapshots: [],
      });
      if (newAnswers.results) {
        const next = simulateWithAnswer(ship, nextSnapshot, newAnswers.results);
        return {
          result: next.result,
          snapshot: [
            {
              type: 'All',
              snapshots: newAnswers.snapshots,
            },
            ...next.snapshot,
          ],
        };
      }
      return {
        result: null,
        snapshot: [{
          type: 'All',
          snapshots: newAnswers.snapshots,
        }],
      };
    }
    return {
      result: null,
      snapshot: [snapshotItemError({
        expected: snapshotItem.type,
        got: result.value,
      })],
    };
  }
  default:
    return result.value;
  }
}

export function simulate<Effect, Action, State, A>(
  ship: t<Effect, Action, State, A>,
  snapshot: Snapshot<Effect, Action, State>
): Snapshot<Effect, Action, State> {
  return simulateWithAnswer(ship, snapshot).snapshot;
}
