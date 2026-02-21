import React, { useState } from 'react';
import { ChevronDown, HatGlasses, Eye, Lock, Users, FileText, Globe, Mail, AlertCircle } from '../../components/Icons/Icons';
import styles from './PrivacyPolicy.module.scss';

const PrivacyPolicy: React.FC = () => {
  const [openAccordion, setOpenAccordion] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenAccordion(openAccordion === index ? null : index);
  };

  const sections = [
    {
      title: "Information We Collect",
      icon: <FileText size={24} />,
      content: (
        <>
          <h3>Personal Information You Provide</h3>
          <p>When you use Small Sided services, we collect information that you provide directly to us:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, phone number, and password when you create an account</li>
            <li><strong>Profile Information:</strong> Age, skill level, playing preferences, and profile photo (optional)</li>
            <li><strong>Booking Information:</strong> Field rental details, pickup game reservations, league registrations</li>
            <li><strong>Payment Information:</strong> Credit card details, billing address (processed securely through our payment processor)</li>
            <li><strong>Communication Data:</strong> Messages, reviews, feedback, and customer support inquiries</li>
          </ul>

          <h3>Information Collected Automatically</h3>
          <p>We automatically collect certain information when you use our services:</p>
          <ul>
            <li><strong>Usage Data:</strong> Pages viewed, features used, time spent on site, click patterns</li>
            <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, IP address</li>
            <li><strong>Location Data:</strong> Approximate location based on IP address or precise location (with permission) for facility recommendations</li>
            <li><strong>Cookies & Tracking:</strong> As detailed in our Cookies Policy, we use cookies and similar technologies</li>
          </ul>

          <h3>Information from Third Parties</h3>
          <p>We may receive information about you from:</p>
          <ul>
            <li>Social media platforms if you connect your account</li>
            <li>Other users who book shared activities with you</li>
            <li>Facility partners regarding your bookings and attendance</li>
            <li>Analytics providers and advertising partners</li>
          </ul>
        </>
      )
    },
    {
      title: "How We Use Your Information",
      icon: <Eye size={24} />,
      content: (
        <>
          <p>We use the information we collect for various purposes:</p>
          
          <h3>Service Delivery</h3>
          <ul>
            <li>Process and manage your bookings, registrations, and payments</li>
            <li>Create and maintain your account</li>
            <li>Provide customer support and respond to inquiries</li>
            <li>Send booking confirmations, reminders, and updates</li>
            <li>Facilitate communication between users for shared activities</li>
          </ul>

          <h3>Service Improvement</h3>
          <ul>
            <li>Analyze usage patterns to improve our platform</li>
            <li>Develop new features and services</li>
            <li>Personalize your experience and provide recommendations</li>
            <li>Conduct research and analytics</li>
            <li>Test new features and functionality</li>
          </ul>

          <h3>Marketing & Communication</h3>
          <ul>
            <li>Send promotional emails about new facilities, programs, and offers (with your consent)</li>
            <li>Display targeted advertising based on your interests</li>
            <li>Share news, tips, and content about small-sided soccer</li>
            <li>Conduct surveys and collect feedback</li>
          </ul>

          <h3>Safety & Security</h3>
          <ul>
            <li>Verify identity and prevent fraud</li>
            <li>Detect and prevent abuse or violations of our terms</li>
            <li>Protect the security and integrity of our services</li>
            <li>Comply with legal obligations and enforce our policies</li>
          </ul>
        </>
      )
    },
    {
      title: "How We Share Your Information",
      icon: <Users size={24} />,
      content: (
        <>
          <p>We share your information in the following circumstances:</p>

          <h3>With Your Consent</h3>
          <p>We share information when you explicitly consent or direct us to share it, such as when you:</p>
          <ul>
            <li>Join a pickup game and your name is visible to other participants</li>
            <li>Leave a public review or rating</li>
            <li>Share your profile or activity with other users</li>
          </ul>

          <h3>Service Providers</h3>
          <p>We share information with third-party vendors who perform services on our behalf:</p>
          <ul>
            <li><strong>Payment Processors:</strong> To process your transactions securely</li>
            <li><strong>Cloud Hosting:</strong> To store data and run our services</li>
            <li><strong>Analytics Providers:</strong> To understand how our services are used</li>
            <li><strong>Email Services:</strong> To send transactional and marketing emails</li>
            <li><strong>Customer Support:</strong> To provide help and resolve issues</li>
          </ul>

          <h3>Facility Partners</h3>
          <p>We share relevant booking information with our facility partners to:</p>
          <ul>
            <li>Process and manage your reservations</li>
            <li>Provide services you've booked</li>
            <li>Handle refunds or disputes</li>
            <li>Improve facility operations</li>
          </ul>

          <h3>Legal Requirements</h3>
          <p>We may disclose information if required by law or to:</p>
          <ul>
            <li>Comply with legal processes, court orders, or government requests</li>
            <li>Enforce our Terms of Service or other agreements</li>
            <li>Protect rights, property, or safety of Small Sided, users, or the public</li>
            <li>Detect, prevent, or address fraud, security, or technical issues</li>
          </ul>

          <h3>Business Transfers</h3>
          <p>If Small Sided is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you of any such change.</p>

          <h3>Aggregated & De-identified Data</h3>
          <p>We may share aggregated or de-identified information that cannot reasonably be used to identify you, such as industry reports or statistical analysis.</p>
        </>
      )
    },
    {
      title: "Data Security",
      icon: <Lock size={24} />,
      content: (
        <>
          <p>We take the security of your information seriously and implement various measures to protect it:</p>

          <h3>Technical Safeguards</h3>
          <ul>
            <li><strong>Encryption:</strong> We use SSL/TLS encryption to protect data in transit</li>
            <li><strong>Secure Storage:</strong> Data at rest is encrypted using industry-standard protocols</li>
            <li><strong>Access Controls:</strong> Limited employee access based on role and necessity</li>
            <li><strong>Authentication:</strong> Password requirements and optional two-factor authentication</li>
            <li><strong>Monitoring:</strong> Continuous security monitoring and threat detection</li>
          </ul>

          <h3>Organizational Safeguards</h3>
          <ul>
            <li>Regular security training for all employees</li>
            <li>Background checks for employees with data access</li>
            <li>Confidentiality agreements with service providers</li>
            <li>Incident response procedures for data breaches</li>
            <li>Regular security audits and assessments</li>
          </ul>

          <h3>Payment Security</h3>
          <p>We use PCI-DSS compliant payment processors. We do not store complete credit card numbers on our servers. Payment information is tokenized and processed through secure third-party services.</p>

          <h3>Your Responsibility</h3>
          <p>Please help keep your account secure by:</p>
          <ul>
            <li>Using a strong, unique password</li>
            <li>Not sharing your login credentials</li>
            <li>Logging out on shared devices</li>
            <li>Reporting suspicious activity immediately</li>
          </ul>

          <div className={styles.warningBox}>
            <AlertCircle size={20} />
            <p><strong>Important:</strong> While we implement strong security measures, no system is 100% secure. We cannot guarantee absolute security of your information.</p>
          </div>
        </>
      )
    },
    {
      title: "Your Privacy Rights",
      icon: <HatGlasses size={24} />,
      content: (
        <>
          <p>You have various rights regarding your personal information:</p>

          <h3>Access & Portability</h3>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Review:</strong> View and update your information in your account settings</li>
          </ul>

          <h3>Correction & Deletion</h3>
          <ul>
            <li><strong>Correction:</strong> Request corrections to inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
            <li><strong>Account Closure:</strong> Close your account at any time through settings or by contacting us</li>
          </ul>

          <h3>Control & Preferences</h3>
          <ul>
            <li><strong>Marketing Opt-Out:</strong> Unsubscribe from marketing emails via the link in any email</li>
            <li><strong>Cookie Controls:</strong> Manage cookie preferences through our cookie banner or browser settings</li>
            <li><strong>Location Services:</strong> Disable location tracking through your device settings</li>
            <li><strong>Notification Preferences:</strong> Adjust email and push notification settings in your account</li>
          </ul>

          <h3>Object & Restrict</h3>
          <ul>
            <li><strong>Object:</strong> Object to processing of your data for certain purposes</li>
            <li><strong>Restrict:</strong> Request restriction of processing in certain circumstances</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
          </ul>

          <h3>Exercising Your Rights</h3>
          <p>To exercise any of these rights, you can:</p>
          <ul>
            <li>Update information directly in your account settings</li>
            <li>Email us at privacy@smallsided.com</li>
            <li>Contact us through the support section of our website</li>
          </ul>
          <p>We will respond to your request within 30 days. Some requests may require identity verification to protect your information.</p>

          <h3>Regional Rights</h3>
          <p><strong>California Residents (CCPA):</strong> You have additional rights under the California Consumer Privacy Act, including the right to know what information is sold or disclosed and the right to opt-out of sale.</p>
          <p><strong>EU/UK Residents (GDPR):</strong> You have additional rights under GDPR, including the right to lodge a complaint with a supervisory authority.</p>
        </>
      )
    },
    {
      title: "Data Retention",
      icon: <FileText size={24} />,
      content: (
        <>
          <p>We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy.</p>

          <h3>Retention Periods</h3>
          <ul>
            <li><strong>Account Information:</strong> Retained while your account is active and for 90 days after closure</li>
            <li><strong>Booking History:</strong> Retained for 7 years for financial and legal compliance</li>
            <li><strong>Payment Information:</strong> Tokenized data retained according to payment processor policies</li>
            <li><strong>Communication Data:</strong> Retained for 2 years unless longer retention is required</li>
            <li><strong>Usage Data:</strong> Aggregated data retained indefinitely; individual data for 2 years</li>
            <li><strong>Marketing Data:</strong> Retained until you opt-out or for 3 years of inactivity</li>
          </ul>

          <h3>Factors Affecting Retention</h3>
          <p>We determine retention periods based on:</p>
          <ul>
            <li>The nature and sensitivity of the information</li>
            <li>Legal and regulatory requirements</li>
            <li>Potential risk of harm from unauthorized use or disclosure</li>
            <li>The purposes for which we process your information</li>
            <li>Whether we can achieve those purposes through other means</li>
          </ul>

          <h3>Deletion Process</h3>
          <p>When data is deleted:</p>
          <ul>
            <li>It is removed from active systems within 30 days</li>
            <li>Backup copies are deleted within 90 days</li>
            <li>Some information may persist in aggregated, anonymized form</li>
            <li>Data required for legal compliance is retained as necessary</li>
          </ul>
        </>
      )
    },
    {
      title: "Children's Privacy",
      icon: <Users size={24} />,
      content: (
        <>
          <p>Small Sided is committed to protecting children's privacy.</p>

          <h3>Age Requirements</h3>
          <ul>
            <li>Our services are not intended for children under 13 years of age</li>
            <li>We do not knowingly collect information from children under 13</li>
            <li>Users aged 13-17 must have parental consent to use our services</li>
          </ul>

          <h3>Youth Accounts</h3>
          <p>For youth soccer programs (ages 13-17):</p>
          <ul>
            <li>Parent/guardian must create and manage the account</li>
            <li>We collect only necessary information for service delivery</li>
            <li>Marketing communications are not sent to youth accounts</li>
            <li>Parents can review, update, or delete youth information at any time</li>
          </ul>

          <h3>Parental Controls</h3>
          <p>Parents and guardians have the right to:</p>
          <ul>
            <li>Review their child's personal information</li>
            <li>Request deletion of their child's information</li>
            <li>Refuse further collection or use of their child's information</li>
            <li>Receive notifications about youth account activity</li>
          </ul>

          <h3>If We Learn of Unauthorized Collection</h3>
          <p>If we discover we have collected information from a child under 13 without parental consent, we will:</p>
          <ul>
            <li>Delete the information immediately</li>
            <li>Terminate the account</li>
            <li>Not use the information for any purpose</li>
          </ul>

          <p>If you believe a child under 13 has provided information to us, please contact us immediately at privacy@smallsided.com.</p>
        </>
      )
    },
    {
      title: "International Data Transfers",
      icon: <Globe size={24} />,
      content: (
        <>
          <p>Small Sided operates primarily in the United States, but we may transfer and process data internationally.</p>

          <h3>Data Transfer Mechanisms</h3>
          <p>When we transfer data internationally, we use appropriate safeguards:</p>
          <ul>
            <li><strong>Standard Contractual Clauses:</strong> EU-approved contracts for data transfers</li>
            <li><strong>Adequacy Decisions:</strong> Transfers to countries with adequate data protection</li>
            <li><strong>Privacy Shield (where applicable):</strong> Compliance with relevant frameworks</li>
            <li><strong>Your Consent:</strong> Explicit consent for certain transfers</li>
          </ul>

          <h3>Cross-Border Processing</h3>
          <p>Your information may be processed in:</p>
          <ul>
            <li>The United States (primary servers and operations)</li>
            <li>Countries where our service providers operate</li>
            <li>Countries where you access our services</li>
          </ul>

          <h3>Data Protection Standards</h3>
          <p>Regardless of where data is processed, we:</p>
          <ul>
            <li>Apply consistent security measures globally</li>
            <li>Require service providers to meet our privacy standards</li>
            <li>Ensure transfers comply with applicable laws</li>
            <li>Provide appropriate safeguards for your rights</li>
          </ul>

          <h3>Your Rights in International Transfers</h3>
          <p>You have the right to:</p>
          <ul>
            <li>Request information about data transfer safeguards</li>
            <li>Obtain copies of relevant transfer mechanisms</li>
            <li>Object to transfers in certain circumstances</li>
          </ul>
        </>
      )
    },
    {
      title: "Third-Party Links & Services",
      icon: <Globe size={24} />,
      content: (
        <>
          <p>Our services may contain links to third-party websites, applications, and services.</p>

          <h3>Third-Party Websites</h3>
          <p>Small Sided is not responsible for:</p>
          <ul>
            <li>Privacy practices of third-party websites</li>
            <li>Content or functionality of external sites</li>
            <li>Data collection by linked services</li>
          </ul>
          <p>We encourage you to review the privacy policies of any third-party sites you visit.</p>

          <h3>Social Media Integration</h3>
          <p>If you connect social media accounts:</p>
          <ul>
            <li>We may receive information from those platforms per their policies</li>
            <li>You can control what information is shared through platform settings</li>
            <li>Social platforms may collect information about your use of our services</li>
            <li>We are not responsible for social media platform privacy practices</li>
          </ul>

          <h3>Analytics & Advertising Services</h3>
          <p>We use third-party services like:</p>
          <ul>
            <li><strong>Google Analytics:</strong> To analyze website traffic and usage</li>
            <li><strong>Advertising Networks:</strong> To display relevant advertisements</li>
            <li><strong>Tag Managers:</strong> To manage tracking codes</li>
          </ul>
          <p>These services have their own privacy policies and may collect data independently. You can opt-out of many through industry opt-out tools or browser settings.</p>

          <h3>Payment Processors</h3>
          <p>Payment processing is handled by third-party providers who maintain their own privacy practices. We do not receive or store complete credit card information.</p>
        </>
      )
    },
    {
      title: "Changes to This Policy",
      icon: <FileText size={24} />,
      content: (
        <>
          <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.</p>

          <h3>How We Notify You</h3>
          <p>When we make changes, we will:</p>
          <ul>
            <li>Update the "Last Updated" date at the top of this policy</li>
            <li>Post the revised policy on our website</li>
            <li>Notify you via email if changes are material (for registered users)</li>
            <li>Display a prominent notice on our platform for significant changes</li>
            <li>Provide at least 30 days' notice for material changes affecting your rights</li>
          </ul>

          <h3>What Constitutes Material Changes</h3>
          <p>Material changes include:</p>
          <ul>
            <li>Changes in how we use your personal information</li>
            <li>New categories of information we collect</li>
            <li>Changes in how we share your information</li>
            <li>Reduction of your privacy rights or protections</li>
            <li>Changes to data retention periods</li>
          </ul>

          <h3>Your Acceptance</h3>
          <p>By continuing to use Small Sided services after changes take effect, you accept the updated Privacy Policy. If you do not agree with changes:</p>
          <ul>
            <li>Stop using our services</li>
            <li>Close your account</li>
            <li>Contact us to discuss your concerns</li>
          </ul>

          <h3>Version History</h3>
          <p>Previous versions of this policy may be available upon request. Contact privacy@smallsided.com to request historical versions.</p>
        </>
      )
    },
    {
      title: "Contact Us",
      icon: <Mail size={24} />,
      content: (
        <>
          <p>If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:</p>

          <div className={styles.contactGrid}>
            <div className={styles.contactCard}>
              <Mail size={24} />
              <h4>Email</h4>
              <p><a href="mailto:privacy@smallsided.com">privacy@smallsided.com</a></p>
              <span>For privacy-specific inquiries</span>
            </div>

            <div className={styles.contactCard}>
              <Mail size={24} />
              <h4>General Support</h4>
              <p><a href="mailto:support@smallsided.com">support@smallsided.com</a></p>
              <span>For general questions and support</span>
            </div>
          </div>

          <div className={styles.addressSection}>
            <h4>Mailing Address</h4>
            <p>
              Small Sided, LLC<br />
              Privacy Department<br />
              [Your Street Address]<br />
              [City, State ZIP Code]<br />
              United States
            </p>
          </div>

          <h3>Response Times</h3>
          <ul>
            <li>Privacy inquiries: Within 30 days</li>
            <li>Data access requests: Within 30 days</li>
            <li>Deletion requests: Within 30 days (after verification)</li>
            <li>General support: Within 48 hours</li>
          </ul>

          <h3>What to Include in Your Request</h3>
          <p>To help us process your request efficiently, please include:</p>
          <ul>
            <li>Your full name and email address associated with your account</li>
            <li>A clear description of your request or concern</li>
            <li>Any relevant account or transaction details</li>
            <li>Verification information (we may request additional proof of identity)</li>
          </ul>

          <div className={styles.regulatorySection}>
            <h4>Regulatory Authorities</h4>
            <p>If you are not satisfied with our response to your privacy concerns, you have the right to lodge a complaint with your local data protection authority:</p>
            <ul>
              <li><strong>EU Residents:</strong> Contact your national Data Protection Authority</li>
              <li><strong>UK Residents:</strong> Information Commissioner's Office (ICO)</li>
              <li><strong>California Residents:</strong> California Attorney General's Office</li>
            </ul>
          </div>
        </>
      )
    }
  ];

  return (
    <div className={styles.privacyPolicy}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <HatGlasses size={48} />
          </div>
          <h1>Privacy Policy</h1>
          <p className={styles.lastUpdated}>Last Updated: January 21, 2026</p>
          <p className={styles.headerDescription}>
            At Small Sided, we take your privacy seriously. This Privacy Policy explains how we collect, use, share, and protect your personal information when you use our services. Please read this policy carefully to understand our practices.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        {sections.map((section, index) => (
          <div key={index} className={styles.accordionItem}>
            <button
              className={`${styles.accordionHeader} ${openAccordion === index ? styles.active : ''}`}
              onClick={() => toggleAccordion(index)}
            >
              <div className={styles.accordionTitle}>
                <div className={styles.accordionIconWrap}>{section.icon}</div>
                <h2>{section.title}</h2>
              </div>
              <ChevronDown className={styles.accordionIcon} />
            </button>
            {openAccordion === index && (
              <div className={styles.accordionContent}>
                {section.content}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <HatGlasses size={32} />
          <h3>Your Privacy Matters</h3>
          <p>
            We're committed to protecting your personal information and being transparent about our practices. 
            If you have any questions or concerns, please don't hesitate to contact us at{' '}
            <a href="mailto:privacy@smallsided.com">privacy@smallsided.com</a>
          </p>
          <p className={styles.lastUpdatedFooter}>Last Updated: January 21, 2026</p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;