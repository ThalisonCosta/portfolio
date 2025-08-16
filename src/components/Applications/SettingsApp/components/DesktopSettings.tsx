import React, { useCallback, useState } from 'react';
import { useDesktopStore } from '../../../../stores/useDesktopStore';
import { useI18n } from '../../../../i18n/hooks';
import { ColorPicker, GradientEditor } from './ColorPicker';
import type { ColorPreset, RGBTimerSettings, GradientSettings, ColorStop } from '../../../../types/settings.types';
import './DesktopSettings.css';

/**
 * DesktopSettings component for customizing desktop background,
 * gradients, RGB timer, and color presets
 */
export const DesktopSettings: React.FC = () => {
  const { t } = useI18n();
  const { settings, updateSettings, getBackgroundStyle, startRGBTimer, stopRGBTimer } = useDesktopStore();
  const [presetName, setPresetName] = useState('');
  const [showPresetDialog, setShowPresetDialog] = useState(false);

  const handleBackgroundColorChange = useCallback(
    (color: string) => {
      updateSettings({
        desktop: {
          ...settings.desktop,
          backgroundColor: color,
        },
      });
    },
    [settings.desktop, updateSettings]
  );

  const handleGradientChange = useCallback(
    (gradient: GradientSettings) => {
      updateSettings({
        desktop: {
          ...settings.desktop,
          gradient,
        },
      });
    },
    [settings.desktop, updateSettings]
  );

  const handleRGBTimerChange = useCallback(
    (rgbTimer: Partial<RGBTimerSettings>) => {
      const newRGBTimer = { ...settings.desktop.rgbTimer, ...rgbTimer };
      updateSettings({
        desktop: {
          ...settings.desktop,
          rgbTimer: newRGBTimer,
        },
      });

      // Start or stop timer based on enabled state
      if (newRGBTimer.enabled && rgbTimer.enabled !== false) {
        startRGBTimer();
      } else if (rgbTimer.enabled === false) {
        stopRGBTimer();
      }
    },
    [settings.desktop, updateSettings, startRGBTimer, stopRGBTimer]
  );

  const handleTimerColorChange = useCallback(
    (index: number, color: string) => {
      const newColors = [...settings.desktop.rgbTimer.colors];
      newColors[index] = color;
      handleRGBTimerChange({ colors: newColors });
    },
    [settings.desktop.rgbTimer.colors, handleRGBTimerChange]
  );

  const addTimerColor = useCallback(() => {
    const newColors = [...settings.desktop.rgbTimer.colors, '#ffffff'];
    handleRGBTimerChange({ colors: newColors });
  }, [settings.desktop.rgbTimer.colors, handleRGBTimerChange]);

  const removeTimerColor = useCallback(
    (index: number) => {
      if (settings.desktop.rgbTimer.colors.length <= 2) return;
      const newColors = settings.desktop.rgbTimer.colors.filter((_, i) => i !== index);
      handleRGBTimerChange({ colors: newColors });
    },
    [settings.desktop.rgbTimer.colors, handleRGBTimerChange]
  );

  const savePreset = useCallback(() => {
    if (!presetName.trim()) return;

    const newPreset: ColorPreset = {
      id: `preset-${Date.now()}`,
      name: presetName,
      type: settings.desktop.gradient.enabled ? 'gradient' : 'solid',
      value: settings.desktop.gradient.enabled ? settings.desktop.gradient : settings.desktop.backgroundColor,
    };

    updateSettings({
      desktop: {
        ...settings.desktop,
        presets: [...settings.desktop.presets, newPreset],
      },
    });

    setPresetName('');
    setShowPresetDialog(false);
  }, [presetName, settings.desktop, updateSettings]);

  const loadPreset = useCallback(
    (preset: ColorPreset) => {
      if (preset.type === 'solid') {
        updateSettings({
          desktop: {
            ...settings.desktop,
            backgroundColor: preset.value as string,
            gradient: { ...settings.desktop.gradient, enabled: false },
          },
        });
      } else {
        updateSettings({
          desktop: {
            ...settings.desktop,
            gradient: preset.value as GradientSettings,
          },
        });
      }
    },
    [settings.desktop, updateSettings]
  );

  const deletePreset = useCallback(
    (presetId: string) => {
      updateSettings({
        desktop: {
          ...settings.desktop,
          presets: settings.desktop.presets.filter((p) => p.id !== presetId),
        },
      });
    },
    [settings.desktop, updateSettings]
  );

  return (
    <div className="desktop-settings">
      <h2 className="desktop-settings__title">{t('desktop.title')}</h2>

      <div className="desktop-settings__section">
        <h3>{t('desktop.background')}</h3>

        <div className="desktop-settings__preview">
          <div className="desktop-settings__preview-swatch" style={{ background: getBackgroundStyle() }} />
          <span className="desktop-settings__preview-text">{t('common.preview')}</span>
        </div>

        <div className="desktop-settings__controls">
          <ColorPicker
            color={settings.desktop.backgroundColor}
            onChange={handleBackgroundColorChange}
            label={t('desktop.backgroundColor')}
          />

          <GradientEditor gradient={settings.desktop.gradient} onChange={handleGradientChange} />
        </div>
      </div>

      <div className="desktop-settings__section">
        <h3>{t('desktop.rgbTimer')}</h3>

        <div className="desktop-settings__rgb-controls">
          <label className="desktop-settings__checkbox">
            <input
              type="checkbox"
              checked={settings.desktop.rgbTimer.enabled}
              onChange={(e) => handleRGBTimerChange({ enabled: e.target.checked })}
            />
            {t('desktop.enableTimer')}
          </label>

          {settings.desktop.rgbTimer.enabled && (
            <>
              <div className="desktop-settings__timer-interval">
                <label>
                  {t('desktop.timerInterval')}: {settings.desktop.rgbTimer.interval / 1000}s
                </label>
                <input
                  type="range"
                  min="1000"
                  max="10000"
                  step="500"
                  value={settings.desktop.rgbTimer.interval}
                  onChange={(e) => handleRGBTimerChange({ interval: parseInt(e.target.value, 10) })}
                />
              </div>

              <div className="desktop-settings__timer-colors">
                <h4>Timer Colors</h4>
                {settings.desktop.rgbTimer.colors.map((color, index) => (
                  <div key={index} className="desktop-settings__timer-color">
                    <ColorPicker
                      color={color}
                      onChange={(newColor) => handleTimerColorChange(index, newColor)}
                      showAdvanced={false}
                    />
                    {settings.desktop.rgbTimer.colors.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeTimerColor(index)}
                        className="desktop-settings__remove-color-btn"
                      >
                        ❌
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addTimerColor} className="desktop-settings__add-color-btn">
                  + Add Color
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="desktop-settings__section">
        <h3>{t('desktop.colorPresets')}</h3>

        <div className="desktop-settings__presets">
          <button type="button" onClick={() => setShowPresetDialog(true)} className="desktop-settings__save-preset-btn">
            💾 {t('desktop.savePreset')}
          </button>

          {showPresetDialog && (
            <div className="desktop-settings__preset-dialog">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder={t('desktop.presetName')}
                className="desktop-settings__preset-input"
              />
              <div className="desktop-settings__preset-buttons">
                <button onClick={savePreset} className="desktop-settings__preset-save">
                  {t('common.save')}
                </button>
                <button
                  onClick={() => {
                    setShowPresetDialog(false);
                    setPresetName('');
                  }}
                  className="desktop-settings__preset-cancel"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          <div className="desktop-settings__preset-list">
            {settings.desktop.presets.map((preset) => (
              <div key={preset.id} className="desktop-settings__preset-item">
                <div
                  className="desktop-settings__preset-swatch"
                  style={{
                    background:
                      preset.type === 'solid'
                        ? (preset.value as string)
                        : (() => {
                            const g = preset.value as GradientSettings;
                            const colorStops =
                              g.colors?.map((stop: ColorStop) => `${stop.color} ${stop.position}%`).join(', ') || '';
                            return g.type === 'linear'
                              ? `linear-gradient(${g.angle}deg, ${colorStops})`
                              : `radial-gradient(circle, ${colorStops})`;
                          })(),
                  }}
                />
                <span className="desktop-settings__preset-name">{preset.name}</span>
                <div className="desktop-settings__preset-actions">
                  <button onClick={() => loadPreset(preset)} className="desktop-settings__preset-load">
                    Load
                  </button>
                  <button onClick={() => deletePreset(preset.id)} className="desktop-settings__preset-delete">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
