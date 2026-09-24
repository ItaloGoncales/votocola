import { render, screen } from '@testing-library/react-native';
import { ElectionHistory } from '@/ui';

describe('ElectionHistory', () => {
  it('summarizes and marks elected results with text, not only color', async () => {
    await render(
      <ElectionHistory
        items={[
          {
            year: 2022,
            office: 'Presidente',
            place: 'Brasil',
            party: 'MDB',
            result: 'Não eleito(a)',
            elected: false,
          },
          {
            year: 2014,
            office: 'Senador',
            place: 'MS',
            party: 'PMDB',
            result: 'Eleito(a)',
            elected: true,
          },
        ]}
      />,
    );
    expect(screen.getByText(/2 candidaturas anteriores · eleito\(a\) 1 vez/)).toBeTruthy();
    expect(screen.getByText('✓ Eleito(a)')).toBeTruthy();
    expect(screen.getByText('MS · PMDB')).toBeTruthy();
  });

  it('renders nothing for a first run', async () => {
    await render(<ElectionHistory items={[]} />);
    expect(screen.toJSON()).toBeNull();
  });
});
