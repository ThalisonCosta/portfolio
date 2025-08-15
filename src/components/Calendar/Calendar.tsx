import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './Calendar.css';

/**
 * Props for Calendar component
 */
interface CalendarProps {
  /** Whether the calendar is visible */
  isVisible: boolean;
  /** Callback when calendar should be closed */
  onClose: () => void;
  /** Position relative to the taskbar */
  position?: { x: number; y: number };
}

/**
 * Windows 11-style Calendar component
 *
 * Features:
 * - Monthly calendar view with day grid
 * - Current date highlighting
 * - Month/year navigation with 50-year limits
 * - Windows 11 Fluent Design styling
 * - Keyboard navigation and accessibility
 * - Click outside to close
 */
export const Calendar: React.FC<CalendarProps> = ({ isVisible, onClose, position }) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  // State for navigation
  const [viewDate, setViewDate] = useState(new Date());

  // Refs
  const calendarRef = useRef<HTMLDivElement>(null);

  // 50-year limits
  const MIN_YEAR = currentYear - 50;
  const MAX_YEAR = currentYear + 50;

  /**
   * Reset view date when calendar becomes visible
   */
  useEffect(() => {
    if (isVisible) {
      setViewDate(new Date());
    }
  }, [isVisible]);

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateMonth(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateMonth(1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        navigateYear(-1);
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        navigateYear(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, viewDate]);

  /**
   * Handle click outside to close
   */
  useEffect(() => {
    if (!isVisible) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, onClose]);

  /**
   * Navigate months with boundary checking
   */
  const navigateMonth = useCallback(
    (direction: number) => {
      setViewDate((prevDate) => {
        const newDate = new Date(prevDate);
        newDate.setMonth(newDate.getMonth() + direction);

        // Check year boundaries
        if (newDate.getFullYear() < MIN_YEAR) {
          newDate.setFullYear(MIN_YEAR);
          newDate.setMonth(0);
        } else if (newDate.getFullYear() > MAX_YEAR) {
          newDate.setFullYear(MAX_YEAR);
          newDate.setMonth(11);
        }

        return newDate;
      });
    },
    [MIN_YEAR, MAX_YEAR]
  );

  /**
   * Navigate years with boundary checking
   */
  const navigateYear = useCallback(
    (direction: number) => {
      setViewDate((prevDate) => {
        const newDate = new Date(prevDate);
        const newYear = newDate.getFullYear() + direction;

        if (newYear >= MIN_YEAR && newYear <= MAX_YEAR) {
          newDate.setFullYear(newYear);
        }

        return newDate;
      });
    },
    [MIN_YEAR, MAX_YEAR]
  );

  /**
   * Check if navigation buttons should be disabled
   */
  const navigationDisabled = useMemo(() => {
    const viewYear = viewDate.getFullYear();
    const viewMonth = viewDate.getMonth();

    return {
      prevMonth: viewYear === MIN_YEAR && viewMonth === 0,
      nextMonth: viewYear === MAX_YEAR && viewMonth === 11,
      prevYear: viewYear <= MIN_YEAR,
      nextYear: viewYear >= MAX_YEAR,
    };
  }, [viewDate, MIN_YEAR, MAX_YEAR]);

  /**
   * Get the days to display in the calendar grid
   */
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // First day of the week (Sunday = 0)
    const firstDayWeek = firstDay.getDay();

    // Days to show
    const days: Array<{
      date: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      fullDate: Date;
    }> = [];

    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const date = prevMonthLastDay - i;
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        fullDate: new Date(year, month - 1, date),
      });
    }

    // Current month's days
    for (let date = 1; date <= lastDay.getDate(); date++) {
      const fullDate = new Date(year, month, date);
      const isToday = fullDate.toDateString() === currentDate.toDateString();

      days.push({
        date,
        isCurrentMonth: true,
        isToday,
        fullDate,
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let date = 1; date <= remainingDays; date++) {
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        fullDate: new Date(year, month + 1, date),
      });
    }

    return days;
  }, [viewDate, currentDate]);

  /**
   * Format month/year display
   */
  const monthYearDisplay = useMemo(
    () =>
      viewDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [viewDate]
  );

  /**
   * Week day names
   */
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!isVisible) return null;

  return (
    <div className="calendar-overlay" role="dialog" aria-modal="true" aria-labelledby="calendar-title">
      <div
        ref={calendarRef}
        className="calendar"
        style={{
          position: 'fixed',
          bottom: position ? `${window.innerHeight - position.y + 10}px` : '60px',
          right: position ? `${window.innerWidth - position.x}px` : '20px',
        }}
      >
        {/* Header with navigation */}
        <div className="calendar-header">
          <div className="calendar-navigation">
            <button
              type="button"
              className="calendar-nav-button"
              onClick={() => navigateYear(-1)}
              disabled={navigationDisabled.prevYear}
              aria-label="Previous year"
            >
              &#8249;&#8249;
            </button>
            <button
              type="button"
              className="calendar-nav-button"
              onClick={() => navigateMonth(-1)}
              disabled={navigationDisabled.prevMonth}
              aria-label="Previous month"
            >
              &#8249;
            </button>
            <h2 id="calendar-title" className="calendar-title">
              {monthYearDisplay}
            </h2>
            <button
              type="button"
              className="calendar-nav-button"
              onClick={() => navigateMonth(1)}
              disabled={navigationDisabled.nextMonth}
              aria-label="Next month"
            >
              &#8250;
            </button>
            <button
              type="button"
              className="calendar-nav-button"
              onClick={() => navigateYear(1)}
              disabled={navigationDisabled.nextYear}
              aria-label="Next year"
            >
              &#8250;&#8250;
            </button>
          </div>
        </div>

        {/* Week day headers */}
        <div className="calendar-weekdays">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="calendar-grid" role="grid">
          {calendarDays.map((day) => (
            <div
              key={`${day.fullDate.getTime()}`}
              className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} ${
                day.isToday ? 'today' : ''
              }`}
              role="gridcell"
              aria-label={day.fullDate.toLocaleDateString()}
            >
              {day.date}
            </div>
          ))}
        </div>

        {/* Footer with today button */}
        <div className="calendar-footer">
          <button
            type="button"
            className="calendar-today-button"
            onClick={() => {
              setViewDate(new Date());
            }}
          >
            Today
          </button>
        </div>
      </div>
    </div>
  );
};

Calendar.displayName = 'Calendar';
