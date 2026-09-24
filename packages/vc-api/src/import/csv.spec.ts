import { partiesOf } from './candidates.js';
import { clean, parseCsv, parseDate, titleCase } from './csv.js';

describe('parseCsv', () => {
  it('parses quoted fields, escaped quotes and CRLF', () => {
    const rows = parseCsv('"A";"B"\r\n"1";"x;""y"""\r\n"2";"#NULO#"\r\n');
    expect(rows).toEqual([
      { A: '1', B: 'x;"y"' },
      { A: '2', B: '#NULO#' },
    ]);
    expect(clean(rows[1].B)).toBeNull();
  });
});

describe('helpers', () => {
  it('formats names and dates', () => {
    expect(titleCase('LUIZ INÁCIO LULA DA SILVA')).toBe('Luiz Inácio Lula da Silva');
    expect(titleCase('ANA MARIA-JOSÉ')).toBe('Ana Maria-José');
    expect(titleCase('MARIA "DO POVO" LIMA')).toBe('Maria "do Povo" Lima');
    expect(parseDate('04/10/1980')).toBe('1980-10-04');
    expect(parseDate(null)).toBeNull();
  });
});

describe('TSE 2026 quirks', () => {
  it('treats "não divulgável" as missing and cleans federation composition', () => {
    expect(clean('Não divulgável')).toBeNull();
    expect(clean('NÃO DIVULGÁVEL')).toBeNull();
    expect(partiesOf('13-PT/65-PC do B/43-PV')).toBe('PT / PC do B / PV');
  });
});
