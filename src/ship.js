// @flow

export type Command<Effect, Commit, State> = {
  type: 'Effect',
  effect: Effect,
} | {
  type: 'Commit',
  commit: Commit,
} | {
  type: 'GetState',
  selector: (state: State) => any,
};

export type Yield<Effect, Commit, State> = {
  type: 'Command',
  command: Command<Effect, Commit, State>,
} | {
  type: 'All',
  ships: Generator<Yield<Effect, Commit, State>, any, any>[],
};

export type Ship<Effect, Commit, State, A> = Generator<Yield<Effect, Commit, State>, A, any>;

export function* call<Effect, Commit, State>(
  effect: Effect
): Ship<Effect, Commit, State, any> {
  const result: any = yield {
    type: 'Command',
    command: {
      type: 'Effect',
      effect,
    },
  };
  return result;
}

export function* commit<Effect, Commit, State>(
  commit: Commit
): Ship<Effect, Commit, State, void> {
  yield {
    type: 'Command',
    command: {
      type: 'Commit',
      commit,
    },
  };
}

export function* getState<Effect, Commit, State, A>(
  selector: (state: State) => A
): Ship<Effect, Commit, State, A> {
  const state: any = yield {
    type: 'Command',
    command: {
      type: 'GetState',
      selector,
    },
  };
  return state;
}

export function* allAny<Effect, Commit, State>(
  ...ships: Ship<Effect, Commit, State, any>[]
): Ship<Effect, Commit, State, any[]> {
  const result: any = yield {
    type: 'All',
    ships,
  };
  return result;
}

export function all<Effect, Commit, State, A>(
  ships: Ship<Effect, Commit, State, A>[]
): Ship<Effect, Commit, State, A[]> {
  return allAny(...ships);
}

/* eslint-disable no-undef */
export const all2: <Effect, Commit, State, A1, A2>(
  ship1: Ship<Effect, Commit, State, A1>,
  ship2: Ship<Effect, Commit, State, A2>
) => Ship<Effect, Commit, State, [A1, A2]> =
  allAny;

export const all3: <Effect, Commit, State, A1, A2, A3>(
  ship1: Ship<Effect, Commit, State, A1>,
  ship2: Ship<Effect, Commit, State, A2>,
  ship3: Ship<Effect, Commit, State, A3>
) => Ship<Effect, Commit, State, [A1, A2, A3]> =
  allAny;

export const all4: <Effect, Commit, State, A1, A2, A3, A4>(
  ship1: Ship<Effect, Commit, State, A1>,
  ship2: Ship<Effect, Commit, State, A2>,
  ship3: Ship<Effect, Commit, State, A3>,
  ship4: Ship<Effect, Commit, State, A4>
) => Ship<Effect, Commit, State, [A1, A2, A3, A4]> =
  allAny;

export const all5: <Effect, Commit, State, A1, A2, A3, A4, A5>(
  ship1: Ship<Effect, Commit, State, A1>,
  ship2: Ship<Effect, Commit, State, A2>,
  ship3: Ship<Effect, Commit, State, A3>,
  ship4: Ship<Effect, Commit, State, A4>,
  ship4: Ship<Effect, Commit, State, A5>
) => Ship<Effect, Commit, State, [A1, A2, A3, A4, A5]> =
  allAny;

export const all6: <Effect, Commit, State, A1, A2, A3, A4, A5, A6>(
  ship1: Ship<Effect, Commit, State, A1>,
  ship2: Ship<Effect, Commit, State, A2>,
  ship3: Ship<Effect, Commit, State, A3>,
  ship4: Ship<Effect, Commit, State, A4>,
  ship4: Ship<Effect, Commit, State, A5>,
  ship4: Ship<Effect, Commit, State, A6>
) => Ship<Effect, Commit, State, [A1, A2, A3, A4, A5, A6]> =
  allAny;

export const all7: <Effect, Commit, State, A1, A2, A3, A4, A5, A6, A7>(
  ship1: Ship<Effect, Commit, State, A1>,
  ship2: Ship<Effect, Commit, State, A2>,
  ship3: Ship<Effect, Commit, State, A3>,
  ship4: Ship<Effect, Commit, State, A4>,
  ship4: Ship<Effect, Commit, State, A5>,
  ship4: Ship<Effect, Commit, State, A6>,
  ship4: Ship<Effect, Commit, State, A7>
) => Ship<Effect, Commit, State, [A1, A2, A3, A4, A5, A6, A7]> =
  allAny;
/* eslint-enable no-undef */
