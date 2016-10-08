// @flow
import type {Command, t} from './ship';

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
