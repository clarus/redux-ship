// @flow
import * as EyeModel from '../model';

const commits = [{
  type: 'LoadStart',
}, {
  type: 'LoadSuccess',
  color: 'red',
}]

test('model', () => {
  commits.forEach(commit => {
    expect(EyeModel.reduce(EyeModel.initialState, commit)).toMatchSnapshot();
  });
});
