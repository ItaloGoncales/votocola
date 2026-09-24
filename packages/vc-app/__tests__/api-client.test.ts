import { gql, GraphQLRequestError } from '@/api/client';

describe('gql', () => {
  afterEach(() => jest.restoreAllMocks());

  it('returns data', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({ data: { ok: true } }),
    } as Response);
    await expect(gql('{ ok }')).resolves.toEqual({ ok: true });
  });

  it('throws the first error with its code', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({ errors: [{ message: 'nope', extensions: { code: 'NOT_FOUND' } }] }),
    } as Response);
    await expect(gql('{ x }')).rejects.toEqual(new GraphQLRequestError('nope', 'NOT_FOUND'));
  });
});
