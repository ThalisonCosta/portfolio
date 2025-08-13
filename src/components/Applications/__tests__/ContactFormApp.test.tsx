/** @jsxImportSource react */
import { render, screen } from '@testing-library/react';
import { ContactFormApp } from '../ContactFormApp';

describe('ContactFormApp Component', () => {
  test('renders contact form with correct title', () => {
    render(<ContactFormApp />);

    expect(screen.getByText('Contact Me')).toBeInTheDocument();
  });

  test('renders all form fields with correct labels and attributes', () => {
    render(<ContactFormApp />);

    // Check name field
    const nameField = screen.getByLabelText('Name');
    expect(nameField).toBeInTheDocument();
    expect(nameField).toHaveAttribute('type', 'text');
    expect(nameField).toHaveAttribute('placeholder', 'Your Name');
    expect(nameField).toBeRequired();

    // Check email field
    const emailField = screen.getByLabelText('Email');
    expect(emailField).toBeInTheDocument();
    expect(emailField).toHaveAttribute('type', 'email');
    expect(emailField).toHaveAttribute('placeholder', 'Your Email');
    expect(emailField).toBeRequired();

    // Check message field
    const messageField = screen.getByLabelText('Message');
    expect(messageField).toBeInTheDocument();
    expect(messageField).toHaveAttribute('placeholder', 'Your Message');
    expect(messageField).toBeRequired();
  });

  test('renders submit button with correct attributes', () => {
    render(<ContactFormApp />);

    const submitButton = screen.getByRole('button', { name: /send contact message/i });
    expect(submitButton).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  test('form has correct accessibility attributes', () => {
    render(<ContactFormApp />);

    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    expect(form).toHaveAttribute('aria-labelledby', 'contact-form-title');
  });
});
