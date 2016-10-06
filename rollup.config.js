import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

export default {
  dest: 'dist/index.js',
  entry: 'src/index.js',
  format: 'cjs',
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    uglify(),
  ],
  sourceMap: true,
};
