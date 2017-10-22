# ![Logo](https://raw.githubusercontent.com/clarus/icons/master/rocket-48.png) Redux Ship
> Side effects with snapshots for Redux.

[![travis status](https://img.shields.io/travis/clarus/redux-ship/master.svg?label=travis-ci)](https://travis-ci.org/clarus/redux-ship)
[![appveyor status](https://img.shields.io/appveyor/ci/clarus/redux-ship.svg?label=app-veyor)](https://ci.appveyor.com/project/clarus/redux-ship)
[![npm version](https://img.shields.io/npm/v/redux-ship.svg)](https://www.npmjs.com/package/redux-ship)
[![npm downloads](https://img.shields.io/npm/dm/redux-ship.svg)](https://www.npmjs.com/package/redux-ship)

Redux Ship is a side effects handler for [Redux](https://github.com/reactjs/redux) with a built-in system of **snapshots** for:

* **live debugging** thanks to a graphical visualization of the side effects;
* simpler **unit tests** with snapshot testing.

The key insight is to use generators to serialize all the side effects, including the control flow of the code, using the approach of *free monads*. Additionally, we provide a **composition mechanism** of sub-stores with effects and **full typing** (for now only in [Flow](https://flow.org/)).

## Install
```
npm install --save redux-ship
```

## Documentation
* [Tutorial](https://clarus.github.io/redux-ship/docs/tutorial/)
* [API Reference](https://clarus.github.io/redux-ship/docs/api.html)

## Example
Get the movies of R2D2 using the [StarWars API](https://swapi.co/):
```js
// Check if we already have the list of movies in the Redux store.
const currentMovies = yield* Ship.getState(state => state.movies);
if (!currentMovies) {
  // If not, notify Redux that we start loading the movies.
  yield* Ship.commit({type: 'LoadStart'});
  // Get the description of R2D2 with an API call.
  const r2d2 = yield* Effect.httpRequest('https://swapi.co/api/people/3/');
  // For each movie of R2D2:
  const movies = yield* Ship.all(JSON.parse(r2d2).films.map(function* (movieUrl) {
    // Get the movie title with an API call.
    const movie = yield* Effect.httpRequest(movieUrl);
    return JSON.parse(movie).title;
  }));
  // Write the list of movies in the Redux store.
  yield* Ship.commit({type: 'LoadSuccess', movies});
}
```

With the [Redux Ship devtools](https://github.com/clarus/redux-ship-devtools) we see the following snapshot of the execution:
![Snapshot](docs/snapshot.png)

This shows us that we:

* access the Redux state;
* dispatch the action `LoadStart`;
* make an HTTP call;
* make seven HTTP calls in parallel (to get the movie titles);
* dispatch the action `LoadSuccess`.

Even without reading the code we get a sense of what the application does. By clicking on each pill we see the details of each element.

* access to a value in the store:

![snapshot-get-state](docs/snapshot-get-state.png)

* dispatch of an action to the store:

![snapshot-load-success](docs/snapshot-load-success.png)

* other side effect like an API call with the effect and its result:

![snapshot-http-request](docs/snapshot-http-request.png)

We also get a serialized snapshot, directly usable to make a unit test:
```js
[
  {
    "type": "GetState",
    "state": null
  },
  {
    "type": "Commit",
    "commit": {
      "type": "LoadStart"
    }
  },
  {
    "type": "Effect",
    "effect": {
      "type": "HttpRequest",
      "url": "https://swapi.co/api/people/3/"
    },
    "result": "{\"name\":\"R2-D2\",\"height\":\"96\",\"mass\":\"32\",\"hair_color\":\"n/a\",\"skin_color\":\"white, blue\",\"eye_color\":\"red\",\"birth_year\":\"33BBY\",\"gender\":\"n/a\",\"homeworld\":\"https://swapi.co/api/planets/8/\",\"films\":[\"https://swapi.co/api/films/2/\",\"https://swapi.co/api/films/5/\",\"https://swapi.co/api/films/4/\",\"https://swapi.co/api/films/6/\",\"https://swapi.co/api/films/3/\",\"https://swapi.co/api/films/1/\",\"https://swapi.co/api/films/7/\"],\"species\":[\"https://swapi.co/api/species/2/\"],\"vehicles\":[],\"starships\":[],\"created\":\"2014-12-10T15:11:50.376000Z\",\"edited\":\"2014-12-20T21:17:50.311000Z\",\"url\":\"https://swapi.co/api/people/3/\"}"
  },
  {
    "type": "All",
    "snapshots": [
      [
        {
          "type": "Effect",
          "effect": {
            "type": "HttpRequest",
            "url": "https://swapi.co/api/films/2/"
          },
          "result": "{\"title\":\"The Empire Strikes Back\",\"episode_id\":5,\"opening_crawl\":\"It is a dark time for the\\r\\nRebellion. Although the Death\\r\\nStar has been destroyed,\\r\\nImperial troops have driven the\\r\\nRebel forces from their hidden\\r\\nbase and pursued them across\\r\\nthe galaxy.\\r\\n\\r\\nEvading the dreaded Imperial\\r\\nStarfleet, a group of freedom\\r\\nfighters led by Luke Skywalker\\r\\nhas established a new secret\\r\\nbase on the remote ice world\\r\\nof Hoth.\\r\\n\\r\\nThe evil lord Darth Vader,\\r\\nobsessed with finding young\\r\\nSkywalker, has dispatched\\r\\nthousands of remote probes into\\r\\nthe far reaches of space....\",\"director\":\"Irvin Kershner\",\"producer\":\"Gary Kurtz, Rick McCallum\",\"release_date\":\"1980-05-17\",\"characters\":[\"https://swapi.co/api/people/1/\",\"https://swapi.co/api/people/2/\",\"https://swapi.co/api/people/3/\",\"https://swapi.co/api/people/4/\",\"https://swapi.co/api/people/5/\",\"https://swapi.co/api/people/10/\",\"https://swapi.co/api/people/13/\",\"https://swapi.co/api/people/14/\",\"https://swapi.co/api/people/18/\",\"https://swapi.co/api/people/20/\",\"https://swapi.co/api/people/21/\",\"https://swapi.co/api/people/22/\",\"https://swapi.co/api/people/23/\",\"https://swapi.co/api/people/24/\",\"https://swapi.co/api/people/25/\",\"https://swapi.co/api/people/26/\"],\"planets\":[\"https://swapi.co/api/planets/4/\",\"https://swapi.co/api/planets/5/\",\"https://swapi.co/api/planets/6/\",\"https://swapi.co/api/planets/27/\"],\"starships\":[\"https://swapi.co/api/starships/15/\",\"https://swapi.co/api/starships/10/\",\"https://swapi.co/api/starships/11/\",\"https://swapi.co/api/starships/12/\",\"https://swapi.co/api/starships/21/\",\"https://swapi.co/api/starships/22/\",\"https://swapi.co/api/starships/23/\",\"https://swapi.co/api/starships/3/\",\"https://swapi.co/api/starships/17/\"],\"vehicles\":[\"https://swapi.co/api/vehicles/8/\",\"https://swapi.co/api/vehicles/14/\",\"https://swapi.co/api/vehicles/16/\",\"https://swapi.co/api/vehicles/18/\",\"https://swapi.co/api/vehicles/19/\",\"https://swapi.co/api/vehicles/20/\"],\"species\":[\"https://swapi.co/api/species/6/\",\"https://swapi.co/api/species/7/\",\"https://swapi.co/api/species/3/\",\"https://swapi.co/api/species/2/\",\"https://swapi.co/api/species/1/\"],\"created\":\"2014-12-12T11:26:24.656000Z\",\"edited\":\"2017-04-19T10:57:29.544256Z\",\"url\":\"https://swapi.co/api/films/2/\"}"
        }
      ],
      [
        {
          "type": "Effect",
          "effect": {
            "type": "HttpRequest",
            "url": "https://swapi.co/api/films/5/"
          },
          "result": "{\"title\":\"Attack of the Clones\",\"episode_id\":2,\"opening_crawl\":\"There is unrest in the Galactic\\r\\nSenate. Several thousand solar\\r\\nsystems have declared their\\r\\nintentions to leave the Republic.\\r\\n\\r\\nThis separatist movement,\\r\\nunder the leadership of the\\r\\nmysterious Count Dooku, has\\r\\nmade it difficult for the limited\\r\\nnumber of Jedi Knights to maintain \\r\\npeace and order in the galaxy.\\r\\n\\r\\nSenator Amidala, the former\\r\\nQueen of Naboo, is returning\\r\\nto the Galactic Senate to vote\\r\\non the critical issue of creating\\r\\nan ARMY OF THE REPUBLIC\\r\\nto assist the overwhelmed\\r\\nJedi....\",\"director\":\"George Lucas\",\"producer\":\"Rick McCallum\",\"release_date\":\"2002-05-16\",\"characters\":[\"https://swapi.co/api/people/2/\",\"https://swapi.co/api/people/3/\",\"https://swapi.co/api/people/6/\",\"https://swapi.co/api/people/7/\",\"https://swapi.co/api/people/10/\",\"https://swapi.co/api/people/11/\",\"https://swapi.co/api/people/20/\",\"https://swapi.co/api/people/21/\",\"https://swapi.co/api/people/22/\",\"https://swapi.co/api/people/33/\",\"https://swapi.co/api/people/36/\",\"https://swapi.co/api/people/40/\",\"https://swapi.co/api/people/43/\",\"https://swapi.co/api/people/46/\",\"https://swapi.co/api/people/51/\",\"https://swapi.co/api/people/52/\",\"https://swapi.co/api/people/53/\",\"https://swapi.co/api/people/58/\",\"https://swapi.co/api/people/59/\",\"https://swapi.co/api/people/60/\",\"https://swapi.co/api/people/61/\",\"https://swapi.co/api/people/62/\",\"https://swapi.co/api/people/63/\",\"https://swapi.co/api/people/64/\",\"https://swapi.co/api/people/65/\",\"https://swapi.co/api/people/66/\",\"https://swapi.co/api/people/67/\",\"https://swapi.co/api/people/68/\",\"https://swapi.co/api/people/69/\",\"https://swapi.co/api/people/70/\",\"https://swapi.co/api/people/71/\",\"https://swapi.co/api/people/72/\",\"https://swapi.co/api/people/73/\",\"https://swapi.co/api/people/74/\",\"https://swapi.co/api/people/75/\",\"https://swapi.co/api/people/76/\",\"https://swapi.co/api/people/77/\",\"https://swapi.co/api/people/78/\",\"https://swapi.co/api/people/82/\",\"https://swapi.co/api/people/35/\"],\"planets\":[\"https://swapi.co/api/planets/8/\",\"https://swapi.co/api/planets/9/\",\"https://swapi.co/api/planets/10/\",\"https://swapi.co/api/planets/11/\",\"https://swapi.co/api/planets/1/\"],\"starships\":[\"https://swapi.co/api/starships/21/\",\"https://swapi.co/api/starships/39/\",\"https://swapi.co/api/starships/43/\",\"https://swapi.co/api/starships/47/\",\"https://swapi.co/api/starships/48/\",\"https://swapi.co/api/starships/49/\",\"https://swapi.co/api/starships/32/\",\"https://swapi.co/api/starships/52/\",\"https://swapi.co/api/starships/58/\"],\"vehicles\":[\"https://swapi.co/api/vehicles/4/\",\"https://swapi.co/api/vehicles/44/\",\"https://swapi.co/api/vehicles/45/\",\"https://swapi.co/api/vehicles/46/\",\"https://swapi.co/api/vehicles/50/\",\"https://swapi.co/api/vehicles/51/\",\"https://swapi.co/api/vehicles/53/\",\"https://swapi.co/api/vehicles/54/\",\"https://swapi.co/api/vehicles/55/\",\"https://swapi.co/api/vehicles/56/\",\"https://swapi.co/api/vehicles/57/\"],\"species\":[\"https://swapi.co/api/species/32/\",\"https://swapi.co/api/species/33/\",\"https://swapi.co/api/species/2/\",\"https://swapi.co/api/species/35/\",\"https://swapi.co/api/species/6/\",\"https://swapi.co/api/species/1/\",\"https://swapi.co/api/species/12/\",\"https://swapi.co/api/species/34/\",\"https://swapi.co/api/species/13/\",\"https://swapi.co/api/species/15/\",\"https://swapi.co/api/species/28/\",\"https://swapi.co/api/species/29/\",\"https://swapi.co/api/species/30/\",\"https://swapi.co/api/species/31/\"],\"created\":\"2014-12-20T10:57:57.886000Z\",\"edited\":\"2015-04-11T09:45:01.623982Z\",\"url\":\"https://swapi.co/api/films/5/\"}"
        }
      ],
      [
        {
          "type": "Effect",
          "effect": {
            "type": "HttpRequest",
            "url": "https://swapi.co/api/films/4/"
          },
          "result": "{\"title\":\"The Phantom Menace\",\"episode_id\":1,\"opening_crawl\":\"Turmoil has engulfed the\\r\\nGalactic Republic. The taxation\\r\\nof trade routes to outlying star\\r\\nsystems is in dispute.\\r\\n\\r\\nHoping to resolve the matter\\r\\nwith a blockade of deadly\\r\\nbattleships, the greedy Trade\\r\\nFederation has stopped all\\r\\nshipping to the small planet\\r\\nof Naboo.\\r\\n\\r\\nWhile the Congress of the\\r\\nRepublic endlessly debates\\r\\nthis alarming chain of events,\\r\\nthe Supreme Chancellor has\\r\\nsecretly dispatched two Jedi\\r\\nKnights, the guardians of\\r\\npeace and justice in the\\r\\ngalaxy, to settle the conflict....\",\"director\":\"George Lucas\",\"producer\":\"Rick McCallum\",\"release_date\":\"1999-05-19\",\"characters\":[\"https://swapi.co/api/people/2/\",\"https://swapi.co/api/people/3/\",\"https://swapi.co/api/people/10/\",\"https://swapi.co/api/people/11/\",\"https://swapi.co/api/people/16/\",\"https://swapi.co/api/people/20/\",\"https://swapi.co/api/people/21/\",\"https://swapi.co/api/people/32/\",\"https://swapi.co/api/people/33/\",\"https://swapi.co/api/people/34/\",\"https://swapi.co/api/people/36/\",\"https://swapi.co/api/people/37/\",\"https://swapi.co/api/people/38/\",\"https://swapi.co/api/people/39/\",\"https://swapi.co/api/people/40/\",\"https://swapi.co/api/people/41/\",\"https://swapi.co/api/people/42/\",\"https://swapi.co/api/people/43/\",\"https://swapi.co/api/people/44/\",\"https://swapi.co/api/people/46/\",\"https://swapi.co/api/people/48/\",\"https://swapi.co/api/people/49/\",\"https://swapi.co/api/people/50/\",\"https://swapi.co/api/people/51/\",\"https://swapi.co/api/people/52/\",\"https://swapi.co/api/people/53/\",\"https://swapi.co/api/people/54/\",\"https://swapi.co/api/people/55/\",\"https://swapi.co/api/people/56/\",\"https://swapi.co/api/people/57/\",\"https://swapi.co/api/people/58/\",\"https://swapi.co/api/people/59/\",\"https://swapi.co/api/people/47/\",\"https://swapi.co/api/people/35/\"],\"planets\":[\"https://swapi.co/api/planets/8/\",\"https://swapi.co/api/planets/9/\",\"https://swapi.co/api/planets/1/\"],\"starships\":[\"https://swapi.co/api/starships/40/\",\"https://swapi.co/api/starships/41/\",\"https://swapi.co/api/starships/31/\",\"https://swapi.co/api/starships/32/\",\"https://swapi.co/api/starships/39/\"],\"vehicles\":[\"https://swapi.co/api/vehicles/33/\",\"https://swapi.co/api/vehicles/34/\",\"https://swapi.co/api/vehicles/35/\",\"https://swapi.co/api/vehicles/36/\",\"https://swapi.co/api/vehicles/37/\",\"https://swapi.co/api/vehicles/38/\",\"https://swapi.co/api/vehicles/42/\"],\"species\":[\"https://swapi.co/api/species/1/\",\"https://swapi.co/api/species/2/\",\"https://swapi.co/api/species/6/\",\"https://swapi.co/api/species/11/\",\"https://swapi.co/api/species/12/\",\"https://swapi.co/api/species/13/\",\"https://swapi.co/api/species/14/\",\"https://swapi.co/api/species/15/\",\"https://swapi.co/api/species/16/\",\"https://swapi.co/api/species/17/\",\"https://swapi.co/api/species/18/\",\"https://swapi.co/api/species/19/\",\"https://swapi.co/api/species/20/\",\"https://swapi.co/api/species/21/\",\"https://swapi.co/api/species/22/\",\"https://swapi.co/api/species/23/\",\"https://swapi.co/api/species/24/\",\"https://swapi.co/api/species/25/\",\"https://swapi.co/api/species/26/\",\"https://swapi.co/api/species/27/\"],\"created\":\"2014-12-19T16:52:55.740000Z\",\"edited\":\"2015-04-11T09:45:18.689301Z\",\"url\":\"https://swapi.co/api/films/4/\"}"
        }
      ],
      [
        {
          "type": "Effect",
          "effect": {
            "type": "HttpRequest",
            "url": "https://swapi.co/api/films/6/"
          },
          "result": "{\"title\":\"Revenge of the Sith\",\"episode_id\":3,\"opening_crawl\":\"War! The Republic is crumbling\\r\\nunder attacks by the ruthless\\r\\nSith Lord, Count Dooku.\\r\\nThere are heroes on both sides.\\r\\nEvil is everywhere.\\r\\n\\r\\nIn a stunning move, the\\r\\nfiendish droid leader, General\\r\\nGrievous, has swept into the\\r\\nRepublic capital and kidnapped\\r\\nChancellor Palpatine, leader of\\r\\nthe Galactic Senate.\\r\\n\\r\\nAs the Separatist Droid Army\\r\\nattempts to flee the besieged\\r\\ncapital with their valuable\\r\\nhostage, two Jedi Knights lead a\\r\\ndesperate mission to rescue the\\r\\ncaptive Chancellor....\",\"director\":\"George Lucas\",\"producer\":\"Rick McCallum\",\"release_date\":\"2005-05-19\",\"characters\":[\"https://swapi.co/api/people/1/\",\"https://swapi.co/api/people/2/\",\"https://swapi.co/api/people/3/\",\"https://swapi.co/api/people/4/\",\"https://swapi.co/api/people/5/\",\"https://swapi.co/api/people/6/\",\"https://swapi.co/api/people/7/\",\"https://swapi.co/api/people/10/\",\"https://swapi.co/api/people/11/\",\"https://swapi.co/api/people/12/\",\"https://swapi.co/api/people/13/\",\"https://swapi.co/api/people/20/\",\"https://swapi.co/api/people/21/\",\"https://swapi.co/api/people/33/\",\"https://swapi.co/api/people/46/\",\"https://swapi.co/api/people/51/\",\"https://swapi.co/api/people/52/\",\"https://swapi.co/api/people/53/\",\"https://swapi.co/api/people/54/\",\"https://swapi.co/api/people/55/\",\"https://swapi.co/api/people/56/\",\"https://swapi.co/api/people/58/\",\"https://swapi.co/api/people/63/\",\"https://swapi.co/api/people/64/\",\"https://swapi.co/api/people/67/\",\"https://swapi.co/api/people/68/\",\"https://swapi.co/api/people/75/\",\"https://swapi.co/api/people/78/\",\"https://swapi.co/api/people/79/\",\"https://swapi.co/api/people/80/\",\"https://swapi.co/api/people/81/\",\"https://swapi.co/api/people/82/\",\"https://swapi.co/api/people/83/\",\"https://swapi.co/api/people/35/\"],\"planets\":[\"https://swapi.co/api/planets/2/\",\"https://swapi.co/api/planets/5/\",\"https://swapi.co/api/planets/8/\",\"https://swapi.co/api/planets/9/\",\"https://swapi.co/api/planets/12/\",\"https://swapi.co/api/planets/13/\",\"https://swapi.co/api/planets/14/\",\"https://swapi.co/api/planets/15/\",\"https://swapi.co/api/planets/16/\",\"https://swapi.co/api/planets/17/\",\"https://swapi.co/api/planets/18/\",\"https://swapi.co/api/planets/19/\",\"https://swapi.co/api/planets/1/\"],\"starships\":[\"https://swapi.co/api/starships/48/\",\"https://swapi.co/api/starships/59/\",\"https://swapi.co/api/starships/61/\",\"https://swapi.co/api/starships/32/\",\"https://swapi.co/api/starships/63/\",\"https://swapi.co/api/starships/64/\",\"https://swapi.co/api/starships/65/\",\"https://swapi.co/api/starships/66/\",\"https://swapi.co/api/starships/74/\",\"https://swapi.co/api/starships/75/\",\"https://swapi.co/api/starships/2/\",\"https://swapi.co/api/starships/68/\"],\"vehicles\":[\"https://swapi.co/api/vehicles/33/\",\"https://swapi.co/api/vehicles/50/\",\"https://swapi.co/api/vehicles/53/\",\"https://swapi.co/api/vehicles/56/\",\"https://swapi.co/api/vehicles/60/\",\"https://swapi.co/api/vehicles/62/\",\"https://swapi.co/api/vehicles/67/\",\"https://swapi.co/api/vehicles/69/\",\"https://swapi.co/api/vehicles/70/\",\"https://swapi.co/api/vehicles/71/\",\"https://swapi.co/api/vehicles/72/\",\"https://swapi.co/api/vehicles/73/\",\"https://swapi.co/api/vehicles/76/\"],\"species\":[\"https://swapi.co/api/species/19/\",\"https://swapi.co/api/species/33/\",\"https://swapi.co/api/species/2/\",\"https://swapi.co/api/species/3/\",\"https://swapi.co/api/species/36/\",\"https://swapi.co/api/species/37/\",\"https://swapi.co/api/species/6/\",\"https://swapi.co/api/species/1/\",\"https://swapi.co/api/species/34/\",\"https://swapi.co/api/species/15/\",\"https://swapi.co/api/species/35/\",\"https://swapi.co/api/species/20/\",\"https://swapi.co/api/species/23/\",\"https://swapi.co/api/species/24/\",\"https://swapi.co/api/species/25/\",\"https://swapi.co/api/species/26/\",\"https://swapi.co/api/species/27/\",\"https://swapi.co/api/species/28/\",\"https://swapi.co/api/species/29/\",\"https://swapi.co/api/species/30/\"],\"created\":\"2014-12-20T18:49:38.403000Z\",\"edited\":\"2015-04-11T09:45:44.862122Z\",\"url\":\"https://swapi.co/api/films/6/\"}"
        }
      ],
      [
        {
          "type": "Effect",
          "effect": {
            "type": "HttpRequest",
            "url": "https://swapi.co/api/films/3/"
          },
          "result": "{\"title\":\"Return of the Jedi\",\"episode_id\":6,\"opening_crawl\":\"Luke Skywalker has returned to\\r\\nhis home planet of Tatooine in\\r\\nan attempt to rescue his\\r\\nfriend Han Solo from the\\r\\nclutches of the vile gangster\\r\\nJabba the Hutt.\\r\\n\\r\\nLittle does Luke know that the\\r\\nGALACTIC EMPIRE has secretly\\r\\nbegun construction on a new\\r\\narmored space station even\\r\\nmore powerful than the first\\r\\ndreaded Death Star.\\r\\n\\r\\nWhen completed, this ultimate\\r\\nweapon will spell certain doom\\r\\nfor the small band of rebels\\r\\nstruggling to restore freedom\\r\\nto the galaxy...\",\"director\":\"Richard Marquand\",\"producer\":\"Howard G. Kazanjian, George Lucas, Rick McCallum\",\"release_date\":\"1983-05-25\",\"characters\":[\"https://swapi.co/api/people/1/\",\"https://swapi.co/api/people/2/\",\"https://swapi.co/api/people/3/\",\"https://swapi.co/api/people/4/\",\"https://swapi.co/api/people/5/\",\"https://swapi.co/api/people/10/\",\"https://swapi.co/api/people/13/\",\"https://swapi.co/api/people/14/\",\"https://swapi.co/api/people/16/\",\"https://swapi.co/api/people/18/\",\"https://swapi.co/api/people/20/\",\"https://swapi.co/api/people/21/\",\"https://swapi.co/api/people/22/\",\"https://swapi.co/api/people/25/\",\"https://swapi.co/api/people/27/\",\"https://swapi.co/api/people/28/\",\"https://swapi.co/api/people/29/\",\"https://swapi.co/api/people/30/\",\"https://swapi.co/api/people/31/\",\"https://swapi.co/api/people/45/\"],\"planets\":[\"https://swapi.co/api/planets/5/\",\"https://swapi.co/api/planets/7/\",\"https://swapi.co/api/planets/8/\",\"https://swapi.co/api/planets/9/\",\"https://swapi.co/api/planets/1/\"],\"starships\":[\"https://swapi.co/api/starships/15/\",\"https://swapi.co/api/starships/10/\",\"https://swapi.co/api/starships/11/\",\"https://swapi.co/api/starships/12/\",\"https://swapi.co/api/starships/22/\",\"https://swapi.co/api/starships/23/\",\"https://swapi.co/api/starships/27/\",\"https://swapi.co/api/starships/28/\",\"https://swapi.co/api/starships/29/\",\"https://swapi.co/api/starships/3/\",\"https://swapi.co/api/starships/17/\",\"https://swapi.co/api/starships/2/\"],\"vehicles\":[\"https://swapi.co/api/vehicles/8/\",\"https://swapi.co/api/vehicles/16/\",\"https://swapi.co/api/vehicles/18/\",\"https://swapi.co/api/vehicles/19/\",\"https://swapi.co/api/vehicles/24/\",\"https://swapi.co/api/vehicles/25/\",\"https://swapi.co/api/vehicles/26/\",\"https://swapi.co/api/vehicles/30/\"],\"species\":[\"https://swapi.co/api/species/1/\",\"https://swapi.co/api/species/2/\",\"https://swapi.co/api/species/3/\",\"https://swapi.co/api/species/5/\",\"https://swapi.co/api/species/6/\",\"https://swapi.co/api/species/8/\",\"https://swapi.co/api/species/9/\",\"https://swapi.co/api/species/10/\",\"https://swapi.co/api/species/15/\"],\"created\":\"2014-12-18T10:39:33.255000Z\",\"edited\":\"2015-04-11T09:46:05.220365Z\",\"url\":\"https://swapi.co/api/films/3/\"}"
        }
      ],
      [
        {
          "type": "Effect",
          "effect": {
            "type": "HttpRequest",
            "url": "https://swapi.co/api/films/1/"
          },
          "result": "{\"title\":\"A New Hope\",\"episode_id\":4,\"opening_crawl\":\"It is a period of civil war.\\r\\nRebel spaceships, striking\\r\\nfrom a hidden base, have won\\r\\ntheir first victory against\\r\\nthe evil Galactic Empire.\\r\\n\\r\\nDuring the battle, Rebel\\r\\nspies managed to steal secret\\r\\nplans to the Empire's\\r\\nultimate weapon, the DEATH\\r\\nSTAR, an armored space\\r\\nstation with enough power\\r\\nto destroy an entire planet.\\r\\n\\r\\nPursued by the Empire's\\r\\nsinister agents, Princess\\r\\nLeia races home aboard her\\r\\nstarship, custodian of the\\r\\nstolen plans that can save her\\r\\npeople and restore\\r\\nfreedom to the galaxy....\",\"director\":\"George Lucas\",\"producer\":\"Gary Kurtz, Rick McCallum\",\"release_date\":\"1977-05-25\",\"characters\":[\"https://swapi.co/api/people/1/\",\"https://swapi.co/api/people/2/\",\"https://swapi.co/api/people/3/\",\"https://swapi.co/api/people/4/\",\"https://swapi.co/api/people/5/\",\"https://swapi.co/api/people/6/\",\"https://swapi.co/api/people/7/\",\"https://swapi.co/api/people/8/\",\"https://swapi.co/api/people/9/\",\"https://swapi.co/api/people/10/\",\"https://swapi.co/api/people/12/\",\"https://swapi.co/api/people/13/\",\"https://swapi.co/api/people/14/\",\"https://swapi.co/api/people/15/\",\"https://swapi.co/api/people/16/\",\"https://swapi.co/api/people/18/\",\"https://swapi.co/api/people/19/\",\"https://swapi.co/api/people/81/\"],\"planets\":[\"https://swapi.co/api/planets/2/\",\"https://swapi.co/api/planets/3/\",\"https://swapi.co/api/planets/1/\"],\"starships\":[\"https://swapi.co/api/starships/2/\",\"https://swapi.co/api/starships/3/\",\"https://swapi.co/api/starships/5/\",\"https://swapi.co/api/starships/9/\",\"https://swapi.co/api/starships/10/\",\"https://swapi.co/api/starships/11/\",\"https://swapi.co/api/starships/12/\",\"https://swapi.co/api/starships/13/\"],\"vehicles\":[\"https://swapi.co/api/vehicles/4/\",\"https://swapi.co/api/vehicles/6/\",\"https://swapi.co/api/vehicles/7/\",\"https://swapi.co/api/vehicles/8/\"],\"species\":[\"https://swapi.co/api/species/5/\",\"https://swapi.co/api/species/3/\",\"https://swapi.co/api/species/2/\",\"https://swapi.co/api/species/1/\",\"https://swapi.co/api/species/4/\"],\"created\":\"2014-12-10T14:23:31.880000Z\",\"edited\":\"2015-04-11T09:46:52.774897Z\",\"url\":\"https://swapi.co/api/films/1/\"}"
        }
      ],
      [
        {
          "type": "Effect",
          "effect": {
            "type": "HttpRequest",
            "url": "https://swapi.co/api/films/7/"
          },
          "result": "{\"title\":\"The Force Awakens\",\"episode_id\":7,\"opening_crawl\":\"Luke Skywalker has vanished.\\r\\nIn his absence, the sinister\\r\\nFIRST ORDER has risen from\\r\\nthe ashes of the Empire\\r\\nand will not rest until\\r\\nSkywalker, the last Jedi,\\r\\nhas been destroyed.\\r\\n \\r\\nWith the support of the\\r\\nREPUBLIC, General Leia Organa\\r\\nleads a brave RESISTANCE.\\r\\nShe is desperate to find her\\r\\nbrother Luke and gain his\\r\\nhelp in restoring peace and\\r\\njustice to the galaxy.\\r\\n \\r\\nLeia has sent her most daring\\r\\npilot on a secret mission\\r\\nto Jakku, where an old ally\\r\\nhas discovered a clue to\\r\\nLuke's whereabouts....\",\"director\":\"J. J. Abrams\",\"producer\":\"Kathleen Kennedy, J. J. Abrams, Bryan Burk\",\"release_date\":\"2015-12-11\",\"characters\":[\"https://swapi.co/api/people/1/\",\"https://swapi.co/api/people/3/\",\"https://swapi.co/api/people/5/\",\"https://swapi.co/api/people/13/\",\"https://swapi.co/api/people/14/\",\"https://swapi.co/api/people/27/\",\"https://swapi.co/api/people/84/\",\"https://swapi.co/api/people/85/\",\"https://swapi.co/api/people/86/\",\"https://swapi.co/api/people/87/\",\"https://swapi.co/api/people/88/\"],\"planets\":[\"https://swapi.co/api/planets/61/\"],\"starships\":[\"https://swapi.co/api/starships/77/\",\"https://swapi.co/api/starships/10/\"],\"vehicles\":[],\"species\":[\"https://swapi.co/api/species/3/\",\"https://swapi.co/api/species/2/\",\"https://swapi.co/api/species/1/\"],\"created\":\"2015-04-17T06:51:30.504780Z\",\"edited\":\"2015-12-17T14:31:47.617768Z\",\"url\":\"https://swapi.co/api/films/7/\"}"
        }
      ]
    ]
  },
  {
    "type": "Commit",
    "commit": {
      "type": "LoadSuccess",
      "movies": [
        "The Empire Strikes Back",
        "Attack of the Clones",
        "The Phantom Menace",
        "Revenge of the Sith",
        "Return of the Jedi",
        "A New Hope",
        "The Force Awakens"
      ]
    }
  }
]
```

## License
MIT
