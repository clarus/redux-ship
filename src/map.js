// @flow
import type {Command, Ship} from './ship';
import {allAny, call, commit, getState} from './ship';

function* mapCommand<Effect1, Commit1, State1, Effect2, Commit2, State2>(
  liftEffect: (effect1: Effect1) => Ship<Effect2, Commit2, State2, any>,
  liftCommit: (commit1: Commit1) => Commit2,
  extractState: (state2: State2) => State1,
  command: Command<Effect1, Commit1, State1>
): Ship<Effect2, Commit2, State2, any> {
  switch (command.type) {
  case 'Effect':
    return yield* liftEffect(command.effect);
  case 'Commit':
    return yield* commit(liftCommit(command.commit));
  case 'GetState': {
    const {selector} = command;
    return yield* getState(state => selector(extractState(state)));
  }
  default:
    return command;
  }
}

function* mapWithAnswer<Effect1, Commit1, State1, Effect2, Commit2, State2, A>(
  liftEffect: (effect1: Effect1) => Ship<Effect2, Commit2, State2, any>,
  liftCommit: (commit1: Commit1) => Commit2,
  extractState: (state2: State2) => State1,
  ship: Ship<Effect1, Commit1, State1, A>,
  answer?: any
): Ship<Effect2, Commit2, State2, A> {
  const result = ship.next(answer);
  if (result.done) {
    return (result.value: any);
  }
  switch (result.value.type) {
  case 'Command': {
    const newAnswer = yield* mapCommand(liftEffect, liftCommit, extractState, result.value.command);
    return yield* mapWithAnswer(liftEffect, liftCommit, extractState, ship, newAnswer);
  }
  case 'All': {
    const newAnswer = yield* allAny(...result.value.ships.map((currenyShip) =>
      mapWithAnswer(liftEffect, liftCommit, extractState, currenyShip)
    ));
    return yield* mapWithAnswer(liftEffect, liftCommit, extractState, ship, newAnswer);
  }
  default:
    return result.value;
  }
}

export function map<Effect, Commit1, State1, Commit2, State2, A>(
  liftCommit: (commit1: Commit1) => Commit2,
  extractState: (state2: State2) => State1,
  ship: Ship<Effect, Commit1, State1, A>
): Ship<Effect, Commit2, State2, A> {
  return mapWithAnswer((effect) => call(effect), liftCommit, extractState, ship);
}
