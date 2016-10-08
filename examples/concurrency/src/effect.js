// @flow
import * as Ship from 'redux-ship';

export type t = {
  type: 'HttpRequest',
  url: string,
};

export async function run(effect: t): Promise<any> {
  switch (effect.type) {
  case 'HttpRequest': {
    const response = await fetch(effect.url);
    return await response.text();
  }
  default:
    return;
  }
}

export function httpRequest<Action, State>(url: string): Ship.Ship<t, Action, State, string> {
  return Ship.call({
    type: 'HttpRequest',
    url,
  });
}
