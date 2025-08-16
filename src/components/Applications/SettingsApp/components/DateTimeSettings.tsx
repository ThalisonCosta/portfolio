import React, { useCallback, useState, useEffect } from 'react';
import { useDesktopStore } from '../../../../stores/useDesktopStore';
import { useI18n } from '../../../../i18n/hooks';
import { TIME_ZONES } from '../../../../i18n/types';
import './DateTimeSettings.css';

/**
 * DateTimeSettings component for configuring timezone, date/time formats,
 * and display preferences
 */
export const DateTimeSettings: React.FC = () => {
  const { t, formatDateTime } = useI18n();
  const { settings, updateSettings } = useDesktopStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second for live preview
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleTimezoneChange = useCallback(
    (timezone: string) => {
      updateSettings({
        datetime: {
          ...settings.datetime,
          timezone,
        },
      });
    },
    [settings.datetime, updateSettings]
  );

  const handleDateFormatChange = useCallback(
    (dateFormat: 'short' | 'medium' | 'long' | 'full') => {
      updateSettings({
        datetime: {
          ...settings.datetime,
          dateFormat,
        },
      });
    },
    [settings.datetime, updateSettings]
  );

  const handleTimeFormatChange = useCallback(
    (timeFormat: 'short' | 'medium' | 'long' | 'full') => {
      updateSettings({
        datetime: {
          ...settings.datetime,
          timeFormat,
        },
      });
    },
    [settings.datetime, updateSettings]
  );

  const handleHour12FormatChange = useCallback(
    (hour12Format: boolean) => {
      updateSettings({
        datetime: {
          ...settings.datetime,
          hour12Format,
        },
      });
    },
    [settings.datetime, updateSettings]
  );

  const handleShowSecondsChange = useCallback(
    (showSeconds: boolean) => {
      updateSettings({
        datetime: {
          ...settings.datetime,
          showSeconds,
        },
      });
    },
    [settings.datetime, updateSettings]
  );

  const handleAutoUpdateChange = useCallback(
    (autoUpdate: boolean) => {
      updateSettings({
        datetime: {
          ...settings.datetime,
          autoUpdate,
        },
      });
    },
    [settings.datetime, updateSettings]
  );

  const getPreviewDateTime = (
    dateStyle?: 'short' | 'medium' | 'long' | 'full',
    timeStyle?: 'short' | 'medium' | 'long' | 'full',
    hour12?: boolean
  ) => {
    try {
      return new Intl.DateTimeFormat(settings.language.language, {
        dateStyle: dateStyle || settings.datetime.dateFormat,
        timeStyle: timeStyle || settings.datetime.timeFormat,
        hour12: hour12 ?? settings.datetime.hour12Format,
        timeZone: settings.datetime.timezone,
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleString();
    }
  };

  const dateFormatOptions = [
    { value: 'short', label: 'Short', example: getPreviewDateTime('short', undefined) },
    { value: 'medium', label: 'Medium', example: getPreviewDateTime('medium', undefined) },
    { value: 'long', label: 'Long', example: getPreviewDateTime('long', undefined) },
    { value: 'full', label: 'Full', example: getPreviewDateTime('full', undefined) },
  ];

  const timeFormatOptions = [
    { value: 'short', label: 'Short', example: getPreviewDateTime(undefined, 'short') },
    { value: 'medium', label: 'Medium', example: getPreviewDateTime(undefined, 'medium') },
    { value: 'long', label: 'Long', example: getPreviewDateTime(undefined, 'long') },
    { value: 'full', label: 'Full', example: getPreviewDateTime(undefined, 'full') },
  ];

  return (
    <div className="datetime-settings">
      <h2 className="datetime-settings__title">{t('datetime.title')}</h2>

      <div className="datetime-settings__section">
        <h3>{t('datetime.currentDateTime')}</h3>
        <div className="datetime-settings__current-time">
          <div className="datetime-settings__time-display">{formatDateTime(currentTime)}</div>
          <div className="datetime-settings__timezone-info">
            {t('datetime.timezone')}: {settings.datetime.timezone}
          </div>
        </div>
      </div>

      <div className="datetime-settings__section">
        <h3>{t('datetime.timezone')}</h3>
        <p className="datetime-settings__description">{t('datetime.description')}</p>

        <select
          value={settings.datetime.timezone}
          onChange={(e) => handleTimezoneChange(e.target.value)}
          className="datetime-settings__select"
        >
          {TIME_ZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div className="datetime-settings__section">
        <h3>{t('datetime.dateFormat')}</h3>
        <p className="datetime-settings__description">{t('datetime.dateFormatDescription')}</p>

        <div className="datetime-settings__format-options">
          {dateFormatOptions.map((option) => (
            <label
              key={option.value}
              className={`datetime-settings__format-option ${
                settings.datetime.dateFormat === option.value ? 'datetime-settings__format-option--active' : ''
              }`}
            >
              <input
                type="radio"
                name="dateFormat"
                value={option.value}
                checked={settings.datetime.dateFormat === option.value}
                onChange={(e) => handleDateFormatChange(e.target.value as 'short' | 'medium' | 'long' | 'full')}
              />
              <div className="datetime-settings__format-info">
                <span className="datetime-settings__format-label">{option.label}</span>
                <span className="datetime-settings__format-example">{option.example}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="datetime-settings__section">
        <h3>{t('datetime.timeFormat')}</h3>
        <p className="datetime-settings__description">{t('datetime.timeFormatDescription')}</p>

        <div className="datetime-settings__format-options">
          {timeFormatOptions.map((option) => (
            <label
              key={option.value}
              className={`datetime-settings__format-option ${
                settings.datetime.timeFormat === option.value ? 'datetime-settings__format-option--active' : ''
              }`}
            >
              <input
                type="radio"
                name="timeFormat"
                value={option.value}
                checked={settings.datetime.timeFormat === option.value}
                onChange={(e) => handleTimeFormatChange(e.target.value as 'short' | 'medium' | 'long' | 'full')}
              />
              <div className="datetime-settings__format-info">
                <span className="datetime-settings__format-label">{option.label}</span>
                <span className="datetime-settings__format-example">{option.example}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="datetime-settings__section">
        <h3>{t('datetime.timeDisplayOptions')}</h3>

        <div className="datetime-settings__options">
          <label className="datetime-settings__checkbox">
            <input
              type="radio"
              name="hourFormat"
              checked={!settings.datetime.hour12Format}
              onChange={() => handleHour12FormatChange(false)}
            />
            <div className="datetime-settings__option-info">
              <span className="datetime-settings__option-label">{t('datetime.hour24')}</span>
              <span className="datetime-settings__option-example">{getPreviewDateTime(undefined, 'short', false)}</span>
            </div>
          </label>

          <label className="datetime-settings__checkbox">
            <input
              type="radio"
              name="hourFormat"
              checked={settings.datetime.hour12Format}
              onChange={() => handleHour12FormatChange(true)}
            />
            <div className="datetime-settings__option-info">
              <span className="datetime-settings__option-label">{t('datetime.hour12')}</span>
              <span className="datetime-settings__option-example">{getPreviewDateTime(undefined, 'short', true)}</span>
            </div>
          </label>

          <label className="datetime-settings__checkbox">
            <input
              type="checkbox"
              checked={settings.datetime.showSeconds}
              onChange={(e) => handleShowSecondsChange(e.target.checked)}
            />
            <div className="datetime-settings__option-info">
              <span className="datetime-settings__option-label">{t('datetime.showSeconds')}</span>
              <span className="datetime-settings__option-example">{t('datetime.includeSeconds')}</span>
            </div>
          </label>

          <label className="datetime-settings__checkbox">
            <input
              type="checkbox"
              checked={settings.datetime.autoUpdate}
              onChange={(e) => handleAutoUpdateChange(e.target.checked)}
            />
            <div className="datetime-settings__option-info">
              <span className="datetime-settings__option-label">{t('datetime.autoUpdate')}</span>
              <span className="datetime-settings__option-example">{t('datetime.autoSync')}</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
