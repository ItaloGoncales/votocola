import { APP_OPEN_COOLDOWN_MS, shouldShowAppOpen, type AppOpenState } from '@/ads/policy';

const base: AppOpenState = {
  now: 10 * 60 * 60_000,
  onboarded: true,
  loadedAt: 10 * 60 * 60_000 - 60_000,
  lastShownAt: 0,
  lastInterstitialAt: 0,
  returningFromOwnAction: false,
};

describe('shouldShowAppOpen', () => {
  it('shows a fresh ad for a returning user', () => {
    expect(shouldShowAppOpen(base)).toBe(true);
  });

  it('never shows on the first launch or when coming back from share/PDF/links', () => {
    expect(shouldShowAppOpen({ ...base, onboarded: false })).toBe(false);
    expect(shouldShowAppOpen({ ...base, returningFromOwnAction: true })).toBe(false);
  });

  it('respects cooldown, interstitials and expiry', () => {
    expect(shouldShowAppOpen({ ...base, lastShownAt: base.now - APP_OPEN_COOLDOWN_MS + 1 })).toBe(
      false,
    );
    expect(shouldShowAppOpen({ ...base, lastInterstitialAt: base.now - 30_000 })).toBe(false);
    expect(shouldShowAppOpen({ ...base, loadedAt: base.now - 5 * 60 * 60_000 })).toBe(false);
    expect(shouldShowAppOpen({ ...base, loadedAt: null })).toBe(false);
  });
});
