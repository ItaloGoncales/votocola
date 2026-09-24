import { shouldStartTunnel, upsertEnvLine } from './tunnel.js';

describe('shouldStartTunnel', () => {
  it('runs only in development and test, unless disabled', () => {
    expect(shouldStartTunnel({ NODE_ENV: 'development' })).toBe(true);
    expect(shouldStartTunnel({ NODE_ENV: 'test' })).toBe(true);
    expect(shouldStartTunnel({ NODE_ENV: 'production' })).toBe(false);
    expect(shouldStartTunnel({ NODE_ENV: 'stage' })).toBe(false);
    expect(shouldStartTunnel({})).toBe(false);
    expect(shouldStartTunnel({ NODE_ENV: 'development', TUNNEL: 'false' })).toBe(false);
  });
});

describe('upsertEnvLine', () => {
  it('replaces the key and keeps other lines', () => {
    expect(upsertEnvLine('A=1\nEXPO_PUBLIC_API_URL=old\n', 'EXPO_PUBLIC_API_URL', 'new')).toBe(
      'A=1\nEXPO_PUBLIC_API_URL=new\n',
    );
    expect(upsertEnvLine('A=1', 'B', '2')).toBe('A=1\nB=2\n');
    expect(upsertEnvLine('', 'B', '2')).toBe('B=2\n');
  });
});
