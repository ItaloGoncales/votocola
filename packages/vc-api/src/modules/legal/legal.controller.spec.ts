import { appAdsTxt, storeLinks } from './legal.controller.js';

describe('appAdsTxt', () => {
  it('builds the AdMob line and rejects malformed ids', () => {
    expect(appAdsTxt('pub-6785676183694375')).toBe(
      'google.com, pub-6785676183694375, DIRECT, f08c47fec0942fa0\n',
    );
    expect(() => appAdsTxt('ca-app-pub-1')).toThrow(/ADMOB_PUBLISHER_ID/);
  });
});

describe('storeLinks', () => {
  it('shows available stores or "em breve"', () => {
    expect(storeLinks()).toMatch(/Em breve/);
    expect(storeLinks('https://play.google.com/x')).toContain('Google Play');
  });
});
