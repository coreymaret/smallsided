import React from 'react';
import { User } from 'lucide-react';

interface ContactStepProps {
  formData: {
    name: string;
    email: string;
    phone: string;
  };
  errors: {
    name?: string;
    email?: string;
    phone?: string;
  };
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  styles: any; // SCSS module styles
}

const ContactStep: React.FC<ContactStepProps> = ({
  formData,
  errors,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  styles,
}) => {
  return (
    <div className={styles.step}>
      <h2 className={styles.title}>Your Information</h2>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <div className={styles.iconCircle}>
            <User size={20} />
          </div>
          Contact Details
        </h3>
        
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Full Name"
              className={`${styles.input} ${errors.name ? styles.error : ''}`}
            />
            <label className={`${styles.floatingLabel} ${formData.name ? styles.active : ''}`}>
              Full Name *
            </label>
            {errors.name && (
              <span className={styles.errorMessage}>{errors.name}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Email Address"
              className={`${styles.input} ${errors.email ? styles.error : ''}`}
            />
            <label className={`${styles.floatingLabel} ${formData.email ? styles.active : ''}`}>
              Email Address *
            </label>
            {errors.email && (
              <span className={styles.errorMessage}>{errors.email}</span>
            )}
          </div>
          
          <div className={styles.formGroup}>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={onPhoneChange}
              placeholder="Phone Number"
              className={`${styles.input} ${errors.phone ? styles.error : ''}`}
            />
            <label className={`${styles.floatingLabel} ${formData.phone ? styles.active : ''}`}>
              Phone Number *
            </label>
            {errors.phone && (
              <span className={styles.errorMessage}>{errors.phone}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactStep;
