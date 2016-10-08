// @flow
import * as Controller from './controller';

it('gets the full name', () => {
  const ship = Controller.control({
    type: 'Load'
  });
  {
    const {value} = ship.next();
    expect(value).toEqual({
      type: 'Command',
      command: {
        type: 'Dispatch',
        action: {
          type: 'LoadStart',
        },
      },
    });
  }
  {
    const {value} = ship.next();
    expect(value).toEqual({
      type: 'Command',
      command: {
        type: 'Effect',
        effect: {
          type: 'HttpRequest',
          url: 'http://swapi.co/api/people/1/',
        },
      },
    });
  }
  {
    const {value} = ship.next(JSON.stringify({
      name: 'Luke Skywalker',
    }));
    expect(value).toEqual({
      type: 'Command',
      command: {
        type: 'Dispatch',
        action: {
          type: 'LoadSuccess',
          fullName: 'Luke Skywalker'
        },
      },
    });
  }
  {
    const {done} = ship.next();
    expect(done).toBe(true);
  }
});
