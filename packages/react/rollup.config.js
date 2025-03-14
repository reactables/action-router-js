import typescript from 'rollup-plugin-typescript2';

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
  plugins: [typescript()],
  external: ['react', 'rxjs', 'rxjs/operators', '@reactables/core', '@reactables/react'],
};
