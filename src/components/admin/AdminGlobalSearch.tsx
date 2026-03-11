// src/components/admin/AdminGlobalSearch.tsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, Calendar, Trophy, Users, Cake, Smile, ChartNoAxesCombined, User
} from '../../components/Icons/Icons';
import { useGlobalSearch, type SearchResult, type ServiceType } from '../../hooks/useGlobalSearch';
import styles from './AdminGlobalSearch.module.scss';

interface AdminGlobalSearchProps {
  onClose: () => void;
}

// ─── Service config ────────────────────────────────────────────────────────────
const SERVICE_CONFIG: Record<ServiceType, { label: string; route: string; icon: any; color: string }> = {
  field_rental: { label: 'Field Rentals',    route: '/admin/field-rentals',    icon: Calendar,            color: '#3b82f6' },
  league:       { label: 'Leagues',          route: '/admin/leagues',          icon: Trophy,              color: '#10b981' },
  pickup:       { label: 'Pickup Games',     route: '/admin/pickup',           icon: Users,               color: '#ef4444' },
  birthday:     { label: 'Birthday Parties', route: '/admin/birthday-parties', icon: Cake,                color: '#ec4899' },
  camp:         { label: 'Camps',            route: '/admin/camps',            icon: Smile,               color: '#f59e0b' },
  training:     { label: 'Training',         route: '/admin/training',         icon: ChartNoAxesCombined, color: '#8b5cf6' },
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};

const formatAmount = (amount: number): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

// ─── Result row ───────────────────────────────────────────────────────────────
const ResultRow = ({ result, onClick }: { result: SearchResult; onClick: () => void }) => {
  const config = SERVICE_CONFIG[result.service];
  const Icon = config.icon;

  // For leagues show team name, for training show player name
  const subtitle = result.service === 'league'
    ? result.raw.team_name
    : result.service === 'training'
      ? `Player: ${result.raw.player_name}`
      : result.customerEmail;

  return (
    <button className={styles.resultRow} onClick={onClick}>
      <div className={styles.resultIcon} style={{ background: `${config.color}18`, color: config.color }}>
        <Icon size={16} />
      </div>
      <div className={styles.resultBody}>
        <div className={styles.resultName}>{result.customerName}</div>
        <div className={styles.resultMeta}>
          <span>{subtitle}</span>
          <span className={styles.dot}>·</span>
          <span>{formatDate(result.date)}</span>
          <span className={styles.dot}>·</span>
          <span>{formatAmount(result.amount)}</span>
        </div>
      </div>
      <div className={styles.resultService}>
        <span className={styles.serviceTag} style={{ color: config.color, background: `${config.color}18` }}>
          {config.label}
        </span>
      </div>
    </button>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const AdminGlobalSearch = ({ onClose }: AdminGlobalSearchProps) => {
  const navigate = useNavigate();
  const { query, results, totalResults, isSearching, search, clear } = useGlobalSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleResultClick = (result: SearchResult) => {
    const route = SERVICE_CONFIG[result.service].route;
    navigate(route);
    onClose();
    // Small delay so the page navigates before the palette closes
    // The target page will show the full table — future enhancement: pre-open drawer
  };

  const hasResults = totalResults > 0;
  const showEmpty = query.trim().length >= 2 && !isSearching && !hasResults;
  const showHint = query.trim().length < 2;

  // Collect all results in service order for display
  const orderedServices = Object.keys(SERVICE_CONFIG) as ServiceType[];
  const groupedResults = orderedServices
    .map(service => ({ service, items: results[service] }))
    .filter(g => g.items.length > 0);

  return (
    <div className={styles.overlay} ref={overlayRef} onClick={(e) => {
      if (e.target === overlayRef.current) onClose();
    }}>
      <div className={styles.palette}>
        {/* Search input */}
        <div className={styles.inputRow}>
          <Search size={20} className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            placeholder="Search customers, emails, phone numbers..."
            value={query}
            onChange={e => search(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className={styles.clearBtn} onClick={() => { clear(); inputRef.current?.focus(); }}>
              <X size={16} />
            </button>
          )}
          <button className={styles.escBtn} onClick={onClose}>
            Esc
          </button>
        </div>

        {/* Results area */}
        <div className={styles.results}>
          {isSearching && (
            <div className={styles.state}>
              <div className={styles.spinner} />
              <span>Searching all services...</span>
            </div>
          )}

          {showHint && (
            <div className={styles.hint}>
              <User size={32} className={styles.hintIcon} />
              <p>Search across all services by customer name, email, or phone number.</p>
              <div className={styles.hintTags}>
                {orderedServices.map(s => {
                  const cfg = SERVICE_CONFIG[s];
                  const Icon = cfg.icon;
                  return (
                    <span key={s} className={styles.hintTag} style={{ color: cfg.color, background: `${cfg.color}18` }}>
                      <Icon size={12} />
                      {cfg.label}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {showEmpty && (
            <div className={styles.state}>
              <p className={styles.emptyText}>No results for <strong>"{query}"</strong></p>
              <p className={styles.emptySubtext}>Try a different name, email, or phone number.</p>
            </div>
          )}

          {!isSearching && hasResults && groupedResults.map(({ service, items }) => {
            const config = SERVICE_CONFIG[service];
            const Icon = config.icon;
            return (
              <div key={service} className={styles.group}>
                <div className={styles.groupHeader}>
                  <Icon size={14} style={{ color: config.color }} />
                  <span>{config.label}</span>
                  <span className={styles.groupCount}>{items.length}</span>
                </div>
                {items.map(result => (
                  <ResultRow
                    key={result.id}
                    result={result}
                    onClick={() => handleResultClick(result)}
                  />
                ))}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        {hasResults && (
          <div className={styles.footer}>
            <span>{totalResults} result{totalResults !== 1 ? 's' : ''} across all services</span>
            <span>Click a result to navigate to that page</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGlobalSearch;
