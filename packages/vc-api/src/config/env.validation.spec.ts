import { validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('defaults PUBLIC_URL to localhost and strips trailing slashes', () => {
    expect(validateEnv({}).PUBLIC_URL).toBe('http://localhost:4000');
    expect(validateEnv({ PUBLIC_URL: 'https://api.x.app/' }).PUBLIC_URL).toBe('https://api.x.app');
  });

  it('turns popularity sort on unless disabled', () => {
    expect(validateEnv({}).POPULARITY_SORT).toBe(true);
    expect(validateEnv({ POPULARITY_SORT: 'false' }).POPULARITY_SORT).toBe(false);
    expect(() => validateEnv({ POPULARITY_SORT: 'no' })).toThrow(/POPULARITY_SORT/);
    expect(validateEnv({}).VIEW_COUNT_VISIBLE).toBe(true);
    expect(validateEnv({ VIEW_COUNT_VISIBLE: 'false' }).VIEW_COUNT_VISIBLE).toBe(false);
  });

  it('rejects invalid urls', () => {
    expect(() => validateEnv({ PUBLIC_URL: 'api.x.app' })).toThrow(/PUBLIC_URL/);
  });
});
