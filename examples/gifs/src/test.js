// @flow
import React from 'react';
import renderer from 'react-test-renderer';
import {createStore} from 'redux';
import * as Ship from 'redux-ship';

export function dispatch() {
}

export function simulateControl<Action, Effect, Commit, State>(
  control: (action: Action) => Ship.Ship<Effect, Commit, State, void>,
  configs: {[id: string]: {
    action: Action,
    snapshot: Ship.Snapshot<Effect, Commit>,
  }}
): void {
  Object.keys(configs).forEach(id => {
    it(id, () => {
      const {action, snapshot} = configs[id];
      expect(Ship.simulate(control(action), snapshot)).toEqual(snapshot);
    });
  });
}

export function snapshotApplyCommit<Commit, Patch, State>(
  applyCommit: (state: State, commit: Commit) => Patch,
  configs: {[id: string]: {commit: Commit, state: State}}
): void {
  Object.keys(configs).forEach(id => {
    it(id, () => {
      const {commit, state} = configs[id];
      expect(applyCommit(state, commit)).toMatchSnapshot();
    });
  });
}

export function snapshotComponent<Config>(
  component: ReactClass<Config>,
  configs: {[id: string]: Config}
): void {
  Object.keys(configs).forEach(id => {
    it(id, () => {
      const element = React.createElement(component, configs[id]);
      const tree = renderer.create(element).toJSON();
      expect(tree).toMatchSnapshot();
    });
  });
}

export function snapshotControl<Action, Effect, Commit, Patch, State>(
  control: (action: Action) => Ship.Ship<Effect, Commit, State, void>,
  applyCommit: (state: State, commit: Commit) => Patch,
  reduce: (state: State, patch: Patch) => State,
  configs: {[id: string]: {
    action: Action,
    runEffect: (effect: Effect) => any,
    state: State,
  }}
): void {
  Object.keys(configs).forEach(id => {
    it(id, async () => {
      const {action, runEffect, state} = configs[id];
      const store = createStore(
        (state, commit) => reduce(state, applyCommit(state, commit)),
        state
      );
      const {snapshot} = await Ship.run(
        runEffect,
        store.dispatch,
        store.getState,
        Ship.snap(control(action))
      );
      expect(snapshot).toMatchSnapshot();
    });
  });
}

export function snapshotReduce<Patch, State>(
  reduce: (state: State, patch: Patch) => State,
  configs: {[id: string]: {patch: Patch, state: State}}
): void {
  Object.keys(configs).forEach(id => {
    it(id, () => {
      const {patch, state} = configs[id];
      expect(reduce(state, patch)).toMatchSnapshot();
    });
  });
}
