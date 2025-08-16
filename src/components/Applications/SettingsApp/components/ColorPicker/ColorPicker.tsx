import React, { useState, useCallback } from 'react';
import './ColorPicker.css';

interface ColorPickerProps {
  /** Current color value */
  color: string;
  /** Callback when color changes */
  onChange: (color: string) => void;
  /** Whether to show advanced controls */
  showAdvanced?: boolean;
  /** Label for the color picker */
  label?: string;
}

interface HSLColor {
  h: number;
  s: number;
  l: number;
}

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * ColorPicker component with HTML5 color input and advanced RGB/HSL controls
 */
export const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, showAdvanced = true, label }) => {
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const hexToRgb = useCallback((hex: string): RGBColor => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }, []);

  const rgbToHex = useCallback(
    (r: number, g: number, b: number): string =>
      `#${[r, g, b]
        .map((x) => {
          const hex = Math.round(x).toString(16);
          return hex.length === 1 ? `0${hex}` : hex;
        })
        .join('')}`,
    []
  );

  const rgbToHsl = useCallback((r: number, g: number, b: number): HSLColor => {
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;

    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case rNorm:
          h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
          break;
        case gNorm:
          h = (bNorm - rNorm) / d + 2;
          break;
        case bNorm:
          h = (rNorm - gNorm) / d + 4;
          break;
        default:
          break;
      }
      h /= 6;
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  }, []);

  const hslToRgb = useCallback((h: number, s: number, l: number): RGBColor => {
    const hNorm = h / 360;
    const sNorm = s / 100;
    const lNorm = l / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      let tNorm = t;
      if (tNorm < 0) tNorm += 1;
      if (tNorm > 1) tNorm -= 1;
      if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
      if (tNorm < 1 / 2) return q;
      if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
      return p;
    };

    let r, g, b;

    if (sNorm === 0) {
      r = g = b = lNorm; // achromatic
    } else {
      const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
      const p = 2 * lNorm - q;
      r = hue2rgb(p, q, hNorm + 1 / 3);
      g = hue2rgb(p, q, hNorm);
      b = hue2rgb(p, q, hNorm - 1 / 3);
    }

    return { r: r * 255, g: g * 255, b: b * 255 };
  }, []);

  const currentRgb = hexToRgb(color);
  const currentHsl = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b);

  const handleColorChange = useCallback(
    (newColor: string) => {
      onChange(newColor);
    },
    [onChange]
  );

  const handleRgbChange = useCallback(
    (component: 'r' | 'g' | 'b', value: number) => {
      const newRgb = { ...currentRgb, [component]: Math.max(0, Math.min(255, value)) };
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      handleColorChange(newHex);
    },
    [currentRgb, rgbToHex, handleColorChange]
  );

  const handleHslChange = useCallback(
    (component: 'h' | 's' | 'l', value: number) => {
      const newHsl = { ...currentHsl };

      if (component === 'h') {
        newHsl.h = Math.max(0, Math.min(360, value));
      } else {
        newHsl[component] = Math.max(0, Math.min(100, value));
      }

      const newRgb = hslToRgb(newHsl.h, newHsl.s, newHsl.l);
      const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
      handleColorChange(newHex);
    },
    [currentHsl, hslToRgb, rgbToHex, handleColorChange]
  );

  return (
    <div className="color-picker">
      {label && <label className="color-picker__label">{label}</label>}

      <div className="color-picker__main">
        <input
          type="color"
          value={color}
          onChange={(e) => handleColorChange(e.target.value)}
          className="color-picker__input"
        />

        <div className="color-picker__preview" style={{ backgroundColor: color }}>
          <span className="color-picker__hex">{color.toUpperCase()}</span>
        </div>

        {showAdvanced && (
          <button type="button" onClick={() => setIsAdvancedMode(!isAdvancedMode)} className="color-picker__toggle">
            {isAdvancedMode ? '🔽' : '▶️'} Advanced
          </button>
        )}
      </div>

      {showAdvanced && isAdvancedMode && (
        <div className="color-picker__advanced">
          <div className="color-picker__section">
            <h4>RGB</h4>
            <div className="color-picker__controls">
              <div className="color-picker__control">
                <label>R</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={currentRgb.r}
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value, 10))}
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={Math.round(currentRgb.r)}
                  onChange={(e) => handleRgbChange('r', parseInt(e.target.value, 10) || 0)}
                  className="color-picker__number"
                />
              </div>

              <div className="color-picker__control">
                <label>G</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={currentRgb.g}
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value, 10))}
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={Math.round(currentRgb.g)}
                  onChange={(e) => handleRgbChange('g', parseInt(e.target.value, 10) || 0)}
                  className="color-picker__number"
                />
              </div>

              <div className="color-picker__control">
                <label>B</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={currentRgb.b}
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value, 10))}
                />
                <input
                  type="number"
                  min="0"
                  max="255"
                  value={Math.round(currentRgb.b)}
                  onChange={(e) => handleRgbChange('b', parseInt(e.target.value, 10) || 0)}
                  className="color-picker__number"
                />
              </div>
            </div>
          </div>

          <div className="color-picker__section">
            <h4>HSL</h4>
            <div className="color-picker__controls">
              <div className="color-picker__control">
                <label>H</label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={currentHsl.h}
                  onChange={(e) => handleHslChange('h', parseInt(e.target.value, 10))}
                />
                <input
                  type="number"
                  min="0"
                  max="360"
                  value={Math.round(currentHsl.h)}
                  onChange={(e) => handleHslChange('h', parseInt(e.target.value, 10) || 0)}
                  className="color-picker__number"
                />
              </div>

              <div className="color-picker__control">
                <label>S</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentHsl.s}
                  onChange={(e) => handleHslChange('s', parseInt(e.target.value, 10))}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(currentHsl.s)}
                  onChange={(e) => handleHslChange('s', parseInt(e.target.value, 10) || 0)}
                  className="color-picker__number"
                />
              </div>

              <div className="color-picker__control">
                <label>L</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={currentHsl.l}
                  onChange={(e) => handleHslChange('l', parseInt(e.target.value, 10))}
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={Math.round(currentHsl.l)}
                  onChange={(e) => handleHslChange('l', parseInt(e.target.value, 10) || 0)}
                  className="color-picker__number"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
