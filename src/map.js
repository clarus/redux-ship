// @flow
import type {Command, t} from './ship';
import {allAny, call, dispatch, getState} from './ship';

function* mapCommand<Effect1, Action1, State1, Effect2, Action2, State2>(
  liftEffect: (effect1: Effect1) => t<Effect2, Action2, State2, any>,
  liftAction: (action1: Action1) => Action2,
  liftState: (state2: State2) => State1,
  command: Command<Effect1, Action1, State1>
): t<Effect2, Action2, State2, any> {
  switch (command.type) {
  case 'Effect':
    return yield* liftEffect(command.effect);
  case 'Dispatch':
    return yield* dispatch(liftAction(command.action));
  case 'GetState':
    return liftState(yield* getState());
  default:
    return command;
  }
}

function* mapWithAnswer<Effect1, Action1, State1, Effect2, Action2, State2, A>(
  liftEffect: (effect1: Effect1) => t<Effect2, Action2, State2, any>,
  liftAction: (action1: Action1) => Action2,
  liftState: (state2: State2) => State1,
  ship: t<Effect1, Action1, State1, A>,
  answer?: any
): t<Effect2, Action2, State2, A> {
  const result = ship.next(answer);
  if (result.done) {
    return (result.value: any);
  }
  switch (result.value.type) {
  case 'Command': {
    const newAnswer = yield* mapCommand(liftEffect, liftAction, liftState, result.value.command);
    return yield* mapWithAnswer(liftEffect, liftAction, liftState, ship, newAnswer);
  }
  case 'All': {
    const newAnswer = yield* allAny(...result.value.ships.map((currenyShip) =>
      mapWithAnswer(liftEffect, liftAction, liftState, currenyShip)
    ));
    return yield* mapWithAnswer(liftEffect, liftAction, liftState, ship, newAnswer);
  }
  default:
    return result.value;
  }
}

export function map<Effect, Action1, State1, Action2, State2, A>(
  liftAction: (action1: Action1) => Action2,
  liftState: (state2: State2) => State1,
  ship: t<Effect, Action1, State1, A>
): t<Effect, Action2, State2, A> {
  return mapWithAnswer((effect) => call(effect), liftAction, liftState, ship);
}
