// @flow

export type Effect = {
  type: 'Wait',
  args: any[],
  fn: (...args: any[]) => Promise<any>
} | {
  type: 'Call',
  arg: Generator<Effect, any, any>
} | {
  type: 'All',
  args: Generator<Effect, any, any>[]
};

export type t<A> = Generator<Effect, A, any>;

export async function run<A>(ship: t<A>, answer?: any): Promise<A> {
  const result = ship.next(answer);
  if (result.done) {
    return result.value;
  }
  const newAnswer = await (() => {
    switch (result.value.type) {
      case 'Wait': {
        return result.value.fn(...result.value.args);
      }
      case 'Call': {
        return run(result.value.arg);
      }
      case 'All': {
        return Promise.all(result.value.args.map(run));
      }
      default:
        return result.value;
    }
  })();
  return await run(ship, newAnswer);
}

export function* waitn<A>(fn: (...args: any[]) => Promise<A>, args: any[]): t<A> {
  const result = yield {
    type: 'Wait',
    args,
    fn,
  };
  return (result: any);
}

export function* wait<A, B>(fn: (arg: A) => Promise<B>, arg: A): t<B> {
  return yield* waitn(fn, [arg]);
}

export function* wait0<A>(arg: Promise<A>): t<A> {
  return yield* waitn(() => arg, []);
}

export function* wait2<A1, A2, B>(
  fn: (arg1: A1, arg2: A2) => Promise<B>,
  arg1: A1, arg2: A2)
  : t<B> {
  return yield* waitn(fn, [arg1, arg2]);
}

export function* call<A>(arg: t<A>): t<A> {
  const result = yield {
    type: 'Call',
    arg,
  };
  return (result: any);
}

export function* alln(args: t<any>[]): t<any[]> {
  const result = yield {
    type: 'All',
    args,
  };
  return (result: any);
}

export function* all<A>(args: t<A>[]): t<A[]> {
  return yield* alln(args);
}

export function* all2<A1, A2>(arg1: t<A1>, arg2: t<A2>): t<[A1, A2]> {
  return yield* alln([arg1, arg2]);
}
