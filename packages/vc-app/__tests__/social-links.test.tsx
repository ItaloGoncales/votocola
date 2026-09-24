import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { SocialLinks } from '@/ui';

describe('SocialLinks', () => {
  it('renders one button per network and opens the link', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await render(
      <SocialLinks
        links={[
          { network: 'instagram', url: 'https://instagram.com/fulano' },
          { network: 'site', url: 'https://fulano.com.br' },
        ]}
      />,
    );
    expect(screen.getByText('Instagram')).toBeTruthy();
    await fireEvent.press(screen.getByLabelText('Abrir Site'));
    expect(open).toHaveBeenCalledWith('https://fulano.com.br');
  });

  it('renders nothing without links', async () => {
    await render(<SocialLinks links={[]} />);
    expect(screen.toJSON()).toBeNull();
  });
});
