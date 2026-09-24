import { render, screen } from '@testing-library/react-native';
import { ViewCount } from '@/ui';

describe('ViewCount', () => {
  it('shows the compact label with an accessible description', async () => {
    await render(<ViewCount count={1250} label="1,3 mil" />);
    expect(screen.getByText('1,3 mil')).toBeTruthy();
    expect(screen.getByLabelText('1,3 mil visualizações')).toBeTruthy();
  });

  it('hides when there are no views or the API turned it off', async () => {
    await render(<ViewCount count={0} label="0" />);
    expect(screen.queryByText('0')).toBeNull();
    await render(<ViewCount count={null} label={null} />);
    expect(screen.toJSON()).toBeNull();
  });
});
