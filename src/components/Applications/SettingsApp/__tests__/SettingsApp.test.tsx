import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SettingsApp } from '../SettingsApp';

// Mock the i18n hook
jest.mock('../../../../i18n/hooks', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.settings': 'Settings',
        'desktop.title': 'Desktop',
        'language.title': 'Language & Region',
        'datetime.title': 'Date & Time',
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the desktop store
jest.mock('../../../../stores/useDesktopStore', () => ({
  useDesktopStore: () => ({
    settings: {
      desktop: {
        backgroundColor: '#0078d4',
        gradient: { enabled: false, type: 'linear', angle: 45, colors: [] },
        rgbTimer: { enabled: false, interval: 5000, speed: 1, colors: [] },
        presets: [],
      },
      language: { language: 'en', region: 'US', currency: 'USD' },
      datetime: {
        timezone: 'UTC',
        dateFormat: 'short',
        timeFormat: 'short',
        hour12Format: true,
        showSeconds: false,
        autoUpdate: true,
      },
    },
    updateSettings: jest.fn(),
    getBackgroundStyle: jest.fn(() => '#0078d4'),
    startRGBTimer: jest.fn(),
    stopRGBTimer: jest.fn(),
  }),
}));

describe('SettingsApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<SettingsApp />);
    expect(screen.getByText('⚙️ Settings')).toBeInTheDocument();
  });

  it('displays all navigation tabs', () => {
    render(<SettingsApp />);

    expect(screen.getByText('Desktop')).toBeInTheDocument();
    expect(screen.getByText('Language & Region')).toBeInTheDocument();
    expect(screen.getByText('Date & Time')).toBeInTheDocument();
  });

  it('switches between tabs when clicked', () => {
    render(<SettingsApp />);

    const languageTab = screen.getByText('Language & Region');
    fireEvent.click(languageTab);

    // Should switch to language tab (this would be tested more thoroughly with actual tab content)
    expect(languageTab.closest('button')).toHaveClass('settings-app__tab--active');
  });

  it('has desktop tab active by default', () => {
    render(<SettingsApp />);

    const desktopTab = screen.getByText('Desktop');
    expect(desktopTab.closest('button')).toHaveClass('settings-app__tab--active');
  });

  it('shows correct icons for each tab', () => {
    render(<SettingsApp />);

    expect(screen.getByText('🖥️')).toBeInTheDocument(); // Desktop icon
    expect(screen.getByText('🌐')).toBeInTheDocument(); // Language icon
    expect(screen.getByText('🕒')).toBeInTheDocument(); // DateTime icon
  });
});
