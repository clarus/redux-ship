# Composition
**work in progress**

For now, you can look at the [`http-request`](https://github.com/clarus/redux-ship/tree/master/examples/http-request) example. The key part is the use of the [`Ship.map`](https://clarus.github.io/redux-ship/docs/api.html) primitive:
```js
export function* control(action: Action): Ship.Ship<*, Model.Patch, Model.State, void> {
  switch (action.type) {
  case 'Eye':
    return yield* Ship.map(
      patch => ({type: 'Eye', patch}),
      state => state.eye,
      EyeController.control(action.action)
    );
  case 'Movies':
    return yield* Ship.map(
      patch => ({type: 'Movies', patch}),
      state => state.movies,
      MoviesController.control(action.action)
    );
  default:
    return;
  }
}
```
