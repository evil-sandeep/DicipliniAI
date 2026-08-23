import { useState, useEffect, useCallback, useRef } from 'react';
import { FaYoutube, FaWalking } from 'react-icons/fa';
import { FiCode, FiPlus, FiList, FiX, FiCheck, FiLogOut, FiEdit2, FiTrash2, FiCalendar, FiChevronLeft, FiChevronRight, FiStar, FiCheckSquare, FiSquare, FiPieChart, FiTarget, FiFileText, FiDollarSign, FiCreditCard, FiTrendingDown, FiEdit3 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const API = `${API_BASE_URL}/api/tracker`;

const INITIAL_COLUMNS = [
  { id: 'yt', name: 'YT', sub: 'YouTube', iconName: 'FaYoutube', Icon: FaYoutube, color: '#ef4444', bg: '#fef2f2' },
  { id: 'dsa', name: 'DSA', sub: 'Practice', iconName: 'FiCode', Icon: FiCode, color: '#6366f1', bg: '#eef2ff' },
  { id: 'walk', name: 'WALK', sub: '30 min', iconName: 'FaWalking', Icon: FaWalking, color: '#22c55e', bg: '#f0fdf4' },
];

const ICON_MAP = {
  FaYoutube: { Icon: FaYoutube, bg: '#fef2f2', color: '#ef4444' },
  FiCode: { Icon: FiCode, bg: '#eef2ff', color: '#6366f1' },
  FaWalking: { Icon: FaWalking, bg: '#f0fdf4', color: '#22c55e' },
  FiList: { Icon: FiList, bg: '#f3f0ff', color: '#6366f1' },
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

  const fallbacks = ['🎯', '✨', '🔥', '🚀', '📌', '⚡', '📝', '🌟'];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return fallbacks[hash % fallbacks.length];
}

const WEEK_DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

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

const CATEGORY_STYLES = {
  Personal: { bg: '#eef2ff', text: '#6366f1', border: '#c7d2fe', emoji: '👤' },
  Work: { bg: '#fdf2f8', text: '#ec4899', border: '#fbcfe8', emoji: '💼' },
  Study: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', emoji: '📚' },
  Health: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', emoji: '🏃' },
  Urgent: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', emoji: '⚡' },
};

const EXPENSE_CATEGORIES = {
  Shopping: { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8', emoji: '🛍️' },
  Food: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', emoji: '🍔' },
  Bills: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', emoji: '💳' },
  Travel: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', emoji: '🚗' },
  Others: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe', emoji: '📦' },
};

export default function TrackerPage() {
  const navigate = useNavigate();
  const [columns, setColumns] = useState(INITIAL_COLUMNS);
  const [checked, setChecked] = useState({});
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingColId, setEditingColId] = useState(null);
  const [editName, setEditName] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [animatingKey, setAnimatingKey] = useState(null);

  // ── Notebook Tab & To-Do State ───────────────────────
  const [activeTab, setActiveTab] = useState('THIS WEEK');
  const [todos, setTodos] = useState([
    { id: '1', text: 'Review daily study goals', completed: false, category: 'Study', createdAt: new Date().toISOString() },
    { id: '2', text: 'Drink 2L water & 30 min walk', completed: true, category: 'Health', createdAt: new Date().toISOString() },
  ]);
  const [newTodoText, setNewTodoText] = useState('');
  const [newTodoCat, setNewTodoCat] = useState('Personal');
  const [todoFilter, setTodoFilter] = useState('all');
  const [notesText, setNotesText] = useState('📌 Quick Notes & Ideas:\n- Focus on consistency over intensity.\n- Small daily wins build big habits.');

  // ── Monthly Expense State ────────────────────────────
  const [monthlyBudget, setMonthlyBudget] = useState(25000);
  const [expenses, setExpenses] = useState([
    { id: 'exp-1', title: 'Shopping', amount: 0, category: 'Shopping', date: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() }
  ]);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCat, setExpenseCat] = useState('Shopping');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);

  const saveTimerRef = useRef(null);
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
        if (data.todos && data.todos.length > 0) {
          setTodos(data.todos);
        }
        if (data.monthlyBudget !== undefined && data.monthlyBudget !== null) {
          setMonthlyBudget(data.monthlyBudget);
        }
        if (data.expenses && data.expenses.length > 0) {
          setExpenses(data.expenses);
        }
      })
      .catch(err => console.error('Failed to load tracker data:', err))
      .finally(() => setLoadingData(false));
  }, [navigate]);

  // ── Auto-save to backend ─────────────────────────────
  const saveToBackend = useCallback((newColumns, newChecked, newTodos = todos, newBudget = monthlyBudget, newExpenses = expenses) => {
    const token = getToken();
    if (!token) return;

    clearTimeout(saveTimerRef.current);
    setSaving(true);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const serialisableCols = newColumns.map(({ Icon, bg: _bg, ...rest }) => rest);
        await fetch(API, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            columns: serialisableCols,
            checked: newChecked,
            todos: newTodos,
            monthlyBudget: newBudget,
            expenses: newExpenses
          }),
        });
      } catch (err) {
        console.error('Save failed:', err);
      } finally {
        setSaving(false);
      }
    }, 800);
  }, [todos, monthlyBudget, expenses]);

  // ── To-Do Handlers ────────────────────────────────────
  const handleAddTodo = (e) => {
    if (e) e.preventDefault();
    if (!newTodoText.trim()) return;
    const item = {
      id: Date.now().toString(),
      text: newTodoText.trim(),
      completed: false,
      category: newTodoCat,
      createdAt: new Date().toISOString()
    };
    const updatedTodos = [item, ...todos];
    setTodos(updatedTodos);
    setNewTodoText('');
    saveToBackend(columns, checked, updatedTodos, monthlyBudget, expenses);
  };

  const handleToggleTodo = (id) => {
    const updatedTodos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTodos(updatedTodos);
    saveToBackend(columns, checked, updatedTodos, monthlyBudget, expenses);
  };

  const handleDeleteTodo = (id) => {
    const updatedTodos = todos.filter(t => t.id !== id);
    setTodos(updatedTodos);
    saveToBackend(columns, checked, updatedTodos, monthlyBudget, expenses);
  };

  const handleClearCompleted = () => {
    const updatedTodos = todos.filter(t => !t.completed);
    setTodos(updatedTodos);
    saveToBackend(columns, checked, updatedTodos, monthlyBudget, expenses);
  };

  // ── Monthly Expense Handlers ─────────────────────────
  const handleSaveBudget = (e) => {
    if (e) e.preventDefault();
    const parsed = Number(budgetInput);
    if (isNaN(parsed) || parsed < 0) return;
    setMonthlyBudget(parsed);
    setShowBudgetModal(false);
    setBudgetInput('');
    saveToBackend(columns, checked, todos, parsed, expenses);
  };

  const handleAddExpense = (e) => {
    if (e) e.preventDefault();
    const amt = Number(expenseAmount);
    if (!expenseTitle.trim() || isNaN(amt) || amt <= 0) return;

    const newExp = {
      id: `exp-${Date.now()}`,
      title: expenseTitle.trim(),
      amount: amt,
      category: expenseCat,
      date: expenseDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    const updatedExpenses = [newExp, ...expenses];
    setExpenses(updatedExpenses);
    setExpenseTitle('');
    setExpenseAmount('');
    saveToBackend(columns, checked, todos, monthlyBudget, updatedExpenses);
  };

  const handleDeleteExpense = (id) => {
    const updatedExpenses = expenses.filter(exp => exp.id !== id);
    setExpenses(updatedExpenses);
    saveToBackend(columns, checked, todos, monthlyBudget, updatedExpenses);
  };

  // Expense calculations
  const totalSpent = expenses.reduce((sum, exp) => sum + Number(exp.amount || 0), 0);
  const remainingBalance = monthlyBudget - totalSpent;
  const spentPercentage = monthlyBudget > 0 ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100)) : 0;

  // ── Habit Progress ───────────────────────────────────
  const days = getWeekDates(weekOffset);
  const weekLabel = getWeekLabel(weekOffset);
  const totalCells = days.length * columns.length;
  const checkedCount = days.reduce((count, day) => {
    columns.forEach(col => {
      const key = `${day.iso}-${col.id}`;
      if (checked[key]) count++;
    });
    return count;
  }, 0);
  const pct = totalCells === 0 ? 0 : Math.round((checkedCount / totalCells) * 100);
  const circumference = 2 * Math.PI * 26;

  // ── Handlers ─────────────────────────────────────────
  const toggleCheck = (dayIso, colId) => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (dayIso !== todayIso) return;

    const key = `${dayIso}-${colId}`;
    setAnimatingKey(key);
    setTimeout(() => setAnimatingKey(null), 450);

    const newChecked = { ...checked, [key]: !checked[key] };
    setChecked(newChecked);
    saveToBackend(columns, newChecked, todos, monthlyBudget, expenses);
  };

  const openModal = () => { setNewName(''); setShowInput(true); };
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
    saveToBackend(newColumns, checked, todos, monthlyBudget, expenses);
    closeModal();
  };

  const deleteList = (colId) => {
    const newColumns = columns.filter(c => c.id !== colId);
    const newChecked = { ...checked };
    Object.keys(newChecked).forEach(k => { if (k.endsWith(`-${colId}`)) delete newChecked[k]; });
    setColumns(newColumns);
    setChecked(newChecked);
    saveToBackend(newColumns, newChecked, todos, monthlyBudget, expenses);
  };

  const startRename = (id, name) => { setEditingColId(id); setEditName(name); };
  const cancelRename = () => { setEditingColId(null); setEditName(''); };
  const saveRename = () => {
    if (!editName.trim()) { cancelRename(); return; }
    const newColumns = columns.map(c => c.id === editingColId ? { ...c, name: editName.trim().toUpperCase() } : c);
    setColumns(newColumns);
    saveToBackend(newColumns, checked, todos, monthlyBudget, expenses);
    cancelRename();
  };

  const handleKey = e => { if (e.key === 'Enter') addList(); if (e.key === 'Escape') closeModal(); };
  const handleRenameKey = e => { if (e.key === 'Enter') saveRename(); if (e.key === 'Escape') cancelRename(); };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); };

  const NOTEBOOK_TABS = ['THIS WEEK', 'TO-DO LIST', 'MONTHLY EXP', 'STATS', 'GOALS', 'NOTES'];
  const TAB_COLORS = ['#6366f1', '#ec4899', '#10b981', '#22c55e', '#f59e0b', '#8b5cf6'];

  const filteredTodos = todos.filter(t => {
    if (todoFilter === 'active') return !t.completed;
    if (todoFilter === 'completed') return t.completed;
    return true;
  });
  const completedTodosCount = todos.filter(t => t.completed).length;

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
            className="bg-[#fffcf5] rounded-2xl p-6 w-80 shadow-2xl border border-[#ede8db] relative animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={closeModal} className="absolute top-4 right-4 text-[#7c8499] hover:text-[#172554]">
              <FiX size={18} />
            </button>
            <h3 className="text-base font-bold text-[#172554] mb-1">Add New Habit</h3>
            <p className="text-xs text-[#7c8499] mb-4">Enter habit title (e.g. Gym, Reading, Code)</p>

            <input
              autoFocus
              type="text"
              placeholder="Habit name…"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleKey}
              className="w-full px-3 py-2 border border-[#ede8db] rounded-lg text-sm bg-white outline-none focus:border-[#6366f1] mb-4 font-semibold text-[#172554]"
            />

            <div className="flex justify-end gap-2">
              <button onClick={closeModal} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[#7c8499] hover:bg-[#f3f0ff]">
                Cancel
              </button>
              <button
                onClick={addList}
                className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#6366f1] hover:bg-[#4f46e5] shadow-sm transition-all"
              >
                Add Habit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Budget Modal ───────────────────────────────── */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowBudgetModal(false)}>
          <div
            className="bg-[#fffcf5] rounded-2xl p-6 w-84 shadow-2xl border border-[#ede8db] relative animate-in fade-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            <button onClick={() => setShowBudgetModal(false)} className="absolute top-4 right-4 text-[#7c8499] hover:text-[#172554]">
              <FiX size={18} />
            </button>
            <h3 className="text-base font-bold text-[#172554] mb-1">Set Monthly Budget</h3>
            <p className="text-xs text-[#7c8499] mb-4">Enter your total budget for this month (e.g. 25000)</p>

            <form onSubmit={handleSaveBudget}>
              <div className="relative mb-4">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-[#64748b]">₹</span>
                <input
                  autoFocus
                  type="number"
                  placeholder="25000"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 border border-[#ede8db] rounded-lg text-sm bg-white outline-none focus:border-[#10b981] font-semibold text-[#172554]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowBudgetModal(false)} className="px-4 py-1.5 rounded-lg text-xs font-semibold text-[#7c8499] hover:bg-[#f1f5f9]">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-[#10b981] hover:bg-[#059669] shadow-sm transition-all"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Outer Layout ──────────────────────────────── */}
      <div className="w-[98vw] h-[95vh] flex">

        {/* Spiral Spine */}
        <div className="w-10 bg-[#3a3530] rounded-l-xl flex flex-col justify-around items-center py-4 z-10 shadow-lg border-r border-[#2d2925] shrink-0">
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className="w-7 h-3.5 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 rounded-full shadow-inner border border-gray-500 transform -rotate-12" />
          ))}
        </div>

        {/* Notebook Page */}
        <div className="flex-1 bg-[#fffcf5] rounded-l-xl flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden border border-[#cbd5e1] border-r-0">

          {/* ── Header ─────────────────────────────────── */}
          <div className="px-6 py-3 shrink-0 flex justify-between items-center border-b border-[#cbd5e1]">
            <div className="flex items-center gap-3">
              <img
                src={user?.picture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.email || 'User')}`}
                alt="Profile"
                className="w-9 h-9 rounded-full object-cover border border-[#cbd5e1] shadow-sm"
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
              {activeTab === 'THIS WEEK' && (
                <div className="flex items-center gap-1.5 bg-white border border-[#cbd5e1] rounded-full px-3 py-1.5 shadow-sm text-sm text-[#172554] font-medium">
                  <FiCalendar size={13} className="text-[#6366f1]" />
                  <span className="text-xs">{weekLabel}</span>
                  <button onClick={() => setWeekOffset(w => w - 1)} className="w-5 h-5 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center transition-colors ml-1">
                    <FiChevronLeft size={12} />
                  </button>
                  <button onClick={() => setWeekOffset(w => w + 1)} className="w-5 h-5 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center transition-colors">
                    <FiChevronRight size={12} />
                  </button>
                </div>
              )}

              {activeTab === 'TO-DO LIST' && (
                <div className="flex items-center gap-2 bg-[#fdf2f8] border border-[#fbcfe8] rounded-full px-3 py-1 text-xs font-bold text-[#ec4899]">
                  <FiCheckSquare size={13} />
                  <span>{completedTodosCount} of {todos.length} Done</span>
                </div>
              )}

              {activeTab === 'MONTHLY EXP' && (
                <button
                  onClick={() => { setBudgetInput(monthlyBudget.toString()); setShowBudgetModal(true); }}
                  className="flex items-center gap-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-full px-3 py-1 text-xs font-bold text-[#16a34a] hover:bg-[#dcfce7] transition-all shadow-sm"
                >
                  <FiEdit3 size={13} />
                  <span>Edit Budget</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                title="Log Out"
                className="w-8 h-8 rounded-full bg-white border border-[#cbd5e1] text-[#7c8499] hover:text-[#172554] flex items-center justify-center shadow-sm hover:scale-105 transition-all"
              >
                <FiLogOut size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* ── Active Tab View Content ─────────────────── */}
          <div className="flex-1 overflow-auto bg-[#fffcf5] relative">

            {/* TAB 1: THIS WEEK (HABIT TRACKER MATRIX) */}
            {activeTab === 'THIS WEEK' && (
              <table className="w-full h-full border-collapse" style={{ minWidth: 520 }}>
                <colgroup>
                  <col style={{ width: 130, minWidth: 120 }} />
                  {columns.map(c => <col key={c.id} />)}
                  <col style={{ width: 90 }} />
                </colgroup>

                <thead className="sticky top-0 z-10 bg-[#fffcf5]">
                  <tr>
                    <th className="px-5 py-1.5 text-left border-b border-[#cbd5e1] border-r-2 border-r-[#fca5a5]">
                      <div className="inline-flex items-center gap-1.5 bg-[#eef2ff] px-3 py-0.5 rounded-lg border border-[#e0e7ff]">
                        <span className="text-xs font-bold text-[#6366f1] tracking-widest">DAY</span>
                      </div>
                    </th>

                    {columns.map(col => (
                      <th key={col.id} className="px-3 py-1.5 text-center border-b border-[#cbd5e1] border-r border-[#cbd5e1] group relative">
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

                    <th className="px-2 py-1.5 text-center border-b border-[#cbd5e1]">
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
                  {days.map((day, rowIdx) => {
                    const today = new Date();
                    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                    const isCurrentDay = day.iso === todayIso;
                    return (
                      <tr key={day.iso} className={`border-b border-[#cbd5e1] last:border-b-0 transition-colors ${isCurrentDay ? 'bg-[#eef2ff]/50 hover:bg-[#e0e7ff]/60' : rowIdx % 2 === 0 ? 'bg-[#fffcf5]' : 'bg-[#f8fafc]'}`}>
                        <td className="px-5 py-1 border-r-2 border-r-[#fca5a5]">
                          <div className="flex flex-col">
                            <span className={`text-sm font-bold leading-tight tracking-wide ${isCurrentDay ? 'text-[#4338ca]' : 'text-[#172554]'}`}>{day.name}</span>
                            <span className={`text-[10px] font-medium leading-none ${isCurrentDay ? 'text-[#6366f1] font-bold' : 'text-[#64748b]'}`}>{day.date}</span>
                          </div>
                        </td>

                        {columns.map(col => {
                          const key = `${day.iso}-${col.id}`;
                          const isFuture = day.iso > todayIso;
                          const isToday = day.iso === todayIso;
                          const isChecked = isFuture ? false : !!checked[key];
                          const isAnimating = animatingKey === key;
                          return (
                            <td key={col.id} className="py-1 px-3 text-center border-r border-[#cbd5e1]">
                              <div className="flex items-center justify-center">
                                <div
                                  onClick={() => isToday && toggleCheck(day.iso, col.id)}
                                  className={`
                                    w-6 h-6 rounded-[7px] border-2 flex items-center justify-center
                                    transition-all duration-200 select-none
                                    ${isAnimating ? 'animate-vibrate' : ''}
                                    ${isFuture
                                      ? 'bg-[#f1f5f9] border-[#cbd5e1] cursor-not-allowed opacity-40'
                                      : !isToday
                                        ? isChecked
                                          ? 'bg-[#6366f1]/50 border-[#6366f1]/50 text-white cursor-not-allowed opacity-60'
                                          : 'bg-[#f8fafc] border-[#cbd5e1] cursor-not-allowed opacity-40'
                                        : isChecked
                                          ? 'bg-[#6366f1] border-[#6366f1] shadow-[0_0_10px_rgba(99,102,241,0.45)] scale-105 cursor-pointer'
                                          : 'bg-white border-[#94a3b8] hover:border-[#6366f1] hover:scale-110 cursor-pointer shadow-sm'
                                    }
                                  `}
                                >
                                  {isChecked && <FiCheck size={12} strokeWidth={3} className="text-white" />}
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
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* TAB 2: TO-DO LIST VIEW */}
            {activeTab === 'TO-DO LIST' && (
              <div className="p-6 max-w-3xl mx-auto flex flex-col h-full">
                <div className="flex items-center justify-between pb-4 border-b border-[#cbd5e1] mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#172554] flex items-center gap-2">
                      <span>📝</span> My To-Do List
                    </h2>
                    <p className="text-xs text-[#64748b]">Manage daily tasks, priorities & action items</p>
                  </div>

                  <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl border border-[#cbd5e1]">
                    {['all', 'active', 'completed'].map(f => (
                      <button
                        key={f}
                        onClick={() => setTodoFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${todoFilter === f ? 'bg-white text-[#6366f1] shadow-sm' : 'text-[#64748b] hover:text-[#172554]'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleAddTodo} className="bg-white p-3 rounded-2xl border border-[#cbd5e1] shadow-sm flex flex-col md:flex-row items-center gap-3 mb-6">
                  <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTodoText}
                    onChange={e => setNewTodoText(e.target.value)}
                    className="flex-1 px-4 py-2 border border-[#e2e8f0] rounded-xl text-sm outline-none focus:border-[#ec4899] font-medium text-[#172554] bg-[#fafafa]"
                  />

                  <div className="flex items-center gap-1 shrink-0">
                    {Object.keys(CATEGORY_STYLES).map(cat => {
                      const style = CATEGORY_STYLES[cat];
                      const isSelected = newTodoCat === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setNewTodoCat(cat)}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'shadow-sm scale-105' : 'opacity-60 hover:opacity-100'}`}
                          style={{
                            background: style.bg,
                            color: style.text,
                            borderColor: style.border
                          }}
                        >
                          {style.emoji} {cat}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#ec4899] hover:bg-[#db2777] shadow-sm transition-all flex items-center gap-1 shrink-0"
                  >
                    <FiPlus size={14} strokeWidth={3} /> Add
                  </button>
                </form>

                <div className="flex-1 overflow-auto pr-1 space-y-2.5">
                  {filteredTodos.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-center border-2 border-dashed border-[#cbd5e1] rounded-2xl p-6">
                      <span className="text-3xl mb-2">🎉</span>
                      <p className="text-sm font-bold text-[#172554]">No tasks found</p>
                      <p className="text-xs text-[#64748b]">Add your first to-do item above to stay on track!</p>
                    </div>
                  ) : (
                    filteredTodos.map(todo => {
                      const catStyle = CATEGORY_STYLES[todo.category] || CATEGORY_STYLES.Personal;
                      return (
                        <div
                          key={todo.id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 shadow-sm ${todo.completed ? 'bg-[#f8fafc] border-[#e2e8f0] opacity-75' : 'bg-white border-[#cbd5e1] hover:border-[#ec4899]'}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                              onClick={() => handleToggleTodo(todo.id)}
                              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${todo.completed ? 'bg-[#ec4899] border-[#ec4899] text-white' : 'border-[#cbd5e1] hover:border-[#ec4899] bg-white'}`}
                            >
                              {todo.completed && <FiCheck size={14} strokeWidth={3} />}
                            </button>

                            <span className={`text-sm font-semibold truncate text-[#172554] ${todo.completed ? 'line-through text-[#94a3b8]' : ''}`}>
                              {todo.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-bold border"
                              style={{ background: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}
                            >
                              {catStyle.emoji} {todo.category}
                            </span>

                            <button
                              onClick={() => handleDeleteTodo(todo.id)}
                              className="p-1.5 text-[#94a3b8] hover:text-[#ef4444] rounded-lg hover:bg-red-50 transition-all"
                              title="Delete task"
                            >
                              <FiTrash2 size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {todos.some(t => t.completed) && (
                  <div className="pt-3 border-t border-[#cbd5e1] mt-3 flex justify-between items-center text-xs">
                    <span className="text-[#64748b] font-medium">{completedTodosCount} completed</span>
                    <button
                      onClick={handleClearCompleted}
                      className="text-[#ec4899] font-bold hover:underline"
                    >
                      Clear Completed
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MONTHLY EXPENSE VIEW */}
            {activeTab === 'MONTHLY EXP' && (
              <div className="p-6 w-full h-full flex flex-col md:flex-row gap-6 overflow-hidden">

                {/* LEFT SIDE: Fixed Control & Budget Panel */}
                <div className="w-full md:w-1/2 flex flex-col gap-4 overflow-y-auto pr-1">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e1]">
                    <div>
                      <h2 className="text-lg font-bold text-[#172554] flex items-center gap-2">
                        <span>💰</span> Monthly Expense Tracker
                      </h2>
                      <p className="text-[11px] text-[#64748b]">Track budget, daily spends & remaining balance</p>
                    </div>

                    <button
                      onClick={() => { setBudgetInput(monthlyBudget.toString()); setShowBudgetModal(true); }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl text-xs font-bold text-[#16a34a] hover:bg-[#dcfce7] transition-all shadow-sm shrink-0"
                    >
                      <FiEdit3 size={12} /> Set Budget
                    </button>
                  </div>

                  {/* 3 Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Monthly Budget Card */}
                    <div className="bg-white p-3 rounded-xl border border-[#cbd5e1] shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] text-[#64748b] font-semibold">
                        <span>Monthly Budget</span>
                        <FiDollarSign className="text-[#10b981]" />
                      </div>
                      <div className="mt-1.5">
                        <span className="text-xl font-extrabold text-[#172554]">₹{monthlyBudget.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Total Spent Card */}
                    <div className="bg-white p-3 rounded-xl border border-[#cbd5e1] shadow-sm flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] text-[#64748b] font-semibold">
                        <span>Total Spent</span>
                        <FiTrendingDown className="text-[#ef4444]" />
                      </div>
                      <div className="mt-1.5">
                        <span className="text-xl font-extrabold text-[#ef4444]">₹{totalSpent.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Remaining Balance Card */}
                    <div className={`p-3 rounded-xl border shadow-sm flex flex-col justify-between transition-all ${remainingBalance < 0
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : remainingBalance <= monthlyBudget * 0.2
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}>
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span>Remaining Balance</span>
                        <FiCreditCard />
                      </div>
                      <div className="mt-1.5">
                        <span className="text-xl font-extrabold">₹{remainingBalance.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="bg-white p-3 rounded-xl border border-[#cbd5e1] shadow-sm space-y-1">
                    <div className="flex justify-between text-xs font-bold text-[#172554]">
                      <span>Budget Used ({spentPercentage}%)</span>
                      <span>₹{totalSpent.toLocaleString('en-IN')} / ₹{monthlyBudget.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${spentPercentage > 90 ? 'bg-red-500' : spentPercentage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                        style={{ width: `${spentPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Add Expense Form */}
                  <form onSubmit={handleAddExpense} className="bg-white p-3.5 rounded-xl border border-[#cbd5e1] shadow-sm flex flex-col gap-3">
                    <h4 className="text-xs font-bold text-[#172554] tracking-wide uppercase">Add New Expense</h4>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Expense title (e.g. Shopping, Milk)..."
                        value={expenseTitle}
                        onChange={e => setExpenseTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-[#e2e8f0] rounded-xl text-xs outline-none focus:border-[#10b981] font-medium text-[#172554] bg-[#fafafa]"
                      />

                      <div className="relative shrink-0 sm:w-32">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-[#64748b]">₹</span>
                        <input
                          type="number"
                          placeholder="Amount"
                          value={expenseAmount}
                          onChange={e => setExpenseAmount(e.target.value)}
                          className="w-full pl-6 pr-2.5 py-1.5 border border-[#e2e8f0] rounded-xl text-xs outline-none focus:border-[#10b981] font-medium text-[#172554] bg-[#fafafa]"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={e => setExpenseDate(e.target.value)}
                        className="px-2.5 py-1.5 border border-[#e2e8f0] rounded-xl text-xs font-medium text-[#172554] outline-none focus:border-[#10b981] bg-[#fafafa]"
                      />

                      {/* Category Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto">
                        {Object.keys(EXPENSE_CATEGORIES).map(cat => {
                          const style = EXPENSE_CATEGORIES[cat];
                          const isSelected = expenseCat === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setExpenseCat(cat)}
                              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all border ${isSelected ? 'shadow-sm scale-105' : 'opacity-60 hover:opacity-100'}`}
                              style={{ background: style.bg, color: style.text, borderColor: style.border }}
                              title={cat}
                            >
                              {style.emoji}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#10b981] hover:bg-[#059669] shadow-sm transition-all flex items-center gap-1 shrink-0"
                      >
                        <FiPlus size={14} strokeWidth={3} /> Add
                      </button>
                    </div>
                  </form>
                </div>

                {/* RIGHT SIDE: Scrollable Expense History */}
                <div className="w-full md:w-1/2 flex flex-col h-full bg-[#fdfbf7] p-4 rounded-2xl border border-[#cbd5e1] overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-[#cbd5e1] mb-3 shrink-0">
                    <h3 className="text-xs font-bold text-[#64748b] tracking-wider uppercase flex items-center gap-1.5">
                      <span>📋</span> EXPENSE HISTORY
                    </h3>
                    <span className="text-[11px] font-semibold text-[#10b981] bg-[#f0fdf4] px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
                      {expenses.length} Entries
                    </span>
                  </div>

                  {/* Scrollable list container */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1.5">
                    {expenses.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed border-[#cbd5e1] rounded-2xl p-6">
                        <span className="text-3xl mb-2">💸</span>
                        <p className="text-sm font-bold text-[#172554]">No expenses logged yet</p>
                        <p className="text-xs text-[#64748b]">Add your daily expenses on the left to calculate remaining balance!</p>
                      </div>
                    ) : (
                      expenses.map(exp => {
                        const catStyle = EXPENSE_CATEGORIES[exp.category] || EXPENSE_CATEGORIES.Others;
                        const formattedDate = new Date(exp.date || Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        });

                        return (
                          <div
                            key={exp.id}
                            className="bg-white p-3 rounded-xl border border-[#cbd5e1] hover:border-[#10b981] shadow-sm flex items-center justify-between gap-3 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span
                                className="px-2 py-0.5 rounded-lg text-xs font-bold border shrink-0"
                                style={{ background: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}
                              >
                                {catStyle.emoji} {exp.category}
                              </span>

                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-[#172554] truncate">{exp.title}</span>
                                <span className="text-[10px] font-semibold text-[#64748b] flex items-center gap-1">
                                  <FiCalendar size={9} /> {formattedDate}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 shrink-0">
                              <span className="text-sm font-extrabold text-[#ef4444]">
                                -₹{Number(exp.amount).toLocaleString('en-IN')}
                              </span>
                              <button
                                onClick={() => handleDeleteExpense(exp.id)}
                                className="p-1 text-[#94a3b8] hover:text-[#ef4444] rounded-lg hover:bg-red-50 transition-all"
                                title="Delete expense"
                              >
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 4: STATS VIEW */}
            {activeTab === 'STATS' && (
              <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
                <div className="border-b border-[#cbd5e1] pb-3">
                  <h2 className="text-xl font-bold text-[#172554] flex items-center gap-2">
                    <FiPieChart className="text-[#22c55e]" /> Habit Statistics & Progress
                  </h2>
                  <p className="text-xs text-[#64748b]">Track your daily and weekly completion rates</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-[#cbd5e1] shadow-sm flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-[#6366f1]">{pct}%</span>
                    <span className="text-xs font-bold text-[#172554] mt-1">Weekly Success Rate</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#cbd5e1] shadow-sm flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-[#22c55e]">{checkedCount}</span>
                    <span className="text-xs font-bold text-[#172554] mt-1">Total Habits Done</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-[#cbd5e1] shadow-sm flex flex-col items-center col-span-2 md:col-span-1">
                    <span className="text-3xl font-extrabold text-[#f59e0b]">{columns.length}</span>
                    <span className="text-xs font-bold text-[#172554] mt-1">Active Habit Lists</span>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#cbd5e1] shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-[#172554]">Habit Breakdown</h3>
                  {columns.map(col => {
                    const colCheckedCount = days.filter(d => checked[`${d.iso}-${col.id}`]).length;
                    const colPct = Math.round((colCheckedCount / 7) * 100);
                    return (
                      <div key={col.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#172554] flex items-center gap-1.5">
                            {col.Icon ? <col.Icon style={{ color: col.color }} size={12} /> : col.iconName} {col.name}
                          </span>
                          <span style={{ color: col.color }}>{colCheckedCount}/7 days ({colPct}%)</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#f1f5f9] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${colPct}%`, background: col.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: GOALS VIEW */}
            {activeTab === 'GOALS' && (
              <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
                <div className="border-b border-[#cbd5e1] pb-3">
                  <h2 className="text-xl font-bold text-[#172554] flex items-center gap-2">
                    <FiTarget className="text-[#f59e0b]" /> Weekly & Monthly Goals
                  </h2>
                  <p className="text-xs text-[#64748b]">Set target milestones for personal growth</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#fffbeb] border border-[#fde68a] p-4 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-[#d97706] tracking-wider uppercase">🎯 Short-term Target</span>
                    <h3 className="text-base font-bold text-[#172554] mt-1">Complete 80%+ Habits This Week</h3>
                    <p className="text-xs text-[#64748b] mt-1">Keep ticking off daily tasks consistently to build momentum.</p>
                  </div>

                  <div className="bg-[#eef2ff] border border-[#c7d2fe] p-4 rounded-2xl shadow-sm">
                    <span className="text-xs font-bold text-[#4f46e5] tracking-wider uppercase">🚀 Monthly Vision</span>
                    <h3 className="text-base font-bold text-[#172554] mt-1">Master New Skill Routine</h3>
                    <p className="text-xs text-[#64748b] mt-1">Practice coding and health habits without missing 3 consecutive days.</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: NOTES VIEW */}
            {activeTab === 'NOTES' && (
              <div className="p-6 max-w-2xl mx-auto flex flex-col h-full gap-4">
                <div className="border-b border-[#cbd5e1] pb-2 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-[#172554] flex items-center gap-2">
                      <FiFileText className="text-[#8b5cf6]" /> Quick Notepad
                    </h2>
                    <p className="text-xs text-[#64748b]">Write down quick thoughts, reflections and reminders</p>
                  </div>
                </div>

                <textarea
                  value={notesText}
                  onChange={e => setNotesText(e.target.value)}
                  placeholder="Type your notes here..."
                  className="flex-1 w-full p-4 rounded-2xl border border-[#cbd5e1] text-sm bg-white outline-none focus:border-[#8b5cf6] font-mono leading-relaxed text-[#172554] shadow-sm resize-none"
                  style={{ minHeight: 280 }}
                />
              </div>
            )}

          </div>

          {/* ── Bottom Bar: Progress + Motivation ──────── */}
          <div className="shrink-0 border-t border-[#ede8db] px-5 py-2 flex items-center justify-between bg-[#faf8f0] gap-4">

            <div className="hidden md:flex items-center gap-1.5 bg-[#fef9c3] border border-[#fde68a] rounded-xl px-4 py-2 shadow-sm relative text-xs">
              <FiStar size={12} className="text-[#facc15]" />
              <p className="font-bold text-[#172554]">Small steps every day lead to big results. 😊</p>
            </div>

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

            <div className="hidden md:flex items-center gap-1.5 bg-[#f3f0ff] border border-[#ddd6fe] rounded-xl px-4 py-2 shadow-sm text-xs">
              <FiStar size={11} className="text-[#6366f1]" />
              <p className="text-[#7c8499]"><span className="font-bold text-[#172554]">Keep going!</span> Consistency today, success tomorrow.</p>
            </div>
          </div>
        </div>

        {/* ── Notebook Tabs (right side) ──────────────── */}
        <div className="flex flex-col justify-center gap-1 shrink-0">
          {NOTEBOOK_TABS.map((tab, i) => {
            const isActive = activeTab === tab;
            return (
              <div key={tab} className="relative flex items-center justify-center">
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`text-[10px] font-extrabold tracking-widest text-white px-2 py-3 rounded-r-xl select-none shadow-md transition-all cursor-pointer border-r-2 border-y border-white/20 ${isActive ? 'scale-105 shadow-xl opacity-100 ring-2 ring-white/50' : 'opacity-75 hover:opacity-100 hover:scale-105'}`}
                  style={{
                    background: TAB_COLORS[i],
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: isActive ? 'rotate(180deg) translateX(-3px)' : 'rotate(180deg)',
                    minHeight: 60,
                  }}
                >
                  {tab}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
