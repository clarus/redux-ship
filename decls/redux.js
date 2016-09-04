// @flow

declare module 'redux' {
  declare type Enhancer<Action, State> = mixed;

  declare type ReduxStore<Action, State> = {
    dispatch: (action: Action) => void | Promise<void>,
    getState: () => State,
  };

  declare type ReduxMiddleware<Action, State> =
    (store: ReduxStore<Action, State>) =>
    (next: (action: Action) => any) =>
    (action: Action) =>
    any;

  declare function applyMiddleware<Action, State>(
    ...middlewares: ReduxMiddleware<Action, State>[]
  ): Enhancer<Action, State>;

  declare function createStore<Action, State>(
    reduce: (state: State, action: Action) => State,
    initialState: State,
    enhancer: Enhancer<Action, State>
  ): ReduxStore<Action, State>;
}
