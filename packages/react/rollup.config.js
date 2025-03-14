export default {
  input: ['src/index.ts'],
  output: [
    {
      dir: 'dist',
      entryFileNames: '[name].js',
      format: 'cjs',
      exports: 'named',
    },
  ],
  plugins: [],
  external: ['rxjs', 'rxjs/operators'],
};
