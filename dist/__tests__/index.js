'use strict';

var _index = require('../index');

var Ship = _interopRequireWildcard(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var _marked = [eyeControl, control].map(regeneratorRuntime.mark);

function httpRequest(url) {
  return Ship.call({
    type: 'HttpRequest',
    url: url
  });
}

var initialEyeState = {
  color: null,
  isLoading: false
};

function eyeControl() {
  var currentEyeColor, r2d2, eyeColor;
  return regeneratorRuntime.wrap(function eyeControl$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          return _context.delegateYield(Ship.getState(function (state) {
            return state.color;
          }), 't0', 1);

        case 1:
          currentEyeColor = _context.t0;

          if (currentEyeColor) {
            _context.next = 8;
            break;
          }

          return _context.delegateYield(Ship.commit({ type: 'LoadStart' }), 't1', 4);

        case 4:
          return _context.delegateYield(httpRequest('http://swapi.co/api/people/3/'), 't2', 5);

        case 5:
          r2d2 = _context.t2;
          eyeColor = JSON.parse(r2d2).eye_color;
          return _context.delegateYield(Ship.commit({ type: 'LoadSuccess', color: eyeColor }), 't3', 8);

        case 8:
        case 'end':
          return _context.stop();
      }
    }
  }, _marked[0], this);
}

var initialState = {
  eye: initialEyeState
};

function control() {
  return regeneratorRuntime.wrap(function control$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          return _context2.delegateYield(Ship.map(function (commit) {
            return { type: 'Eye', commit: commit };
          }, function (state) {
            return state.eye;
          }, eyeControl()), 't0', 1);

        case 1:
        case 'end':
          return _context2.stop();
      }
    }
  }, _marked[1], this);
}

describe('map', function () {
  test('without eye', function () {
    var snapshot = [{ "type": "GetState" }, { "type": "Commit", "commit": { "type": "Eye", "commit": { "type": "LoadStart" } } }, { "type": "Effect", "effect": { "type": "HttpRequest", "url": "http://swapi.co/api/people/3/" }, "result": "{\"name\":\"R2-D2\",\"eye_color\":\"red\"}" }, { "type": "Commit", "commit": { "type": "Eye", "commit": { "type": "LoadSuccess", "color": "red" } } }];
    expect(Ship.simulate(control(), snapshot)).toEqual(snapshot);
  });
  test('with eye', function () {
    var snapshot = [{ "type": "GetState", state: "red" }];
    expect(Ship.simulate(control(), snapshot)).toEqual(snapshot);
  });
});