import { useState } from 'react';
import { FaYoutube, FaWalking } from 'react-icons/fa';
import { FiCode, FiPlus, FiList, FiX, FiCheck, FiLogOut, FiEdit2, FiTrash2, FiCalendar, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const INITIAL_COLUMNS = [
  { id: 'yt',   name: 'YT',   sub: 'YouTube',  Icon: FaYoutube, color: '#ef4444', bg: '#fef2f2' },
  { id: 'dsa',  name: 'DSA',  sub: 'Practice', Icon: FiCode,    color: '#6366f1', bg: '#eef2ff' },
  { id: 'walk', name: 'WALK', sub: '30 min',   Icon: FaWalking, color: '#22c55e', bg: '#f0fdf4' },
];

const WEEK_DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];

// Generate week dates starting from a Monday offset
function getWeekDates(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay(); // 0=Sun,1=Mon...
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);

  return WEEK_DAYS.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return { name, date: dateStr, iso: d.toISOString().slice(0, 10) };
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

  const days = getWeekDates(weekOffset);
  const weekLabel = getWeekLabel(weekOffset);

  // ── Progress calculation ──────────────────────────────
  const totalCells   = days.length * columns.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const pct          = totalCells === 0 ? 0 : Math.round((checkedCount / totalCells) * 100);
  const circumference = 2 * Math.PI * 26; // r=26

  // ── Handlers (all existing logic preserved) ───────────
  const toggleCheck = (dayIso, colId) => {
    const key = `${dayIso}-${colId}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openModal  = () => { setNewName(''); setShowInput(true); };
  const closeModal = () => setShowInput(false);

  const addList = () => {
    const name = newName.trim().toUpperCase();
    if (!name) return;
    setColumns(prev => [
      ...prev,
      { id: `list-${Date.now()}`, name, sub: 'Custom', Icon: FiList, color: '#6366f1', bg: '#eef2ff' },
    ]);
    closeModal();
  };

  const deleteList = (colId) => {
    setColumns(prev => prev.filter(c => c.id !== colId));
    setChecked(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => { if (k.endsWith(`-${colId}`)) delete next[k]; });
      return next;
    });
  };

  const startRename  = (id, name) => { setEditingColId(id); setEditName(name); };
  const cancelRename = ()         => { setEditingColId(null); setEditName(''); };
  const saveRename   = () => {
    if (!editName.trim()) { cancelRename(); return; }
    setColumns(prev => prev.map(c => c.id === editingColId ? { ...c, name: editName.trim().toUpperCase() } : c));
    cancelRename();
  };

  const handleKey       = e => { if (e.key === 'Enter') addList();   if (e.key === 'Escape') closeModal();    };
  const handleRenameKey = e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') cancelRename(); };
  const handleLogout    = () => navigate('/login');

  const NOTEBOOK_TABS = ['THIS WEEK', 'STATS', 'GOALS', 'NOTES'];
  const TAB_COLORS    = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899'];

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
                <h2 className="text-xl font-bold text-[#172554]" style={{ fontFamily: 'Inter, sans-serif' }}>Add New Habit</h2>
                <p className="text-sm text-[#7c8499] mt-0.5">Give your new habit a name</p>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-full bg-[#f3f0e8] text-[#7c8499] hover:text-[#172554] flex items-center justify-center transition-colors">
                <FiX size={16} />
              </button>
            </div>

            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. READING, GYM, MEDITATE…"
              maxLength={14}
              className="w-full border-2 border-[#e8e2d4] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#6366f1] transition-colors placeholder-[#b8b0a0] bg-white text-[#172554] font-semibold"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 text-sm rounded-xl border-2 border-[#e8e2d4] text-[#7c8499] font-semibold hover:bg-[#f3f0e8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addList}
                disabled={!newName.trim()}
                className="flex-1 py-2.5 text-sm rounded-xl bg-[#6366f1] text-white font-bold hover:bg-[#4f46e5] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
              >
                <FiPlus strokeWidth={3} /> Add Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Outer Layout: Spiral + Notebook + Tabs ──── */}
        <div className="flex h-[96vh] w-full max-w-[1400px]" style={{ fontFamily: 'Inter, sans-serif' }}>

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

          {/* ── Header ───────────────────────────────────── */}
          <div className="px-6 pt-5 pb-3 shrink-0 flex justify-between items-start border-b border-[#ede8db]">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <img src="/logo.png" alt="DiciplineOS" className="h-8 object-contain" onError={e => { e.target.style.display='none'; }} />
                <h1 className="text-3xl font-extrabold text-[#172554] tracking-tight leading-none">
                  Weekly Tracker
                  <span className="ml-2 text-[#facc15] text-2xl">✦</span>
                </h1>
              </div>
              <p className="text-[#7c8499] text-sm mt-0.5">
                Track your daily habits and build <span className="underline decoration-[#facc15] underline-offset-2 font-medium text-[#172554]">consistency</span>.
              </p>
            </div>

            {/* Right controls */}
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
              <button
                onClick={handleLogout}
                title="Logout"
                className="w-8 h-8 rounded-full bg-white border border-[#ede8db] text-[#7c8499] hover:text-[#172554] flex items-center justify-center shadow-sm hover:scale-105 transition-all"
              >
                <FiLogOut size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* ── Tracker Table ─────────────────────────────── */}
          <div className="flex-1 overflow-auto min-h-0">
            <table className="w-full border-collapse" style={{ minWidth: 520 }}>
              <colgroup>
                <col style={{ width: 130, minWidth: 120 }} />
                {columns.map(c => <col key={c.id} />)}
                <col style={{ width: 90 }} />
              </colgroup>

              {/* Table Header */}
              <thead className="sticky top-0 z-10 bg-[#fffcf5]">
                <tr>
                  {/* DAY header */}
                  <th className="px-5 py-3 text-left border-b border-[#ede8db] border-r-2 border-r-[#f4c2c2]">
                    <div className="inline-flex items-center gap-1.5 bg-[#eef2ff] px-3 py-1 rounded-lg">
                      <span className="text-sm font-bold text-[#6366f1] tracking-widest">DAY</span>
                    </div>
                  </th>

                  {/* Dynamic Habit Columns */}
                  {columns.map(col => (
                    <th key={col.id} className="px-3 py-3 text-center border-b border-[#ede8db] border-r border-[#ede8db] group relative">
                      {editingColId === col.id ? (
                        <input
                          autoFocus value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onKeyDown={handleRenameKey} onBlur={saveRename}
                          className="w-full text-center border-b border-[#6366f1] outline-none text-sm bg-transparent font-bold text-[#172554]"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md" style={{ background: col.bg }}>
                            <col.Icon style={{ color: col.color }} size={14} />
                            <span className="text-sm font-bold text-[#172554] tracking-wide">{col.name}</span>
                          </div>
                          <span className="text-[11px] text-[#7c8499]">{col.sub}</span>

                          {/* Hover actions */}
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

                  {/* NEW LIST header */}
                  <th className="px-2 py-3 text-center border-b border-[#ede8db]">
                    <div className="flex flex-col items-center gap-0.5 cursor-pointer hover:opacity-70 transition-opacity" onClick={openModal}>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#f3f0ff]">
                        <div className="w-3.5 h-3.5 rounded-full border border-dashed border-[#6366f1] flex items-center justify-center">
                          <FiPlus size={9} className="text-[#6366f1]" strokeWidth={2.5} />
                        </div>
                        <span className="text-[11px] font-bold text-[#6366f1] tracking-wide">NEW LIST</span>
                      </div>
                      <span className="text-[11px] text-[#7c8499]">Add habit</span>
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Table Body */}
              <tbody>
                {days.map((day, rowIdx) => (
                  <tr
                    key={day.iso}
                    className={`border-b border-[#ede8db] last:border-b-0 transition-colors hover:bg-[#f9f7f0] ${rowIdx % 2 === 0 ? 'bg-[#fffcf5]' : 'bg-[#fdfaf2]'}`}
                  >
                    {/* Day Cell */}
                    <td className="px-5 py-2.5 border-r-2 border-r-[#f4c2c2]">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#172554] leading-tight tracking-wide">{day.name}</span>
                        <span className="text-[11px] text-[#6366f1] font-medium">{day.date}</span>
                      </div>
                    </td>

                    {/* Habit Checkboxes */}
                    {columns.map(col => {
                      const key = `${day.iso}-${col.id}`;
                      const isChecked = !!checked[key];
                      return (
                        <td key={col.id} className="py-2.5 px-3 text-center border-r border-[#ede8db]">
                          <div className="flex items-center justify-center">
                            <div
                              onClick={() => toggleCheck(day.iso, col.id)}
                              className={`
                                w-6 h-6 rounded-[6px] border-2 cursor-pointer
                                flex items-center justify-center
                                transition-all duration-200 select-none
                                ${isChecked
                                  ? 'bg-[#6366f1] border-[#6366f1] shadow-[0_0_8px_rgba(99,102,241,0.4)] scale-105'
                                  : 'bg-white border-[#c4bfdd] hover:border-[#6366f1] hover:scale-105'
                                }
                              `}
                            >
                              {isChecked && <FiCheck size={13} strokeWidth={3} className="text-white" />}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* NEW LIST cell */}
                    <td className="py-2.5 px-2 text-center">
                      <div className="flex items-center justify-center">
                        <div
                          onClick={openModal}
                          className="w-6 h-6 rounded-full border border-dashed border-[#c4bfdd] text-[#c4bfdd] flex items-center justify-center cursor-pointer hover:border-[#6366f1] hover:text-[#6366f1] transition-all hover:scale-110"
                        >
                          <FiPlus size={12} strokeWidth={2} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Bottom: Progress + Motivation ─────────────── */}
          <div className="shrink-0 border-t border-[#ede8db] px-5 py-3 flex items-center gap-4 bg-[#faf8f0]">

            {/* Motivational sticky note */}
            <div className="hidden md:flex flex-col justify-center bg-[#fef9c3] border border-[#fde68a] rounded-xl px-4 py-2.5 min-w-[130px] shadow-sm relative">
              <FiStar size={12} className="absolute top-2 right-2 text-[#facc15]" />
              <p className="text-[11px] font-bold text-[#172554] leading-tight">Small steps every day</p>
              <p className="text-[11px] text-[#7c8499] leading-tight">lead to big results.</p>
              <span className="text-base mt-1">😊</span>
            </div>

            {/* Progress Ring */}
            <div className="flex items-center gap-3 bg-white border border-[#ede8db] rounded-xl px-4 py-2.5 shadow-sm flex-1 max-w-[260px]">
              <div className="relative w-14 h-14 shrink-0">
                <svg className="w-14 h-14 -rotate-90" viewBox="0 0 60 60">
                  <circle cx="30" cy="30" r="26" fill="none" stroke="#ede8db" strokeWidth="4" />
                  <circle
                    cx="30" cy="30" r="26" fill="none"
                    stroke="#6366f1" strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - (pct / 100) * circumference}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-[#172554]">{pct}%</span>
              </div>
              <div>
                <p className="text-sm font-bold text-[#172554]">Weekly Progress</p>
                <p className="text-[11px] text-[#7c8499]">{checkedCount} of {totalCells} completed</p>
              </div>
            </div>

            {/* Keep going card */}
            <div className="hidden md:flex flex-col justify-center bg-[#f3f0ff] border border-[#ddd6fe] rounded-xl px-4 py-2.5 shadow-sm min-w-[150px]">
              <div className="flex items-center gap-1.5 mb-0.5">
                <FiStar size={11} className="text-[#6366f1]" />
                <span className="text-[11px] font-bold text-[#172554]">Keep going!</span>
              </div>
              <p className="text-[11px] text-[#7c8499] leading-tight">Consistency today,</p>
              <p className="text-[11px] text-[#7c8499] leading-tight">success tomorrow.</p>
            </div>
          </div>
        </div>

        {/* ── Notebook Tabs (right side) ─────────────────── */}
        <div className="flex flex-col justify-center gap-0 shrink-0">
          {NOTEBOOK_TABS.map((tab, i) => (
            <div
              key={tab}
              className="relative flex items-center justify-center"
              style={{ marginBottom: i < NOTEBOOK_TABS.length - 1 ? 2 : 0 }}
            >
              <div
                className="writing-mode-vertical text-[10px] font-bold tracking-widest text-white px-1.5 py-3 rounded-r-lg cursor-default shadow-md select-none"
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
