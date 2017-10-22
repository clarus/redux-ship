// @flow
import type {Ship} from 'redux-ship';
import {call} from 'redux-ship';

export type Effect = {
  type: 'HttpRequest',
  url: string,
};

export async function run(effect: Effect): Promise<any> {
  switch (effect.type) {
  case 'HttpRequest': {
    const response = await fetch(effect.url);
    return await response.text();
  }
  default:
    return;
  }
}

export function httpRequest<Commit, State>(url: string): Ship<Effect, Commit, State, string> {
  return call({
    type: 'HttpRequest',
    url,
  });
}
