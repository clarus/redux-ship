// @flow
import 'babel-polyfill';
import * as Ship from 'redux-ship';
import * as EyeController from '../controller';

const config = [
  {"action":{"type":"Load"},"snapshot":[{"type":"Commit","commit":{"type":"LoadStart"}},{"type":"Effect","effect":{"type":"HttpRequest","url":"http://swapi.co/api/people/3/"},"result":"{\"name\":\"R2-D2\",\"height\":\"96\",\"mass\":\"32\",\"hair_color\":\"n/a\",\"skin_color\":\"white, blue\",\"eye_color\":\"red\",\"birth_year\":\"33BBY\",\"gender\":\"n/a\",\"homeworld\":\"http://swapi.co/api/planets/8/\",\"films\":[\"http://swapi.co/api/films/5/\",\"http://swapi.co/api/films/4/\",\"http://swapi.co/api/films/6/\",\"http://swapi.co/api/films/3/\",\"http://swapi.co/api/films/2/\",\"http://swapi.co/api/films/1/\",\"http://swapi.co/api/films/7/\"],\"species\":[\"http://swapi.co/api/species/2/\"],\"vehicles\":[],\"starships\":[],\"created\":\"2014-12-10T15:11:50.376000Z\",\"edited\":\"2014-12-20T21:17:50.311000Z\",\"url\":\"http://swapi.co/api/people/3/\"}"},{"type":"Commit","commit":{"type":"LoadSuccess","color":"red"}}]}
];

test('controller', () => {
  config.forEach(({action, snapshot}) => {
    expect(Ship.simulate(EyeController.control(action), snapshot)).toEqual(snapshot);
  });
});
