// @flow

export type Effect<Action, Model> = {
  type: 'Wait',
  args: any[],
  fn: (...args: any[]) => Promise<any>
} | {
  type: 'Call',
  args: any[],
  fn: (...args: any[]) => Generator<Effect<Action, Model>, any, any>
} | {
  type: 'Impure',
  args: any[],
  fn: (...args: any[]) => any
} | {
  type: 'All',
  ships: Generator<Effect<Action, Model>, any, any>[]
} | {
  type: 'Dispatch',
  action: Action
} | {
  type: 'GetState'
};

export type t<Action, Model, A> = Generator<Effect<Action, Model>, A, any>;

export async function run<Action, Model, A>(
  reduce: (model: Model, action: Action) => Model,
  model: Model,
  ship: t<Action, Model, A>,
  answer?: any)
  : Promise<A> {
  const result = ship.next(answer);
  if (result.done) {
    return result.value;
  }
  switch (result.value.type) {
  case 'Wait': {
    const newAnswer = await result.value.fn(...result.value.args);
    return await run(reduce, model, ship, newAnswer);
  }
  case 'Call': {
    const newAnswer = await run(reduce, model, result.value.fn(...result.value.args));
    return await run(reduce, model, ship, newAnswer);
  }
  case 'Impure': {
    const newAnswer = result.value.fn(...result.value.args);
    return await run(reduce, model, ship, newAnswer);
  }
  case 'All': {
    const newAnswer = await Promise.all(result.value.ships.map(currentShip =>
      run(reduce, model, currentShip))
    );
    return await run(reduce, model, ship, newAnswer);
  }
  case 'Dispatch': {
    const newModel = reduce(model, result.value.action);
    return await run(reduce, newModel, ship);
  }
  case 'GetState': {
    const newAnswer = model;
    return await run(reduce, model, ship, newAnswer);
  }
  default:
    return result.value;
  }
}

export function* waitn<Action, Model, A>(fn: (...args: any[]) => Promise<A>, args: any[])
  : t<Action, Model, A> {
  const result = yield {
    type: 'Wait',
    args,
    fn,
  };
  return (result: any);
}

export function* wait<Action, Model, A>(promise: Promise<A>): t<Action, Model, A> {
  return yield* waitn(() => promise, []);
}

export function* wait1<Action, Model, A1, B>(
  fn: (arg: A1) => Promise<B>,
  arg1: A1)
  : t<Action, Model, B> {
  return yield* waitn(fn, [arg1]);
}

export function* wait2<Action, Model, A1, A2, B>(
  fn: (arg1: A1, arg2: A2) => Promise<B>,
  arg1: A1, arg2: A2)
  : t<Action, Model, B> {
  return yield* waitn(fn, [arg1, arg2]);
}

export function* calln<Action, Model, A>(fn: (...args: any[]) => t<Action, Model, A>, args: any[])
  : t<Action, Model, A> {
  const result = yield {
    type: 'Call',
    args,
    fn,
  };
  return (result: any);
}

export function* call<Action, Model, A>(ship: t<Action, Model, A>): t<Action, Model, A> {
  return yield* calln(() => ship, []);
}

export function* impuren<Action, Model, A>(fn: (...args: any[]) => A, args: any[])
  : t<Action, Model, A> {
  const result = yield {
    type: 'Impure',
    args,
    fn,
  };
  return (result: any);
}

export function* impure<Action, Model, A>(value: A): t<Action, Model, A> {
  return yield* impuren(() => value, []);
}

export function* impure1<Action, Model, A1, B>(fn: (arg1: A1) => B, arg1: A1): t<Action, Model, B> {
  return yield* impuren(fn, [arg1]);
}

export function* alln<Action, Model>(ships: t<Action, Model, any>[]): t<Action, Model, any[]> {
  const result = yield {
    type: 'All',
    ships,
  };
  return (result: any);
}

export function* all<Action, Model, A>(ships: t<Action, Model, A>[]): t<Action, Model, A[]> {
  return yield* alln(ships);
}

export function* all2<Action, Model, A1, A2>(
  ship1: t<Action, Model, A1>,
  ship2: t<Action, Model, A2>)
  : t<Action, Model, [A1, A2]> {
  return yield* alln([ship1, ship2]);
}

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
