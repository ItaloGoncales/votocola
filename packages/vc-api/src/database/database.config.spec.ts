import { buildDataSourceOptions, sslOption } from './database.config.js';

describe('database config', () => {
  it('enables encrypted connections only with DB_SSL=true', () => {
    expect(sslOption({})).toBe(false);
    expect(sslOption({ DB_SSL: 'true' })).toEqual({ rejectUnauthorized: false });
  });

  it('limits the pool size per machine', () => {
    expect(buildDataSourceOptions({ DB_POOL_MAX: '5' })).toMatchObject({ extra: { max: 5 } });
    expect(buildDataSourceOptions({})).toMatchObject({ extra: { max: 10 } });
  });
});
