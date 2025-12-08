import React, { useState } from 'react';
import { MapPin, Phone, Mail, ThumbsUp, Facebook, Instagram, Youtube, Twitter } from 'lucide-react';
import styles from './Contact.module.scss';
import ContactMap from './ContactMap'; // import the map component

const Contact: React.FC = () => {
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleFocus = (field: string) => setFocusedField(field);
  const handleBlur = (field: string) => {
    if (!formData[field as keyof typeof formData]) setFocusedField(null);
  };
  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); console.log('Form submitted:', formData); };

  return (
    <>
      <div className={styles.contactContainer}>
        {/* LEFT COLUMN */}
        <div className={styles.contactLeft}>
          <div className={styles.leftContent}>
            <div className={styles.decorativeLine}></div>
            <h1>Get in touch.</h1>
            <p className={styles.subtitle}>
              We typically respond within 24 hours during business days. Whether you have a question, feedback, or just want to say hello, we're here to help.
            </p>

            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label className={`${styles.floatingLabel} ${(focusedField === 'firstName' || formData.firstName) ? styles.active : ''}`}>First Name</label>
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
                  <label className={`${styles.floatingLabel} ${(focusedField === 'lastName' || formData.lastName) ? styles.active : ''}`}>Last Name</label>
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

              <div className={styles.inputGroup}>
                <label className={`${styles.floatingLabel} ${(focusedField === 'email' || formData.email) ? styles.active : ''}`}>Email</label>
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

              <div className={styles.inputGroup}>
                <label className={`${styles.floatingLabel} ${(focusedField === 'phone' || formData.phone) ? styles.active : ''}`}>Phone</label>
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

              <div className={styles.inputGroup}>
                <label className={`${styles.floatingLabel} ${(focusedField === 'message' || formData.message) ? styles.active : ''}`}>Message</label>
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

        {/* RIGHT COLUMN */}
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

      {/* GOOGLE MAP BELOW FLEXBOX */}
<div className={styles.contactMapWrapper}>
  <ContactMap />
</div>
    </>
  );
};

export default Contact;
