export interface ColorStop {
  color: string;
  position: number;
}

export interface GradientSettings {
  enabled: boolean;
  type: 'linear' | 'radial';
  angle: number;
  colors: ColorStop[];
}

export interface RGBTimerSettings {
  enabled: boolean;
  interval: number;
  speed: number;
  colors: string[];
}

export interface ColorPreset {
  id: string;
  name: string;
  type: 'solid' | 'gradient';
  value: string | GradientSettings;
}

export interface DesktopSettings {
  backgroundColor: string;
  gradient: GradientSettings;
  rgbTimer: RGBTimerSettings;
  presets: ColorPreset[];
}

export interface LanguageSettings {
  language: string;
  region: string;
  currency: string;
}

export interface DateTimeSettings {
  timezone: string;
  dateFormat: 'short' | 'medium' | 'long' | 'full';
  timeFormat: 'short' | 'medium' | 'long' | 'full';
  hour12Format: boolean;
  showSeconds: boolean;
  autoUpdate: boolean;
}

export interface SystemSettings {
  desktop: DesktopSettings;
  language: LanguageSettings;
  datetime: DateTimeSettings;
}

export const DEFAULT_SETTINGS: SystemSettings = {
  desktop: {
    backgroundColor: '#0078d4',
    gradient: {
      enabled: false,
      type: 'linear',
      angle: 45,
      colors: [
        { color: '#0078d4', position: 0 },
        { color: '#106ebe', position: 100 },
      ],
    },
    rgbTimer: {
      enabled: false,
      interval: 5000,
      speed: 1,
      colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
    },
    presets: [
      {
        id: 'default-blue',
        name: 'Windows Blue',
        type: 'solid',
        value: '#0078d4',
      },
      {
        id: 'default-gradient',
        name: 'Default Gradient',
        type: 'gradient',
        value: {
          enabled: true,
          type: 'linear',
          angle: 45,
          colors: [
            { color: '#0078d4', position: 0 },
            { color: '#106ebe', position: 100 },
          ],
        },
      },
    ],
  },
  language: {
    language: 'en',
    region: 'US',
    currency: 'USD',
  },
  datetime: {
    timezone: 'UTC',
    dateFormat: 'short',
    timeFormat: 'short',
    hour12Format: true,
    showSeconds: false,
    autoUpdate: true,
  },
};
