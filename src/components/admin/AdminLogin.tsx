import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import styles from './AdminLogin.module.scss';

type AdminUser = Database['public']['Tables']['admin_users']['Row'];

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
      // Sign in with Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      // Verify user is an admin
      // Get the current session to verify we're authenticated
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  throw new Error('Authentication failed');
}

// Verify user is an admin - use the authenticated session
const { data: adminUser, error: adminError } = await supabase
  .from('admin_users')
  .select('*')
  .eq('email', email)
  .eq('is_active', true)
  .maybeSingle();  // Use maybeSingle() instead of single()

if (adminError) {
  console.error('Admin check error:', adminError);
  await supabase.auth.signOut();
  throw new Error('Error checking admin access');
}

if (!adminUser) {
  await supabase.auth.signOut();
  throw new Error('You do not have admin access');
}

      // Type assertion since we know the structure
      const admin = adminUser as AdminUser;

      // Update last login time
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase.from('admin_users') as any)
        .update({ last_login: new Date().toISOString() })
        .eq('id', admin.id);
      
      // Redirect to admin dashboard
      navigate('/admin');
    } catch (err) {
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
              placeholder="admin@smallsided.com"
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