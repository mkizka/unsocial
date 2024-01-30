declare namespace jest {
  interface Matchers<R> {
    toEqualPrisma(expected: object): R;
  }
  interface Expect {
    anyDate(): unknown;
  }
}
