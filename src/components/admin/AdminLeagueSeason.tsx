// src/components/admin/AdminLeagueSeason.tsx
// Season detail page with 4 tabs: Schedule, Standings, Rosters, Bracket
import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAdmin } from '../../contexts/AdminContext';
import { ChevronLeft, Trophy, Users, Calendar, X, Check, AlertCircle } from '../../components/Icons/Icons';
import ToastContainer from '../Toast/ToastContainer';
import { useToast } from '../../hooks/useToast';
import styles from './AdminLeagueSeason.module.scss';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Season {
  id: string;
  name: string;
  division: string;
  category: string;
  gender: string | null;
  season_start: string | null;
  season_end: string | null;
  max_teams: number;
  status: string;
  match_day: string | null;
  match_time: string | null;
}

interface Team {
  id: string;
  season_id: string;
  name: string;
  captain_name: string | null;
  captain_email: string | null;
  captain_phone: string | null;
  status: string;
  notes: string | null;
}

interface Player {
  id: string;
  team_id: string;
  name: string;
  age: number | null;
  position: string | null;
  jersey_number: number | null;
  is_captain: boolean;
  waiver_signed: boolean;
  waiver_date: string | null;
  is_eligible: boolean;
  notes: string | null;
}

interface Match {
  id: string;
  season_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string | null;
  match_time: string | null;
  field_id: string | null;
  round: number;
  match_type: string;
  home_score: number | null;
  away_score: number | null;
  status: string;
  forfeit_team_id: string | null;
  notes: string | null;
}

interface Standing {
  id: string;
  season_id: string;
  team_id: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  points: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const FIELDS = [
  { id: 'field-1', name: 'Camp Nou'     },
  { id: 'field-2', name: 'Old Trafford' },
  { id: 'field-3', name: 'San Siro'     },
];

const POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

const fmtDate = (d: string | null) => {
  if (!d) return '—';
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const fmtTime = (t: string | null) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
};

// ─── Round-robin schedule generator ──────────────────────────────────────────

const generateRoundRobin = (teamIds: string[]): Array<{ home: string; away: string; round: number }> => {
  const teams = [...teamIds];
  if (teams.length % 2 !== 0) teams.push('BYE');
  const n = teams.length;
  const rounds: Array<{ home: string; away: string; round: number }> = [];

  for (let round = 0; round < n - 1; round++) {
    for (let i = 0; i < n / 2; i++) {
      const home = teams[i];
      const away = teams[n - 1 - i];
      if (home !== 'BYE' && away !== 'BYE') {
        rounds.push({ home, away, round: round + 1 });
      }
    }
    // Rotate all except first
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }
  return rounds;
};

// ─── Score entry modal ────────────────────────────────────────────────────────

interface ScoreModalProps {
  match: Match;
  teams: Team[];
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, type?: any) => void;
}

const ScoreModal = ({ match, teams, onClose, onSave, showToast }: ScoreModalProps) => {
  const homeTeam = teams.find(t => t.id === match.home_team_id);
  const awayTeam = teams.find(t => t.id === match.away_team_id);
  const [homeScore, setHomeScore] = useState(match.home_score ?? 0);
  const [awayScore, setAwayScore] = useState(match.away_score ?? 0);
  const [matchDate, setMatchDate] = useState(match.match_date ?? '');
  const [matchTime, setMatchTime] = useState(match.match_time ?? '');
  const [fieldId, setFieldId]     = useState(match.field_id ?? '');
  const [status, setStatus]       = useState(match.status);
  const [forfeitTeam, setForfeitTeam] = useState(match.forfeit_team_id ?? '');
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const isCompleted = status === 'completed' || status === 'forfeit';
      const { error } = await (supabase as any).from('league_matches').update({
        home_score:     isCompleted ? homeScore : null,
        away_score:     isCompleted ? awayScore : null,
        match_date:     matchDate || null,
        match_time:     matchTime || null,
        field_id:       fieldId || null,
        status,
        forfeit_team_id: status === 'forfeit' ? (forfeitTeam || null) : null,
        updated_at:     new Date().toISOString(),
      }).eq('id', match.id);
      if (error) throw error;

      // Update standings if completed
      if (isCompleted && status !== 'forfeit') {
        await updateStandings(match.season_id, match.home_team_id, match.away_team_id, homeScore, awayScore);
      }

      showToast('Match updated.', 'success');
      onSave();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to save.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const updateStandings = async (
    seasonId: string,
    homeId: string, awayId: string,
    hScore: number, aScore: number
  ) => {
    // Recalculate standings from all completed matches for this season
    const { data: allMatches } = await (supabase as any)
      .from('league_matches')
      .select('home_team_id, away_team_id, home_score, away_score, status, forfeit_team_id')
      .eq('season_id', seasonId)
      .eq('match_type', 'regular')
      .in('status', ['completed', 'forfeit']);

    // Include the current match in calculation
    const matchesToCalc = [
      ...(allMatches ?? []).filter((m: any) => m.home_team_id !== homeId || m.away_team_id !== awayId),
      { home_team_id: homeId, away_team_id: awayId, home_score: hScore, away_score: aScore, status: 'completed', forfeit_team_id: null }
    ];

    const { data: teams } = await (supabase as any)
      .from('league_teams').select('id').eq('season_id', seasonId).eq('status', 'active');

    const statsMap: Record<string, { played: number; wins: number; draws: number; losses: number; gf: number; ga: number; pts: number }> = {};
    (teams ?? []).forEach((t: any) => {
      statsMap[t.id] = { played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, pts: 0 };
    });

    matchesToCalc.forEach((m: any) => {
      if (!statsMap[m.home_team_id] || !statsMap[m.away_team_id]) return;
      const h = statsMap[m.home_team_id];
      const a = statsMap[m.away_team_id];

      if (m.status === 'forfeit') {
        if (m.forfeit_team_id === m.home_team_id) {
          a.wins++; a.pts += 3; a.played++; h.losses++; h.played++;
        } else {
          h.wins++; h.pts += 3; h.played++; a.losses++; a.played++;
        }
        return;
      }

      h.played++; a.played++;
      h.gf += m.home_score; h.ga += m.away_score;
      a.gf += m.away_score; a.ga += m.home_score;

      if (m.home_score > m.away_score) { h.wins++; h.pts += 3; a.losses++; }
      else if (m.home_score < m.away_score) { a.wins++; a.pts += 3; h.losses++; }
      else { h.draws++; h.pts++; a.draws++; a.pts++; }
    });

    // Upsert standings
    for (const [teamId, s] of Object.entries(statsMap)) {
      await (supabase as any).from('league_standings').upsert({
        season_id: seasonId, team_id: teamId,
        played: s.played, wins: s.wins, draws: s.draws, losses: s.losses,
        goals_for: s.gf, goals_against: s.ga, points: s.pts,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'season_id,team_id' });
    }
  };

  return (
    <>
      <div className={styles.modalBackdrop} onClick={onClose} />
      <div className={styles.modal} role="dialog">
        <div className={styles.modalHeader}>
          <h2>Edit Match</h2>
          <button className={styles.modalClose} onClick={onClose}><X size={18} /></button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.scoreRow}>
            <div className={styles.scoreTeam}>
              <div className={styles.scoreTeamName}>{homeTeam?.name ?? '?'}</div>
              <input type="number" className={styles.scoreInput} value={homeScore}
                onChange={e => setHomeScore(parseInt(e.target.value) || 0)} min="0" max="99" />
            </div>
            <div className={styles.scoreSep}>vs</div>
            <div className={styles.scoreTeam}>
              <input type="number" className={styles.scoreInput} value={awayScore}
                onChange={e => setAwayScore(parseInt(e.target.value) || 0)} min="0" max="99" />
              <div className={styles.scoreTeamName}>{awayTeam?.name ?? '?'}</div>
            </div>
          </div>

          <div className={styles.matchFields}>
            <div className={styles.formField}>
              <label>Date</label>
              <input type="date" className={styles.input} value={matchDate} onChange={e => setMatchDate(e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label>Time</label>
              <input type="time" className={styles.input} value={matchTime} onChange={e => setMatchTime(e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label>Field</label>
              <select className={styles.input} value={fieldId} onChange={e => setFieldId(e.target.value)}>
                <option value="">—</option>
                {FIELDS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className={styles.formField}>
              <label>Status</label>
              <select className={styles.input} value={status} onChange={e => setStatus(e.target.value)}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="cancelled">Cancelled</option>
                <option value="forfeit">Forfeit</option>
              </select>
            </div>
            {status === 'forfeit' && (
              <div className={styles.formField}>
                <label>Forfeiting Team</label>
                <select className={styles.input} value={forfeitTeam} onChange={e => setForfeitTeam(e.target.value)}>
                  <option value="">Select…</option>
                  <option value={match.home_team_id}>{homeTeam?.name}</option>
                  <option value={match.away_team_id}>{awayTeam?.name}</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Match'}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Player drawer ────────────────────────────────────────────────────────────

interface PlayerDrawerProps {
  player: Partial<Player> | null;
  teamId: string;
  isNew: boolean;
  onClose: () => void;
  onSave: () => void;
  showToast: (msg: string, type?: any) => void;
}

const PlayerDrawer = ({ player, teamId, isNew, onClose, onSave, showToast }: PlayerDrawerProps) => {
  const [name, setName]           = useState(player?.name ?? '');
  const [age, setAge]             = useState(player?.age?.toString() ?? '');
  const [position, setPosition]   = useState(player?.position ?? '');
  const [jersey, setJersey]       = useState(player?.jersey_number?.toString() ?? '');
  const [isCaptain, setIsCaptain] = useState(player?.is_captain ?? false);
  const [waiver, setWaiver]       = useState(player?.waiver_signed ?? false);
  const [waiverDate, setWaiverDate] = useState(player?.waiver_date ?? '');
  const [eligible, setEligible]   = useState(player?.is_eligible ?? true);
  const [notes, setNotes]         = useState(player?.notes ?? '');
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', h); };
  }, [onClose]);

  const handleSave = async () => {
    if (!name.trim()) { showToast('Name is required.', 'error'); return; }
    setIsSaving(true);
    try {
      const payload = {
        team_id: teamId, name,
        age: age ? parseInt(age) : null,
        position: position || null,
        jersey_number: jersey ? parseInt(jersey) : null,
        is_captain: isCaptain,
        waiver_signed: waiver,
        waiver_date: waiver && waiverDate ? waiverDate : null,
        is_eligible: eligible,
        notes: notes || null,
      };
      if (isNew) {
        const { error } = await (supabase as any).from('league_players').insert(payload);
        if (error) throw error;
        showToast('Player added.', 'success');
      } else {
        const { error } = await (supabase as any).from('league_players')
          .update(payload).eq('id', player?.id);
        if (error) throw error;
        showToast('Player updated.', 'success');
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
          <h2>{isNew ? 'Add Player' : 'Edit Player'}</h2>
          <button className={styles.drawerClose} onClick={onClose}><X size={20} /></button>
        </div>
        <div className={styles.drawerBody}>
          <section className={styles.section}>
            <h3>Player Info</h3>
            <div className={styles.formField}>
              <label>Name *</label>
              <input className={styles.input} value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label>Age</label>
                <input type="number" className={styles.input} value={age}
                  onChange={e => setAge(e.target.value)} min="5" max="80" />
              </div>
              <div className={styles.formField}>
                <label>Jersey #</label>
                <input type="number" className={styles.input} value={jersey}
                  onChange={e => setJersey(e.target.value)} min="1" max="99" />
              </div>
            </div>
            <div className={styles.formField}>
              <label>Position</label>
              <select className={styles.input} value={position} onChange={e => setPosition(e.target.value)}>
                <option value="">—</option>
                {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Status</h3>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={isCaptain} onChange={e => setIsCaptain(e.target.checked)} />
              <span>Team Captain</span>
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={eligible} onChange={e => setEligible(e.target.checked)} />
              <span>Eligible to play</span>
            </label>
            <label className={styles.checkLabel}>
              <input type="checkbox" checked={waiver} onChange={e => setWaiver(e.target.checked)} />
              <span>Waiver signed</span>
            </label>
            {waiver && (
              <div className={styles.formField} style={{ marginTop: '0.5rem' }}>
                <label>Waiver Date</label>
                <input type="date" className={styles.input} value={waiverDate}
                  onChange={e => setWaiverDate(e.target.value)} />
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h3>Notes</h3>
            <textarea className={styles.textarea} value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
          </section>
        </div>
        <div className={styles.drawerFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving…' : isNew ? 'Add Player' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
};

// ─── Draggable Match Row ─────────────────────────────────────────────────────

interface DraggableMatchRowProps {
  match: Match;
  isDragging: boolean;
  canEdit: boolean;
  onEdit: () => void;
  teamName: (id: string) => string;
  onFieldChange: (fieldId: string) => void;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const DraggableMatchRow = ({ match: m, isDragging, canEdit, onEdit, teamName, onFieldChange, onDateChange, onTimeChange }: DraggableMatchRowProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: m.id });
  const isCompleted = m.status === 'completed';
  const isForfeit   = m.status === 'forfeit';
  const [editingField, setEditingField] = useState(false);
  const [editingDate,  setEditingDate]  = useState(false);
  const [editingTime,  setEditingTime]  = useState(false);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={`${styles.matchRow} ${isCompleted ? styles.matchCompleted : ''}`}
    >
      {/* Drag handle */}
      {canEdit && (
        <div className={styles.matchDragHandle} {...attributes} {...listeners} title="Drag to reorder or move to another round">
          ⠿
        </div>
      )}

      {/* Teams & score */}
      <div className={styles.matchTeams} onClick={onEdit} style={{ cursor: canEdit ? 'pointer' : 'default', flex: 1 }}>
        <span className={`${styles.matchTeam} ${isCompleted && m.home_score! > m.away_score! ? styles.winner : ''}`}>
          {teamName(m.home_team_id)}
        </span>
        <div className={styles.matchScore}>
          {isCompleted ? (
            <strong>{m.home_score} – {m.away_score}</strong>
          ) : isForfeit ? (
            <span className={styles.forfeitBadge}>FFT</span>
          ) : (
            <span className={styles.matchVs}>vs</span>
          )}
        </div>
        <span className={`${styles.matchTeam} ${styles.matchTeamAway} ${isCompleted && m.away_score! > m.home_score! ? styles.winner : ''}`}>
          {teamName(m.away_team_id)}
        </span>
      </div>

      {/* Inline editable meta */}
      <div className={styles.matchMeta}>
        {/* Date */}
        {editingDate ? (
          <input type="date" className={styles.inlineInput} defaultValue={m.match_date ?? ''}
            autoFocus
            onBlur={e => { onDateChange(e.target.value); setEditingDate(false); }}
            onKeyDown={e => { if (e.key === 'Escape') setEditingDate(false); }}
          />
        ) : (
          <span className={canEdit ? styles.editableMeta : ''} onClick={() => canEdit && setEditingDate(true)} title="Click to set date">
            {m.match_date ? fmtDate(m.match_date) : canEdit ? '+ Date' : '—'}
          </span>
        )}

        {/* Time */}
        {editingTime ? (
          <input type="time" className={styles.inlineInput} defaultValue={m.match_time ?? ''}
            autoFocus
            onBlur={e => { onTimeChange(e.target.value); setEditingTime(false); }}
            onKeyDown={e => { if (e.key === 'Escape') setEditingTime(false); }}
          />
        ) : (
          <span className={canEdit ? styles.editableMeta : ''} onClick={() => canEdit && setEditingTime(true)} title="Click to set time">
            {m.match_time ? fmtTime(m.match_time) : canEdit ? '+ Time' : ''}
          </span>
        )}

        {/* Field */}
        {editingField ? (
          <select className={styles.inlineInput} defaultValue={m.field_id ?? ''}
            autoFocus
            onBlur={e => { onFieldChange(e.target.value); setEditingField(false); }}
            onChange={e => { onFieldChange(e.target.value); setEditingField(false); }}
          >
            <option value="">— No field —</option>
            {FIELDS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        ) : (
          <span className={canEdit ? styles.editableMeta : ''} onClick={() => canEdit && setEditingField(true)} title="Click to assign field">
            {m.field_id ? FIELDS.find(f => f.id === m.field_id)?.name : canEdit ? '+ Field' : ''}
          </span>
        )}

        <span className={`${styles.matchStatus} ${styles[`ms_${m.status}`]}`}>{m.status}</span>
      </div>
    </div>
  );
};

// ─── Draggable Bracket Match ──────────────────────────────────────────────────

interface DraggableBracketMatchProps {
  match: Match;
  canEdit: boolean;
  onScoreClick: () => void;
  onReseed: (homeId: string, awayId: string) => void;
  teamName: (id: string) => string;
}

const DraggableBracketMatch = ({ match: m, canEdit, onScoreClick, onReseed, teamName }: DraggableBracketMatchProps) => {
  const [draggingTeam, setDraggingTeam] = useState<'home' | 'away' | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<'home' | 'away' | null>(null);

  const handleDragStart = (slot: 'home' | 'away') => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingTeam(slot);
  };

  const handleDrop = (targetSlot: 'home' | 'away') => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlot(null);
    if (!draggingTeam || draggingTeam === targetSlot) { setDraggingTeam(null); return; }
    // Swap the two teams
    const newHome = targetSlot === 'home' ? m.away_team_id : m.home_team_id;
    const newAway = targetSlot === 'away' ? m.home_team_id : m.away_team_id;
    onReseed(newHome, newAway);
    setDraggingTeam(null);
  };

  return (
    <div className={styles.bracketMatch}>
      {/* Home team slot */}
      <div
        className={`${styles.bracketTeam} ${m.status === 'completed' && m.home_score! > m.away_score! ? styles.bracketWinner : ''} ${dragOverSlot === 'home' ? styles.bracketDropTarget : ''}`}
        draggable={canEdit}
        onDragStart={handleDragStart('home')}
        onDragOver={e => { e.preventDefault(); setDragOverSlot('home'); }}
        onDragLeave={() => setDragOverSlot(null)}
        onDrop={handleDrop('home')}
        style={{ cursor: canEdit ? 'grab' : 'default' }}
      >
        <span>{teamName(m.home_team_id)}</span>
        <span className={styles.bracketScore} onClick={onScoreClick} style={{ cursor: 'pointer' }}>
          {m.status === 'completed' ? m.home_score : '—'}
        </span>
      </div>

      {/* Away team slot */}
      <div
        className={`${styles.bracketTeam} ${m.status === 'completed' && m.away_score! > m.home_score! ? styles.bracketWinner : ''} ${dragOverSlot === 'away' ? styles.bracketDropTarget : ''}`}
        draggable={canEdit}
        onDragStart={handleDragStart('away')}
        onDragOver={e => { e.preventDefault(); setDragOverSlot('away'); }}
        onDragLeave={() => setDragOverSlot(null)}
        onDrop={handleDrop('away')}
        style={{ cursor: canEdit ? 'grab' : 'default' }}
      >
        <span>{teamName(m.away_team_id)}</span>
        <span className={styles.bracketScore} onClick={onScoreClick} style={{ cursor: 'pointer' }}>
          {m.status === 'completed' ? m.away_score : '—'}
        </span>
      </div>
    </div>
  );
};

// ─── Main season detail component ─────────────────────────────────────────────

interface AdminLeagueSeasonProps {
  season: Season;
  onBack: () => void;
}

const AdminLeagueSeason = ({ season, onBack }: AdminLeagueSeasonProps) => {
  const { can }                             = useAdmin();
  const { toasts, showToast, removeToast } = useToast();
  const [activeTab, setActiveTab]           = useState<'schedule' | 'standings' | 'rosters' | 'bracket'>('schedule');
  const [teams, setTeams]                   = useState<Team[]>([]);
  const [matches, setMatches]               = useState<Match[]>([]);
  const [standings, setStandings]           = useState<Standing[]>([]);
  const [players, setPlayers]               = useState<Player[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [isGenerating, setIsGenerating]     = useState(false);
  const [scoreModal, setScoreModal]         = useState<Match | null>(null);
  const [playerDrawer, setPlayerDrawer]     = useState<{ player: Partial<Player> | null; teamId: string; isNew: boolean } | null>(null);
  const [expandedTeam, setExpandedTeam]     = useState<string | null>(null);
  const [newTeamName, setNewTeamName]       = useState('');
  const [activeDragId, setActiveDragId]     = useState<string | null>(null);
  const [bracketTeams, setBracketTeams]     = useState<string[]>([]);
  const [isAddingTeam, setIsAddingTeam]     = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => { fetchAll(); }, [season.id]);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [teamsRes, matchesRes, standingsRes, playersRes] = await Promise.all([
        (supabase as any).from('league_teams').select('*').eq('season_id', season.id).eq('status', 'active').order('name'),
        (supabase as any).from('league_matches').select('*').eq('season_id', season.id).order('round').order('match_date'),
        (supabase as any).from('league_standings').select('*').eq('season_id', season.id).order('points', { ascending: false }),
        (supabase as any).from('league_players').select('*').order('name'),
      ]);
      setTeams(teamsRes.data ?? []);
      setMatches(matchesRes.data ?? []);
      setStandings(standingsRes.data ?? []);
      setPlayers(playersRes.data ?? []);
    } catch {
      showToast('Failed to load season data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) return;
    setIsAddingTeam(true);
    try {
      const { error } = await (supabase as any).from('league_teams').insert({
        season_id: season.id, name: newTeamName.trim(), status: 'active',
      });
      if (error) throw error;
      setNewTeamName('');
      showToast('Team added.', 'success');
      fetchAll();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to add team.', 'error');
    } finally {
      setIsAddingTeam(false);
    }
  };

  const handleGenerateSchedule = async () => {
    if (teams.length < 2) { showToast('Need at least 2 teams to generate a schedule.', 'error'); return; }
    if (matches.filter(m => m.match_type === 'regular').length > 0) {
      if (!confirm('This will replace the existing regular season schedule. Continue?')) return;
      await (supabase as any).from('league_matches').delete().eq('season_id', season.id).eq('match_type', 'regular');
    }

    setIsGenerating(true);
    try {
      const fixtures = generateRoundRobin(teams.map(t => t.id));
      const matchDay = season.match_day;
      const matchTime = season.match_time;

      const inserts = fixtures.map(f => ({
        season_id:    season.id,
        home_team_id: f.home,
        away_team_id: f.away,
        round:        f.round,
        match_type:   'regular',
        status:       'scheduled',
        match_time:   matchTime || null,
        match_date:   null,
      }));

      const { error } = await (supabase as any).from('league_matches').insert(inserts);
      if (error) throw error;

      // Initialize standings
      const standingsInserts = teams.map(t => ({
        season_id: season.id, team_id: t.id,
        played: 0, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0, points: 0,
      }));
      await (supabase as any).from('league_standings').upsert(standingsInserts, { onConflict: 'season_id,team_id' });

      showToast(`Generated ${inserts.length} matches across ${Math.max(...fixtures.map(f => f.round))} rounds.`, 'success');
      fetchAll();
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to generate schedule.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeletePlayer = async (playerId: string) => {
    if (!confirm('Remove this player?')) return;
    const { error } = await (supabase as any).from('league_players').delete().eq('id', playerId);
    if (!error) { setPlayers(prev => prev.filter(p => p.id !== playerId)); showToast('Player removed.', 'success'); }
  };

  // ── DnD handlers ──────────────────────────────────────────────────────────

  const handleMatchMove = useCallback(async (matchId: string, updates: Partial<Match>) => {
    // Optimistic update
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updates } : m));
    try {
      const { error } = await (supabase as any).from('league_matches')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', matchId);
      if (error) throw error;
      showToast('Match updated.', 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to update match.', 'error');
      fetchAll();
    }
  }, []);

  const handleBracketReseed = useCallback(async (matchId: string, homeTeamId: string, awayTeamId: string) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, home_team_id: homeTeamId, away_team_id: awayTeamId } : m));
    try {
      const { error } = await (supabase as any).from('league_matches')
        .update({ home_team_id: homeTeamId, away_team_id: awayTeamId, updated_at: new Date().toISOString() })
        .eq('id', matchId);
      if (error) throw error;
      showToast('Bracket reseeded.', 'success');
    } catch (err: any) {
      showToast(err?.message ?? 'Failed to reseed.', 'error');
      fetchAll();
    }
  }, []);

  // ── Group matches by round ─────────────────────────────────────────────────

  // Group matches by round
  const matchesByRound = useMemo(() => {
    const map: Record<number, Match[]> = {};
    matches.filter(m => m.match_type === 'regular').forEach(m => {
      if (!map[m.round]) map[m.round] = [];
      map[m.round].push(m);
    });
    return map;
  }, [matches]);

  const playoffMatches = matches.filter(m => m.match_type !== 'regular');

  // Sorted standings
  const sortedStandings = useMemo(() => {
    return [...standings].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goals_for - a.goals_against;
      const gdB = b.goals_for - b.goals_against;
      if (gdB !== gdA) return gdB - gdA;
      return b.goals_for - a.goals_for;
    });
  }, [standings]);

  const teamName = (id: string) => teams.find(t => t.id === id)?.name ?? '?';
  const teamPlayers = (teamId: string) => players.filter(p => p.team_id === teamId);

  const regularMatches = matches.filter(m => m.match_type === 'regular');
  const completedCount = regularMatches.filter(m => m.status === 'completed').length;

  return (
    <div className={styles.page}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          <ChevronLeft size={18} /> All Seasons
        </button>
        <div className={styles.headerInfo}>
          <h1>{season.name}</h1>
          <p>{season.category} · {season.gender ? `${season.gender} ` : ''}{season.division} · {teams.length} teams · {completedCount}/{regularMatches.length} matches played</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {(['schedule', 'standings', 'rosters', 'bracket'] as const).map(tab => (
          <button key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? <div className={styles.loading}>Loading…</div> : (

        <div className={styles.tabContent}>

          {/* ── Schedule tab ─────────────────────────────────────────── */}
          {activeTab === 'schedule' && (
            <div>
              <div className={styles.scheduleActions}>
                {can('manage_settings') && (
                  <button className={styles.generateBtn} onClick={handleGenerateSchedule} disabled={isGenerating || teams.length < 2}>
                    {isGenerating ? 'Generating…' : `Generate Round-Robin (${teams.length} teams)`}
                  </button>
                )}
                {teams.length < 2 && (
                  <span className={styles.scheduleHint}>Add at least 2 teams in the Rosters tab first.</span>
                )}
              </div>

              {Object.keys(matchesByRound).length === 0 ? (
                <div className={styles.empty}>No schedule generated yet.</div>
              ) : (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={(e: DragStartEvent) => setActiveDragId(String(e.active.id))}
                  onDragEnd={(e: DragEndEvent) => {
                    setActiveDragId(null);
                    const { active, over } = e;
                    if (!over || active.id === over.id) return;
                    // Find the match being dragged and the target match
                    const dragMatch = matches.find(m => m.id === String(active.id));
                    const overMatch = matches.find(m => m.id === String(over.id));
                    if (!dragMatch || !overMatch) return;
                    // If different rounds, move to that round
                    if (dragMatch.round !== overMatch.round) {
                      handleMatchMove(dragMatch.id, { round: overMatch.round });
                    } else {
                      // Reorder within round — swap order by swapping match dates/times
                      const tmp = { match_date: overMatch.match_date, match_time: overMatch.match_time };
                      handleMatchMove(dragMatch.id, { match_date: overMatch.match_date, match_time: overMatch.match_time });
                      handleMatchMove(overMatch.id, { match_date: dragMatch.match_date, match_time: dragMatch.match_time });
                    }
                  }}
                >
                  {Object.entries(matchesByRound)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([round, roundMatches]) => (
                      <div key={round} className={styles.roundBlock}>
                        <div className={styles.roundTitle}>Round {round}</div>
                        <SortableContext items={roundMatches.map(m => m.id)} strategy={verticalListSortingStrategy}>
                          <div className={styles.matchList}>
                            {roundMatches.map(m => {
                              const isCompleted = m.status === 'completed';
                              const isForfeit   = m.status === 'forfeit';
                              const isDragging  = activeDragId === m.id;
                              return (
                                <DraggableMatchRow
                                  key={m.id}
                                  match={m}
                                  isDragging={isDragging}
                                  canEdit={can('manage_settings')}
                                  onEdit={() => can('manage_settings') && setScoreModal(m)}
                                  teamName={teamName}
                                  onFieldChange={(fieldId) => handleMatchMove(m.id, { field_id: fieldId })}
                                  onDateChange={(date) => handleMatchMove(m.id, { match_date: date })}
                                  onTimeChange={(time) => handleMatchMove(m.id, { match_time: time })}
                                />
                              );
                            })}
                          </div>
                        </SortableContext>
                      </div>
                    ))
                  }
                  <DragOverlay>
                    {activeDragId ? (() => {
                      const m = matches.find(x => x.id === activeDragId);
                      if (!m) return null;
                      return (
                        <div className={`${styles.matchRow} ${styles.matchDragOverlay}`}>
                          <div className={styles.matchTeams}>
                            <span className={styles.matchTeam}>{teamName(m.home_team_id)}</span>
                            <span className={styles.matchVs}>vs</span>
                            <span className={`${styles.matchTeam} ${styles.matchTeamAway}`}>{teamName(m.away_team_id)}</span>
                          </div>
                        </div>
                      );
                    })() : null}
                  </DragOverlay>
                </DndContext>
              )}
            </div>
          )}

          {/* ── Standings tab ─────────────────────────────────────────── */}
          {activeTab === 'standings' && (
            <div>
              {sortedStandings.length === 0 ? (
                <div className={styles.empty}>No standings yet. Generate a schedule and enter scores to see standings.</div>
              ) : (
                <div className={styles.standingsWrap}>
                  <table className={styles.standingsTable}>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Team</th>
                        <th>P</th>
                        <th>W</th>
                        <th>D</th>
                        <th>L</th>
                        <th>GF</th>
                        <th>GA</th>
                        <th>GD</th>
                        <th>Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedStandings.map((s, i) => (
                        <tr key={s.id} className={i < 4 ? styles.qualifies : ''}>
                          <td className={styles.tdPos}>{i + 1}</td>
                          <td className={styles.tdTeam}>{teamName(s.team_id)}</td>
                          <td>{s.played}</td>
                          <td>{s.wins}</td>
                          <td>{s.draws}</td>
                          <td>{s.losses}</td>
                          <td>{s.goals_for}</td>
                          <td>{s.goals_against}</td>
                          <td className={s.goals_for - s.goals_against > 0 ? styles.gdPos : s.goals_for - s.goals_against < 0 ? styles.gdNeg : ''}>
                            {s.goals_for - s.goals_against > 0 ? '+' : ''}{s.goals_for - s.goals_against}
                          </td>
                          <td className={styles.tdPts}>{s.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className={styles.standingsNote}>Top 4 highlighted for playoff qualification</div>
                </div>
              )}
            </div>
          )}

          {/* ── Rosters tab ───────────────────────────────────────────── */}
          {activeTab === 'rosters' && (
            <div>
              {/* Add team */}
              {can('manage_settings') && (
                <div className={styles.addTeamRow}>
                  <input className={styles.input} placeholder="New team name…"
                    value={newTeamName} onChange={e => setNewTeamName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTeam()} />
                  <button className={styles.addTeamBtn} onClick={handleAddTeam}
                    disabled={isAddingTeam || !newTeamName.trim()}>
                    {isAddingTeam ? '…' : '+ Add Team'}
                  </button>
                </div>
              )}

              {teams.length === 0 ? (
                <div className={styles.empty}>No teams yet. Add teams above.</div>
              ) : (
                <div className={styles.teamList}>
                  {teams.map(team => {
                    const roster = teamPlayers(team.id);
                    const isExpanded = expandedTeam === team.id;
                    const missingWaivers = roster.filter(p => !p.waiver_signed).length;
                    const ineligible    = roster.filter(p => !p.is_eligible).length;
                    return (
                      <div key={team.id} className={styles.teamCard}>
                        <div className={styles.teamCardHeader}
                          onClick={() => setExpandedTeam(isExpanded ? null : team.id)}>
                          <div className={styles.teamCardInfo}>
                            <span className={styles.teamCardName}>{team.name}</span>
                            <span className={styles.teamCardMeta}>
                              {roster.length} players
                              {missingWaivers > 0 && <span className={styles.warnBadge}>{missingWaivers} missing waiver</span>}
                              {ineligible > 0 && <span className={styles.dangerBadge}>{ineligible} ineligible</span>}
                            </span>
                          </div>
                          <div className={styles.teamCardActions}>
                            {can('manage_settings') && (
                              <button className={styles.addPlayerBtn}
                                onClick={e => { e.stopPropagation(); setPlayerDrawer({ player: null, teamId: team.id, isNew: true }); }}>
                                + Player
                              </button>
                            )}
                            <span className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className={styles.rosterTable}>
                            {roster.length === 0 ? (
                              <div className={styles.emptyRoster}>No players added yet.</div>
                            ) : (
                              <table className={styles.playerTable}>
                                <thead>
                                  <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Pos</th>
                                    <th>Age</th>
                                    <th>Waiver</th>
                                    <th>Eligible</th>
                                    <th></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {roster.map(p => (
                                    <tr key={p.id}>
                                      <td className={styles.jerseyCell}>{p.jersey_number ?? '—'}</td>
                                      <td>
                                        <span className={styles.playerName}>{p.name}</span>
                                        {p.is_captain && <span className={styles.captainBadge}>C</span>}
                                      </td>
                                      <td className={styles.tdMuted}>{p.position ?? '—'}</td>
                                      <td className={styles.tdMuted}>{p.age ?? '—'}</td>
                                      <td>
                                        {p.waiver_signed
                                          ? <Check size={14} className={styles.checkGreen} />
                                          : <AlertCircle size={14} className={styles.checkRed} />}
                                      </td>
                                      <td>
                                        {p.is_eligible
                                          ? <Check size={14} className={styles.checkGreen} />
                                          : <AlertCircle size={14} className={styles.checkRed} />}
                                      </td>
                                      <td>
                                        {can('manage_settings') && (
                                          <div className={styles.playerActions}>
                                            <button className={styles.editSmallBtn}
                                              onClick={() => setPlayerDrawer({ player: p, teamId: team.id, isNew: false })}>
                                              Edit
                                            </button>
                                            <button className={styles.deleteSmallBtn}
                                              onClick={() => handleDeletePlayer(p.id)}>
                                              ✕
                                            </button>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Bracket tab ───────────────────────────────────────────── */}
          {activeTab === 'bracket' && (
            <div>
              {playoffMatches.length === 0 ? (
                <div className={styles.bracketEmpty}>
                  <Trophy size={40} className={styles.emptyIcon} />
                  <p>No playoff bracket yet.</p>
                  {can('manage_settings') && sortedStandings.length >= 4 && (
                    <button className={styles.generateBtn} onClick={async () => {
                      const top4 = sortedStandings.slice(0, 4);
                      const semifinal1 = { season_id: season.id, home_team_id: top4[0].team_id, away_team_id: top4[3].team_id, round: 1, match_type: 'playoff', status: 'scheduled' };
                      const semifinal2 = { season_id: season.id, home_team_id: top4[1].team_id, away_team_id: top4[2].team_id, round: 1, match_type: 'playoff', status: 'scheduled' };
                      const final      = { season_id: season.id, home_team_id: top4[0].team_id, away_team_id: top4[1].team_id, round: 2, match_type: 'final', status: 'scheduled' };
                      await (supabase as any).from('league_matches').insert([semifinal1, semifinal2, final]);
                      showToast('Playoff bracket generated from top 4 teams.', 'success');
                      fetchAll();
                    }}>
                      Generate Playoff Bracket (Top 4)
                    </button>
                  )}
                  {sortedStandings.length < 4 && <p className={styles.bracketHint}>Complete the regular season and enter scores to generate a bracket.</p>}
                </div>
              ) : (
                <div>
                  <p className={styles.bracketDndHint}>Drag team names within a match to swap home/away seeding</p>
                  <div className={styles.bracketWrap}>
                    {[1, 2].map(round => {
                      const roundMatches = playoffMatches.filter(m => m.round === round);
                      if (roundMatches.length === 0) return null;
                      return (
                        <div key={round} className={styles.bracketRound}>
                          <div className={styles.bracketRoundTitle}>
                            {round === 1 ? 'Semi-Finals' : 'Final'}
                          </div>
                          {roundMatches.map(m => (
                            <DraggableBracketMatch
                              key={m.id}
                              match={m}
                              canEdit={can('manage_settings')}
                              onScoreClick={() => can('manage_settings') && setScoreModal(m)}
                              onReseed={(homeId, awayId) => handleBracketReseed(m.id, homeId, awayId)}
                              teamName={teamName}
                            />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* Score modal */}
      {scoreModal && (
        <ScoreModal match={scoreModal} teams={teams}
          onClose={() => setScoreModal(null)}
          onSave={() => { setScoreModal(null); fetchAll(); }}
          showToast={showToast} />
      )}

      {/* Player drawer */}
      {playerDrawer && (
        <PlayerDrawer
          player={playerDrawer.player} teamId={playerDrawer.teamId} isNew={playerDrawer.isNew}
          onClose={() => setPlayerDrawer(null)}
          onSave={() => { setPlayerDrawer(null); fetchAll(); }}
          showToast={showToast} />
      )}
    </div>
  );
};

export default AdminLeagueSeason;
