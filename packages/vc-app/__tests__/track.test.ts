import * as api from '@/api';
import { store } from '@/store';
import { countOnce } from '@/track';

describe('countOnce', () => {
  it('sends +1 only the first time per candidate and kind, with no device identifier', () => {
    const spy = jest.spyOn(api, 'trackCandidate').mockImplementation(() => {});
    countOnce('VIEW', 'a');
    countOnce('VIEW', 'a');
    countOnce('PICK', 'a');
    expect(spy.mock.calls).toEqual([
      ['a', 'VIEW'],
      ['a', 'PICK'],
    ]);
    expect(store.get()).not.toHaveProperty('deviceId');
  });
});
