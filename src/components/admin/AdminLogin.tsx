import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { AlertCircle } from '../../components/Icons/Icons';
import Logo from '../../assets/logo.svg';
import styles from './AdminLogin.module.scss';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{ email?: string }>({});

  const validateEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user || !authData.session) throw new Error('Login failed. Please try again.');

      await supabase.auth.setSession({
        access_token: authData.session.access_token,
        refresh_token: authData.session.refresh_token,
      });

      console.log('Auth user id:', authData.user.id);
      console.log('Auth user email:', authData.user.email);

      const { data: testQuery, error: testError } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('id', authData.user.id);

      console.log('Test query result:', testQuery);
      console.log('Test query error:', testError);

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id, role, is_active')
        .eq('id', authData.user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (adminError) {
        await supabase.auth.signOut();
        throw new Error('Unable to verify admin access. Please try again.');
      }

      if (!adminUser) {
        await supabase.auth.signOut();
        throw new Error('You do not have admin access.');
      }

      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (validationErrors.email && validateEmail(newEmail)) {
      setValidationErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handleEmailBlur = () => {
    if (email && !validateEmail(email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.headerSection}>
          <div className={styles.logo}>
            <img src={Logo} alt="Small Sided Logo" width="180" height="40" />
          </div>
        </div>

        <div className={styles.cardContent}>
          <div className={styles.header}>
            <h2 className={styles.title}>Admin Login</h2>
            <p className={styles.subtitle}>Sign in to access the admin dashboard</p>
          </div>

          {error && (
            <div className={styles.error}>
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                id="email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="Email Address"
                required
                disabled={isLoading}
                className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
              />
              <label htmlFor="email" className={`${styles.floatingLabel} ${email ? styles.active : ''}`}>
                Email Address *
              </label>
              {validationErrors.email && (
                <span className={styles.errorMessage}>{validationErrors.email}</span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={isLoading}
                className={styles.input}
              />
              <label htmlFor="password" className={`${styles.floatingLabel} ${password ? styles.active : ''}`}>
                Password *
              </label>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className={styles.spinner} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p>Forgot your password? Contact the super admin.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;