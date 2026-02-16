import React from 'react';

interface DetailItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface SuccessBannerProps {
  isVisible: boolean;
  isClosing: boolean;
  title: string;
  subtitle: string;
  details: DetailItem[];
  email: string;
  onClose: () => void;
  styles: any; // SCSS module styles
}

const SuccessBanner: React.FC<SuccessBannerProps> = ({
  isVisible,
  isClosing,
  title,
  subtitle,
  details,
  email,
  onClose,
  styles,
}) => {
  if (!isVisible) return null;

  return (
    <>
      <div 
        className={`${styles.bannerBackdrop} ${isClosing ? styles.backdropClosing : ''}`}
        onClick={onClose}
      />
      
      <div 
        className={`${styles.successBanner} ${isClosing ? styles.closing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close notification"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className={styles.bannerHeader}>
          <div className={styles.bannerIcon}>
            <svg viewBox="0 0 24 24" width="24" height="24">
              <circle cx="12" cy="12" r="10" fill="none" stroke="white" strokeWidth="2"/>
              <path 
                d="M9 12l2 2 4-4"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className={styles.bannerText}>
            <h3 className={styles.bannerTitle}>{title}</h3>
            <p className={styles.bannerSubtitle}>{subtitle}</p>
          </div>
        </div>
        
        <div className={styles.bannerDetails}>
          <div className={styles.detailsGrid}>
            {details.map((detail, index) => (
              <div key={index} className={styles.detailItem}>
                {detail.icon}
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>{detail.label}</span>
                  <span className={styles.detailValue}>{detail.value}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.emailNotice}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <span>Confirmation email sent to {email}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessBanner;
