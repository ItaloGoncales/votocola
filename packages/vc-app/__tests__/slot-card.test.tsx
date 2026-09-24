import { render, screen } from '@testing-library/react-native';
import { SlotCard } from '@/ui';

const slot = { key: 'GOVERNOR', office: 'GOVERNOR' as const, label: 'Governador(a)', digits: 2 };

describe('SlotCard', () => {
  it('invites to choose when empty', async () => {
    await render(<SlotCard index={4} slot={slot} />);
    expect(screen.getByText('Escolher →')).toBeTruthy();
  });

  it('shows the chosen number and name', async () => {
    await render(
      <SlotCard
        index={4}
        slot={slot}
        pick={{
          id: '1',
          number: '22',
          ballotName: 'Beltrana',
          partyAcronym: 'PL',
          photoUrl: null,
          state: 'SP',
          office: 'GOVERNOR',
        }}
      />,
    );
    expect(screen.getByText(/Beltrana/)).toBeTruthy();
    expect(screen.getByLabelText('Número 22')).toBeTruthy();
    // Sem foto cadastrada, o avatar mostra as iniciais.
    expect(screen.getByText('B')).toBeTruthy();
  });
});
