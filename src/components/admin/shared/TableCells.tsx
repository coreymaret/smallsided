import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import styles from '../AdminTable.module.scss';

// Cell with icon
interface CellWithIconProps {
  icon: LucideIcon;
  children: ReactNode;
  iconSize?: number;
}

export const CellWithIcon = ({ icon: Icon, children, iconSize = 16 }: CellWithIconProps) => (
  <div className={styles.cellWithIcon}>
    <Icon size={iconSize} />
    {children}
  </div>
);

// Contact cell (email + phone)
interface ContactCellProps {
  email: string;
  phone: string;
}

export const ContactCell = ({ email, phone }: ContactCellProps) => (
  <div className={styles.contactCell}>
    <div>{email}</div>
    <div className={styles.phoneNumber}>{phone}</div>
  </div>
);

// Status badge
interface StatusBadgeProps {
  status: string;
  variant?: 'paid' | 'pending' | 'cancelled' | 'confirmed' | 'active' | 'completed';
}

export const StatusBadge = ({ status, variant }: StatusBadgeProps) => {
  const getStatusClass = () => {
    // Try to infer variant from status text if not provided
    const statusLower = status.toLowerCase();
    const inferredVariant = variant || (
      statusLower.includes('paid') || statusLower.includes('confirmed') || statusLower.includes('active') ? 'paid' :
      statusLower.includes('pending') ? 'pending' :
      statusLower.includes('cancel') || statusLower.includes('completed') ? 'cancelled' :
      'pending'
    );

    const variantClasses = {
      paid: styles.statusPaid,
      confirmed: styles.statusPaid,
      active: styles.statusPaid,
      pending: styles.statusPending,
      cancelled: styles.statusCancelled,
      completed: styles.statusCancelled,
    };

    return `${styles.statusBadge} ${variantClasses[inferredVariant] || ''}`;
  };

  return (
    <span className={getStatusClass()}>
      {status}
    </span>
  );
};

// Currency cell
interface CurrencyCellProps {
  amount: number;
  currency?: string;
  showIcon?: boolean;
}

export const CurrencyCell = ({ amount, currency = 'USD', showIcon = false }: CurrencyCellProps) => {
  const formatted = currency === 'USD' ? `$${amount.toFixed(2)}` : `${amount.toFixed(2)} ${currency}`;
  
  if (showIcon) {
    return (
      <div className={styles.cellWithIcon}>
        <span>$</span>
        {amount.toFixed(2)}
      </div>
    );
  }
  
  return <>{formatted}</>;
};

// Date cell
interface DateCellProps {
  date: string | Date;
  format?: 'short' | 'long' | 'time';
  showIcon?: boolean;
  icon?: LucideIcon;
}

export const DateCell = ({ date, format = 'short', showIcon, icon: Icon }: DateCellProps) => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  let formatted: string;
  switch (format) {
    case 'long':
      formatted = dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      break;
    case 'time':
      formatted = dateObj.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
      break;
    default:
      formatted = dateObj.toLocaleDateString();
  }
  
  if (showIcon && Icon) {
    return (
      <div className={styles.cellWithIcon}>
        <Icon size={16} />
        {formatted}
      </div>
    );
  }
  
  return <>{formatted}</>;
};

// Array cell (for displaying lists)
interface ArrayCellProps {
  items: string[];
  separator?: string;
  maxItems?: number;
}

export const ArrayCell = ({ items, separator = ', ', maxItems }: ArrayCellProps) => {
  if (!items || items.length === 0) return <>—</>;
  
  const displayItems = maxItems ? items.slice(0, maxItems) : items;
  const hasMore = maxItems && items.length > maxItems;
  
  return (
    <>
      {displayItems.join(separator)}
      {hasMore && ` +${items.length - maxItems} more`}
    </>
  );
};
