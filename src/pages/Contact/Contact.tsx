// src/pages/Contact/Contact.tsx

// Styles
import styles from './Contact.module.scss';

// React
import React, { useState, useEffect, lazy, Suspense } from 'react';

// SEO
import SEO from '../../components/SEO/SEO';
import { getSEOConfig } from '../../config/seo';

// Components
import ContactAccordion from '../../components/ContactAccordion/ContactAccordion';

// Lazy-loaded Components
const ContactMap = lazy(() => import('./ContactMap'));

// Icons
import {
  MapPin,
  Phone,
  Mail,
  ThumbsUp,
  Facebook,
  Instagram,
  Youtube,
  Twitter,
} from '../../components/Icons/Icons';

/**
 * Contact page with a two-column layout:
 * left column houses the contact form,
 * right column displays contact info & socials.
 * Includes a lazy-loaded Google Map and FAQ accordion.
 */
const Contact: React.FC = () => {
  const seo = getSEOConfig('contact');

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: '',
  });

  /** Load reCAPTCHA script on mount, clean up on unmount */
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  /** Form field event handlers */
  const handleFocus = (field: string) => setFocusedField(field);
  const handleBlur = (field: string) => {
    if (!formData[field as keyof typeof formData]) setFocusedField(null);
  };
  const handleChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <>
      {/* SEO meta tags, OG, Twitter, JSON-LD */}
      <SEO {...seo} />

      {/* Two-column contact layout */}
      <div className={styles.contactContainer}>

        {/* LEFT COLUMN — Contact form */}
        <div className={styles.contactLeft}>
          <div className={styles.leftContent}>
            <div className={styles.decorativeLine}></div>
            <h1>Get in touch.</h1>
            <p className={styles.subtitle}>
              We typically respond within 24 hours during business days. Whether you have a question,
              feedback, or just want to say hello, we're here to help.
            </p>

            <form className={styles.contactForm} onSubmit={handleSubmit}>
              {/* Name row */}
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={`${styles.floatingLabel} ${(focusedField === 'firstName' || formData.firstName) ? styles.active : ''}`}>
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    onFocus={() => handleFocus('firstName')}
                    onBlur={() => handleBlur('firstName')}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={`${styles.floatingLabel} ${(focusedField === 'lastName' || formData.lastName) ? styles.active : ''}`}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    onFocus={() => handleFocus('lastName')}
                    onBlur={() => handleBlur('lastName')}
                    className={styles.input}
                  />
                </div>
              </div>

              {/* Email */}
              <div className={styles.inputGroup}>
                <label className={`${styles.floatingLabel} ${(focusedField === 'email' || formData.email) ? styles.active : ''}`}>
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                  className={styles.input}
                />
              </div>

              {/* Phone */}
              <div className={styles.inputGroup}>
                <label className={`${styles.floatingLabel} ${(focusedField === 'phone' || formData.phone) ? styles.active : ''}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onFocus={() => handleFocus('phone')}
                  onBlur={() => handleBlur('phone')}
                  className={styles.input}
                />
              </div>

              {/* Message */}
              <div className={styles.inputGroup}>
                <label className={`${styles.floatingLabel} ${(focusedField === 'message' || formData.message) ? styles.active : ''}`}>
                  Message
                </label>
                <textarea
                  required
                  placeholder="Message"
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')}
                  className={`${styles.input} ${styles.textarea}`}
                  rows={5}
                />
              </div>

              <button type="submit" className={styles.submitButton}>Send Message</button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN — Contact info & socials */}
        <div className={styles.contactRight}>
          <div className={styles.contactRow}>
            <MapPin className={styles.contactIcon} size={32} />
            <div className={styles.contactInfo}>
              <h3>Address</h3>
              <p>123 Small Sided Way, Tampa, FL 33617</p>
            </div>
          </div>

          <div className={styles.contactRow}>
            <Phone className={styles.contactIcon} size={32} />
            <div className={styles.contactInfo}>
              <h3>Phone</h3>
              <p>(727) 4-SOCCER</p>
            </div>
          </div>

          <div className={styles.contactRow}>
            <Mail className={styles.contactIcon} size={32} />
            <div className={styles.contactInfo}>
              <h3>Mail</h3>
              <p>admin@smallsided.com</p>
            </div>
          </div>

          <div className={styles.contactRow}>
            <ThumbsUp className={styles.contactIcon} size={32} />
            <div className={styles.contactInfo}>
              <h3>Follow Us</h3>
              <div className={styles.socialIcons}>
                <Facebook size={24} className={styles.socialIcon} />
                <Instagram size={24} className={styles.socialIcon} />
                <Youtube size={24} className={styles.socialIcon} />
                <Twitter size={24} className={styles.socialIcon} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Google Map — lazy loaded */}
      <div className={styles.contactMapWrapper}>
        <Suspense fallback={
          <div style={{
            width: '100%',
            height: '450px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#15141a',
            color: '#fff',
            fontSize: '1rem',
          }}>
            Loading map...
          </div>
        }>
          <ContactMap />
        </Suspense>
      </div>

      {/* FAQ accordion */}
      <ContactAccordion />
    </>
  );
};

export default Contact;