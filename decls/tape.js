// @flow

declare module 'tape' {
  declare function exports(
    cb: (t: {
      deepEqual: <A>(actual: A, expected: A) => void,
      end: () => void,
      equal: <A>(actual: A, expected: A) => void,
      notDeepEqual: <A>(actual: A, expected: A) => void,
    }) => void
  ): void;
}
