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

export type Ship<Effect, Action, State, A> = Generator<Yield<Effect, Action, State>, A, any>;

export function* call<Effect, Action, State>(
  effect: Effect
): Ship<Effect, Action, State, any> {
  const result: any = yield {
    type: 'Command',
    command: {
      type: 'Effect',
      effect,
    },
  };
  return result;
}

export function* dispatch<Effect, Action, State>(
  action: Action
): Ship<Effect, Action, State, void> {
  yield {
    type: 'Command',
    command: {
      type: 'Dispatch',
      action,
    },
  };
}

export function* getState<Effect, Action, State>(): Ship<Effect, Action, State, State> {
  const state: any = yield {
    type: 'Command',
    command: {
      type: 'GetState',
    },
  };
  return state;
}

export function* allAny<Effect, Action, State>(
  ...ships: Ship<Effect, Action, State, any>[]
): Ship<Effect, Action, State, any[]> {
  const result: any = yield {
    type: 'All',
    ships,
  };
  return result;
}

export function all<Effect, Action, State, A>(
  ships: Ship<Effect, Action, State, A>[]
): Ship<Effect, Action, State, A[]> {
  return allAny(...ships);
}

/* eslint-disable no-undef */
export const all2: <Effect, Action, State, A1, A2>(
  ship1: Ship<Effect, Action, State, A1>,
  ship2: Ship<Effect, Action, State, A2>
) => Ship<Effect, Action, State, [A1, A2]> =
  allAny;

export const all3: <Effect, Action, State, A1, A2, A3>(
  ship1: Ship<Effect, Action, State, A1>,
  ship2: Ship<Effect, Action, State, A2>,
  ship3: Ship<Effect, Action, State, A3>
) => Ship<Effect, Action, State, [A1, A2, A3]> =
  allAny;

export const all4: <Effect, Action, State, A1, A2, A3, A4>(
  ship1: Ship<Effect, Action, State, A1>,
  ship2: Ship<Effect, Action, State, A2>,
  ship3: Ship<Effect, Action, State, A3>,
  ship4: Ship<Effect, Action, State, A4>
) => Ship<Effect, Action, State, [A1, A2, A3, A4]> =
  allAny;

export const all5: <Effect, Action, State, A1, A2, A3, A4, A5>(
  ship1: Ship<Effect, Action, State, A1>,
  ship2: Ship<Effect, Action, State, A2>,
  ship3: Ship<Effect, Action, State, A3>,
  ship4: Ship<Effect, Action, State, A4>,
  ship4: Ship<Effect, Action, State, A5>
) => Ship<Effect, Action, State, [A1, A2, A3, A4, A5]> =
  allAny;

export const all6: <Effect, Action, State, A1, A2, A3, A4, A5, A6>(
  ship1: Ship<Effect, Action, State, A1>,
  ship2: Ship<Effect, Action, State, A2>,
  ship3: Ship<Effect, Action, State, A3>,
  ship4: Ship<Effect, Action, State, A4>,
  ship4: Ship<Effect, Action, State, A5>,
  ship4: Ship<Effect, Action, State, A6>
) => Ship<Effect, Action, State, [A1, A2, A3, A4, A5, A6]> =
  allAny;

export const all7: <Effect, Action, State, A1, A2, A3, A4, A5, A6, A7>(
  ship1: Ship<Effect, Action, State, A1>,
  ship2: Ship<Effect, Action, State, A2>,
  ship3: Ship<Effect, Action, State, A3>,
  ship4: Ship<Effect, Action, State, A4>,
  ship4: Ship<Effect, Action, State, A5>,
  ship4: Ship<Effect, Action, State, A6>,
  ship4: Ship<Effect, Action, State, A7>
) => Ship<Effect, Action, State, [A1, A2, A3, A4, A5, A6, A7]> =
  allAny;
/* eslint-enable no-undef */
