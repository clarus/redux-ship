// @flow
import type {Ship} from 'redux-ship';
import {call} from 'redux-ship';

// The type of side-effects for the whole application. There should be just one file
// of this kind for an application, with a list of effects kept as short as possible.
export type Effect = {
  type: 'Delay',
  ms: number
} | {
  type: 'HttpRequest',
  url: string,
};

// An effect constructor for the `delay`. The aim of an effect constructor is to
// give the return type of an effect, in this case `void`.
export function* delay<Commit, State>(ms: number): Ship<Effect, Commit, State, void> {
  return yield* call({
    type: 'Delay',
    ms,
  });
}

export function* httpRequest<Commit, State>(url: string): Ship<Effect, Commit, State, string> {
  return yield* call({
    type: 'HttpRequest',
    url,
  });
}

// The function to actually evaluate an effect. In a Redux Ship application, this should
// be the only non-purely functional function!
export async function run(effect: Effect): Promise<any> {
  switch (effect.type) {
  case 'Delay': {
    const {ms} = effect;
    return await new Promise(resolve => setTimeout(resolve, ms));
  }
  case 'HttpRequest': {
    const response = await fetch(effect.url);
    return await response.text();
  }
  default:
    return;
  }
}
