import React, { useState } from 'react';
import { Cookie, Eye, Shield, Settings, BarChart3, Bell, ChevronDown } from '../../components/Icons/Icons';
import styles from './CookiePolicy.module.scss';

const CookiesPolicy: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Cookie },
    { id: 'types', label: 'Cookie Types', icon: Settings },
    { id: 'thirdparty', label: 'Third-Party', icon: Eye },
    { id: 'manage', label: 'Your Choices', icon: Shield },
  ];

  const cookieTypes = [
    {
      id: 'essential',
      name: 'Essential Cookies',
      description: 'Required for the website to function properly',
      examples: 'Session management, security, load balancing',
      duration: 'Session or up to 1 year',
      required: true,
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how visitors interact with our website',
      examples: 'Google Analytics tracking, page views, user behavior',
      duration: 'Up to 2 years',
      required: false,
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Enable enhanced functionality and personalization',
      examples: 'Language preferences, notification settings, booking history',
      duration: 'Up to 1 year',
      required: false,
    },
    {
      id: 'notification',
      name: 'Notification Cookies',
      description: 'Store your preferences for top banner notifications',
      examples: 'TopToggleBar visibility, announcement dismissals',
      duration: 'Up to 30 days',
      required: false,
    },
  ];

  const thirdPartyServices = [
    {
      name: 'Google Analytics',
      purpose: 'Website traffic analysis and user behavior tracking',
      cookies: '_ga, _gid, _gat',
      duration: '2 years (persistent)',
      optOut: 'https://tools.google.com/dlpage/gaoptout',
    },
    {
      name: 'Google Maps',
      purpose: 'Facility location services and interactive maps',
      cookies: 'NID, CONSENT',
      duration: '6 months',
      optOut: 'Browser settings',
    },
  ];

  const faqs = [
    {
      id: 'what-are-cookies',
      question: 'What are cookies?',
      answer: 'Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.',
    },
    {
      id: 'why-use-cookies',
      question: 'Why does Small Sided use cookies?',
      answer: 'We use cookies to improve your experience on our website, remember your preferences, understand how you use our site, and provide relevant information through our notification system. This helps us create a better experience for booking fields, camps, and other services.',
    },
    {
      id: 'disable-cookies',
      question: 'How can I disable cookies?',
      answer: 'You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed. However, if you do this, you may have to manually adjust some preferences every time you visit our site and some services may not function properly.',
    },
    {
      id: 'data-collected',
      question: 'What data is collected through cookies?',
      answer: 'Our cookies collect information such as pages visited, time spent on pages, links clicked, browser type, device information, and general location data. We do not collect personally identifiable information through cookies without your consent.',
    },
    {
      id: 'third-party-control',
      question: 'Do you control third-party cookies?',
      answer: 'No, we do not control the cookies set by third-party services like Google Analytics. These services have their own privacy policies and cookie policies. We recommend reviewing their policies to understand how they use cookies.',
    },
  ];

  return (
    <div className={styles.cookiesPolicy}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.iconWrapper}>
            <Cookie className={styles.heroIcon} />
          </div>
          <h1>Cookies Policy</h1>
          <p className={styles.subtitle}>
            Transparency about how we use cookies and similar technologies
          </p>
          <p className={styles.lastUpdated}>Last Updated: January 21, 2026</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        <div className={styles.tabs}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className={styles.tabIcon} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className={styles.tabContent}>
            <section className={styles.section}>
              <h2>What This Policy Covers</h2>
              <p>
                This Cookies Policy explains how Small Sided Soccer ("we," "us," or "our") uses cookies and similar
                technologies when you visit our website at smallsided.com. This policy should be read in conjunction
                with our Privacy Policy and Terms of Service.
              </p>
            </section>

            <section className={styles.section}>
              <h2>Our Commitment to Transparency</h2>
              <div className={styles.cardGrid}>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <Eye />
                  </div>
                  <h3>Clear Information</h3>
                  <p>We clearly explain what cookies we use and why we use them on our platform.</p>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <Shield />
                  </div>
                  <h3>Your Control</h3>
                  <p>You have the right to accept or decline non-essential cookies at any time.</p>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>
                    <Settings />
                  </div>
                  <h3>Easy Management</h3>
                  <p>Manage your cookie preferences through browser settings or our tools.</p>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2>How We Use Cookies</h2>
              <p>Small Sided uses cookies to:</p>
              <ul className={styles.styledList}>
                <li>Keep you signed in during your session</li>
                <li>Remember your booking preferences and field selections</li>
                <li>Understand how you navigate our website to improve your experience</li>
                <li>Track conversion of bookings for field rentals, camps, training, and pickup soccer</li>
                <li>Remember your notification preferences for our TopToggleBar announcements</li>
                <li>Provide personalized content and recommendations</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>
          </div>
        )}

        {/* Cookie Types Tab */}
        {activeTab === 'types' && (
          <div className={styles.tabContent}>
            <section className={styles.section}>
              <h2>Types of Cookies We Use</h2>
              <p className={styles.intro}>
                We use different types of cookies for different purposes. Some are essential for the website to
                function, while others help us improve your experience.
              </p>

              <div className={styles.cookieTypesList}>
                {cookieTypes.map((cookie) => (
                  <div key={cookie.id} className={styles.cookieTypeCard}>
                    <div className={styles.cookieTypeHeader}>
                      <h3>{cookie.name}</h3>
                      {cookie.required && <span className={styles.requiredBadge}>Required</span>}
                    </div>
                    <p className={styles.cookieTypeDescription}>{cookie.description}</p>
                    <div className={styles.cookieTypeDetails}>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Examples:</span>
                        <span className={styles.detailValue}>{cookie.examples}</span>
                      </div>
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Duration:</span>
                        <span className={styles.detailValue}>{cookie.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2>Session vs. Persistent Cookies</h2>
              <div className={styles.comparisonGrid}>
                <div className={styles.comparisonCard}>
                  <h3>Session Cookies</h3>
                  <p>
                    These cookies are temporary and are deleted when you close your browser. They help us remember
                    your actions during a single browsing session, such as items in your booking cart.
                  </p>
                  <div className={styles.exampleTag}>Example: Login session</div>
                </div>
                <div className={styles.comparisonCard}>
                  <h3>Persistent Cookies</h3>
                  <p>
                    These cookies remain on your device for a set period or until you delete them. They help us
                    remember your preferences between visits, like your preferred facility location.
                  </p>
                  <div className={styles.exampleTag}>Example: Remember me</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Third-Party Tab */}
        {activeTab === 'thirdparty' && (
          <div className={styles.tabContent}>
            <section className={styles.section}>
              <h2>Third-Party Cookies</h2>
              <p className={styles.intro}>
                We use trusted third-party services that may set their own cookies on your device. These services
                help us provide better functionality and understand how our website is used.
              </p>

              <div className={styles.thirdPartyList}>
                {thirdPartyServices.map((service, index) => (
                  <div key={index} className={styles.thirdPartyCard}>
                    <div className={styles.serviceName}>
                      <BarChart3 className={styles.serviceIcon} />
                      <h3>{service.name}</h3>
                    </div>
                    <div className={styles.serviceDetails}>
                      <div className={styles.serviceRow}>
                        <span className={styles.serviceLabel}>Purpose:</span>
                        <span className={styles.serviceValue}>{service.purpose}</span>
                      </div>
                      <div className={styles.serviceRow}>
                        <span className={styles.serviceLabel}>Cookies Set:</span>
                        <code className={styles.cookieCode}>{service.cookies}</code>
                      </div>
                      <div className={styles.serviceRow}>
                        <span className={styles.serviceLabel}>Duration:</span>
                        <span className={styles.serviceValue}>{service.duration}</span>
                      </div>
                      <div className={styles.serviceRow}>
                        <span className={styles.serviceLabel}>Opt-Out:</span>
                        {service.optOut.startsWith('http') ? (
                          <a href={service.optOut} target="_blank" rel="noopener noreferrer" className={styles.optOutLink}>
                            Visit opt-out page →
                          </a>
                        ) : (
                          <span className={styles.serviceValue}>{service.optOut}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.section}>
              <h2>Google Analytics Details</h2>
              <div className={styles.highlightBox}>
                <h3>How We Use Google Analytics</h3>
                <p>
                  We use Google Analytics to understand how visitors interact with our website. This helps us
                  improve the booking experience for field rentals, camps, training sessions, and pickup soccer.
                </p>
                <h4>Data Collected:</h4>
                <ul className={styles.styledList}>
                  <li>Pages you visit and time spent on each page</li>
                  <li>How you arrived at our site (search, direct, referral)</li>
                  <li>Device type, browser, and screen resolution</li>
                  <li>General geographic location (city/country level)</li>
                  <li>Booking funnel navigation and completion rates</li>
                </ul>
                <h4>Privacy Measures:</h4>
                <ul className={styles.styledList}>
                  <li>IP addresses are anonymized</li>
                  <li>No personally identifiable information is collected</li>
                  <li>Data is used only for analytical purposes</li>
                  <li>You can opt-out using Google's browser extension</li>
                </ul>
              </div>
            </section>

            <section className={styles.section}>
              <h2>TopToggleBar Notifications</h2>
              <div className={styles.notificationBox}>
                <Bell className={styles.notificationIcon} />
                <div className={styles.notificationContent}>
                  <h3>Announcement Banner Cookies</h3>
                  <p>
                    Our TopToggleBar displays important announcements about facility updates, special offers, and
                    schedule changes. We use cookies to remember when you've dismissed notifications so we don't
                    show them repeatedly.
                  </p>
                  <div className={styles.notificationDetails}>
                    <span><strong>Cookie Name:</strong> togglebar_dismissed</span>
                    <span><strong>Duration:</strong> 30 days</span>
                    <span><strong>Purpose:</strong> Remember dismissed announcements</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Manage Tab */}
        {activeTab === 'manage' && (
          <div className={styles.tabContent}>
            <section className={styles.section}>
              <h2>Managing Your Cookie Preferences</h2>
              <p className={styles.intro}>
                You have control over which cookies are set on your device. Here's how you can manage them.
              </p>

              <div className={styles.manageGrid}>
                <div className={styles.manageCard}>
                  <h3>Browser Settings</h3>
                  <p>All modern browsers allow you to control cookies through their settings menu.</p>
                  <ul className={styles.browserList}>
                    <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
                    <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies</li>
                    <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                    <li><strong>Edge:</strong> Settings → Cookies and site permissions</li>
                  </ul>
                </div>

                <div className={styles.manageCard}>
                  <h3>Impact of Blocking Cookies</h3>
                  <p>While you can block cookies, some features may not work properly:</p>
                  <ul className={styles.impactList}>
                    <li>You may need to log in each visit</li>
                    <li>Booking preferences won't be saved</li>
                    <li>Some features may not function correctly</li>
                    <li>We won't remember your notification preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2>Opt-Out Options</h2>
              <div className={styles.optOutGrid}>
                <div className={styles.optOutCard}>
                  <BarChart3 className={styles.optOutIcon} />
                  <h3>Google Analytics Opt-Out</h3>
                  <p>
                    Install Google's browser add-on to prevent your data from being used by Google Analytics
                    across all websites.
                  </p>
                  <a 
                    href="https://tools.google.com/dlpage/gaoptout" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.optOutButton}
                  >
                    Download Browser Add-On
                  </a>
                </div>

                <div className={styles.optOutCard}>
                  <Shield className={styles.optOutIcon} />
                  <h3>Do Not Track</h3>
                  <p>
                    Most browsers support a "Do Not Track" signal. While we respect these signals, not all
                    third-party services do.
                  </p>
                  <div className={styles.dntInfo}>
                    Enable in browser privacy settings
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.section}>
              <h2>Frequently Asked Questions</h2>
              <div className={styles.accordionList}>
                {faqs.map((faq) => (
                  <div key={faq.id} className={styles.accordionItem}>
                    <button
                      className={`${styles.accordionHeader} ${openAccordion === faq.id ? styles.active : ''}`}
                      onClick={() => toggleAccordion(faq.id)}
                    >
                      <span>{faq.question}</span>
                      <ChevronDown className={styles.accordionIcon} />
                    </button>
                    {openAccordion === faq.id && (
                      <div className={styles.accordionContent}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Contact Section */}
      <section className={styles.contactSection}>
        <div className={styles.contactContent}>
          <h2>Questions About Our Cookie Policy?</h2>
          <p>
            If you have questions about how we use cookies or would like more information about your privacy
            rights, please contact us.
          </p>
          <div className={styles.contactInfo}>
            <div className={styles.contactMethod}>
              <strong>Email:</strong> hello@smallsided.com
            </div>
            <div className={styles.contactMethod}>
              <strong>Phone:</strong> (727) 4-SOCCER
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CookiesPolicy;