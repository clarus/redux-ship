# Composition
**work in progresss**

For now, you can look at the [`http-request`](https://github.com/clarus/redux-ship/tree/master/examples/http-request) example. The key part is the use of the [`Ship.map`](https://clarus.github.io/redux-ship/docs/api.html) primitive:
```js
export function* control(action: Action): Ship.Ship<*, Commit, State, void> {
  switch (action.type) {
  case 'Eye':
    return yield* Ship.map(
      commit => ({type: 'Eye', commit}),
      state => state.eye,
      EyeController.control(action.action)
    );
  case 'Movies':
    return yield* Ship.map(
      commit => ({type: 'Movies', commit}),
      state => state.movies,
      MoviesController.control(action.action)
    );
  default:
    return;
  }
}
```
