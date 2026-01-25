import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import styles from './AdminLogin.module.scss';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('🔐 Starting login for:', email);
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('✅ Auth response:', { authData, authError });

      if (authError) {
        throw new Error(authError.message);
      }

      console.log('👤 Checking admin status for:', email);

      // Verify user is an admin
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .eq('is_active', true)
        .maybeSingle();

      console.log('📋 Admin query result:', { adminUser, adminError });

      if (adminError) {
        console.error('❌ Admin query error:', adminError);
        await supabase.auth.signOut();
        throw new Error(`Database error: ${adminError.message}`);
      }

      if (!adminUser) {
        console.error('❌ No admin user found for:', email);
        await supabase.auth.signOut();
        throw new Error('You do not have admin access');
      }

      console.log('✅ Admin user found:', adminUser);
      console.log('🎉 Login successful! Redirecting to /admin');
      
      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('💥 Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>⚽</div>
            <h1>Small Sided Admin</h1>
          </div>
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
            <label htmlFor="email">
              <Mail size={18} />
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password">
              <Lock size={18} />
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
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
  );
};

export default AdminLogin;
