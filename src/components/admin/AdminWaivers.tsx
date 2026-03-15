// src/components/admin/AdminWaivers.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Search } from '../../components/Icons/Icons';
import styles from './AdminWaivers.module.scss';

interface WaiverSig {
  id: string;
  customer_name: string;
  customer_email: string;
  signed_at: string;
  service_type: string | null;
  waiver_version: number;
  signature_data: string;
  booking_id: string | null;
}

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric',
  hour: 'numeric', minute: '2-digit',
});

const AdminWaivers = () => {
  const [signatures, setSignatures] = useState<WaiverSig[]>([]);
  const [filtered, setFiltered]     = useState<WaiverSig[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [search, setSearch]         = useState('');
  const [preview, setPreview]       = useState<WaiverSig | null>(null);

  useEffect(() => { fetchSignatures(); }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      signatures.filter(s =>
        s.customer_name.toLowerCase().includes(q) ||
        s.customer_email.toLowerCase().includes(q) ||
        (s.service_type ?? '').toLowerCase().includes(q)
      )
    );
  }, [search, signatures]);

  const fetchSignatures = async () => {
    setIsLoading(true);
    const { data } = await (supabase as any)
      .from('waiver_signatures')
      .select('*')
      .order('signed_at', { ascending: false });
    setSignatures(data ?? []);
    setFiltered(data ?? []);
    setIsLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1>Waivers</h1>
          <p>{signatures.length} signatures on file</p>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input className={styles.searchInput} placeholder="Search by name or email…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No waiver signatures found.</div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Customer</span>
            <span>Service</span>
            <span>Signed</span>
            <span>Version</span>
            <span>Signature</span>
          </div>
          {filtered.map(s => (
            <div key={s.id} className={styles.tableRow} onClick={() => setPreview(s)}>
              <div>
                <div className={styles.name}>{s.customer_name}</div>
                <div className={styles.email}>{s.customer_email}</div>
              </div>
              <div className={styles.service}>{s.service_type ?? '—'}</div>
              <div className={styles.date}>{fmtDate(s.signed_at)}</div>
              <div>v{s.waiver_version}</div>
              <div>
                <img src={s.signature_data} alt="sig" className={styles.sigThumb} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Signature preview modal */}
      {preview && (
        <>
          <div className={styles.previewBackdrop} onClick={() => setPreview(null)} />
          <div className={styles.previewModal}>
            <div className={styles.previewHeader}>
              <h2>{preview.customer_name}</h2>
              <button onClick={() => setPreview(null)}><X size={20} /></button>
            </div>
            <div className={styles.previewBody}>
              <div className={styles.previewMeta}>
                <span><strong>Email:</strong> {preview.customer_email}</span>
                <span><strong>Signed:</strong> {fmtDate(preview.signed_at)}</span>
                <span><strong>Service:</strong> {preview.service_type ?? '—'}</span>
                <span><strong>Version:</strong> v{preview.waiver_version}</span>
              </div>
              <div className={styles.previewSigWrap}>
                <img src={preview.signature_data} alt="Signature" className={styles.previewSig} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminWaivers;
