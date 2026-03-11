// src/components/admin/shared/DateFilterBar.tsx
import { type DatePreset, PRESET_LABELS } from '../../../hooks/useDateFilter';
import styles from './DateFilterBar.module.scss';

interface DateFilterBarProps {
  preset: DatePreset;
  onChange: (preset: DatePreset) => void;
  resultCount?: number;
}

const PRESETS: DatePreset[] = ['upcoming', 'today', 'this_week', 'this_month', 'last_month', 'all'];

const DateFilterBar = ({ preset, onChange, resultCount }: DateFilterBarProps) => (
  <div className={styles.bar}>
    <div className={styles.presets}>
      {PRESETS.map(p => (
        <button
          key={p}
          className={`${styles.preset} ${preset === p ? styles.active : ''}`}
          onClick={() => onChange(p)}
        >
          {PRESET_LABELS[p]}
        </button>
      ))}
    </div>
    {resultCount !== undefined && (
      <span className={styles.count}>
        {resultCount} {resultCount === 1 ? 'result' : 'results'}
      </span>
    )}
  </div>
);

export default DateFilterBar;
