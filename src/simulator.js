// @flow
import _isEqual from 'lodash.isequal';
import * as Ship from './ship';

export type Effect<Action, Model> = {
  type: 'Wait',
  args: any[],
  result: any
} | {
  type: 'Call',
  args: any[],
  result: any
} | {
  type: 'Impure',
  args: any[],
  result: any
} | {
  type: 'All',
  simulators: Generator<Effect<Action, Model>, void, void>[]
};

export type t<Action, Model> = Generator<Effect<Action, Model>, void, void>;

function checkArgs(args1: any[], args2: any[]): void {
  if (!_isEqual(args1, args2)) {
    console.log('checkArgs', args1, args2);
    throw new Error(JSON.stringify({
      message: 'Arguments mismatch',
      args1,
      args2,
    }));
  }
}

export function run<Action, Model, A>(
  ship: Ship.t<Action, Model, A>,
  simulator: t<Action, Model>, answer?: any)
  : A {
  const resultShip = ship.next(answer);
  const resultSimulator = simulator.next();
  if (resultShip.done) {
    if (resultSimulator.done) {
      return (resultShip.value: any);
    }
    throw new Error('Simulator not terminated but ship terminated');
  }
  if (resultSimulator.done) {
    throw new Error('Ship not terminated but simulator terminated');
  }
  const newAnswer = (() => {
    switch (resultShip.value.type) {
      case 'Wait':
        if (resultSimulator.value.type === 'Wait') {
          const { result } = resultSimulator.value;
          checkArgs(resultSimulator.value.args, resultShip.value.args);
          return result;
        }
        throw new Error(`Expected ${resultSimulator.value.type} but got Wait`);
      case 'Call':
        if (resultSimulator.value.type === 'Call') {
          const { result } = resultSimulator.value;
          checkArgs(resultSimulator.value.args, resultShip.value.args);
          return result;
        }
        throw new Error(`Expected ${resultSimulator.value.type} but got Call`);
      case 'Impure':
        if (resultSimulator.value.type === 'Impure') {
          const { result } = resultSimulator.value;
          checkArgs(resultSimulator.value.args, resultShip.value.args);
          return result;
        }
        throw new Error(`Expected ${resultSimulator.value.type} but got Impure`);
      case 'All': {
        const { ships } = resultShip.value;
        if (resultSimulator.value.type === 'All') {
          const { simulators } = resultSimulator.value;
          return simulators.map((currentSimulator, index) =>
            run(ships[index], currentSimulator)
          );
        }
        throw new Error(`Expected ${resultSimulator.value.type} but got All`);
      }
      default:
        return resultShip.value;
    }
  })();
  return run(ship, simulator, newAnswer);
}

export function* wait<Action, Model, A>(args: any[], result: A): t<Action, Model> {
  return yield {
    type: 'Wait',
    args,
    result,
  };
}

export function* call<Action, Model, A>(args: any[], result: A): t<Action, Model> {
  return yield {
    type: 'Call',
    args,
    result,
  };
}

export function* impure<Action, Model, A>(args: any[], result: A): t<Action, Model> {
  return yield {
    type: 'Impure',
    args,
    result,
  };
}

export function* all<Action, Model>(simulators: t<Action, Model>[]): t<Action, Model> {
  return yield {
    type: 'All',
    simulators,
  };
}
