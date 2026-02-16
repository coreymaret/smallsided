import React from 'react';

interface ReviewSection {
  title: string;
  items: {
    icon?: React.ReactNode;
    label?: string;
    value: string | number;
  }[];
}

interface ReviewStepProps {
  title?: string;
  sections: ReviewSection[];
  totalAmount?: number;
  styles: any;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ 
  title = 'Review & Confirm',
  sections,
  totalAmount,
  styles 
}) => {
  return (
    <div className={styles.step}>
      <h2 className={styles.title}>{title}</h2>
      
      <div className={styles.confirmation || styles.bookingDetailsWrapper}>
        <div className={styles.summary || styles.bookingDetails}>
          {sections.map((section, idx) => (
            <div key={idx} className={styles.summarySection || styles.section}>
              <h3>{section.title}</h3>
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className={styles.summaryItem || styles.detailRow}>
                  {item.icon && (
                    <div className={styles.iconCircle}>
                      {item.icon}
                    </div>
                  )}
                  <div>
                    {item.label && <strong>{item.label}</strong>}
                    <span className={styles.detailValue}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {totalAmount !== undefined && (
          <div className={styles.bookingSummary}>
            <span>Total:</span>
            <span className={styles.totalPrice}>${totalAmount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewStep;
