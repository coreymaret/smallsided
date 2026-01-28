import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Trophy, User } from 'lucide-react';
import styles from './AdminTraining.module.scss';

const AdminLeagues = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchTerm, registrations]);

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('league_registrations')
        .select('*, leagues(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterData = () => {
    let result = [...registrations];
    if (searchTerm) {
      result = result.filter(r =>
        r.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.captain_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.captain_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFiltered(result);
  };

  if (isLoading) return <div className={styles.container}><div className={styles.loading}>Loading...</div></div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div><h1>League Registrations</h1><p>{filtered.length} teams</p></div>
      </div>
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <Search size={18} />
          <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Team</th><th>League</th><th>Captain</th><th>Contact</th><th>Experience</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id}>
                <td><div className={styles.cellWithIcon}><Trophy size={16} />{r.team_name}</div></td>
                <td>{r.age_division}</td>
                <td><div className={styles.cellWithIcon}><User size={16} />{r.captain_name}</div></td>
                <td><div className={styles.contactCell}><div>{r.captain_email}</div><div className={styles.phoneNumber}>{r.captain_phone}</div></div></td>
                <td>{r.skill_level}</td>
                <td>${r.total_amount}</td>
                <td><span className={`${styles.statusBadge} ${styles.statusPaid}`}>{r.payment_status || 'paid'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeagues;