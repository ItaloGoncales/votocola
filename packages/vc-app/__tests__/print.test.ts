import type { BallotSlot } from '@/api';
import { base64ToBytes, buildPrintHtml } from '@/print';

jest.mock('expo-print', () => ({ printAsync: jest.fn(), printToFileAsync: jest.fn() }));
jest.mock('expo-file-system', () => ({ File: jest.fn(), Paths: {} }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));

const ballot: BallotSlot[] = [
  { key: 'GOVERNOR', office: 'GOVERNOR', label: 'Governador(a)', digits: 2 },
  { key: 'SENATOR_1', office: 'SENATOR', label: 'Senador(a) — 1ª vaga', digits: 3 },
];

describe('buildPrintHtml', () => {
  const html = buildPrintHtml('SP', ballot, {
    GOVERNOR: {
      id: '1',
      number: '10',
      ballotName: 'Fulano <b>"x"</b>',
      partyAcronym: 'P&Q',
      photoUrl: null,
      state: 'SP',
      office: 'GOVERNOR',
    },
  });

  it('prints two copies with a cut line, in black on white', () => {
    expect(html.match(/<section class="copy">/g)).toHaveLength(2);
    expect(html).toContain('recorte aqui');
    expect(html).toContain('Minha colinha · São Paulo');
  });

  it('fills chosen numbers and leaves blank boxes to write by hand', () => {
    expect(html).toContain('<span class="box">1</span><span class="box">0</span>');
    expect(html).toContain(
      '<span class="box">&nbsp;</span><span class="box">&nbsp;</span><span class="box">&nbsp;</span>',
    );
    expect(html).toContain('<span class="blank"></span>');
  });

  it('escapes names', () => {
    expect(html).not.toContain('<b>"x"</b>');
    expect(html).toContain('Fulano &#60;b&#62;&#34;x&#34;&#60;/b&#62;');
    expect(html).toContain('P&#38;Q');
  });
});

describe('base64ToBytes', () => {
  it('decodes the PDF header', () => {
    expect(Array.from(base64ToBytes('JVBERi0='))).toEqual([37, 80, 68, 70, 45]); // "%PDF-"
  });
});
