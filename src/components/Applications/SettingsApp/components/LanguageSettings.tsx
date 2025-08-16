import React, { useCallback } from 'react';
import { useDesktopStore } from '../../../../stores/useDesktopStore';
import { useI18n } from '../../../../i18n/hooks';
import { SUPPORTED_LANGUAGES } from '../../../../i18n/types';
import './LanguageSettings.css';

/**
 * LanguageSettings component for configuring display language,
 * region, currency, and localization preferences
 */
export const LanguageSettings: React.FC = () => {
  const { t, changeLanguage, currentLanguage } = useI18n();
  const { settings, updateSettings } = useDesktopStore();

  const handleLanguageChange = useCallback(
    (language: string) => {
      changeLanguage(language);
      updateSettings({
        language: {
          ...settings.language,
          language,
        },
      });
    },
    [settings.language, updateSettings, changeLanguage]
  );

  return (
    <div className="language-settings">
      <h2 className="language-settings__title">{t('language.title')}</h2>

      <div className="language-settings__section">
        <h3>{t('language.language')}</h3>
        <p className="language-settings__description">{t('language.description')}</p>

        <div className="language-settings__language-grid">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`language-settings__language-option ${
                currentLanguage === lang.code ? 'language-settings__language-option--active' : ''
              }`}
            >
              <div className="language-settings__language-info">
                <span className="language-settings__language-name">{lang.nativeName}</span>
                <span className="language-settings__language-english">{lang.name}</span>
              </div>
              {currentLanguage === lang.code && <span className="language-settings__language-check">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
