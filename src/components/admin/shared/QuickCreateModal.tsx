// src/components/admin/shared/QuickCreateModal.tsx
import { useState, useEffect } from 'react';
import { X, ChevronDown } from '../../../components/Icons/Icons';
import type { ToastType } from '../../../hooks/useToast';
import styles from './QuickCreateModal.module.scss';

type ServiceType = 'field_rental' | 'pickup' | 'birthday' | 'camp' | 'training' | 'league';

interface QuickCreateModalProps {
  defaultFieldId: string;
  defaultTime: string;
  defaultDate: string;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (message: string, type?: ToastType) => void;
}

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'field_rental', label: 'Field Rental'        },
  { value: 'pickup',       label: 'Pickup Game'         },
  { value: 'birthday',     label: 'Birthday Party'      },
  { value: 'camp',         label: 'Camp'                },
  { value: 'training',     label: 'Training'            },
  { value: 'league',       label: 'League Registration' },
];

const FIELDS = [
  { id: 'field-1', name: 'Camp Nou'     },
  { id: 'field-2', name: 'Old Trafford' },
  { id: 'field-3', name: 'San Siro'     },
];

const TIME_OPTIONS = Array.from({ length: 28 }, (_, i) => {
  const totalMins = 10 * 60 + i * 30;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  const value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  const label = `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  return { value, label };
});

// ─── Sub-components ───────────────────────────────────────────────────────────

const Input = ({ label, required, error, ...props }: {
  label: string; required?: boolean; error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className={styles.field}>
    <label className={styles.label}>{label}{required && <span className={styles.req}>*</span>}</label>
    <input className={`${styles.input} ${error ? styles.inputError : ''}`} {...props} />
    {error && <span className={styles.fieldError}>{error}</span>}
  </div>
);

const Select = ({ label, required, children, ...props }: {
  label: string; required?: boolean; children: React.ReactNode;
} & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className={styles.field}>
    <label className={styles.label}>{label}{required && <span className={styles.req}>*</span>}</label>
    <div className={styles.selectWrap}>
      <select className={styles.select} {...props}>{children}</select>
      <ChevronDown size={14} className={styles.selectChevron} />
    </div>
  </div>
);

const Textarea = ({ label, ...props }: {
  label: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className={styles.field}>
    <label className={styles.label}>{label}</label>
    <textarea className={styles.textarea} rows={3} {...props} />
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const QuickCreateModal = ({
  defaultFieldId,
  defaultTime,
  defaultDate,
  onClose,
  onSuccess,
  showToast,
}: QuickCreateModalProps) => {
  const [service, setService]             = useState<ServiceType>('field_rental');
  const [isSubmitting, setIsSubmitting]   = useState(false);
  const [errors, setErrors]               = useState<Record<string, string>>({});

  // Common fields
  const [customerName, setCustomerName]   = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [bookingDate, setBookingDate]     = useState(defaultDate);
  const [startTime, setStartTime]         = useState(defaultTime);
  const [endTime, setEndTime]             = useState('');
  const [fieldId, setFieldId]             = useState(defaultFieldId);
  const [participants, setParticipants]   = useState('');
  const [totalAmount, setTotalAmount]     = useState('');
  const [notes, setNotes]                 = useState('');

  // Service-specific
  const [childName, setChildName]               = useState('');
  const [childAge, setChildAge]                 = useState('');
  const [campType, setCampType]                 = useState('');
  const [packageType, setPackageType]           = useState('');
  const [format, setFormat]                     = useState('7v7');
  const [teamName, setTeamName]                 = useState('');
  const [ageDivision, setAgeDivision]           = useState('');
  const [skillLevel, setSkillLevel]             = useState('beginner');
  const [trainingType, setTrainingType]         = useState('individual');
  const [playerName, setPlayerName]             = useState('');
  const [playerAge, setPlayerAge]               = useState('');
  const [preferredTime, setPreferredTime]       = useState('morning');
  const [focusAreas, setFocusAreas]             = useState<string[]>([]);
  const [preferredDays, setPreferredDays]       = useState<string[]>([]);
  const [medicalNotes, setMedicalNotes]         = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Escape key + body scroll lock
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!customerName.trim())  errs.customerName  = 'Name is required';
    if (!customerPhone.trim()) errs.customerPhone  = 'Phone is required';
    if (!bookingDate)          errs.bookingDate    = 'Date is required';
    if (service === 'training' && !playerName.trim()) errs.playerName = 'Player name is required';
    if (service === 'league'   && !teamName.trim())   errs.teamName   = 'Team name is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    // Dynamic import to avoid top-level Supabase import issues with TypeScript generics
    const { supabase } = await import('../../../lib/supabase');

    try {
      if (service === 'training') {
        const { error } = await (supabase as any).from('training_registrations').insert({
          training_type:  trainingType,
          player_name:    playerName,
          player_age:     parseInt(playerAge) || 0,
          parent_name:    customerName,
          parent_email:   customerEmail,
          parent_phone:   customerPhone,
          skill_level:    skillLevel,
          focus_areas:    focusAreas,
          preferred_days: preferredDays,
          preferred_time: preferredTime,
          additional_info: notes || null,
          total_amount:   parseFloat(totalAmount) || 0,
          status:         'pending',
        });
        if (error) throw error;

      } else if (service === 'league') {
        const { error } = await (supabase as any).from('league_registrations').insert({
          league_id:        '00000000-0000-0000-0000-000000000000',
          team_name:        teamName,
          captain_name:     customerName,
          captain_email:    customerEmail,
          captain_phone:    customerPhone,
          age_division:     ageDivision || 'Open',
          skill_level:      skillLevel,
          players:          [],
          total_amount:     parseFloat(totalAmount) || 0,
          payment_status:   'pending',
          waiver_signed:    false,
          additional_notes: notes || null,
        });
        if (error) throw error;

      } else {
        const metadata: Record<string, any> = {};

        if (service === 'birthday') {
          if (childName)   metadata.child_name = childName;
          if (childAge)    metadata.child_age  = parseInt(childAge);
          if (packageType) metadata.package    = packageType;
        }
        if (service === 'camp') {
          if (childName)        metadata.child_name        = childName;
          if (childAge)         metadata.child_age         = parseInt(childAge);
          if (campType)         metadata.camp_type         = campType;
          if (medicalNotes)     metadata.medical_notes     = medicalNotes;
          if (emergencyContact) metadata.emergency_contact = emergencyContact;
        }
        if (service === 'pickup') {
          metadata.format = format;
        }

        const { error } = await (supabase as any).from('bookings').insert({
          booking_type:    service,
          customer_name:   customerName,
          customer_email:  customerEmail,
          customer_phone:  customerPhone,
          booking_date:    bookingDate,
          start_time:      startTime || null,
          end_time:        endTime || null,
          field_id:        ['field_rental', 'pickup'].includes(service) ? fieldId : null,
          participants:    participants ? parseInt(participants) : null,
          total_amount:    parseFloat(totalAmount) || 0,
          payment_status:  'pending',
          booking_status:  'confirmed',
          special_requests: notes || null,
          metadata:        Object.keys(metadata).length > 0 ? metadata : null,
        });
        if (error) throw error;
      }

      onSuccess();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to create booking.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleArray = (arr: string[], setArr: (v: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="New Booking">

        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2>New Booking</h2>
            <p>Phone-in booking — payment collected separately</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Service selector */}
        <div className={styles.serviceBar}>
          {SERVICE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.serviceBtn} ${service === opt.value ? styles.serviceBtnActive : ''}`}
              onClick={() => setService(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className={styles.body}>

          {/* Contact */}
          <div className={styles.section}>
            <h3>Contact</h3>
            <div className={styles.row}>
              <Input
                label="Name" required autoFocus
                value={customerName} onChange={e => setCustomerName(e.target.value)}
                error={errors.customerName} placeholder="Full name"
              />
              <Input
                label="Phone" required type="tel"
                value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                error={errors.customerPhone} placeholder="(555) 555-5555"
              />
            </div>
            <Input
              label="Email" type="email"
              value={customerEmail} onChange={e => setCustomerEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {/* Scheduling */}
          {!['training', 'league'].includes(service) && (
            <div className={styles.section}>
              <h3>Scheduling</h3>
              <div className={styles.row}>
                <Input
                  label="Date" required type="date"
                  value={bookingDate} onChange={e => setBookingDate(e.target.value)}
                  error={errors.bookingDate}
                />
                <Select label="Start Time" value={startTime} onChange={e => setStartTime(e.target.value)}>
                  {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
                <Select label="End Time" value={endTime} onChange={e => setEndTime(e.target.value)}>
                  <option value="">No end time</option>
                  {TIME_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </Select>
              </div>
              {['field_rental', 'pickup'].includes(service) && (
                <Select label="Field" value={fieldId} onChange={e => setFieldId(e.target.value)}>
                  {FIELDS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </Select>
              )}
            </div>
          )}

          {/* Field Rental */}
          {service === 'field_rental' && (
            <div className={styles.section}>
              <h3>Details</h3>
              <div className={styles.row}>
                <Input label="Players" type="number" min="1" value={participants} onChange={e => setParticipants(e.target.value)} placeholder="Number of players" />
                <Input label="Amount ($)" type="number" min="0" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>
          )}

          {/* Pickup */}
          {service === 'pickup' && (
            <div className={styles.section}>
              <h3>Details</h3>
              <div className={styles.row}>
                <Select label="Format" value={format} onChange={e => setFormat(e.target.value)}>
                  {['5v5','6v6','7v7','8v8','9v9','11v11'].map(f => <option key={f} value={f}>{f}</option>)}
                </Select>
                <Input label="Spots" type="number" min="1" value={participants} onChange={e => setParticipants(e.target.value)} placeholder="Number of spots" />
                <Input label="Amount ($)" type="number" min="0" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>
          )}

          {/* Birthday */}
          {service === 'birthday' && (
            <div className={styles.section}>
              <h3>Party Details</h3>
              <div className={styles.row}>
                <Input label="Child's Name" value={childName} onChange={e => setChildName(e.target.value)} placeholder="Birthday child" />
                <Input label="Child's Age" type="number" min="1" value={childAge} onChange={e => setChildAge(e.target.value)} placeholder="Age" />
              </div>
              <div className={styles.row}>
                <Input label="Package" value={packageType} onChange={e => setPackageType(e.target.value)} placeholder="e.g. Basic, Premium" />
                <Input label="Amount ($)" type="number" min="0" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>
          )}

          {/* Camp */}
          {service === 'camp' && (
            <div className={styles.section}>
              <h3>Camp Details</h3>
              <div className={styles.row}>
                <Input label="Child's Name" value={childName} onChange={e => setChildName(e.target.value)} placeholder="Camper name" />
                <Input label="Child's Age" type="number" min="1" value={childAge} onChange={e => setChildAge(e.target.value)} placeholder="Age" />
              </div>
              <div className={styles.row}>
                <Input label="Camp Type" value={campType} onChange={e => setCampType(e.target.value)} placeholder="e.g. Summer, Holiday" />
                <Input label="Amount ($)" type="number" min="0" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" />
              </div>
              <Input label="Medical / Allergy Notes" value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)} placeholder="Any medical conditions or allergies" />
              <Input label="Emergency Contact" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Name and phone number" />
            </div>
          )}

          {/* Training */}
          {service === 'training' && (
            <div className={styles.section}>
              <h3>Training Details</h3>
              <div className={styles.row}>
                <Input label="Player Name" required value={playerName} onChange={e => setPlayerName(e.target.value)} error={errors.playerName} placeholder="Player's full name" />
                <Input label="Player Age" type="number" min="1" value={playerAge} onChange={e => setPlayerAge(e.target.value)} placeholder="Age" />
              </div>
              <div className={styles.row}>
                <Select label="Training Type" value={trainingType} onChange={e => setTrainingType(e.target.value)}>
                  <option value="individual">Individual</option>
                  <option value="small-group">Small Group</option>
                  <option value="position-specific">Position-Specific</option>
                </Select>
                <Select label="Skill Level" value={skillLevel} onChange={e => setSkillLevel(e.target.value)}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </div>
              <div className={styles.row}>
                <Select label="Preferred Time" value={preferredTime} onChange={e => setPreferredTime(e.target.value)}>
                  <option value="morning">Morning (8AM–12PM)</option>
                  <option value="afternoon">Afternoon (12PM–5PM)</option>
                  <option value="evening">Evening (5PM–8PM)</option>
                </Select>
                <Input label="Amount ($)" type="number" min="0" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Focus Areas</label>
                <div className={styles.checkGroup}>
                  {['ball-control','shooting','passing','dribbling','defense','fitness'].map(area => (
                    <label key={area} className={styles.checkLabel}>
                      <input type="checkbox" checked={focusAreas.includes(area)} onChange={() => toggleArray(focusAreas, setFocusAreas, area)} />
                      {area.replace('-', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </label>
                  ))}
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Preferred Days</label>
                <div className={styles.checkGroup}>
                  {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(day => (
                    <label key={day} className={styles.checkLabel}>
                      <input type="checkbox" checked={preferredDays.includes(day)} onChange={() => toggleArray(preferredDays, setPreferredDays, day)} />
                      {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* League */}
          {service === 'league' && (
            <div className={styles.section}>
              <h3>League Details</h3>
              <div className={styles.row}>
                <Input label="Team Name" required value={teamName} onChange={e => setTeamName(e.target.value)} error={errors.teamName} placeholder="Team name" />
                <Input label="Age Division" value={ageDivision} onChange={e => setAgeDivision(e.target.value)} placeholder="e.g. U12, Adult Open" />
              </div>
              <div className={styles.row}>
                <Select label="Skill Level" value={skillLevel} onChange={e => setSkillLevel(e.target.value)}>
                  <option value="beginner">Recreational</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Competitive</option>
                </Select>
                <Input label="Amount ($)" type="number" min="0" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" />
              </div>
            </div>
          )}

          {/* Notes */}
          <div className={styles.section}>
            <Textarea label="Internal Notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any additional notes (staff only)…" />
          </div>

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.paymentNote}>
            💳 Payment status will be set to <strong>Pending</strong> — collect separately
          </div>
          <div className={styles.footerBtns}>
            <button className={styles.cancelBtn} onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
            <button className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create Booking'}
            </button>
          </div>
        </div>

      </div>
    </>
  );
};

export default QuickCreateModal;