# Simple
> HTTP calls to get the movies of R2-D2.

Gets the list of movies with R2-D2, concurrently running one HTTP request per movie.

```
npm install
npm start
npm test
```

Open the JavaScript console to see the Redux logs, and use the [Redux Ship dev-tools](https://github.com/clarus/redux-ship-devtools) to visualize the side-effects.

## Organization
We organize the files in on opinionated way to clearly separate the concerns:
* the view stuff (in `view.js`) handled by React;
* the data stuff (in `model.js`) handled by Redux;
* the rest (in `controller.js`) handled by Redux Ship (API calls, cookies, ...).

Yes, this is the good old [MVC pattern](https://en.wikipedia.org/wiki/Model–view–controller). If you do not want to feel doing MVC *again*, just rename one of these three files :).

The file `effect.js` contains the definition of the side-effects of the application. This is the only file with non-purely functional code (apart from initialization code). There should be only one `effect.js` file per project, while there could be as many controller / model / view files as needed.

## Credit
This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
