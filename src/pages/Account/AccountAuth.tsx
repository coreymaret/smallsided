// src/pages/Account/AccountAuth.tsx
// Login / signup page with email+password, Google, Facebook
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import styles from './AccountAuth.module.scss';
import Logo from '../../assets/logo.svg';

type Mode = 'login' | 'signup' | 'forgot';

const AccountAuth = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [error, setError]         = useState<string | null>(null);
  const [message, setMessage]     = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailAuth = async () => {
    setError(null);
    setMessage(null);
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setIsLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/account');
      } else if (mode === 'signup') {
        if (!firstName.trim()) { setError('First name is required.'); return; }
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            data: { first_name: firstName, last_name: lastName },
            emailRedirectTo: `${window.location.origin}/account`,
          },
        });
        if (error) throw error;
        setMessage('Check your email to confirm your account.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/account/reset-password`,
        });
        if (error) throw error;
        setMessage('Password reset link sent — check your email.');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (error) setError(error.message);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <img src={Logo} alt="Small Sided" width={140} />
        </div>
        <div className={styles.cardBody}>
          <h1 className={styles.title}>
            {mode === 'login'  && 'Welcome back'}
            {mode === 'signup' && 'Create your account'}
            {mode === 'forgot' && 'Reset your password'}
          </h1>
          <p className={styles.subtitle}>
            {mode === 'login'  && 'Sign in to view your bookings and manage your account.'}
            {mode === 'signup' && 'Join Small Sided to track bookings and manage your family.'}
            {mode === 'forgot' && "Enter your email and we'll send you a reset link."}
          </p>

          {/* OAuth buttons */}
          {mode !== 'forgot' && (
            <div className={styles.oauthGroup}>
              <button className={styles.oauthBtn} onClick={() => handleOAuth('google')} disabled={isLoading}>
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
                </svg>
                Continue with Google
              </button>
              <button className={styles.oauthBtn} onClick={() => handleOAuth('facebook')} disabled={isLoading}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Continue with Facebook
              </button>
            </div>
          )}

          {mode !== 'forgot' && <div className={styles.divider}><span>or</span></div>}

          {/* Email form */}
          <div className={styles.form}>
            {mode === 'signup' && (
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label>First Name *</label>
                  <input className={styles.input} value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" autoFocus />
                </div>
                <div className={styles.inputGroup}>
                  <label>Last Name</label>
                  <input className={styles.input} value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" />
                </div>
              </div>
            )}
            <div className={styles.inputGroup}>
              <label>Email *</label>
              <input type="email" className={styles.input} value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" autoFocus={mode !== 'signup'}
                onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
            </div>
            {mode !== 'forgot' && (
              <div className={styles.inputGroup}>
                <label>Password *</label>
                <input type="password" className={styles.input} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" onKeyDown={e => e.key === 'Enter' && handleEmailAuth()} />
              </div>
            )}

            {error   && <div className={styles.error}>{error}</div>}
            {message && <div className={styles.success}>{message}</div>}

            <button className={styles.submitBtn} onClick={handleEmailAuth} disabled={isLoading}>
              {isLoading ? 'Please wait…' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>
          </div>

          {/* Mode switchers */}
          <div className={styles.footer}>
            {mode === 'login' && (
              <>
                <button className={styles.linkBtn} onClick={() => { setMode('forgot'); setError(null); }}>Forgot password?</button>
                <span>·</span>
                <button className={styles.linkBtn} onClick={() => { setMode('signup'); setError(null); }}>Create account</button>
              </>
            )}
            {mode === 'signup' && (
              <button className={styles.linkBtn} onClick={() => { setMode('login'); setError(null); }}>Already have an account? Sign in</button>
            )}
            {mode === 'forgot' && (
              <button className={styles.linkBtn} onClick={() => { setMode('login'); setError(null); }}>Back to sign in</button>
            )}
          </div>

          <p className={styles.terms}>
            By continuing you agree to our <Link to="/terms-of-service">Terms of Service</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountAuth;