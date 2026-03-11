import { ReactNode, useState, useEffect, useRef } from 'react';
import { LucideIcon } from '../../../components/Icons/Icons';
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
  variant?: 'paid' | 'pending' | 'cancelled' | 'confirmed' | 'active' | 'completed' | 'refunded' | 'failed';
}

export const StatusBadge = ({ status, variant }: StatusBadgeProps) => {
  const getStatusClass = () => {
    const statusLower = status.toLowerCase();

    const inferredVariant = variant || (
      statusLower.includes('paid') || statusLower.includes('confirmed') || statusLower.includes('active')
        ? 'paid'
        : statusLower.includes('pending')
          ? 'pending'
          : statusLower.includes('cancel') || statusLower.includes('failed')
            ? 'cancelled'
            : statusLower.includes('completed')
              ? 'completed'       // ← fixed: completed is no longer cancelled
              : statusLower.includes('refunded')
                ? 'refunded'
                : 'pending'
    );

    const variantClasses: Record<string, string> = {
      paid:      styles.statusConfirmed,  // green
      confirmed: styles.statusConfirmed,
      active:    styles.statusConfirmed,
      pending:   styles.statusPending,    // amber
      cancelled: styles.statusCancelled,  // red
      failed:    styles.statusCancelled,
      completed: styles.statusCompleted,  // blue — distinct from cancelled
      refunded:  styles.statusCompleted,
    };

    return `${styles.statusBadge} ${variantClasses[inferredVariant] || styles.statusPending}`;
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
        year: 'numeric', month: 'long', day: 'numeric',
      });
      break;
    case 'time':
      formatted = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
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

// ─── Inline Status Badge ──────────────────────────────────────────────────────
// A clickable status badge that opens a popover with valid next statuses.
// Only renders as clickable when onStatusChange is provided and transitions exist.

import { ChevronDown } from '../../../components/Icons/Icons';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'no_show' | 'cancelled';

const STATUS_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending:   ['confirmed', 'cancelled'],
  confirmed: ['completed', 'no_show', 'cancelled'],
  completed: [],
  no_show:   ['confirmed'],
  cancelled: ['confirmed'],
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending:   'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  no_show:   'No Show',
  cancelled: 'Cancelled',
};

interface InlineStatusBadgeProps {
  status: string;
  onStatusChange?: (newStatus: BookingStatus) => void;
  disabled?: boolean;
}

export const InlineStatusBadge = ({ status, onStatusChange, disabled }: InlineStatusBadgeProps) => {
  const [open, setOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const btnRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const currentStatus = status as BookingStatus;
  const transitions = STATUS_TRANSITIONS[currentStatus] ?? [];
  const isClickable = !!onStatusChange && transitions.length > 0 && !disabled;

  // Calculate position using fixed coordinates to prevent overflow
  const calculatePosition = () => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const popoverWidth = 180;
    const popoverHeight = transitions.length * 44;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Horizontal: align left by default, flip right if it would overflow
    let left = rect.left;
    if (left + popoverWidth > viewportWidth - 12) {
      left = rect.right - popoverWidth;
    }

    // Vertical: open downward by default, flip upward if it would overflow
    let top = rect.bottom + 4;
    if (top + popoverHeight > viewportHeight - 12) {
      top = rect.top - popoverHeight - 4;
    }

    setPopoverStyle({ position: 'fixed', top, left, width: popoverWidth });
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        popoverRef.current && !popoverRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape or scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onScroll = () => setOpen(false);
    document.addEventListener('keydown', onKey);
    document.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  if (!isClickable) {
    return <StatusBadge status={status} />;
  }

  return (
    <div className={styles.inlineStatusWrap}>
      <button
        ref={btnRef}
        className={styles.inlineStatusBtn}
        onClick={(e) => {
          e.stopPropagation();
          if (!open) calculatePosition();
          setOpen(o => !o);
        }}
        title="Change status"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <StatusBadge status={status} />
        <ChevronDown size={12} className={styles.inlineStatusChevron} />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className={styles.inlineStatusPopover}
          style={popoverStyle}
          role="menu"
        >
          {transitions.map(next => (
            <button
              key={next}
              className={styles.inlineStatusOption}
              role="menuitem"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                onStatusChange(next);
              }}
            >
              <StatusBadge status={next} />
              <span className={styles.inlineStatusLabel}>{STATUS_LABELS[next]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
