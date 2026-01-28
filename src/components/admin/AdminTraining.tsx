import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import styles from './AdminTable.module.scss';

const AdminTraining = () => {
  console.log('🚀 AdminTraining component loaded!');
  
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    console.log('🔍 useEffect is running...');
    fetchRegistrations(); 
  }, []);

  const checkAuth = async () => {
    console.log('🔐 Checking authentication...');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 Current user:', user);
    console.log('📧 User email:', user?.email);
    console.log('🆔 User ID:', user?.id);
    alert(`Logged in as: ${user?.email || 'NOT LOGGED IN'}\nUser ID: ${user?.id || 'NONE'}`);
  };

  const fetchRegistrations = async () => {
    console.log('📡 Starting to fetch training registrations...');
    
    // Check auth first
    const { data: { user } } = await supabase.auth.getUser();
    console.log('👤 User during fetch:', user?.email);
    
    try {
      const { data, error } = await supabase
        .from('training_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('📊 Supabase response:', { data, error, dataLength: data?.length });
      
      if (error) {
        console.error('❌ Error fetching training registrations:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
      } else {
        console.log('✅ Successfully fetched data, setting registrations...');
        setRegistrations(data || []);
      }
    } catch (error) {
      console.error('💥 Catch error:', error);
    } finally {
      console.log('🏁 Finished fetching, setting isLoading to false');
      setIsLoading(false);
    }
  };

  console.log('🔢 Current state:', { registrationsCount: registrations.length, isLoading });

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
        <h1>Training Registrations (Debug Mode)</h1>
        <p>{registrations.length} registration{registrations.length !== 1 ? 's' : ''} found</p>
        <button onClick={checkAuth} style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer' }}>
          Check Authentication
        </button>
      </div>

      <div className={styles.tableWrapper}>
        {registrations.length === 0 ? (
          <p>No training registrations found in database.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Player Name</th>
                <th>Parent Email</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id}>
                  <td>{reg.id.substring(0, 8)}...</td>
                  <td>{reg.player_name}</td>
                  <td>{reg.parent_email}</td>
                  <td>{new Date(reg.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminTraining;