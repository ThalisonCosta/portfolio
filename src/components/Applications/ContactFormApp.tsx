import React from 'react';

/**
 * Contact Form application component that provides a contact form interface.
 */
export const ContactFormApp: React.FC = () => (
  <div style={{ padding: '20px', height: '100%', overflow: 'auto' }}>
    <h3 id="contact-form-title">Contact Me</h3>
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      aria-labelledby="contact-form-title"
      role="form"
    >
      <div>
        <label htmlFor="contact-name" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          placeholder="Your Name"
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="contact-email" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          placeholder="Your Email"
          style={{ padding: '8px', width: '100%', boxSizing: 'border-box' }}
          required
          aria-required="true"
        />
      </div>

      <div>
        <label htmlFor="contact-message" style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>
          Message
        </label>
        <textarea
          id="contact-message"
          placeholder="Your Message"
          rows={5}
          style={{ padding: '8px', resize: 'vertical', width: '100%', boxSizing: 'border-box' }}
          required
          aria-required="true"
        />
      </div>

      <button
        type="submit"
        style={{
          padding: '10px',
          backgroundColor: '#0078d4',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
        aria-label="Send contact message"
      >
        Send Message
      </button>
    </form>
  </div>
);
