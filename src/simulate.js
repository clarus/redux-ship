// @flow
import type {Command, t} from './ship';
import type {Snapshot, SnapshotItem} from './snap';

function snapshotItemError<Effect, Action, State>(
  error: mixed
): SnapshotItem<Effect, Action, State> {
  return ({error}: any);
}

function simulateCommand<Effect, Action, State>(
  command: Command<Effect, Action, State>,
  snapshotItem: SnapshotItem<Effect, Action, State>
): {result: ?{value: any}, snapshotItem: SnapshotItem<Effect, Action, State>} {
  switch (command.type) {
  case 'Effect':
    if (snapshotItem.type === 'Effect') {
      return {
        result: {value: snapshotItem.result},
        snapshotItem: snapshotItem.result ? {
          type: 'Effect',
          effect: command.effect,
          result: snapshotItem.result,
        } : {
          type: 'Effect',
          effect: command.effect,
        },
      };
    }
    break;
  case 'Dispatch':
    if (snapshotItem.type === 'Dispatch') {
      return {
        result: {value: undefined},
        snapshotItem: {
          type: 'Dispatch',
          action: command.action,
        },
      };
    }
    break;
  case 'GetState':
    if (snapshotItem.type === 'GetState') {
      return {
        result: {value: snapshotItem.state},
        snapshotItem,
      };
    }
    break;
  default:
    return command;
  }
  return {
    result: null,
    snapshotItem: snapshotItemError({
      expected: snapshotItem.type,
      got: command,
    }),
  };
}

function simulateWithAnswer<Effect, Action, State, A>(
  ship: t<Effect, Action, State, A>,
  snapshot: Snapshot<Effect, Action, State>,
  answer?: any
): {result: ?{value: A}, snapshot: Snapshot<Effect, Action, State>} {
  const result = ship.next(answer);
  if (result.done) {
    return {
      result: {value: (result.value: any)},
      snapshot: result.value === undefined ? [] : [{
        type: 'Return',
        result: result.value,
      }],
    };
  }
  const [snapshotItem, ...nextSnapshot] = snapshot;
  if (snapshotItem === undefined) {
    return {
      result: null,
      snapshot: [snapshotItemError({
        expected: 'terminated',
        got: result.value,
      })],
    };
  }
  switch (result.value.type) {
  case 'Command': {
    const newAnswer = simulateCommand(result.value.command, snapshotItem);
    if (newAnswer.result) {
      const next = simulateWithAnswer(ship, nextSnapshot, newAnswer.result.value);
      return {
        result: next.result,
        snapshot: [
          newAnswer.snapshotItem,
          ...next.snapshot
        ],
      };
    }
    return {
      result: null,
      snapshot: [newAnswer.snapshotItem],
    };
  }
  case 'All': {
    if (snapshotItem.type === 'All') {
      const newAnswers = result.value.ships.reduce((accumulator, currentShip, shipIndex) => {
        const currentSnapshot = snapshotItem.snapshots[shipIndex];
        if (currentSnapshot) {
          const currentAnswer = simulateWithAnswer(currentShip, currentSnapshot);
          if (currentAnswer.result) {
            return {
              results: accumulator.results && [...accumulator.results, currentAnswer.result.value],
              snapshots: [...accumulator.snapshots, currentAnswer.snapshot],
            };
          }
          return {
            results: null,
            snapshots: [...accumulator.snapshots, currentAnswer.snapshot],
          };
        }
        return {
          results: null,
          snapshots: accumulator.snapshots,
        };
      }, {
        results: [],
        snapshots: [],
      });
      if (newAnswers.results) {
        const next = simulateWithAnswer(ship, nextSnapshot, newAnswers.results);
        return {
          result: next.result,
          snapshot: [
            {
              type: 'All',
              snapshots: newAnswers.snapshots,
            },
            ...next.snapshot,
          ],
        };
      }
      return {
        result: null,
        snapshot: [{
          type: 'All',
          snapshots: newAnswers.snapshots,
        }],
      };
    }
    return {
      result: null,
      snapshot: [snapshotItemError({
        expected: snapshotItem.type,
        got: result.value,
      })],
    };
  }
  default:
    return result.value;
  }
}

export function simulate<Effect, Action, State, A>(
  ship: t<Effect, Action, State, A>,
  snapshot: Snapshot<Effect, Action, State>
): Snapshot<Effect, Action, State> {
  return simulateWithAnswer(ship, snapshot).snapshot;
}
