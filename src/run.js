// @flow
import type {Command, Ship} from './ship';

function runCommand<Effect, Commit, State>(
  runEffect: (effect: Effect) => any | Promise<any>,
  runCommit: (commit: Commit) => void | Promise<void>,
  runGetState: () => State,
  command: Command<Effect, Commit, State>
): Promise<any> {
  return Promise.resolve((() => {
    switch (command.type) {
    case 'Effect':
      return runEffect(command.effect);
    case 'Commit':
      return runCommit(command.commit);
    case 'GetState':
      return command.selector(runGetState());
    default:
      return (command: empty);
    }
  })());
}

function runWithAnswer<Effect, Commit, State, A>(
  runEffect: (effect: Effect) => any | Promise<any>,
  runCommit: (commit: Commit) => void | Promise<void>,
  runGetState: () => State,
  ship: Ship<Effect, Commit, State, A>,
  answer?: any
): Promise<A> {
  const result = ship.next(answer);
  if (result.done) {
    return Promise.resolve((result.value: any));
  }
  switch (result.value.type) {
  case 'Command':
    return runCommand(runEffect, runCommit, runGetState, result.value.command).then((newAnswer) =>
      runWithAnswer(runEffect, runCommit, runGetState, ship, newAnswer)
    );
  case 'All':
    return Promise.all(result.value.ships.map(currentShip =>
      runWithAnswer(runEffect, runCommit, runGetState, currentShip))
    ).then(newAnswer =>
      runWithAnswer(runEffect, runCommit, runGetState, ship, newAnswer)
    );
  default:
    return (result.value: empty);
  }
}

export function run<Effect, Commit, State, A>(
  runEffect: (effect: Effect) => any | Promise<any>,
  store: {
    dispatch: (commit: Commit) => void | Promise<void>,
    getState: () => State
  },
  ship: Ship<Effect, Commit, State, A>
): Promise<A> {
  return runWithAnswer(runEffect, store.dispatch, store.getState, ship);
}
