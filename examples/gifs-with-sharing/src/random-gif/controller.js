// @flow
import * as Ship from 'redux-ship';
import * as Effect from '../effect';
import * as CounterModel from '../counter/model';
import * as RandomGifModel from './model';

export type Action = {
  type: 'Load',
  tag: string,
};

export type Commit = {
  type: 'LoadStart',
} | {
  type: 'LoadSuccess',
  gifUrl: string,
};

export type State = {
  counter: CounterModel.State,
  randomGif: RandomGifModel.State,
};

export type Patch = {
  counter?: CounterModel.Patch,
  randomGif?: RandomGifModel.Patch,
};

export function applyCommit(state: State, commit: Commit): Patch {
  switch (commit.type) {
  case 'LoadStart':
    return {randomGif: commit};
  case 'LoadSuccess':
    return {
      counter: state.counter.count >= 10 ?
        {type: 'IncrementByTwo'} :
        {type: 'IncrementByOne'},
      randomGif: commit,
    };
  default:
    return {};
  }
}

export function* control(action: Action): Ship.Ship<*, Commit, State, void> {
  switch (action.type) {
  case 'Load': {
    yield* Ship.commit({
      type: 'LoadStart',
    });
    const result = yield* Effect.httpRequest(
      `http://api.giphy.com/v1/gifs/random?api_key=dc6zaTOxFJmzC&tag=${action.tag}`
    );
    const gifUrl: string = JSON.parse(result).data.image_url;
    yield* Ship.commit({
      type: 'LoadSuccess',
      gifUrl,
    });
    return;
  }
  default:
    return;
  }
}
