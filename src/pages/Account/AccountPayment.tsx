// src/pages/Account/AccountPayment.tsx
// Display Stripe saved cards (read-only via Netlify function)
import { useEffect, useState } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import { CreditCard } from '../../components/Icons/Icons';
import styles from './AccountPayment.module.scss';

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  exp_month: number;
  exp_year: number;
}

const BRAND_ICONS: Record<string, string> = {
  visa: '💳', mastercard: '💳', amex: '💳', discover: '💳',
};

const AccountPayment = () => {
  const { user } = useAccount();
  const [cards, setCards]         = useState<SavedCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  useEffect(() => { if (user) fetchCards(); }, [user]);

  const fetchCards = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/.netlify/functions/get-saved-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user!.email }),
      });
      if (!res.ok) throw new Error('Could not load saved cards.');
      const data = await res.json();
      setCards(data.cards ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load payment methods.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Payment Methods</h1>
      <div className={styles.card}>
        <p className={styles.desc}>Cards saved from your previous bookings are shown below. To add a new card, complete a booking using the new card and it will appear here.</p>

        {isLoading ? (
          <div className={styles.loading}>Loading…</div>
        ) : error ? (
          <div className={styles.error}>{error}</div>
        ) : cards.length === 0 ? (
          <div className={styles.empty}>
            <CreditCard size={32} className={styles.emptyIcon} />
            <p>No saved payment methods yet.</p>
            <span>Cards will appear here after you complete a booking.</span>
          </div>
        ) : (
          <div className={styles.cardList}>
            {cards.map(c => (
              <div key={c.id} className={styles.cardRow}>
                <div className={styles.cardIcon}><CreditCard size={20} /></div>
                <div className={styles.cardInfo}>
                  <span className={styles.cardBrand}>{c.brand.charAt(0).toUpperCase() + c.brand.slice(1)}</span>
                  <span className={styles.cardNumber}>•••• •••• •••• {c.last4}</span>
                </div>
                <div className={styles.cardExpiry}>Expires {String(c.exp_month).padStart(2,'0')}/{c.exp_year}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPayment;
