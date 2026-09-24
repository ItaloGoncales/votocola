import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as api from '@/api';
import { useCandidateSearch } from '@/use-candidate-search';

const candidate = (id: string) => ({ id, ballotName: id }) as api.CandidateSummary;
const page = (ids: string[], nextOffset: number | null, total = 3): api.CandidatePage => ({
  items: ids.map(candidate),
  total,
  hasMore: nextOffset !== null,
  nextOffset,
});

describe('useCandidateSearch', () => {
  afterEach(() => jest.restoreAllMocks());

  it('loads more pages, drops duplicates and stops at the end', async () => {
    const spy = jest
      .spyOn(api, 'searchCandidates')
      .mockResolvedValueOnce(page(['a', 'b'], 2))
      .mockResolvedValueOnce(page(['b', 'c'], null));
    const { result } = await renderHook(() => useCandidateSearch({ state: 'SP' }));
    await waitFor(() => expect(result.current.items).toHaveLength(2));

    await act(async () => result.current.loadMore());
    await waitFor(() => expect(result.current.items.map((c) => c.id)).toEqual(['a', 'b', 'c']));
    expect(spy).toHaveBeenLastCalledWith({ state: 'SP' }, 2);
    expect(result.current.hasMore).toBe(false);

    await act(async () => result.current.loadMore());
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('ignores a slow answer from a previous filter', async () => {
    let resolveOld: (p: api.CandidatePage) => void = () => {};
    jest
      .spyOn(api, 'searchCandidates')
      .mockImplementationOnce(() => new Promise((r) => (resolveOld = r)))
      .mockResolvedValueOnce(page(['new'], null, 1));
    const { result, rerender } = await renderHook(
      (props: { query: string }) => useCandidateSearch(props),
      { initialProps: { query: 'old' } },
    );
    await rerender({ query: 'new' });
    await waitFor(() => expect(result.current.items.map((c) => c.id)).toEqual(['new']));
    await act(async () => resolveOld(page(['stale'], null, 1)));
    expect(result.current.items.map((c) => c.id)).toEqual(['new']);
  });
});
