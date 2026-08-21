import { useState, useEffect, useCallback, useRef } from 'react';
import { FaYoutube, FaWalking } from 'react-icons/fa';
import { FiCode, FiPlus, FiList, FiX, FiCheck, FiLogOut, FiEdit2, FiTrash2, FiCalendar, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:5000/api/tracker';

const INITIAL_COLUMNS = [
  { id: 'yt',   name: 'YT',   sub: 'YouTube',  iconName: 'FaYoutube', Icon: FaYoutube, color: '#ef4444', bg: '#fef2f2' },
  { id: 'dsa',  name: 'DSA',  sub: 'Practice', iconName: 'FiCode',    Icon: FiCode,    color: '#6366f1', bg: '#eef2ff' },
  { id: 'walk', name: 'WALK', sub: '30 min',   iconName: 'FaWalking', Icon: FaWalking, color: '#22c55e', bg: '#f0fdf4' },
];

// Map icon names → actual icon components (backend stores name strings)
const ICON_MAP = {
  FaYoutube: { Icon: FaYoutube, bg: '#fef2f2', color: '#ef4444' },
  FiCode:    { Icon: FiCode,    bg: '#eef2ff', color: '#6366f1' },
  FaWalking: { Icon: FaWalking, bg: '#f0fdf4', color: '#22c55e' },
  FiList:    { Icon: FiList,    bg: '#f3f0ff', color: '#6366f1' },
};

function hydrateColumns(rawCols) {
  return rawCols.map(c => {
    const meta = ICON_MAP[c.iconName];
    if (meta) {
      return { ...c, ...meta };
    }
    return c;
  });
}

function getEmojiForHabit(name) {
  const upper = name.toUpperCase();
  if (upper.includes('GYM') || upper.includes('WORKOUT') || upper.includes('EXERCISE') || upper.includes('TRAIN')) return '🏋️';
  if (upper.includes('READ') || upper.includes('BOOK') || upper.includes('STUDY') || upper.includes('LEARN')) return '📚';
  if (upper.includes('CODE') || upper.includes('DEV') || upper.includes('PROGRAM') || upper.includes('TECH')) return '💻';
  if (upper.includes('WALK') || upper.includes('RUN') || upper.includes('JOG') || upper.includes('STEPS') || upper.includes('HIKE')) return '🏃';
  if (upper.includes('MEDITATE') || upper.includes('YOGA') || upper.includes('CALM') || upper.includes('BREATHE')) return '🧘';
  if (upper.includes('SLEEP') || upper.includes('REST') || upper.includes('BED')) return '😴';
  if (upper.includes('EAT') || upper.includes('DIET') || upper.includes('FOOD') || upper.includes('WATER') || upper.includes('DRINK') || upper.includes('MILK')) return '🍏';
  if (upper.includes('MONEY') || upper.includes('BUDGET') || upper.includes('SAVE') || upper.includes('FINANCE') || upper.includes('PAY')) return '💵';
  if (upper.includes('CLEAN') || upper.includes('HOUSE') || upper.includes('CHORE') || upper.includes('WASH')) return '🧹';
  if (upper.includes('JOURNAL') || upper.includes('WRITE') || upper.includes('DIARY')) return '✍️';
  if (upper.includes('GAME') || upper.includes('PLAY')) return '🎮';
  if (upper.includes('MUSIC') || upper.includes('SING') || upper.includes('PIANO') || upper.includes('GUITAR') || upper.includes('SONG')) return '🎵';
  if (upper.includes('DANCE')) return '💃';
  if (upper.includes('CALL') || upper.includes('TALK') || upper.includes('MEET') || upper.includes('PHONE')) return '📞';
  
  // Default fallbacks
  const fallbacks = ['🎯', '✨', '🔥', '🚀', '📌', '⚡', '📝', '🌟'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbacks[hash % fallbacks.length];
}

const WEEK_DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);
  return WEEK_DAYS.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dateVal = String(d.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${dateVal}`;
    return { name, date: dateStr, iso };
  });
}

function getWeekLabel(weekOffset = 0) {
  const days = getWeekDates(weekOffset);
  return `${days[0].date} – ${days[6].date}`;
}

export default function TrackerPage() {
  const navigate = useNavigate();
  const [columns, setColumns]           = useState(INITIAL_COLUMNS);
  const [checked, setChecked]           = useState({});
  const [showInput, setShowInput]       = useState(false);
  const [newName, setNewName]           = useState('');
  const [editingColId, setEditingColId] = useState(null);
  const [editName, setEditName]         = useState('');
  const [weekOffset, setWeekOffset]     = useState(0);
  const [loadingData, setLoadingData]   = useState(true);
  const [saving, setSaving]             = useState(false);
  const [user, setUser]                 = useState(null);

  const saveTimerRef = useRef(null);

  // ── Auth helper ───────────────────────────────────────
  const getToken = () => localStorage.getItem('token');

  // ── Load data from backend on mount ──────────────────
  useEffect(() => {
    const token = getToken();
    if (!token) { navigate('/login'); return; }

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse user:', e);
      }
    }

    fetch(API, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.columns && data.columns.length > 0) {
          setColumns(hydrateColumns(data.columns));
        }
        if (data.checked) {
          setChecked(data.checked);
        }
      })
      .catch(err => console.error('Failed to load tracker data:', err))
      .finally(() => setLoadingData(false));
  }, [navigate]);

  // ── Auto-save to backend (debounced 800ms) ────────────
  const saveToBackend = useCallback((newColumns, newChecked) => {
    const token = getToken();
    if (!token) return;

    clearTimeout(saveTimerRef.current);
    setSaving(true);
    saveTimerRef.current = setTimeout(async () => {
      try {
        // Strip React component references before sending — only store serialisable data
        const serialisableCols = newColumns.map(({ Icon, bg: _bg, ...rest }) => rest);
        await fetch(API, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ columns: serialisableCols, checked: newChecked }),
        });
      } catch (err) {
        console.error('Save failed:', err);
      } finally {
        setSaving(false);
      }
    }, 800);
  }, []);

  // ── Progress ──────────────────────────────────────────
  const days = getWeekDates(weekOffset);
  const weekLabel = getWeekLabel(weekOffset);
  const totalCells   = days.length * columns.length;
  const checkedCount = days.reduce((count, day) => {
    columns.forEach(col => {
      const key = `${day.iso}-${col.id}`;
      if (checked[key]) count++;
    });
    return count;
  }, 0);
  const pct          = totalCells === 0 ? 0 : Math.round((checkedCount / totalCells) * 100);
  const circumference = 2 * Math.PI * 26;

  // ── Handlers ─────────────────────────────────────────
  const toggleCheck = (dayIso, colId) => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (dayIso !== todayIso) return; // Only allow ticking today's date

    const key = `${dayIso}-${colId}`;
    const newChecked = { ...checked, [key]: !checked[key] };
    setChecked(newChecked);
    saveToBackend(columns, newChecked);
  };

  const openModal  = () => { setNewName(''); setShowInput(true); };
  const closeModal = () => setShowInput(false);

  const addList = () => {
    const name = newName.trim().toUpperCase();
    if (!name) return;
    
    const emoji = getEmojiForHabit(name);
    const colors = [
      { color: '#6366f1', bg: '#eef2ff' },
      { color: '#ec4899', bg: '#fdf2f8' },
      { color: '#f59e0b', bg: '#fffbeb' },
      { color: '#10b981', bg: '#ecfdf5' },
      { color: '#8b5cf6', bg: '#f5f3ff' },
      { color: '#3b82f6', bg: '#eff6ff' }
    ];
    const hash = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const colorScheme = colors[hash % colors.length];

    const newCol = { 
      id: `list-${Date.now()}`, 
      name, 
      sub: 'Habit', 
      iconName: emoji, 
      color: colorScheme.color,
      bg: colorScheme.bg
    };
    
    const newColumns = [...columns, newCol];
    setColumns(newColumns);
    saveToBackend(newColumns, checked);
    closeModal();
  };

  const deleteList = (colId) => {
    const newColumns = columns.filter(c => c.id !== colId);
    const newChecked = { ...checked };
    Object.keys(newChecked).forEach(k => { if (k.endsWith(`-${colId}`)) delete newChecked[k]; });
    setColumns(newColumns);
    setChecked(newChecked);
    saveToBackend(newColumns, newChecked);
  };

  const startRename  = (id, name) => { setEditingColId(id); setEditName(name); };
  const cancelRename = ()         => { setEditingColId(null); setEditName(''); };
  const saveRename   = () => {
    if (!editName.trim()) { cancelRename(); return; }
    const newColumns = columns.map(c => c.id === editingColId ? { ...c, name: editName.trim().toUpperCase() } : c);
    setColumns(newColumns);
    saveToBackend(newColumns, checked);
    cancelRename();
  };

  const handleKey       = e => { if (e.key === 'Enter') addList();    if (e.key === 'Escape') closeModal();    };
  const handleRenameKey = e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') cancelRename(); };
  const handleLogout    = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  const NOTEBOOK_TABS = ['THIS WEEK', 'STATS', 'GOALS', 'NOTES'];
  const TAB_COLORS    = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899'];

  // ── Loading state ─────────────────────────────────────
  if (loadingData) {
    return (
      <div className="w-full h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#c4a882 0%,#b8956a 100%)' }}>
        <div className="bg-[#fffcf5] rounded-2xl p-10 shadow-2xl flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#6366f1] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#172554] font-semibold">Loading your tracker…</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#c4a882 0%,#b8956a 100%)' }}
    >
      {/* ── New List Modal ─────────────────────────────── */}
      {showInput && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={closeModal}>
          <div
            className="bg-[#fffcf5] rounded-2xl shadow-2xl p-7 w-96 animate-[fadeIn_0.15s_ease] border border-[#e8e2d4]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-[#172554]">Add New Habit</h2>
                <p className="text-sm text-[#7c8499] mt-0.5">Give your new habit a name</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-[#f3f0e8] text-[#7c8499] hover:text-[#172554] flex items-center justify-center transition-colors">
                <FiX size={16} />
              </button>
            </div>
            <input
              autoFocus value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. READING, GYM, MEDITATE…"
              maxLength={14}
              className="w-full border-2 border-[#e8e2d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6366f1] transition-colors placeholder-[#b8b0a0] bg-white text-[#172554] font-semibold"
            />
            <div className="flex gap-3 mt-6">
              <button onClick={closeModal} className="flex-1 py-2.5 text-sm rounded-xl border-2 border-[#e8e2d4] text-[#7c8499] font-semibold hover:bg-[#f3f0e8] transition-colors">
                Cancel
              </button>
              <button
                onClick={addList} disabled={!newName.trim()}
                className="flex-1 py-2.5 text-sm rounded-xl bg-[#6366f1] text-white font-bold hover:bg-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                <FiPlus strokeWidth={3} /> Add Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Outer Layout ─────────────────────────────── */}
      <div className="flex h-[96vh] w-full max-w-[1400px]">

        {/* Spiral Binding */}
        <div className="w-10 shrink-0 flex flex-col items-center justify-around py-3 z-10">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="relative flex items-center justify-center w-full h-full">
              <div className="w-7 h-[10px] bg-gradient-to-b from-[#d0d0d0] via-[#888] to-[#d0d0d0] rounded-full shadow-md" />
              <div className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#b8956a] rounded-full border border-[#a07850]" />
            </div>
          ))}
        </div>

        {/* Notebook Page */}
        <div className="flex-1 bg-[#fffcf5] rounded-l-xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden border border-[#ede8db] border-r-0">

          {/* ── Header ─────────────────────────────────── */}
          <div className="px-6 py-3 shrink-0 flex justify-between items-center border-b border-[#ede8db]">
            <div className="flex items-center gap-3">
              <img
                src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.email || 'User')}`}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-[#ede8db] shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#172554] leading-tight">{user?.name || user?.email?.split('@')[0]}</span>
                {saving ? (
                  <span className="text-[10px] text-[#6366f1] font-semibold animate-pulse">saving…</span>
                ) : (
                  <span className="text-[10px] text-[#7c8499] font-medium">online</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Week Selector */}
              <div className="flex items-center gap-1.5 bg-white border border-[#ede8db] rounded-full px-3 py-1.5 shadow-sm text-sm text-[#172554] font-medium">
                <FiCalendar size={13} className="text-[#6366f1]" />
                <span className="text-xs">{weekLabel}</span>
                <button onClick={() => setWeekOffset(w => w - 1)} className="w-5 h-5 rounded-full hover:bg-[#f3f0e8] flex items-center justify-center transition-colors ml-1">
                  <FiChevronLeft size={13} />
                </button>
                <button onClick={() => setWeekOffset(w => w + 1)} className="w-5 h-5 rounded-full hover:bg-[#f3f0e8] flex items-center justify-center transition-colors">
                  <FiChevronRight size={13} />
                </button>
              </div>

              {/* + New List */}
              <button
                onClick={openModal}
                className="flex items-center gap-1.5 bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
              >
                <FiPlus strokeWidth={3} size={14} /> New List
              </button>

              {/* Logout */}
              <button onClick={handleLogout} title="Logout"
                className="w-8 h-8 rounded-full bg-white border border-[#ede8db] text-[#7c8499] hover:text-[#172554] flex items-center justify-center shadow-sm hover:scale-105 transition-all">
                <FiLogOut size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* ── Tracker Table ─────────────────────────── */}
          <div className="flex-1 overflow-hidden min-h-0">
            <table className="w-full h-full border-collapse" style={{ minWidth: 520 }}>
              <colgroup>
                <col style={{ width: 130, minWidth: 120 }} />
                {columns.map(c => <col key={c.id} />)}
                <col style={{ width: 90 }} />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-[#fffcf5]">
                <tr>
                  <th className="px-5 py-1.5 text-left border-b border-[#ede8db] border-r-2 border-r-[#f4c2c2]">
                    <div className="inline-flex items-center gap-1.5 bg-[#eef2ff] px-3 py-0.5 rounded-lg">
                      <span className="text-xs font-bold text-[#6366f1] tracking-widest">DAY</span>
                    </div>
                  </th>

                  {columns.map(col => (
                    <th key={col.id} className="px-3 py-1.5 text-center border-b border-[#ede8db] border-r border-[#ede8db] group relative">
                      {editingColId === col.id ? (
                        <input autoFocus value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={handleRenameKey} onBlur={saveRename}
                          className="w-full text-center border-b border-[#6366f1] outline-none text-sm bg-transparent font-bold text-[#172554]"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{ background: col.bg }}>
                            {col.Icon ? (
                              <col.Icon style={{ color: col.color }} size={14} />
                            ) : (
                              <span className="text-xs leading-none select-none">{col.iconName}</span>
                            )}
                            <span className="text-sm font-bold text-[#172554] tracking-wide">{col.name}</span>
                          </div>
                          <span className="text-[11px] text-[#7c8499]">{col.sub}</span>
                          <div className="absolute inset-0 bg-[#fffcf5]/95 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded">
                            <button onClick={e => { e.stopPropagation(); startRename(col.id, col.name); }}
                              className="p-1.5 bg-[#eef2ff] text-[#6366f1] rounded-full hover:bg-[#6366f1] hover:text-white transition-all" title="Rename">
                              <FiEdit2 size={11} strokeWidth={2.5} />
                            </button>
                            <button onClick={e => { e.stopPropagation(); deleteList(col.id); }}
                              className="p-1.5 bg-red-50 text-red-400 rounded-full hover:bg-red-400 hover:text-white transition-all" title="Delete">
                              <FiTrash2 size={11} strokeWidth={2.5} />
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                  ))}

                  <th className="px-2 py-1.5 text-center border-b border-[#ede8db]">
                    <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:opacity-70 transition-opacity" onClick={openModal}>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f0ff]">
                        <div className="w-3 h-3 rounded-full border border-dashed border-[#6366f1] flex items-center justify-center">
                          <FiPlus size={8} className="text-[#6366f1]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-bold text-[#6366f1] tracking-wide">NEW LIST</span>
                      </div>
                      <span className="text-[10px] text-[#7c8499]">Add habit</span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {days.map((day, rowIdx) => (
                  <tr key={day.iso} className={`border-b border-[#ede8db] last:border-b-0 transition-colors hover:bg-[#f9f7f0] ${rowIdx % 2 === 0 ? 'bg-[#fffcf5]' : 'bg-[#fdfaf2]'}`}>
                    {/* Day Cell */}
                    <td className="px-5 py-1 border-r-2 border-r-[#f4c2c2]">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#172554] leading-tight tracking-wide">{day.name}</span>
                        <span className="text-[10px] text-[#6366f1] font-medium leading-none">{day.date}</span>
                      </div>
                    </td>

                    {columns.map(col => {
                      const key = `${day.iso}-${col.id}`;
                      const isChecked = !!checked[key];
                      const today = new Date();
                      const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                      const isToday = day.iso === todayIso;
                      return (
                        <td key={col.id} className="py-1 px-3 text-center border-r border-[#ede8db]">
                          <div className="flex items-center justify-center">
                            <div
                              onClick={() => isToday && toggleCheck(day.iso, col.id)}
                              className={`
                                w-5.5 h-5.5 rounded-[6px] border-2 flex items-center justify-center
                                transition-all duration-200 select-none
                                ${!isToday
                                  ? isChecked
                                    ? 'bg-[#6366f1]/60 border-[#6366f1]/60 text-white cursor-not-allowed opacity-75'
                                    : 'bg-[#f3f0e8] border-[#e8e2d4] cursor-not-allowed opacity-50'
                                  : isChecked
                                    ? 'bg-[#6366f1] border-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.4)] scale-105 cursor-pointer'
                                    : 'bg-white border-[#c4bfdd] hover:border-[#6366f1] hover:scale-105 cursor-pointer'
                                }
                              `}
                            >
                              {isChecked && <FiCheck size={11} strokeWidth={3} className="text-white" />}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    <td className="py-1 px-2 text-center">
                      <div className="flex items-center justify-center">
                        <div
                          onClick={openModal}
                          className="w-5.5 h-5.5 rounded-full border border-dashed border-[#c4bfdd] text-[#c4bfdd] flex items-center justify-center cursor-pointer hover:border-[#6366f1] hover:text-[#6366f1] transition-all hover:scale-110"
                        >
                          <FiPlus size={10} strokeWidth={2} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Bottom Bar: Progress + Motivation ──────── */}
          <div className="shrink-0 border-t border-[#ede8db] px-5 py-2 flex items-center justify-between bg-[#faf8f0] gap-4">

            {/* Sticky motivational note */}
            <div className="hidden md:flex items-center gap-1.5 bg-[#fef9c3] border border-[#fde68a] rounded-xl px-4 py-2 shadow-sm relative text-xs">
              <FiStar size={12} className="text-[#facc15]" />
              <p className="font-bold text-[#172554]">Small steps every day lead to big results. 😊</p>
            </div>

            {/* Progress Ring */}
            <div className="flex items-center gap-3 bg-white border border-[#ede8db] rounded-xl px-4 py-1.5 shadow-sm min-w-[220px]">
              <div className="relative w-10 h-10 shrink-0">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#ede8db" strokeWidth="4" />
                  <circle
                    cx="30" cy="30" r="26" fill="none"
                    stroke="#6366f1" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (pct / 100) * circumference}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-[#172554]">{pct}%</span>
              </div>
              <div>
                <p className="text-xs font-bold text-[#172554] leading-tight">Weekly Progress</p>
                <p className="text-[10px] text-[#7c8499] mt-0.5">{checkedCount} of {totalCells} completed</p>
              </div>
            </div>

            {/* Keep going card */}
            <div className="hidden md:flex items-center gap-1.5 bg-[#f3f0ff] border border-[#ddd6fe] rounded-xl px-4 py-2 shadow-sm text-xs">
              <FiStar size={11} className="text-[#6366f1]" />
              <p className="text-[#7c8499]"><span className="font-bold text-[#172554]">Keep going!</span> Consistency today, success tomorrow.</p>
            </div>
          </div>
        </div>

        {/* ── Notebook Tabs (right side) ──────────────── */}
        <div className="flex flex-col justify-center gap-0.5 shrink-0">
          {NOTEBOOK_TABS.map((tab, i) => (
            <div key={tab} className="relative flex items-center justify-center">
              <div
                className="text-[10px] font-bold tracking-widest text-white px-1.5 py-3 rounded-r-lg select-none shadow-md"
                style={{
                  background: TAB_COLORS[i],
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)',
                  minHeight: 60,
                }}
              >
                {tab}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
