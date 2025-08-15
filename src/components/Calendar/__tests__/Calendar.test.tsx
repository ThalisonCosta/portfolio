import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Calendar } from '../Calendar';

/**
 * Test wrapper for Calendar component
 */
const CalendarWrapper: React.FC<{ isVisible?: boolean; onClose?: () => void; position?: { x: number; y: number } }> = ({
  isVisible = true,
  onClose = jest.fn(),
  position = { x: 100, y: 100 },
}) => <Calendar isVisible={isVisible} onClose={onClose} position={position} />;

describe('Calendar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should render when visible', () => {
      render(<CalendarWrapper isVisible={true} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render when not visible', () => {
      render(<CalendarWrapper isVisible={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Calendar Layout', () => {
    it('should display current month and year', () => {
      render(<CalendarWrapper />);
      const currentDate = new Date();
      const expectedText = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      expect(screen.getByText(expectedText)).toBeInTheDocument();
    });

    it('should display week day headers', () => {
      render(<CalendarWrapper />);
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      weekDays.forEach((day) => {
        expect(screen.getByText(day)).toBeInTheDocument();
      });
    });

    it('should display today button', () => {
      render(<CalendarWrapper />);
      expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have navigation buttons', () => {
      render(<CalendarWrapper />);
      expect(screen.getByLabelText('Previous year')).toBeInTheDocument();
      expect(screen.getByLabelText('Previous month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next month')).toBeInTheDocument();
      expect(screen.getByLabelText('Next year')).toBeInTheDocument();
    });

    it('should navigate to next month when next month button clicked', async () => {
      render(<CalendarWrapper />);
      const currentDate = new Date();
      const nextMonthButton = screen.getByLabelText('Next month');

      fireEvent.click(nextMonthButton);

      const expectedNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
      const expectedText = expectedNextMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });

    it('should navigate to previous month when previous month button clicked', async () => {
      render(<CalendarWrapper />);
      const currentDate = new Date();
      const prevMonthButton = screen.getByLabelText('Previous month');

      fireEvent.click(prevMonthButton);

      const expectedPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
      const expectedText = expectedPrevMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });

    it('should navigate to next year when next year button clicked', async () => {
      render(<CalendarWrapper />);
      const currentDate = new Date();
      const nextYearButton = screen.getByLabelText('Next year');

      fireEvent.click(nextYearButton);

      const expectedNextYear = new Date(currentDate.getFullYear() + 1, currentDate.getMonth());
      const expectedText = expectedNextYear.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });
  });

  describe('Year Limits', () => {
    it('should disable previous year button at minimum year', async () => {
      render(<CalendarWrapper />);
      const currentYear = new Date().getFullYear();
      const minYear = currentYear - 50;
      const prevYearButton = screen.getByLabelText('Previous year');

      // Navigate to minimum year
      for (let i = 0; i < 50; i++) {
        fireEvent.click(prevYearButton);
      }

      await waitFor(() => {
        expect(prevYearButton).toBeDisabled();
        expect(screen.getByText(new RegExp(minYear.toString()))).toBeInTheDocument();
      });
    });

    it('should disable next year button at maximum year', async () => {
      render(<CalendarWrapper />);
      const currentYear = new Date().getFullYear();
      const maxYear = currentYear + 50;
      const nextYearButton = screen.getByLabelText('Next year');

      // Navigate to maximum year
      for (let i = 0; i < 50; i++) {
        fireEvent.click(nextYearButton);
      }

      await waitFor(() => {
        expect(nextYearButton).toBeDisabled();
        expect(screen.getByText(new RegExp(maxYear.toString()))).toBeInTheDocument();
      });
    });
  });

  describe('Today Functionality', () => {
    it('should navigate back to current date when today button clicked', async () => {
      render(<CalendarWrapper />);
      const currentDate = new Date();
      const todayButton = screen.getByRole('button', { name: 'Today' });
      const nextMonthButton = screen.getByLabelText('Next month');

      // Navigate away from current month
      fireEvent.click(nextMonthButton);
      fireEvent.click(nextMonthButton);

      // Click today button
      fireEvent.click(todayButton);

      const expectedText = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('should close calendar when Escape key is pressed', () => {
      const mockOnClose = jest.fn();
      render(<CalendarWrapper onClose={mockOnClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should navigate months with arrow keys', async () => {
      render(<CalendarWrapper />);
      const currentDate = new Date();

      // Navigate right (next month)
      fireEvent.keyDown(document, { key: 'ArrowRight' });

      const expectedNextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
      const expectedText = expectedNextMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });

      await waitFor(() => {
        expect(screen.getByText(expectedText)).toBeInTheDocument();
      });
    });

    it('should navigate years with up/down arrow keys', async () => {
      render(<CalendarWrapper />);
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const nextYearButton = screen.getByLabelText('Next year');

      // Click next year button to simulate year navigation
      fireEvent.click(nextYearButton);

      await waitFor(() => {
        const title = screen.getByRole('heading');
        expect(title).toHaveTextContent((currentYear + 1).toString());
      });
    });
  });

  describe('Click Outside', () => {
    it('should close calendar when clicking outside', () => {
      const mockOnClose = jest.fn();
      render(
        <div>
          <div data-testid="outside-element">Outside</div>
          <CalendarWrapper onClose={mockOnClose} />
        </div>
      );

      fireEvent.mouseDown(screen.getByTestId('outside-element'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close calendar when clicking inside calendar content', () => {
      const mockOnClose = jest.fn();
      render(<CalendarWrapper onClose={mockOnClose} />);

      const todayButton = screen.getByRole('button', { name: 'Today' });
      fireEvent.mouseDown(todayButton);

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<CalendarWrapper />);
      const calendar = screen.getByRole('dialog');

      expect(calendar).toHaveAttribute('aria-modal', 'true');
      expect(calendar).toHaveAttribute('aria-labelledby', 'calendar-title');
    });

    it('should have proper grid structure', () => {
      render(<CalendarWrapper />);
      expect(screen.getByRole('grid')).toBeInTheDocument();

      // Should have grid cells for each day
      const gridCells = screen.getAllByRole('gridcell');
      expect(gridCells.length).toBeGreaterThan(0);
    });
  });

  describe('Date Highlighting', () => {
    it("should highlight today's date", () => {
      render(<CalendarWrapper />);
      const today = new Date().getDate();
      const todayElements = screen.getAllByText(today.toString()).filter((el) => el.closest('.calendar-day.today'));

      expect(todayElements.length).toBeGreaterThan(0);
    });
  });
});
