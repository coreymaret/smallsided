// src/pages/Account/AccountFamily.tsx
import { useState, useEffect } from 'react';
import { useAccount } from '../../contexts/AccountContext';
import { supabase } from '../../lib/supabase';
import { X, Plus } from '../../components/Icons/Icons';
import styles from './AccountFamily.module.scss';

interface FamilyMember { id: string; first_name: string; last_name: string; age: number | null; medical_notes: string | null; allergies: string | null; }
interface Teammate     { id: string; name: string; email: string | null; phone: string | null; notes: string | null; }

const AccountFamily = () => {
  const { user } = useAccount();
  const [family, setFamily]       = useState<FamilyMember[]>([]);
  const [teammates, setTeammates] = useState<Teammate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDrawer, setActiveDrawer] = useState<{ type: 'kid' | 'teammate'; item: any; isNew: boolean } | null>(null);

  useEffect(() => { if (user) fetchAll(); }, [user]);

  const fetchAll = async () => {
    const [famRes, teamRes] = await Promise.all([
      (supabase as any).from('customer_family_members').select('*').eq('customer_id', user!.id).order('first_name'),
      (supabase as any).from('customer_teammates').select('*').eq('customer_id', user!.id).order('name'),
    ]);
    setFamily(famRes.data ?? []);
    setTeammates(teamRes.data ?? []);
    setIsLoading(false);
  };

  const handleDeleteKid = async (id: string) => {
    if (!confirm('Remove this family member?')) return;
    await (supabase as any).from('customer_family_members').delete().eq('id', id);
    setFamily(prev => prev.filter(f => f.id !== id));
  };

  const handleDeleteTeammate = async (id: string) => {
    if (!confirm('Remove this teammate?')) return;
    await (supabase as any).from('customer_teammates').delete().eq('id', id);
    setTeammates(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Family & Team</h1>

      {/* Kids section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><h2>Kids / Family Members</h2><p>Add children for camps and birthday parties.</p></div>
          <button className={styles.addBtn} onClick={() => setActiveDrawer({ type: 'kid', item: null, isNew: true })}>
            <Plus size={16} /> Add
          </button>
        </div>
        {isLoading ? <div className={styles.loading}>Loading…</div> : family.length === 0 ? (
          <div className={styles.empty}>No family members added yet.</div>
        ) : (
          <div className={styles.list}>
            {family.map(f => (
              <div key={f.id} className={styles.memberCard}>
                <div className={styles.memberAvatar}>{f.first_name[0]}{f.last_name?.[0] ?? ''}</div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>{f.first_name} {f.last_name}</div>
                  {f.age && <div className={styles.memberMeta}>Age {f.age}</div>}
                  {f.allergies && <div className={styles.memberAlert}>⚠ {f.allergies}</div>}
                </div>
                <div className={styles.memberActions}>
                  <button className={styles.editBtn} onClick={() => setActiveDrawer({ type: 'kid', item: f, isNew: false })}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteKid(f.id)}><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Teammates section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div><h2>Teammates</h2><p>Add teammates for league registrations.</p></div>
          <button className={styles.addBtn} onClick={() => setActiveDrawer({ type: 'teammate', item: null, isNew: true })}>
            <Plus size={16} /> Add
          </button>
        </div>
        {isLoading ? null : teammates.length === 0 ? (
          <div className={styles.empty}>No teammates added yet.</div>
        ) : (
          <div className={styles.list}>
            {teammates.map(t => (
              <div key={t.id} className={styles.memberCard}>
                <div className={styles.memberAvatar}>{t.name[0]}</div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberName}>{t.name}</div>
                  {t.email && <div className={styles.memberMeta}>{t.email}</div>}
                  {t.phone && <div className={styles.memberMeta}>{t.phone}</div>}
                </div>
                <div className={styles.memberActions}>
                  <button className={styles.editBtn} onClick={() => setActiveDrawer({ type: 'teammate', item: t, isNew: false })}>Edit</button>
                  <button className={styles.deleteBtn} onClick={() => handleDeleteTeammate(t.id)}><X size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drawers */}
      {activeDrawer?.type === 'kid' && (
        <KidDrawer item={activeDrawer.item} isNew={activeDrawer.isNew} userId={user!.id}
          onClose={() => setActiveDrawer(null)} onSave={() => { setActiveDrawer(null); fetchAll(); }} />
      )}
      {activeDrawer?.type === 'teammate' && (
        <TeammateDrawer item={activeDrawer.item} isNew={activeDrawer.isNew} userId={user!.id}
          onClose={() => setActiveDrawer(null)} onSave={() => { setActiveDrawer(null); fetchAll(); }} />
      )}
    </div>
  );
};

// ─── Kid Drawer ───────────────────────────────────────────────────────────────

const KidDrawer = ({ item, isNew, userId, onClose, onSave }: any) => {
  const [firstName, setFirstName] = useState(item?.first_name ?? '');
  const [lastName, setLastName]   = useState(item?.last_name ?? '');
  const [age, setAge]             = useState(item?.age?.toString() ?? '');
  const [medical, setMedical]     = useState(item?.medical_notes ?? '');
  const [allergies, setAllergies] = useState(item?.allergies ?? '');
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSave = async () => {
    if (!firstName.trim()) return;
    setIsSaving(true);
    const payload = { customer_id: userId, first_name: firstName, last_name: lastName, age: age ? parseInt(age) : null, medical_notes: medical || null, allergies: allergies || null };
    if (isNew) await (supabase as any).from('customer_family_members').insert(payload);
    else await (supabase as any).from('customer_family_members').update(payload).eq('id', item.id);
    setIsSaving(false);
    onSave();
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}><h2>{isNew ? 'Add Family Member' : 'Edit Family Member'}</h2><button onClick={onClose}><X size={20} /></button></div>
        <div className={styles.drawerBody}>
          <div className={styles.formRow}>
            <div className={styles.field}><label>First Name *</label><input className={styles.input} value={firstName} onChange={e => setFirstName(e.target.value)} autoFocus /></div>
            <div className={styles.field}><label>Last Name</label><input className={styles.input} value={lastName} onChange={e => setLastName(e.target.value)} /></div>
          </div>
          <div className={styles.field}><label>Age</label><input type="number" className={styles.input} value={age} onChange={e => setAge(e.target.value)} min="1" max="18" /></div>
          <div className={styles.field}><label>Allergies</label><input className={styles.input} value={allergies} onChange={e => setAllergies(e.target.value)} placeholder="e.g. peanuts, bee stings" /></div>
          <div className={styles.field}><label>Medical Notes</label><textarea className={styles.textarea} value={medical} onChange={e => setMedical(e.target.value)} rows={3} /></div>
        </div>
        <div className={styles.drawerFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving || !firstName.trim()}>{isSaving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </>
  );
};

// ─── Teammate Drawer ──────────────────────────────────────────────────────────

const TeammateDrawer = ({ item, isNew, userId, onClose, onSave }: any) => {
  const [name, setName]   = useState(item?.name ?? '');
  const [email, setEmail] = useState(item?.email ?? '');
  const [phone, setPhone] = useState(item?.phone ?? '');
  const [notes, setNotes] = useState(item?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h); return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const handleSave = async () => {
    if (!name.trim()) return;
    setIsSaving(true);
    const payload = { customer_id: userId, name, email: email || null, phone: phone || null, notes: notes || null };
    if (isNew) await (supabase as any).from('customer_teammates').insert(payload);
    else await (supabase as any).from('customer_teammates').update(payload).eq('id', item.id);
    setIsSaving(false);
    onSave();
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}><h2>{isNew ? 'Add Teammate' : 'Edit Teammate'}</h2><button onClick={onClose}><X size={20} /></button></div>
        <div className={styles.drawerBody}>
          <div className={styles.field}><label>Name *</label><input className={styles.input} value={name} onChange={e => setName(e.target.value)} autoFocus /></div>
          <div className={styles.field}><label>Email</label><input type="email" className={styles.input} value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className={styles.field}><label>Phone</label><input type="tel" className={styles.input} value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div className={styles.field}><label>Notes</label><textarea className={styles.textarea} value={notes} onChange={e => setNotes(e.target.value)} rows={2} /></div>
        </div>
        <div className={styles.drawerFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={isSaving || !name.trim()}>{isSaving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </>
  );
};

export default AccountFamily;
