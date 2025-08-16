import React, { useState } from 'react';
import { useI18n } from '../../../i18n/hooks';
import { DesktopSettings } from './components/DesktopSettings';
import { LanguageSettings } from './components/LanguageSettings';
import { DateTimeSettings } from './components/DateTimeSettings';
import './SettingsApp.css';

interface Tab {
  id: string;
  label: string;
  icon: string;
  component: React.ComponentType;
}

/**
 * SettingsApp component provides a comprehensive settings interface
 * with tabbed navigation for desktop, language, and date/time configuration
 */
export const SettingsApp: React.FC = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('desktop');

  const tabs: Tab[] = [
    {
      id: 'desktop',
      label: t('desktop.title'),
      icon: '🖥️',
      component: DesktopSettings,
    },
    {
      id: 'language',
      label: t('language.title'),
      icon: '🌐',
      component: LanguageSettings,
    },
    {
      id: 'datetime',
      label: t('datetime.title'),
      icon: '🕒',
      component: DateTimeSettings,
    },
  ];

  const ActiveTabComponent = tabs.find((tab) => tab.id === activeTab)?.component || DesktopSettings;

  return (
    <div className="settings-app">
      <div className="settings-app__header">
        <h1 className="settings-app__title">⚙️ {t('common.settings')}</h1>
      </div>

      <div className="settings-app__content">
        <nav className="settings-app__nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`settings-app__tab ${activeTab === tab.id ? 'settings-app__tab--active' : ''}`}
            >
              <span className="settings-app__tab-icon">{tab.icon}</span>
              <span className="settings-app__tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="settings-app__main">
          <ActiveTabComponent />
        </main>
      </div>
    </div>
  );
};
