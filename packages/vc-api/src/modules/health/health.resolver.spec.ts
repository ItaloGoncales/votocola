import { HealthResolver } from './health.resolver.js';

describe('HealthResolver', () => {
  it('reports ok status', () => {
    const health = new HealthResolver().health();
    expect(health.status).toBe('ok');
    expect(health.uptime).toBeGreaterThanOrEqual(0);
  });
});
