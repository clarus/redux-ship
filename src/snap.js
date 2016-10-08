// @flow
import type {Command, t} from './ship';
import {allAny, call, dispatch, getState} from './ship';

export type SnapshotItem<Effect, Action, State> = {
  type: 'Return',
  result: any,
} | {
  type: 'Effect',
  effect: Effect,
  result?: any,
} | {
  type: 'Dispatch',
  action: Action
} | {
  type: 'GetState',
  state: State,
} | {
  type: 'All',
  snapshots: (SnapshotItem<Effect, Action, State>[])[],
}

export type Snapshot<Effect, Action, State> = SnapshotItem<Effect, Action, State>[];

function* snapshotCommand<Effect, Action, State>(
  command: Command<Effect, Action, State>
): t<Effect, Action, State, {result: any, snapshotItem: SnapshotItem<Effect, Action, State>}> {
  switch (command.type) {
  case 'Effect': {
    const result = yield* call(command.effect);
    return {
      result,
      snapshotItem: result === undefined ? {
        type: 'Effect',
        effect: command.effect,
      } : {
        type: 'Effect',
        effect: command.effect,
        result,
      },
    };
  }
  case 'Dispatch': {
    yield* dispatch(command.action);
    return {
      result: undefined,
      snapshotItem: {
        type: 'Dispatch',
        action: command.action,
      },
    };
  }
  case 'GetState': {
    const state = yield* getState();
    return {
      result: state,
      snapshotItem: {
        type: 'GetState',
        state,
      },
    };
  }
  default:
    return command;
  }
}

function* snapshotWithAnswer<Effect, Action, State, A>(
  ship: t<Effect, Action, State, A>,
  answer?: any
): t<Effect, Action, State, {result: A, snapshot: Snapshot<Effect, Action, State>}> {
  const result = ship.next(answer);
  if (result.done) {
    return {
      result: (result.value: any),
      snapshot: result.value === undefined ? [] : [{
        type: 'Return',
        result: result.value,
      }],
    };
  }
  switch (result.value.type) {
  case 'Command': {
    const newAnswer = yield* snapshotCommand(result.value.command);
    const next = yield* snapshotWithAnswer(ship, newAnswer.result);
    return {
      result: next.result,
      snapshot: [
        newAnswer.snapshotItem,
        ...next.snapshot,
      ],
    };
  }
  case 'All': {
    const newAnswer = yield* allAny(...result.value.ships.map((currentShip) =>
      snapshotWithAnswer(currentShip)
    ));
    const next = yield* snapshotWithAnswer(ship, newAnswer.map((currentAnswer) =>
      currentAnswer.result
    ));
    return {
      result: next.result,
      snapshot: [
        {
          type: 'All',
          snapshots: newAnswer.map((currentAnswer) => currentAnswer.snapshot),
        },
        ...next.snapshot,
      ],
    };
  }
  default:
    return result.value;
  }
}

/* eslint-disable no-undef */
export const snapshot: <Effect, Action, State, A>(
  ship: t<Effect, Action, State, A>
) => t<Effect, Action, State, {result: A, snapshot: Snapshot<Effect, Action, State>}> =
  snapshotWithAnswer;
/* eslint-enable no-undef */
