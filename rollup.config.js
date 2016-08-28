import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/index.js',
  dest: 'build/main.js',
  format: 'umd',
  moduleName: 'ReduxShip',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    uglify(),
  ],
  sourceMap: true,
};
