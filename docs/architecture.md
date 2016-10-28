# Architecture
Redux Ship is based on the [Model–view–controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller) and the [Flux](https://facebook.github.io/flux/docs/overview.html) architecture.

<img src='https://cdn.rawgit.com/clarus/redux-ship/master/architecture.svg' alt='Architecture' width='500px'>

This architecture is composable and applies both to the whole application and to each component.

## Model
The current state of the component / application, handled by Redux. We modify the model by applying serializable *patches*.

## View
The HTML displayed by the component / application, handled by React. Updates automatically when the model changes. We only have dumb components (without logics). The view dispatches serializable *actions* to the controller in response to user events.

## Controller
Manages side effects like interactions with the server. Written with Redux Ship. The controller handles an action by calling some side effects and by emitting some serializable *commits* to the model. A commit may be formed of one or several patches if it is destined to one or several models. Think commits in Git which can have several patches on different files. A Ship controller is implemented as a generator and each execution is serializable as a *snapshot*.
