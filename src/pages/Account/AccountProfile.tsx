// src/pages/Account/AccountProfile.tsx
import { useState, useEffect } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import { supabase } from '../../lib/supabase';
import styles from './AccountProfile.module.scss';

const AccountProfile = () => {
  const { user, profile, refreshProfile } = useAccount();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [isSaving, setIsSaving]   = useState(false);
  const [message, setMessage]     = useState<string | null>(null);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? '');
      setLastName(profile.last_name ?? '');
      setPhone(profile.phone ?? '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true); setMessage(null); setError(null);
    try {
      const { error } = await (supabase as any).from('customer_profiles').upsert({
        id: user.id, first_name: firstName, last_name: lastName, phone: phone || null,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      await refreshProfile();
      setMessage('Profile saved.');
    } catch (err: any) {
      setError(err?.message ?? 'Failed to save.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/account/reset-password`,
    });
    setMessage('Password reset link sent to your email.');
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Profile</h1>

      <div className={styles.card}>
        <h2>Personal Information</h2>
        <div className={styles.form}>
          <div className={styles.formRow}>
            <div className={styles.field}>
              <label>First Name</label>
              <input className={styles.input} value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Last Name</label>
              <input className={styles.input} value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input className={styles.input} value={user?.email ?? ''} disabled />
            <span className={styles.hint}>Email cannot be changed here.</span>
          </div>
          <div className={styles.field}>
            <label>Phone</label>
            <input className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" />
          </div>
          {message && <div className={styles.success}>{message}</div>}
          {error   && <div className={styles.error}>{error}</div>}
          <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <h2>Password</h2>
        <p className={styles.cardDesc}>Send a password reset link to your email address.</p>
        <button className={styles.secondaryBtn} onClick={handlePasswordReset}>Send Reset Link</button>
      </div>
    </div>
  );
};

export default AccountProfile;
