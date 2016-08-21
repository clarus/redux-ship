// @flow
import * as Ship from './ship';
import * as Simulator from './simulator';

function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function waitWith<A>(ms: number, result: A): Promise<A> {
  await wait(ms);
  return result;
}

function* mainWait(): Ship.t<void, void, void> {
  console.log('start wait');
  const message = yield* Ship.wait2(waitWith, 3 * 1000, 'hi');
  console.log(message);
}

function* mainWaitSimulator(): Simulator.t<void, void> {
  yield* Simulator.wait([3 * 1000, 'hi'], 'hi');
}

function* mainCall(): Ship.t<void, void, void> {
  console.log('start call');
  return yield* Ship.call(mainWait());
}

function* mainCallSimulator(): Simulator.t<void, void> {
  yield* Simulator.call([], undefined);
}

function* mainPar(): Ship.t<void, void, void> {
  console.log('start par');
  const messages = yield* Ship.all2(
    Ship.wait2(waitWith, 3 * 1000, 'hi'),
    Ship.wait(waitWith(3 * 1000, 2))
  );
  console.log(messages);
}

function* mainParSimulator(): Simulator.t<void, void> {
  yield* Simulator.all([
    Simulator.wait([3 * 1000, 'hi'], 'hi'),
    Simulator.wait([2], 2),
  ]);
}

function reduceVoid(): void {
}

const initialModelVoid: void = undefined;

type Action = {
  type: 'Add',
  title: string
} | {
  type: 'Remove',
  index: number
};

type Model = {
  todos: string[]
};

function reduce(model: Model, action: Action): Model {
  switch (action.type) {
    case 'Add':
      return {
        ...model,
        todos: [...model.todos, action.title],
      };
    case 'Remove': {
      const { index } = action;
      return {
        ...model,
        todos: model.todos.filter((title, currentIndex) => currentIndex !== index),
      };
    }
    default:
      return action;
  }
}

const initialModel: Model = {
  todos: [],
};

function* mainRedux(): Ship.t<Action, Model, string> {
  yield* Ship.dispatch({
    type: 'Add',
    title: 'First todo',
  });
  yield* Ship.dispatch({
    type: 'Add',
    title: `Second todo ${yield* Ship.impure(Math.random())}`,
  });
  yield* Ship.dispatch({
    type: 'Remove',
    index: 0,
  });
  const state = yield* Ship.getState();
  return state.todos[0];
}

function runSimulators(): void {
  try {
    console.log('simulator wait', Simulator.run(mainWait(), mainWaitSimulator()));
    console.log('simulator call', Simulator.run(mainCall(), mainCallSimulator()));
    console.log('simulator par', Simulator.run(mainPar(), mainParSimulator()));
  } catch (error) {
    console.log(error);
  }
}

async function main(): Promise<void> {
  console.log('start');
  const message = await waitWith(3 * 1000, 'hi');
  console.log(message);
  runSimulators();
  await Ship.run(reduceVoid, initialModelVoid, mainWait());
  await Ship.run(reduceVoid, initialModelVoid, mainCall());
  await Ship.run(reduceVoid, initialModelVoid, mainPar());
  const todo = await Ship.run(reduce, initialModel, mainRedux());
  console.log('todo:', todo);
}

main();
