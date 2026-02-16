import React from 'react';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentStepProps {
  formData: {
    cardNumber: string;
    cardExpiry: string;
    cardCVV: string;
    billingZip: string;
  };
  errors: {
    cardNumber?: string;
    cardExpiry?: string;
    cardCVV?: string;
    billingZip?: string;
  };
  totalAmount: number;
  onCardNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCardExpiryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCVVChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onZipChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  styles: any; // SCSS module styles
  showTotal?: boolean;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  formData,
  errors,
  totalAmount,
  onCardNumberChange,
  onCardExpiryChange,
  onCVVChange,
  onZipChange,
  styles,
  showTotal = true,
}) => {
  return (
    <div className={styles.step}>
      <h2 className={styles.title}>Payment Information</h2>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <div className={styles.iconCircle}>
            <CreditCard size={20} />
          </div>
          Card Details
        </h3>
        
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <input
              type="text"
              name="cardNumber"
              value={formData.cardNumber}
              onChange={onCardNumberChange}
              placeholder="Card Number"
              maxLength={19}
              className={`${styles.input} ${errors.cardNumber ? styles.error : ''}`}
            />
            <label className={`${styles.floatingLabel} ${formData.cardNumber ? styles.active : ''}`}>
              Card Number *
            </label>
            {errors.cardNumber && (
              <span className={styles.errorMessage}>{errors.cardNumber}</span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className={styles.formGroup}>
              <input
                type="text"
                name="cardExpiry"
                value={formData.cardExpiry}
                onChange={onCardExpiryChange}
                placeholder="Expiry Date"
                maxLength={5}
                className={`${styles.input} ${errors.cardExpiry ? styles.error : ''}`}
              />
              <label className={`${styles.floatingLabel} ${formData.cardExpiry ? styles.active : ''}`}>
                Expiry (MM/YY) *
              </label>
              {errors.cardExpiry && (
                <span className={styles.errorMessage}>{errors.cardExpiry}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <input
                type="text"
                name="cardCVV"
                value={formData.cardCVV}
                onChange={onCVVChange}
                placeholder="CVV"
                maxLength={3}
                className={`${styles.input} ${errors.cardCVV ? styles.error : ''}`}
              />
              <label className={`${styles.floatingLabel} ${formData.cardCVV ? styles.active : ''}`}>
                CVV *
              </label>
              {errors.cardCVV && (
                <span className={styles.errorMessage}>{errors.cardCVV}</span>
              )}
            </div>
          </div>

          <div className={styles.formGroup}>
            <input
              type="text"
              name="billingZip"
              value={formData.billingZip}
              onChange={onZipChange}
              placeholder="Billing ZIP Code"
              maxLength={10}
              className={`${styles.input} ${errors.billingZip ? styles.error : ''}`}
            />
            <label className={`${styles.floatingLabel} ${formData.billingZip ? styles.active : ''}`}>
              Billing ZIP Code *
            </label>
            {errors.billingZip && (
              <span className={styles.errorMessage}>{errors.billingZip}</span>
            )}
          </div>

          <div className={styles.securityNotice}>
            <Lock size={16} />
            <span>Your payment information is encrypted and secure</span>
          </div>

          {showTotal && (
            <div className={styles.bookingSummary || styles.total}>
              <span>Total Amount:</span>
              <span className={styles.totalPrice || styles.totalAmount}>${totalAmount}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStep;
