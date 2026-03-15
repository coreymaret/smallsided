// src/components/admin/AdminLeagueEngine.tsx
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { Trophy, Users, Calendar, ChevronRight, X, Check, Plus } from '../../components/Icons/Icons';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminLeagueEngine.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

type SeasonStatus = 'registration' | 'active' | 'playoffs' | 'completed' | 'cancelled';

interface Season {
  id: string;
  name: string;
  division: string;
  category: string;
  gender: string | null;
  season_start: string | null;
  season_end: string | null;
  max_teams: number;
  status: SeasonStatus;
  match_day: string | null;
  match_time: string | null;
  notes: string | null;
  created_at: string;
  team_count?: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const ADULT_DIVISIONS = ['Men', 'Women', 'Coed', 'Over 30', 'Over 40'];
const YOUTH_DIVISIONS = ['U8', 'U10', 'U12', 'U14', 'U16', 'U18'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STATUS_CONFIG: Record<SeasonStatus, { label: string; bg: string; color: string }> = {
  registration: { label: 'Registration',  bg: '#eff6ff', color: '#1d4ed8' },
  active:       { label: 'Active',        bg: '#f0fdf4', color: '#166534' },
  playoffs:     { label: 'Playoffs',      bg: '#fef3c7', color: '#92400e' },
  completed:    { label: 'Completed',     bg: '#f3f4f6', color: '#6b7280' },
  cancelled:    { label: 'Cancelled',     bg: '#fee2e2', color: '#991b1b' },
};

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: SeasonStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      padding: '0.125rem 0.625rem', borderRadius: 12,
      fontSize: '0.75rem', fontWeight: 700,
    }}>{cfg.label}</span>
  );
};

// ─── Season drawer ────────────────────────────────────────────────────────────

interface SeasonDrawerProps {
  season: Partial<Season> | null;
  isNew: boolean;
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, type?: any) => void;
}

const SeasonDrawer = ({ season, isNew, onClose, onSave, showToast }: SeasonDrawerProps) => {
  const [name, setName]           = useState(season?.name ?? '');
  const [category, setCategory]   = useState(season?.category ?? 'Adult');
  const [division, setDivision]   = useState(season?.division ?? '');
  const [gender, setGender]       = useState(season?.gender ?? '');
  const [start, setStart]         = useState(season?.season_start ?? '');
  const [end, setEnd]             = useState(season?.season_end ?? '');
  const [maxTeams, setMaxTeams]   = useState(season?.max_teams ?? 10);
  const [matchDay, setMatchDay]   = useState(season?.match_day ?? '');
  const [matchTime, setMatchTime] = useState(season?.match_time ?? '');
  const [notes, setNotes]         = useState(season?.notes ?? '');
  const [status, setStatus]       = useState<SeasonStatus>(season?.status ?? 'registration');
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', h); };
  }, [onClose]);

  const divisions = category === 'Adult' ? ADULT_DIVISIONS : YOUTH_DIVISIONS;

  const handleSave = async () => {
    if (!name.trim() || !division) { showToast('Name and division are required.', 'error'); return; }
    setIsSaving(true);
    try {
      const payload = {
        name, category, division,
        gender: category === 'Youth' ? gender : null,
        season_start: start || null, season_end: end || null,
        max_teams: maxTeams, match_day: matchDay || null,
        match_time: matchTime || null, notes: notes || null, status,
      };
      if (isNew) {
        const { error } = await (supabase as any).from('league_seasons').insert(payload);
        if (error) throw error;
        showToast('Season created.', 'success');
      } else {
        const { error } = await (supabase as any).from('league_seasons')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', season?.id);
        if (error) throw error;
        showToast('Season updated.', 'success');
      }
      onSave();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to save.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer} role="dialog">
        <div className={styles.drawerHeader}>
          <div>
            <h2>{isNew ? 'New Season' : 'Edit Season'}</h2>
            {!isNew && <StatusBadge status={status} />}
          </div>
          <button className={styles.drawerClose} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.drawerBody}>
          <section className={styles.section}>
            <h3>Details</h3>
            <div className={styles.formField}>
              <label>Season Name *</label>
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Spring 2026 Men's League" autoFocus />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Category</label>
                <select className={styles.input} value={category}
                  onChange={e => { setCategory(e.target.value); setDivision(''); }}>
                  <option value="Adult">Adult</option>
                  <option value="Youth">Youth</option>
                </select>
              </div>
              <div className={styles.formField}>
                <label>Division *</label>
                <select className={styles.input} value={division} onChange={e => setDivision(e.target.value)}>
                  <option value="">Select…</option>
                  {divisions.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            {category === 'Youth' && (
              <div className={styles.formField}>
                <label>Gender</label>
                <div className={styles.radioGroup}>
                  {['Male', 'Female'].map(g => (
                    <label key={g} className={styles.radioLabel}>
                      <input type="radio" value={g} checked={gender === g} onChange={() => setGender(g)} />
                      {g}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {!isNew && (
              <div className={styles.formField}>
                <label>Status</label>
                <select className={styles.input} value={status} onChange={e => setStatus(e.target.value as SeasonStatus)}>
                  {Object.entries(STATUS_CONFIG).map(([v, cfg]) => (
                    <option key={v} value={v}>{cfg.label}</option>
                  ))}
                </select>
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3>Schedule</h3>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Season Start</label>
                <input type="date" className={styles.input} value={start} onChange={e => setStart(e.target.value)} />
              </div>
              <div className={styles.formField}>
                <label>Season End</label>
                <input type="date" className={styles.input} value={end} onChange={e => setEnd(e.target.value)} min={start} />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Match Day</label>
                <select className={styles.input} value={matchDay} onChange={e => setMatchDay(e.target.value)}>
                  <option value="">Select…</option>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className={styles.formField}>
                <label>Match Time</label>
                <input type="time" className={styles.input} value={matchTime} onChange={e => setMatchTime(e.target.value)} />
              </div>
            </div>
            <div className={styles.formField}>
              <label>Max Teams</label>
              <input type="number" className={styles.input} value={maxTeams}
                onChange={e => setMaxTeams(parseInt(e.target.value) || 10)} min="2" max="32" />
            </div>
          </section>

          <section className={styles.section}>
            <h3>Notes</h3>
            <textarea className={styles.textarea} value={notes} onChange={e => setNotes(e.target.value)}
              rows={3} placeholder="Internal notes…" />
          </section>
        </div>

        <div className={styles.drawerFooter}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={isSaving}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : isNew ? 'Create Season' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

interface AdminLeagueEngineProps {
  onSelectSeason: (season: Season) => void;
}

const AdminLeagueEngine = ({ onSelectSeason }: AdminLeagueEngineProps) => {
  const { can }                             = useAdmin();
  const { toasts, showToast, removeToast } = useToast();
  const [seasons, setSeasons]               = useState<Season[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [drawerSeason, setDrawerSeason]     = useState<Partial<Season> | null>(null);
  const [isNew, setIsNew]                   = useState(false);
  const [filterStatus, setFilterStatus]     = useState<SeasonStatus | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => { fetchSeasons(); }, []);

  const fetchSeasons = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('league_seasons')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Get team counts
      const { data: teams } = await (supabase as any)
        .from('league_teams')
        .select('season_id')
        .eq('status', 'active');

      const countMap: Record<string, number> = {};
      (teams ?? []).forEach((t: any) => {
        countMap[t.season_id] = (countMap[t.season_id] ?? 0) + 1;
      });

      setSeasons((data ?? []).map((s: Season) => ({ ...s, team_count: countMap[s.id] ?? 0 })));
    } catch {
      showToast('Failed to load seasons.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = useCallback(() => {
    setDrawerSeason(null);
    fetchSeasons();
  }, []);

  const filtered = seasons
    .filter(s => filterStatus === 'all' || s.status === filterStatus)
    .filter(s => filterCategory === 'all' || s.category === filterCategory);

  const activeCount = seasons.filter(s => s.status === 'active' || s.status === 'playoffs').length;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.header}>
        <div>
          <h1>League Engine</h1>
          <p>{seasons.length} seasons · {activeCount} currently active</p>
        </div>
        {can('manage_settings') && (
          <button className={styles.addBtn} onClick={() => { setIsNew(true); setDrawerSeason({}); }}>
            + New Season
          </button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        <div className={styles.filterGroup}>
          {(['all', 'registration', 'active', 'playoffs', 'completed', 'cancelled'] as const).map(s => (
            <button key={s}
              className={`${styles.filterBtn} ${filterStatus === s ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterStatus(s)}>
              {s === 'all' ? 'All' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <div className={styles.filterGroup}>
          {['all', 'Adult', 'Youth'].map(c => (
            <button key={c}
              className={`${styles.filterBtn} ${filterCategory === c ? styles.filterBtnActive : ''}`}
              onClick={() => setFilterCategory(c)}>
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className={styles.loading}>Loading seasons…</div>}

      {!isLoading && filtered.length === 0 && (
        <div className={styles.empty}>
          <Trophy size={40} className={styles.emptyIcon} />
          <p>No seasons found.</p>
          {can('manage_settings') && (
            <button className={styles.addBtn} onClick={() => { setIsNew(true); setDrawerSeason({}); }}>
              Create your first season
            </button>
          )}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className={styles.seasonGrid}>
          {filtered.map(s => (
            <button key={s.id} className={styles.seasonCard} onClick={() => onSelectSeason(s)}>
              <div className={styles.seasonCardTop}>
                <div>
                  <div className={styles.seasonName}>{s.name}</div>
                  <div className={styles.seasonDiv}>
                    {s.category} · {s.gender ? `${s.gender} ` : ''}{s.division}
                  </div>
                </div>
                <StatusBadge status={s.status} />
              </div>
              <div className={styles.seasonMeta}>
                <span><Calendar size={13} /> {fmtDate(s.season_start)} – {fmtDate(s.season_end)}</span>
                <span><Users size={13} /> {s.team_count}/{s.max_teams} teams</span>
                {s.match_day && <span><Trophy size={13} /> {s.match_day}{s.match_time ? ` · ${s.match_time}` : ''}</span>}
              </div>
              <div className={styles.seasonFooter}>
                <span className={styles.seasonViewBtn}>View Season <ChevronRight size={14} /></span>
                {can('manage_settings') && (
                  <button className={styles.editBtn}
                    onClick={e => { e.stopPropagation(); setIsNew(false); setDrawerSeason(s); }}>
                    Edit
                  </button>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {drawerSeason !== null && (
        <SeasonDrawer
          season={drawerSeason} isNew={isNew}
          onClose={() => setDrawerSeason(null)}
          onSave={handleSave}
          showToast={showToast}
        />
      )}
    </div>
  );
};

export default AdminLeagueEngine;
