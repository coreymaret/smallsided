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

  const fetchRegistrations = async () => {
    console.log('📡 Starting to fetch training registrations...');
    
    try {
      const { data, error } = await supabase
        .from('training_registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      console.log('📊 Supabase response:', { data, error, dataLength: data?.length });
      
      if (error) {
        console.error('❌ Error fetching training registrations:', error);
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