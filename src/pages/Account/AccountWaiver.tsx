// src/pages/Account/AccountWaiver.tsx
import { useEffect, useState } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import { supabase } from '../../lib/supabase';
import WaiverModal from '../../components/WaiverModal/WaiverModal';
import { Check, FileText } from '../../components/Icons/Icons';
import styles from './AccountWaiver.module.scss';

interface WaiverSig {
  id: string;
  signed_at: string;
  service_type: string | null;
  waiver_version: number;
  signature_data: string;
}

const AccountWaiver = () => {
  const { user, profile } = useAccount();
  const [signatures, setSignatures] = useState<WaiverSig[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [justSigned, setJustSigned] = useState(false);

  useEffect(() => { if (user) fetchSignatures(); }, [user]);

  const fetchSignatures = async () => {
    setIsLoading(true);
    const { data } = await (supabase as any)
      .from('waiver_signatures')
      .select('id, signed_at, service_type, waiver_version, signature_data')
      .eq('customer_email', user!.email)
      .order('signed_at', { ascending: false });
    setSignatures(data ?? []);
    setIsLoading(false);
  };

  const handleSigned = () => {
    setShowModal(false);
    setJustSigned(true);
    fetchSignatures();
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });

  const hasSigned = signatures.length > 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Waiver</h1>
        <button className={styles.signBtn} onClick={() => setShowModal(true)}>
          {hasSigned ? 'Re-sign Waiver' : 'Sign Waiver'}
        </button>
      </div>

      {justSigned && (
        <div className={styles.successBanner}>
          <Check size={16} /> Waiver signed successfully.
        </div>
      )}

      <div className={styles.statusCard}>
        <div className={styles.statusIcon} data-signed={hasSigned}>
          {hasSigned ? <Check size={24} /> : <FileText size={24} />}
        </div>
        <div>
          <div className={styles.statusTitle}>
            {hasSigned ? 'Waiver on file' : 'No waiver signed yet'}
          </div>
          <div className={styles.statusSub}>
            {hasSigned
              ? `Last signed ${fmtDate(signatures[0].signed_at)}`
              : 'Sign the waiver to participate in Small Sided activities.'}
          </div>
        </div>
      </div>

      {signatures.length > 0 && (
        <div className={styles.section}>
          <h2>Signature History</h2>
          <div className={styles.sigList}>
            {signatures.map(s => (
              <div key={s.id} className={styles.sigRow}>
                <div className={styles.sigInfo}>
                  <span className={styles.sigDate}>{fmtDate(s.signed_at)}</span>
                  {s.service_type && (
                    <span className={styles.sigService}>{s.service_type}</span>
                  )}
                  <span className={styles.sigVersion}>v{s.waiver_version}</span>
                </div>
                <img src={s.signature_data} alt="Signature" className={styles.sigImage} />
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <WaiverModal
          customerName={profile?.full_name ?? user?.email ?? ''}
          customerEmail={user?.email ?? ''}
          serviceType="account"
          onSign={handleSigned}
          onSkip={() => setShowModal(false)}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AccountWaiver;
