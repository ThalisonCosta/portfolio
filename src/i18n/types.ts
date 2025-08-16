export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface DateTimeFormat {
  locale: string;
  dateStyle?: 'short' | 'medium' | 'long' | 'full';
  timeStyle?: 'short' | 'medium' | 'long' | 'full';
  hour12?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
];

export const TIME_ZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'America/Sao_Paulo', label: 'São Paulo, Brazil' },
  { value: 'Europe/London', label: 'London, Dublin' },
  { value: 'Europe/Paris', label: 'Paris, Madrid, Berlin' },
  { value: 'Europe/Moscow', label: 'Moscow, St. Petersburg' },
  { value: 'Asia/Tokyo', label: 'Tokyo, Osaka' },
  { value: 'Asia/Shanghai', label: 'Beijing, Shanghai' },
  { value: 'Asia/Kolkata', label: 'Mumbai, Delhi, Kolkata' },
  { value: 'Australia/Sydney', label: 'Sydney, Melbourne' },
];
