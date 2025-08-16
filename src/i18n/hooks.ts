import { useTranslation } from 'react-i18next';
import { useDesktopStore } from '../stores/useDesktopStore';
import type { DateTimeFormat } from './types';

export const useI18n = () => {
  const { t, i18n } = useTranslation();
  const store = useDesktopStore();
  const settings = store.settings || {
    language: { language: 'en', region: 'US', currency: 'USD' },
    datetime: {
      timezone: 'UTC',
      dateFormat: 'short' as const,
      timeFormat: 'short' as const,
      hour12Format: true,
    },
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  const formatDateTime = (date: Date, format?: DateTimeFormat) => {
    const locale = format?.locale || settings.language.language;
    const options: Intl.DateTimeFormatOptions = {
      dateStyle: format?.dateStyle || settings.datetime.dateFormat,
      timeStyle: format?.timeStyle || settings.datetime.timeFormat,
      hour12: format?.hour12 ?? settings.datetime.hour12Format,
      timeZone: settings.datetime.timezone,
    };

    return new Intl.DateTimeFormat(locale, options).format(date);
  };

  return {
    t,
    changeLanguage,
    formatDateTime,
    currentLanguage: i18n.language,
  };
};
