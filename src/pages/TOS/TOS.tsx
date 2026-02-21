import React, { useState } from 'react';
import { ChevronDown, Shield, ShieldCheck, Calendar, CreditCard, Camera, Users, AlertCircle, FileText } from '../../components/Icons/Icons';
import styles from './TOS.module.scss';

const TermsOfService: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'services' | 'policies' | 'legal'>('services');
  const [openAccordion, setOpenAccordion] = useState<string | null>('general');

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  // Reset to first accordion of each tab when switching tabs
  const handleTabChange = (tab: 'services' | 'policies' | 'legal') => {
    setActiveTab(tab);
    if (tab === 'services') setOpenAccordion('general');
    else if (tab === 'policies') setOpenAccordion('payment');
    else if (tab === 'legal') setOpenAccordion('waiver');
  };

  return (
    <div className={styles.termsContainer}>
      <div className={styles.termsHero}>
        <div className={styles.heroContent}>
          <div className={styles.iconWrapper}>
            <Shield size={48} />
          </div>
          <h1>Terms of Service</h1>
          <p className={styles.effectiveDate}>Effective Date: January 21, 2026</p>
          <p className={styles.heroDescription}>
            Please read these terms carefully before using Small Sided services. 
            By accessing or using our facilities and services, you agree to be bound by these terms.
          </p>
        </div>
      </div>

      <div className={styles.termsContent}>
        <div className={styles.tabsContainer}>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'services' ? styles.active : ''}`}
              onClick={() => handleTabChange('services')}
            >
              <FileText size={20} />
              Services & Bookings
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'policies' ? styles.active : ''}`}
              onClick={() => handleTabChange('policies')}
            >
              <Shield size={20} />
              Policies & Rights
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'legal' ? styles.active : ''}`}
              onClick={() => handleTabChange('legal')}
            >
              <AlertCircle size={20} />
              Legal & Liability
            </button>
          </div>
        </div>

        {activeTab === 'services' && (
          <div className={styles.tabContent}>
            {/* General Terms */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'general' ? styles.active : ''}`}
                onClick={() => toggleAccordion('general')}
              >
                <div className={styles.accordionTitle}>
                  <Shield size={24} />
                  <h3>General Terms of Use</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'general' && (
                <div className={styles.accordionContent}>
                  <p>
                    Welcome to Small Sided. These Terms of Service ("Terms") govern your use of our soccer facilities, 
                    programs, and services. By accessing our facility or booking any service, you acknowledge that you 
                    have read, understood, and agree to be bound by these Terms.
                  </p>
                  <p>
                    We reserve the right to modify these Terms at any time. Continued use of our services after changes 
                    constitutes acceptance of the modified Terms. It is your responsibility to review these Terms periodically.
                  </p>
                  <div className={styles.highlightBox}>
                    <AlertCircle size={20} />
                    <p>
                      <strong>Age Requirement:</strong> All participants under 18 must have a parent or legal guardian 
                      sign these Terms on their behalf. Parents/guardians assume full responsibility for minors using our facilities.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Field Rentals */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'field-rentals' ? styles.active : ''}`}
                onClick={() => toggleAccordion('field-rentals')}
              >
                <div className={styles.accordionTitle}>
                  <Calendar size={24} />
                  <h3>Field Rentals</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'field-rentals' && (
                <div className={styles.accordionContent}>
                  <h4>Booking & Reservations</h4>
                  <ul>
                    <li>Field rentals must be booked in advance through our online booking system or at the front desk</li>
                    <li>All bookings require a valid credit card and are subject to our cancellation policy</li>
                    <li>Rental times include setup and breakdown; fields must be vacated promptly at the end of your reserved time</li>
                    <li>We reserve the right to reassign fields based on availability and group size</li>
                  </ul>

                  <h4>Field Usage Rules</h4>
                  <ul>
                    <li>Only appropriate soccer footwear is permitted (turf shoes, indoor shoes, or cleats as specified per field)</li>
                    <li>No metal cleats, baseball cleats, or golf shoes allowed on any surface</li>
                    <li>Food and drinks are permitted in designated areas only; no glass containers</li>
                    <li>Maximum number of players per field must be respected for safety reasons</li>
                    <li>Renter is responsible for the conduct of all participants and guests</li>
                  </ul>

                  <h4>Equipment</h4>
                  <p>
                    Standard rental includes field access and goals. Additional equipment (balls, pinnies, cones) 
                    may be available upon request for an additional fee. All borrowed equipment must be returned in 
                    the same condition or replacement fees will apply.
                  </p>
                </div>
              )}
            </div>

            {/* Camps & Training */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'camps-training' ? styles.active : ''}`}
                onClick={() => toggleAccordion('camps-training')}
              >
                <div className={styles.accordionTitle}>
                  <Users size={24} />
                  <h3>Camps & Training Programs</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'camps-training' && (
                <div className={styles.accordionContent}>
                  <h4>Registration & Enrollment</h4>
                  <ul>
                    <li>Registration is not complete until payment is received in full</li>
                    <li>Spaces are limited and filled on a first-come, first-served basis</li>
                    <li>Participants must meet age and skill level requirements for their selected program</li>
                    <li>Medical information and emergency contacts must be provided for all participants</li>
                  </ul>

                  <h4>Program Participation</h4>
                  <ul>
                    <li>Participants must arrive on time and be picked up promptly at the end of sessions</li>
                    <li>All participants must follow coach instructions and facility rules</li>
                    <li>We reserve the right to remove participants whose behavior is disruptive or dangerous</li>
                    <li>Make-up sessions are not provided for participant absences</li>
                  </ul>

                  <h4>Training Sessions</h4>
                  <p>
                    Private and semi-private training sessions require 24-hour advance notice for cancellation. 
                    Training programs are customized to player ability and goals. Progression is not guaranteed 
                    and depends on individual effort, attendance, and natural ability.
                  </p>

                  <div className={styles.highlightBox}>
                    <AlertCircle size={20} />
                    <p>
                      <strong>Weather & Cancellations:</strong> In case of severe weather or facility issues, 
                      we will make every effort to notify participants at least 2 hours before scheduled sessions. 
                      Cancelled sessions will be rescheduled when possible.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Pickup Soccer */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'pickup-soccer' ? styles.active : ''}`}
                onClick={() => toggleAccordion('pickup-soccer')}
              >
                <div className={styles.accordionTitle}>
                  <Users size={24} />
                  <h3>Pickup Soccer Games</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'pickup-soccer' && (
                <div className={styles.accordionContent}>
                  <h4>How It Works</h4>
                  <p>
                    Pickup soccer allows individual players to join scheduled games without needing a full team. 
                    Players are divided into balanced teams by our staff based on skill level and experience.
                  </p>

                  <h4>Registration Requirements</h4>
                  <ul>
                    <li>All players must register and pay in advance online or through our app</li>
                    <li>Minimum number of players required for games to proceed (refunds issued if minimums not met)</li>
                    <li>Players must check in 10 minutes before game time</li>
                    <li>Late arrivals may forfeit their spot if teams are already formed</li>
                  </ul>

                  <h4>Game Conduct</h4>
                  <ul>
                    <li>Respect all players, referees, and facility staff</li>
                    <li>Physical play is expected, but dangerous or aggressive behavior will not be tolerated</li>
                    <li>Players ejected for misconduct will not receive refunds and may be banned from future games</li>
                    <li>Disputes are resolved by facility staff; their decisions are final</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Birthday Parties */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'birthday-parties' ? styles.active : ''}`}
                onClick={() => toggleAccordion('birthday-parties')}
              >
                <div className={styles.accordionTitle}>
                  <Calendar size={24} />
                  <h3>Birthday Parties & Events</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'birthday-parties' && (
                <div className={styles.accordionContent}>
                  <h4>Party Packages</h4>
                  <p>
                    Birthday party packages include field time, party room access, and basic equipment. 
                    Additional options (decorations, food service, extra time) are available for additional fees.
                  </p>

                  <h4>Booking & Requirements</h4>
                  <ul>
                    <li>Parties must be booked at least 2 weeks in advance</li>
                    <li>A non-refundable deposit is required to secure your date</li>
                    <li>Final headcount must be confirmed 48 hours before the party</li>
                    <li>Maximum attendee limits apply based on package selected</li>
                  </ul>

                  <h4>Party Rules</h4>
                  <ul>
                    <li>Host is responsible for all guests and must supervise children at all times</li>
                    <li>Outside food and drinks allowed only with prior approval</li>
                    <li>Party room must be left clean; additional cleaning fees may apply</li>
                    <li>Decorations must be approved in advance (no confetti, glitter, or items that damage walls/floors)</li>
                  </ul>

                  <h4>Party Day</h4>
                  <p>
                    Arrive 15 minutes early for setup. Party time includes setup, activities, and cleanup. 
                    Extended time may be available based on facility schedule for an additional fee.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'policies' && (
          <div className={styles.tabContent}>
            {/* Payment & Pricing */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'payment' ? styles.active : ''}`}
                onClick={() => toggleAccordion('payment')}
              >
                <div className={styles.accordionTitle}>
                  <CreditCard size={24} />
                  <h3>Payment & Pricing</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'payment' && (
                <div className={styles.accordionContent}>
                  <h4>Payment Methods</h4>
                  <p>
                    We accept all major credit cards, debit cards, and digital payment methods. Payment is due 
                    at the time of booking unless otherwise specified for certain programs.
                  </p>

                  <h4>Pricing</h4>
                  <ul>
                    <li>All prices are subject to change without notice</li>
                    <li>Promotional rates and discounts cannot be combined unless explicitly stated</li>
                    <li>Multi-session packages must be used within the specified time period</li>
                    <li>Prices do not include applicable taxes unless stated otherwise</li>
                  </ul>

                  <h4>Deposits & Non-Refundable Fees</h4>
                  <p>
                    Certain services require deposits or non-refundable booking fees. These will be clearly 
                    indicated at the time of booking. Deposits are applied to the final balance.
                  </p>
                </div>
              )}
            </div>

            {/* Cancellation & Refund */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'cancellation' ? styles.active : ''}`}
                onClick={() => toggleAccordion('cancellation')}
              >
                <div className={styles.accordionTitle}>
                  <AlertCircle size={24} />
                  <h3>Cancellation & Refund Policy</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'cancellation' && (
                <div className={styles.accordionContent}>
                  <h4>Field Rentals</h4>
                  <ul>
                    <li><strong>24+ hours notice:</strong> Full refund or credit</li>
                    <li><strong>12-24 hours notice:</strong> 50% refund or full credit</li>
                    <li><strong>Less than 12 hours:</strong> No refund, credit at facility discretion</li>
                  </ul>

                  <h4>Camps & Training Programs</h4>
                  <ul>
                    <li><strong>7+ days before start:</strong> Full refund minus $25 processing fee</li>
                    <li><strong>3-7 days before start:</strong> 50% refund</li>
                    <li><strong>Less than 3 days:</strong> No refund, but may transfer to another session based on availability</li>
                    <li><strong>After program starts:</strong> No refunds for any reason</li>
                  </ul>

                  <h4>Pickup Soccer</h4>
                  <ul>
                    <li><strong>6+ hours notice:</strong> Full credit for future games</li>
                    <li><strong>Less than 6 hours:</strong> No refund or credit</li>
                  </ul>

                  <h4>Birthday Parties</h4>
                  <ul>
                    <li>Deposits are non-refundable</li>
                    <li><strong>14+ days notice:</strong> Reschedule once at no charge</li>
                    <li><strong>7-14 days notice:</strong> Reschedule with $50 fee</li>
                    <li><strong>Less than 7 days:</strong> Forfeit deposit, may reschedule with 50% additional payment</li>
                  </ul>

                  <div className={styles.highlightBox}>
                    <AlertCircle size={20} />
                    <p>
                      <strong>Facility Cancellations:</strong> If we must cancel due to facility issues or weather, 
                      you will receive a full refund or credit. We are not responsible for travel expenses or other costs.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Photography & Social Media */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'photo-rights' ? styles.active : ''}`}
                onClick={() => toggleAccordion('photo-rights')}
              >
                <div className={styles.accordionTitle}>
                  <Camera size={24} />
                  <h3>Photography & Social Media</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'photo-rights' && (
                <div className={styles.accordionContent}>
                  <h4>Photo & Video Release</h4>
                  <p>
                    By using our facilities and services, you grant Small Sided permission to photograph, video record, 
                    and otherwise document activities occurring at our facility. This includes but is not limited to:
                  </p>
                  <ul>
                    <li>Promotional materials (brochures, flyers, advertisements)</li>
                    <li>Social media posts and content (Instagram, Facebook, Twitter, TikTok)</li>
                    <li>Website content and galleries</li>
                    <li>Internal training and evaluation materials</li>
                  </ul>

                  <h4>Usage Rights</h4>
                  <p>
                    You grant Small Sided a perpetual, royalty-free, worldwide license to use, reproduce, modify, 
                    and distribute any photos or videos in which you or your child appears. We may use these materials 
                    for any lawful purpose related to promoting our business and services.
                  </p>

                  <h4>Opt-Out Policy</h4>
                  <p>
                    If you do not wish to be photographed or recorded, or do not want your child to appear in our 
                    promotional materials, you must notify us in writing at registration or check-in. We will make 
                    reasonable efforts to accommodate your request, but cannot guarantee that you or your child will 
                    not appear in group photos or videos.
                  </p>

                  <div className={styles.highlightBox}>
                    <Camera size={20} />
                    <p>
                      <strong>Personal Photography:</strong> Parents and guardians may photograph their own children. 
                      However, photographing other participants without parental consent is prohibited. Please be 
                      respectful of others' privacy.
                    </p>
                  </div>

                  <h4>Social Media Tagging</h4>
                  <p>
                    We encourage you to share your experiences at Small Sided on social media and tag us! However, 
                    please be respectful and obtain permission before posting photos or videos that prominently 
                    feature other participants or their children.
                  </p>
                </div>
              )}
            </div>

            {/* Code of Conduct */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'code-of-conduct' ? styles.active : ''}`}
                onClick={() => toggleAccordion('code-of-conduct')}
              >
                <div className={styles.accordionTitle}>
                  <Shield size={24} />
                  <h3>Code of Conduct</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'code-of-conduct' && (
                <div className={styles.accordionContent}>
                  <h4>Expected Behavior</h4>
                  <p>All participants, parents, and guests are expected to:</p>
                  <ul>
                    <li>Treat all players, staff, and guests with respect and courtesy</li>
                    <li>Use appropriate language at all times</li>
                    <li>Follow all posted facility rules and staff instructions</li>
                    <li>Maintain good sportsmanship in all activities</li>
                    <li>Report any safety concerns or incidents immediately to staff</li>
                  </ul>

                  <h4>Prohibited Behavior</h4>
                  <p>The following will result in immediate removal from the facility without refund:</p>
                  <ul>
                    <li>Physical violence, threats, or intimidation</li>
                    <li>Verbal abuse, harassment, or discriminatory language</li>
                    <li>Intentionally dangerous play or disregard for safety rules</li>
                    <li>Intoxication or drug use on facility premises</li>
                    <li>Theft, vandalism, or destruction of property</li>
                  </ul>

                  <h4>Enforcement</h4>
                  <p>
                    Violations of this Code of Conduct may result in warning, removal from activities, facility ban, 
                    or legal action depending on severity. We reserve the right to refuse service to anyone who 
                    violates these standards.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'legal' && (
          <div className={styles.tabContent}>
            {/* Liability Waiver */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'waiver' ? styles.active : ''}`}
                onClick={() => toggleAccordion('waiver')}
              >
                <div className={styles.accordionTitle}>
                  <AlertCircle size={24} />
                  <h3>Liability Waiver & Assumption of Risk</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'waiver' && (
                <div className={styles.accordionContent}>
                  <h4>Acknowledgment of Risk</h4>
                  <p>
                    Soccer and related activities involve inherent risks including but not limited to: collisions with 
                    other players, contact with equipment, falls, and other physical impacts that may result in serious 
                    injury including broken bones, concussions, sprains, strains, and in rare cases, permanent disability 
                    or death.
                  </p>
                  <p>
                    By participating in any Small Sided activity, you acknowledge that you understand these risks and 
                    voluntarily assume all risks associated with participation, whether known or unknown.
                  </p>

                  <h4>Release of Liability</h4>
                  <p>
                    To the fullest extent permitted by law, you hereby release, waive, discharge, and covenant not to 
                    sue Small Sided, its owners, employees, coaches, agents, and representatives from any and all 
                    liability, claims, demands, actions, and causes of action whatsoever arising out of or related to 
                    any loss, damage, or injury that may be sustained while participating in activities or while on 
                    facility premises.
                  </p>

                  <h4>Indemnification</h4>
                  <p>
                    You agree to indemnify and hold harmless Small Sided from any loss, liability, damage, or costs 
                    (including attorney fees) that may incur due to your participation in activities or your presence 
                    on facility premises, whether caused by negligence or otherwise.
                  </p>

                  <div className={`${styles.highlightBox} ${styles.warning}`}>
                    <AlertCircle size={20} />
                    <p>
                      <strong>Important:</strong> This waiver includes a release of liability and affects your legal 
                      rights. Please read carefully before agreeing to these terms. If you do not agree, you may not 
                      use our facilities or services.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Medical & Emergency */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'medical' ? styles.active : ''}`}
                onClick={() => toggleAccordion('medical')}
              >
                <div className={styles.accordionTitle}>
                  <AlertCircle size={24} />
                  <h3>Medical & Emergency Procedures</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'medical' && (
                <div className={styles.accordionContent}>
                  <h4>Medical Information</h4>
                  <p>
                    Participants are responsible for disclosing any medical conditions, allergies, medications, or 
                    physical limitations that may affect participation. Small Sided is not liable for injuries or 
                    medical emergencies arising from undisclosed conditions.
                  </p>

                  <h4>Medical Consent</h4>
                  <p>
                    In the event of injury or medical emergency, you authorize Small Sided staff to secure emergency 
                    medical treatment. You agree to be financially responsible for any medical expenses incurred. 
                    We will attempt to contact emergency contacts immediately.
                  </p>

                  <h4>Insurance</h4>
                  <p>
                    Participants are responsible for their own health insurance. Small Sided does not provide medical 
                    insurance for participants. We strongly recommend all participants maintain adequate health insurance 
                    coverage.
                  </p>

                  <h4>First Aid</h4>
                  <p>
                    Basic first aid is available on-site for minor injuries. Staff are trained in basic first aid and 
                    CPR, but are not medical professionals. Serious injuries will result in emergency services being called.
                  </p>
                </div>
              )}
            </div>

            {/* Privacy & Data Protection */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'privacy' ? styles.active : ''}`}
                onClick={() => toggleAccordion('privacy')}
              >
                <div className={styles.accordionTitle}>
                  <Shield size={24} />
                  <h3>Privacy & Data Protection</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'privacy' && (
                <div className={styles.accordionContent}>
                  <h4>Information Collection</h4>
                  <p>We collect personal information necessary to provide our services, including:</p>
                  <ul>
                    <li>Contact information (name, email, phone number, address)</li>
                    <li>Payment information (processed securely through third-party payment processors)</li>
                    <li>Medical information and emergency contacts (for program participants)</li>
                    <li>Usage data and facility access logs</li>
                  </ul>

                  <h4>Information Use</h4>
                  <p>We use your information to:</p>
                  <ul>
                    <li>Process bookings and payments</li>
                    <li>Communicate about your reservations and our services</li>
                    <li>Send promotional materials (with your consent)</li>
                    <li>Improve our services and customer experience</li>
                    <li>Comply with legal obligations</li>
                  </ul>

                  <h4>Information Sharing</h4>
                  <p>
                    We do not sell your personal information. We may share information with service providers 
                    (payment processors, email services) necessary to operate our business. We may disclose information 
                    if required by law or to protect our rights and safety.
                  </p>

                  <h4>Data Security</h4>
                  <p>
                    We implement reasonable security measures to protect your information. However, no electronic 
                    transmission or storage is completely secure. You provide information at your own risk.
                  </p>

                  <h4>Your Rights</h4>
                  <p>
                    You have the right to access, correct, or delete your personal information. Contact us at 
                    privacy@smallsided.com to exercise these rights.
                  </p>
                </div>
              )}
            </div>

            {/* Dispute Resolution */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'disputes' ? styles.active : ''}`}
                onClick={() => toggleAccordion('disputes')}
              >
                <div className={styles.accordionTitle}>
                  <FileText size={24} />
                  <h3>Dispute Resolution & Governing Law</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'disputes' && (
                <div className={styles.accordionContent}>
                  <h4>Governing Law</h4>
                  <p>
                    These Terms shall be governed by and construed in accordance with the laws of the state in which 
                    our facility is located, without regard to conflict of law principles.
                  </p>

                  <h4>Arbitration Agreement</h4>
                  <p>
                    Any dispute, claim, or controversy arising out of or relating to these Terms or your use of our 
                    services shall be settled by binding arbitration in accordance with the rules of the American 
                    Arbitration Association. The arbitration shall take place in the county where our facility is located.
                  </p>

                  <h4>Class Action Waiver</h4>
                  <p>
                    You agree to bring claims only in your individual capacity and not as part of any class or 
                    representative action. You waive any right to participate in a class action lawsuit or class-wide 
                    arbitration.
                  </p>

                  <h4>Informal Resolution</h4>
                  <p>
                    Before initiating arbitration, you agree to first contact us to attempt to resolve the dispute 
                    informally. Most concerns can be resolved quickly through direct communication with our management team.
                  </p>
                </div>
              )}
            </div>

            {/* Miscellaneous */}
            <div className={styles.accordionItem}>
              <button
                className={`${styles.accordionHeader} ${openAccordion === 'miscellaneous' ? styles.active : ''}`}
                onClick={() => toggleAccordion('miscellaneous')}
              >
                <div className={styles.accordionTitle}>
                  <FileText size={24} />
                  <h3>Miscellaneous Provisions</h3>
                </div>
                <ChevronDown className={styles.accordionIcon} />
              </button>
              {openAccordion === 'miscellaneous' && (
                <div className={styles.accordionContent}>
                  <h4>Entire Agreement</h4>
                  <p>
                    These Terms constitute the entire agreement between you and Small Sided regarding use of our 
                    services and supersede all prior agreements and understandings.
                  </p>

                  <h4>Severability</h4>
                  <p>
                    If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions 
                    will continue in full force and effect.
                  </p>

                  <h4>Waiver</h4>
                  <p>
                    Our failure to enforce any provision of these Terms does not constitute a waiver of that provision 
                    or our right to enforce it in the future.
                  </p>

                  <h4>Assignment</h4>
                  <p>
                    You may not assign or transfer these Terms or your rights hereunder without our prior written consent. 
                    We may assign these Terms without restriction.
                  </p>

                  <h4>Force Majeure</h4>
                  <p>
                    We are not liable for failure to perform our obligations due to circumstances beyond our reasonable 
                    control, including acts of God, natural disasters, government actions, or other force majeure events.
                  </p>

                  <h4>Contact Information</h4>
                  <p>
                    For questions about these Terms of Service, please contact us at:
                  </p>
                  <div className={styles.contactBox}>
                    <p><strong>Small Sided</strong></p>
                    <p>Email: legal@smallsided.com</p>
                    <p>Phone: (555) 123-4567</p>
                    <p>Address: 123 Soccer Lane, Your City, ST 12345</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.termsFooter}>
          <div className={styles.acknowledgmentBox}>
            <ShieldCheck size={32} />
            <h3>Acknowledgment Required</h3>
            <p>
              By using any Small Sided service, you acknowledge that you have read, understood, and agree to be 
              bound by these Terms of Service. If you do not agree to these terms, you may not use our facilities 
              or services.
            </p>
            <p className={styles.lastUpdated}>Last Updated: January 21, 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;