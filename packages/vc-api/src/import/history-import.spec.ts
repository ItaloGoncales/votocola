import { resultLabel } from './history-import.js';

describe('resultLabel', () => {
  it('simplifies TSE results', () => {
    expect(resultLabel('Eleito por QP')).toEqual({ result: 'Eleito(a)', elected: true });
    expect(resultLabel('Eleito por média')).toEqual({ result: 'Eleito(a)', elected: true });
    expect(resultLabel('Não eleito')).toEqual({ result: 'Não eleito(a)', elected: false });
    expect(resultLabel('Suplente')).toEqual({ result: 'Suplente', elected: false });
    expect(resultLabel('Registro negado antes da eleição')).toEqual({
      result: 'Registro negado antes da eleição',
      elected: false,
    });
    expect(resultLabel(null)).toEqual({ result: null, elected: false });
  });
});
