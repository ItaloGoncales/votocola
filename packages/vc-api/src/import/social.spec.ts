import { normalizeSocialUrl, pickSocialLinks } from './social.js';

describe('normalizeSocialUrl', () => {
  it('fixes scheme, case of host, www and tracking params', () => {
    expect(normalizeSocialUrl('INSTAGRAM.COM/EUTOCOMDANILO')).toEqual({
      network: 'instagram',
      url: 'https://instagram.com/EUTOCOMDANILO',
    });
    expect(
      normalizeSocialUrl('https://www.instagram.com/lucia_da_portomotos?utm_source=qr&igsh=ZWV'),
    ).toEqual({ network: 'instagram', url: 'https://instagram.com/lucia_da_portomotos' });
    expect(
      normalizeSocialUrl('https://www.facebook.com/share/19JjfXVy9w/?mibextid=wwXIfr')?.url,
    ).toBe('https://facebook.com/share/19JjfXVy9w');
  });

  it('keeps meaningful query params and classifies networks', () => {
    expect(normalizeSocialUrl('facebook.com/profile.php?id=123&fbclid=x')?.url).toBe(
      'https://facebook.com/profile.php?id=123',
    );
    expect(normalizeSocialUrl('HTTPS://WWW.YOUTUBE.COM/@MATHEUS')?.network).toBe('youtube');
    expect(normalizeSocialUrl('https://twitter.com/fulano')?.network).toBe('x');
    expect(normalizeSocialUrl('wa.me/5511999999999')?.network).toBe('whatsapp');
    expect(normalizeSocialUrl('WWW.RAISSASOARESOFICIAL.COM.BR')).toEqual({
      network: 'site',
      url: 'https://raissasoaresoficial.com.br',
    });
  });

  it('drops what is not a usable link', () => {
    expect(normalizeSocialUrl('@SAMPAIOELAINE_')).toBeNull();
    expect(normalizeSocialUrl('não tenho')).toBeNull();
    expect(normalizeSocialUrl('')).toBeNull();
  });
});

describe('pickSocialLinks', () => {
  it('omits WhatsApp and Kwai', () => {
    expect(pickSocialLinks(['wa.me/5511999999999', 'kwai.com/@x', 'instagram.com/y'])).toEqual([
      { network: 'instagram', url: 'https://instagram.com/y' },
    ]);
  });

  it('keeps the first link of each network, in display order', () => {
    const links = pickSocialLinks([
      'https://www.twibbonize.com/a',
      'https://www.twibbonize.com/b',
      'facebook.com/x',
      'instagram.com/first',
      'instagram.com/second',
    ]);
    expect(links.map((l) => l.url)).toEqual([
      'https://instagram.com/first',
      'https://facebook.com/x',
      'https://twibbonize.com/a',
    ]);
  });
});
