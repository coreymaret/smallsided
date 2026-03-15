// src/components/AccountNavButton/AccountNavButton.tsx
import { Link } from 'react-router-dom';
import { useAccount } from '../../contexts/AccountContext';
import { User } from '../Icons/Icons';
import styles from './AccountNavButton.module.scss';

const AccountNavButton = () => {
  const { isCustomer } = useAccount();

  if (!isCustomer) {
    return (
      <Link to="/account/login" className={styles.btn}>
        <User size={16} />
        <span>Get Started</span>
      </Link>
    );
  }

  return (
    <Link to="/account" className={styles.btn}>
      <User size={16} />
      <span>My Account</span>
    </Link>
  );
};

export default AccountNavButton;