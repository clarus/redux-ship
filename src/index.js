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
  mapEffect: (effect1: Effect1) => t<Effect2, Action2, State2, any>,
  mapAction: (action1: Action1) => Action2,
  mapState: (state2: State2) => State1,
  command: Command<Effect1, Action1, State1>
): t<Effect2, Action2, State2, any> {
  switch (command.type) {
  case 'Effect':
    return yield* mapEffect(command.effect);
  case 'Dispatch':
    return yield* dispatch(mapAction(command.action));
  case 'GetState':
    return mapState(yield* getState());
  default:
    return command;
  }
}

function* mapWithAnswer<Effect1, Action1, State1, Effect2, Action2, State2, A>(
  mapEffect: (effect1: Effect1) => t<Effect2, Action2, State2, any>,
  mapAction: (action1: Action1) => Action2,
  mapState: (state2: State2) => State1,
  ship: t<Effect1, Action1, State1, A>,
  answer?: any
): t<Effect2, Action2, State2, A> {
  const result = ship.next(answer);
  if (result.done) {
    return (result.value: any);
  }
  switch (result.value.type) {
  case 'Command': {
    const newAnswer = yield* mapCommand(mapEffect, mapAction, mapState, result.value.command);
    return yield* mapWithAnswer(mapEffect, mapAction, mapState, ship, newAnswer);
  }
  case 'All': {
    const newAnswer = yield* allAny(...result.value.ships.map((currenyShip) =>
      mapWithAnswer(mapEffect, mapAction, mapState, currenyShip)
    ));
    return yield* mapWithAnswer(mapEffect, mapAction, mapState, ship, newAnswer);
  }
  default:
    return result.value;
  }
}

export function map<Effect, Action1, State1, Action2, State2, A>(
  mapAction: (action1: Action1) => Action2,
  mapState: (state2: State2) => State1,
  ship: t<Effect, Action1, State1, A>
): t<Effect, Action2, State2, A> {
  return mapWithAnswer((effect) => call(effect), mapAction, mapState, ship);
}
