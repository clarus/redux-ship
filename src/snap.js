// @flow
import type {Command, Ship} from './ship';
import {allAny} from './ship';

export type SnapshotItem<Effect, Commit> = {
  type: 'Effect',
  effect: Effect,
  result?: any,
} | {
  type: 'Commit',
  commit: Commit
} | {
  type: 'GetState',
  state: any,
} | {
  type: 'All',
  snapshots: (SnapshotItem<Effect, Commit>[])[],
}

export type Snapshot<Effect, Commit> = SnapshotItem<Effect, Commit>[];

function* snapCommand<Effect, Commit, State>(
  command: Command<Effect, Commit, State>
): Ship<Effect, Commit, State, {result: any, snapshotItem: SnapshotItem<Effect, Commit>}> {
  const result = yield {
    type: 'Command',
    command,
  };
  switch (command.type) {
  case 'Effect': {
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
  case 'Commit': {
    return {
      result: undefined,
      snapshotItem: {
        type: 'Commit',
        commit: command.commit,
      },
    };
  }
  case 'GetState': {
    return {
      result,
      snapshotItem: {
        type: 'GetState',
        state: result,
      },
    };
  }
  default:
    return command;
  }
}

function* snapWithAnswer<Effect, Commit, State, A>(
  ship: Ship<Effect, Commit, State, A>,
  answer?: any
): Ship<Effect, Commit, State, {result: A, snapshot: Snapshot<Effect, Commit>}> {
  const result = ship.next(answer);
  if (result.done) {
    return {
      result: (result.value: any),
      snapshot: [],
    };
  }
  switch (result.value.type) {
  case 'Command': {
    const newAnswer = yield* snapCommand(result.value.command);
    const next = yield* snapWithAnswer(ship, newAnswer.result);
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
      snapWithAnswer(currentShip)
    ));
    const next = yield* snapWithAnswer(ship, newAnswer.map((currentAnswer) =>
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
export const snap: <Effect, Commit, State, A>(
  ship: Ship<Effect, Commit, State, A>
) => Ship<Effect, Commit, State, {result: A, snapshot: Snapshot<Effect, Commit>}> =
  snapWithAnswer;
/* eslint-enable no-undef */
