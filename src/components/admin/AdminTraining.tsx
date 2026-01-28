import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Calendar, Target, User, Shield, Mail, Phone } from 'lucide-react';
import styles from './AdminTable.module.scss';

interface TrainingRegistration {
  id: string;
  training_type: string;
  player_name: string;
  player_age: number;
  parent_name: string;
  parent_email: string;
  parent_phone: string;
  skill_level: string;
  focus_areas: string[];
  preferred_days: string[];
  preferred_time: string;
  additional_info: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  stripe_payment_intent_id: string;
}

const AdminTraining = () => {
  const [registrations, setRegistrations] = useState<TrainingRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState<TrainingRegistration | null>(null);

  useEffect(() => { 
    fetchRegistrations(); 
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('training_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching training registrations:', error);
      } else {
        setRegistrations(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTrainingType = (type: string) => {
    const types: Record<string, string> = {
      'individual': 'Individual',
      'small-group': 'Small Group',
      'position-specific': 'Position-Specific'
    };
    return types[type] || type;
  };

  const formatSkillLevel = (level: string) => {
    return level.charAt(0).toUpperCase() + level.slice(1);
  };

  const formatFocusAreas = (areas: string[]) => {
    const areaLabels: Record<string, string> = {
      'ball-control': 'Ball Control',
      'shooting': 'Shooting',
      'passing': 'Passing',
      'dribbling': 'Dribbling',
      'defense': 'Defense',
      'fitness': 'Fitness'
    };
    return areas.map(a => areaLabels[a] || a).join(', ');
  };

  const formatDays = (days: string[]) => {
    const dayLabels: Record<string, string> = {
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };
    return days.map(d => dayLabels[d] || d).join(', ');
  };

  const formatTime = (time: string) => {
    const times: Record<string, string> = {
      'morning': 'Morning (8AM-12PM)',
      'afternoon': 'Afternoon (12PM-5PM)',
      'evening': 'Evening (5PM-8PM)'
    };
    return times[time] || time;
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      case 'completed': return styles.statusCompleted;
      default: return styles.statusPending;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading training registrations...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Training Registrations</h1>
        <p>{registrations.length} registration{registrations.length !== 1 ? 's' : ''}</p>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Player</th>
              <th>Age</th>
              <th>Training Type</th>
              <th>Skill Level</th>
              <th>Parent/Guardian</th>
              <th>Contact</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations.length === 0 ? (
              <tr>
                <td colSpan={10} className={styles.emptyState}>
                  No training registrations yet
                </td>
              </tr>
            ) : (
              registrations.map((reg) => (
                <tr key={reg.id}>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <Calendar size={16} />
                      {new Date(reg.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <User size={16} />
                      {reg.player_name}
                    </div>
                  </td>
                  <td>{reg.player_age} yrs</td>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <Target size={16} />
                      {formatTrainingType(reg.training_type)}
                    </div>
                  </td>
                  <td>
                    <div className={styles.cellWithIcon}>
                      <Shield size={16} />
                      {formatSkillLevel(reg.skill_level)}
                    </div>
                  </td>
                  <td>{reg.parent_name}</td>
                  <td>
                    <div className={styles.contactInfo}>
                      <div className={styles.cellWithIcon}>
                        <Mail size={14} />
                        {reg.parent_email}
                      </div>
                      <div className={styles.cellWithIcon}>
                        <Phone size={14} />
                        {reg.parent_phone}
                      </div>
                    </div>
                  </td>
                  <td>${reg.total_amount}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${getStatusClass(reg.status)}`}>
                      {reg.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      className={styles.viewButton}
                      onClick={() => setSelectedRegistration(reg)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedRegistration && (
        <>
          <div 
            className={styles.modalOverlay}
            onClick={() => setSelectedRegistration(null)}
          />
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Training Registration Details</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setSelectedRegistration(null)}
              >
                ×
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.detailSection}>
                <h3>Player Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Player Name:</strong>
                    <span>{selectedRegistration.player_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Age:</strong>
                    <span>{selectedRegistration.player_age} years</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Skill Level:</strong>
                    <span>{formatSkillLevel(selectedRegistration.skill_level)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Training Details</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Training Type:</strong>
                    <span>{formatTrainingType(selectedRegistration.training_type)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Focus Areas:</strong>
                    <span>{formatFocusAreas(selectedRegistration.focus_areas)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Preferred Days:</strong>
                    <span>{formatDays(selectedRegistration.preferred_days)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Preferred Time:</strong>
                    <span>{formatTime(selectedRegistration.preferred_time)}</span>
                  </div>
                </div>
              </div>

              <div className={styles.detailSection}>
                <h3>Parent/Guardian Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Name:</strong>
                    <span>{selectedRegistration.parent_name}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Email:</strong>
                    <span>{selectedRegistration.parent_email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Phone:</strong>
                    <span>{selectedRegistration.parent_phone}</span>
                  </div>
                </div>
              </div>

              {selectedRegistration.additional_info && (
                <div className={styles.detailSection}>
                  <h3>Additional Comments</h3>
                  <p className={styles.additionalInfo}>
                    {selectedRegistration.additional_info}
                  </p>
                </div>
              )}

              <div className={styles.detailSection}>
                <h3>Payment Information</h3>
                <div className={styles.detailGrid}>
                  <div className={styles.detailItem}>
                    <strong>Amount:</strong>
                    <span>${selectedRegistration.total_amount}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Payment ID:</strong>
                    <span className={styles.paymentId}>{selectedRegistration.stripe_payment_intent_id}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Status:</strong>
                    <span className={`${styles.statusBadge} ${getStatusClass(selectedRegistration.status)}`}>
                      {selectedRegistration.status}
                    </span>
                  </div>
                  <div className={styles.detailItem}>
                    <strong>Registered:</strong>
                    <span>{new Date(selectedRegistration.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminTraining;