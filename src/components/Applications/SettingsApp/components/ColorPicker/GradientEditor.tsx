import React, { useCallback } from 'react';
import { ColorPicker } from './ColorPicker';
import { useI18n } from '../../../../../i18n/hooks';
import type { GradientSettings, ColorStop } from '../../../../../types/settings.types';
import './GradientEditor.css';

interface GradientEditorProps {
  /** Current gradient settings */
  gradient: GradientSettings;
  /** Callback when gradient changes */
  onChange: (gradient: GradientSettings) => void;
}

/**
 * GradientEditor component for creating and editing gradients
 */
export const GradientEditor: React.FC<GradientEditorProps> = ({ gradient, onChange }) => {
  const { t } = useI18n();

  const handleGradientChange = useCallback(
    (updates: Partial<GradientSettings>) => {
      onChange({ ...gradient, ...updates });
    },
    [gradient, onChange]
  );

  const handleColorStopChange = useCallback(
    (index: number, updates: Partial<ColorStop>) => {
      const newColors = [...gradient.colors];
      newColors[index] = { ...newColors[index], ...updates };
      handleGradientChange({ colors: newColors });
    },
    [gradient.colors, handleGradientChange]
  );

  const addColorStop = useCallback(() => {
    const newPosition =
      gradient.colors.length > 0 ? Math.min(100, gradient.colors[gradient.colors.length - 1].position + 20) : 50;

    const newColors = [...gradient.colors, { color: '#ffffff', position: newPosition }];

    handleGradientChange({ colors: newColors });
  }, [gradient.colors, handleGradientChange]);

  const removeColorStop = useCallback(
    (index: number) => {
      if (gradient.colors.length <= 2) return; // Minimum 2 colors required

      const newColors = gradient.colors.filter((_, i) => i !== index);
      handleGradientChange({ colors: newColors });
    },
    [gradient.colors, handleGradientChange]
  );

  const generatePreview = useCallback(() => {
    const colorStops = gradient.colors
      .sort((a, b) => a.position - b.position)
      .map((stop) => `${stop.color} ${stop.position}%`)
      .join(', ');

    if (gradient.type === 'linear') {
      return `linear-gradient(${gradient.angle}deg, ${colorStops})`;
    }
    return `radial-gradient(circle, ${colorStops})`;
  }, [gradient]);

  return (
    <div className="gradient-editor">
      <div className="gradient-editor__controls">
        <div className="gradient-editor__toggle">
          <label>
            <input
              type="checkbox"
              checked={gradient.enabled}
              onChange={(e) => handleGradientChange({ enabled: e.target.checked })}
            />
            {t('desktop.gradientMode')}
          </label>
        </div>

        {gradient.enabled && (
          <>
            <div className="gradient-editor__type">
              <label>{t('desktop.gradientMode')}</label>
              <select
                value={gradient.type}
                onChange={(e) => handleGradientChange({ type: e.target.value as 'linear' | 'radial' })}
              >
                <option value="linear">{t('desktop.gradientLinear')}</option>
                <option value="radial">{t('desktop.gradientRadial')}</option>
              </select>
            </div>

            {gradient.type === 'linear' && (
              <div className="gradient-editor__angle">
                <label>Angle: {gradient.angle}°</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradient.angle}
                  onChange={(e) => handleGradientChange({ angle: parseInt(e.target.value, 10) })}
                />
              </div>
            )}

            <div className="gradient-editor__preview">
              <div className="gradient-editor__preview-swatch" style={{ background: generatePreview() }} />
              <span className="gradient-editor__preview-text">Preview</span>
            </div>

            <div className="gradient-editor__colors">
              <h4>{t('desktop.gradientColors')}</h4>

              {gradient.colors.map((colorStop, index) => (
                <div key={index} className="gradient-editor__color-stop">
                  <ColorPicker
                    color={colorStop.color}
                    onChange={(color) => handleColorStopChange(index, { color })}
                    showAdvanced={false}
                  />

                  <div className="gradient-editor__position">
                    <label>Position: {colorStop.position}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={colorStop.position}
                      onChange={(e) => handleColorStopChange(index, { position: parseInt(e.target.value, 10) })}
                    />
                  </div>

                  {gradient.colors.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeColorStop(index)}
                      className="gradient-editor__remove-btn"
                      title={t('desktop.removeGradientColor')}
                    >
                      ❌
                    </button>
                  )}
                </div>
              ))}

              <button type="button" onClick={addColorStop} className="gradient-editor__add-btn">
                + {t('desktop.addGradientColor')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
