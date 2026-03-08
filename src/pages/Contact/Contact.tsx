// src/pages/Contact/Contact.tsx

// Styles
import styles from './Contact.module.scss';

// React
import React, { useState, useEffect, lazy, Suspense } from 'react';

// i18n
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
            <h1>{t('contact.heading')}</h1>
            <p className={styles.subtitle}>{t('contact.subtitle')}</p>

            <form className={styles.contactForm} onSubmit={handleSubmit}>
              {/* Name row */}
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={`${styles.floatingLabel} ${(focusedField === 'firstName' || formData.firstName) ? styles.active : ''}`}>
                    {t('contact.form.firstName')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('contact.form.firstName')}
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    onFocus={() => handleFocus('firstName')}
                    onBlur={() => handleBlur('firstName')}
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label className={`${styles.floatingLabel} ${(focusedField === 'lastName' || formData.lastName) ? styles.active : ''}`}>
                    {t('contact.form.lastName')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('contact.form.lastName')}
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
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  required
                  placeholder={t('contact.form.email')}
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
                  {t('contact.form.phone')}
                </label>
                <input
                  type="tel"
                  required
                  placeholder={t('contact.form.phone')}
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
                  {t('contact.form.message')}
                </label>
                <textarea
                  required
                  placeholder={t('contact.form.message')}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  onFocus={() => handleFocus('message')}
                  onBlur={() => handleBlur('message')}
                  className={`${styles.input} ${styles.textarea}`}
                  rows={5}
                />
              </div>

              <button type="submit" className={styles.submitButton}>{t('contact.form.submit')}</button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN — Contact info & socials */}
        <div className={styles.contactRight}>
          <div className={styles.contactRow}>
            <MapPin className={styles.contactIcon} size={32} />
            <div className={styles.contactInfo}>
              <h3>{t('contact.info.address')}</h3>
              <p>{t('contact.info.addressValue')}</p>
            </div>
          </div>

          <div className={styles.contactRow}>
            <Phone className={styles.contactIcon} size={32} />
            <div className={styles.contactInfo}>
              <h3>{t('contact.info.phone')}</h3>
              <p>(727) 4-SOCCER</p>
            </div>
          </div>

          <div className={styles.contactRow}>
            <Mail className={styles.contactIcon} size={32} />
            <div className={styles.contactInfo}>
              <h3>{t('contact.info.mail')}</h3>
              <p>admin@smallsided.com</p>
            </div>
          </div>

          <div className={styles.contactRow}>
            <ThumbsUp className={styles.contactIcon} size={32} />
            <div className={styles.contactInfo}>
              <h3>{t('contact.info.followUs')}</h3>
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
            {t('contact.map.loading')}
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