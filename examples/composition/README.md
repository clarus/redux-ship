# Composition
> Composition of components with effects.

The `eye` component gets the color of the eye of R2-D2 with one HTTP request. The `movies` component gets the list of movies with R2-D2, concurrently running one HTTP request per movie.

```
npm install
npm start
npm test
```

## Organization
This example continues the `simple` example by showing how to compose sub-components. As in `simple`, we use the MVC pattern with Redux Ship.

In the folders `eye` and `movies` we define two components with their own `controller.js`, `model.js` and `view.js` files. Thus we group the files by features, as recommended in [How to better organize your React applications?](https://medium.com/@alexmngn/how-to-better-organize-your-react-applications-2fd3ea1920f1). We compose these components by using:

* in `view.js`: the ability of a React component to include other React components;
* in `model.js`: the ability of a reducer to call another reducer;
* in `controller.js`: the `Ship.map` primitive.

## Credit
This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).
