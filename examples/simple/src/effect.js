// @flow
import type {Ship} from 'redux-ship';
import {call} from 'redux-ship';

export type Effect = {
  type: 'Delay',
  ms: number
} | {
  type: 'HttpRequest',
  url: string,
};

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

export function delay<Commit, State>(ms: number): Ship<Effect, Commit, State, void> {
  return call({
    type: 'Delay',
    ms,
  });
}

export function httpRequest<Commit, State>(url: string): Ship<Effect, Commit, State, string> {
  return call({
    type: 'HttpRequest',
    url,
  });
}
