import { parseTrustProxy } from './app.setup.js';

describe('parseTrustProxy', () => {
  it('parses hops, true and empty', () => {
    expect(parseTrustProxy(undefined)).toBeUndefined();
    expect(parseTrustProxy('')).toBeUndefined();
    expect(parseTrustProxy('false')).toBeUndefined();
    expect(parseTrustProxy('1')).toBe(1);
    expect(parseTrustProxy('true')).toBe(true);
    expect(() => parseTrustProxy('sim')).toThrow(/TRUST_PROXY/);
  });
});
