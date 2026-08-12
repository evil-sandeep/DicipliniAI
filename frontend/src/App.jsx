import { useState } from 'react';
import { 
  FiCheck, 
  FiPlus, 
  FiTrash2, 
  FiEdit, 
  FiCalendar, 
  FiFlag, 
  FiSearch, 
  FiBell, 
  FiFolder, 
  FiMoreVertical, 
  FiClock, 
  FiUser, 
  FiLogOut, 
  FiGrid, 
  FiList, 
  FiChevronRight, 
  FiSun, 
  FiMoon, 
  FiHash, 
  FiSettings, 
  FiCheckCircle, 
  FiInfo,
  FiPaperclip, 
  FiAlignLeft,
  FiSliders,
  FiTrendingUp,
  FiHelpCircle
} from 'react-icons/fi';

// Static seed data for visual mockup and basic click interactions
const INITIAL_LISTS = [
  { id: '1', name: 'Work Project', icon: '💼', count: 4, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  { id: '2', name: 'Personal Stuff', icon: '🚀', count: 3, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20' },
  { id: '3', name: 'Groceries', icon: '🛒', count: 2, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  { id: '4', name: 'Fitness & Health', icon: '🏋️', count: 0, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
];

const INITIAL_TASKS = [
  {
    id: 't1',
    listId: '1',
    title: 'Refactor database schemas for task service',
    description: 'Optimize queries and index the listId and status columns for faster retrieval under high concurrent load.',
    completed: false,
    priority: 'high',
    dueDate: 'Yesterday',
    dueStatus: 'overdue',
    tags: ['Backend', 'Performance'],
    notes: 'Make sure to write a migration script for existing data. Check the local cluster configuration before applying changes.'
  },
  {
    id: 't2',
    listId: '1',
    title: 'Create API documentation with Swagger',
    description: 'Define request and response payloads for lists and tasks endpoints in the OpenAPI spec.',
    completed: false,
    priority: 'medium',
    dueDate: 'Today, 5:00 PM',
    dueStatus: 'today',
    tags: ['API', 'Docs'],
    notes: 'We should include examples for validation errors (400 Bad Request).'
  },
  {
    id: 't3',
    listId: '1',
    title: 'Initialize Git repository and branch setup',
    description: 'Configure workspace, setup git ignore, and push initial skeleton repository to GitHub.',
    completed: true,
    priority: 'low',
    dueDate: 'Completed Today',
    dueStatus: 'completed',
    tags: ['Git', 'DevOps'],
    notes: 'Created the project-setup-ui branch. Standardized folder structure for frontend and future backend.'
  },
  {
    id: 't4',
    listId: '1',
    title: 'Design frontend state management architecture',
    description: 'Decide on Context API vs Zustand and define store interfaces for task and list management.',
    completed: false,
    priority: 'high',
    dueDate: 'Aug 15',
    dueStatus: 'upcoming',
    tags: ['Frontend', 'Architecture'],
    notes: 'Need a store that can sync list-level states and handles optimistic updates easily.'
  },
  {
    id: 't5',
    listId: '2',
    title: 'Book dental appointment',
    description: 'Routine cleaning and checkup before the end of the month.',
    completed: false,
    priority: 'medium',
    dueDate: 'Aug 18',
    dueStatus: 'upcoming',
    tags: ['Health', 'Personal'],
    notes: 'Call the office at 555-0199.'
  },
  {
    id: 't6',
    listId: '2',
    title: 'Plan weekend trip itinerary',
    description: 'Choose hotels, restaurants, and key attractions for the trip to the mountains.',
    completed: false,
    priority: 'low',
    dueDate: 'Friday',
    dueStatus: 'upcoming',
    tags: ['Leisure'],
    notes: 'Check weather forecast first.'
  },
  {
    id: 't7',
    listId: '2',
    title: 'Renew car insurance policy',
    description: 'Compare quotes from GEICO and Progressive and renew before expiration date.',
    completed: true,
    priority: 'high',
    dueDate: 'Completed Yesterday',
    dueStatus: 'completed',
    tags: ['Finance'],
    notes: 'Auto-renewal was disabled last year.'
  },
  {
    id: 't8',
    listId: '3',
    title: 'Organic almond milk & cold brew concentrate',
    description: 'Pick up 2 bottles of unsweetened vanilla almond milk and 1 medium roast concentrate.',
    completed: false,
    priority: 'low',
    dueDate: 'Today',
    dueStatus: 'today',
    tags: ['Grocery'],
    notes: 'Check the aisle near dairy.'
  },
  {
    id: 't9',
    listId: '3',
    title: 'Fresh salmon fillets & asparagus',
    description: 'Get wild-caught salmon and one bunch of fresh green asparagus for dinner.',
    completed: false,
    priority: 'medium',
    dueDate: 'Today',
    dueStatus: 'today',
    tags: ['Grocery', 'Cooking'],
    notes: 'Salmon should be around 1 lb.'
  }
];

function App() {
  const [selectedListId, setSelectedListId] = useState('1');
  const [activeTab, setActiveTab] = useState('all'); // all, active, completed
  const [selectedTaskId, setSelectedTaskId] = useState('t1');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentFilter, setCurrentFilter] = useState('all'); // all, today, important, completed (Quick sidebar filters)

  // Find details
  const activeList = INITIAL_LISTS.find(l => l.id === selectedListId) || INITIAL_LISTS[0];
  
  // Filter tasks based on selected list, sidebar category, search query, and tabs
  const filteredTasks = INITIAL_TASKS.filter(task => {
    // Search query filter
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase()) && !task.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Sidebar navigation/filter selection
    if (currentFilter === 'all') {
      // Must match active list
      if (task.listId !== selectedListId) return false;
    } else if (currentFilter === 'today') {
      if (task.dueStatus !== 'today') return false;
    } else if (currentFilter === 'important') {
      if (task.priority !== 'high') return false;
    } else if (currentFilter === 'completed') {
      if (!task.completed) return false;
    }

    // Tab filter (All / Active / Completed)
    if (activeTab === 'active') {
      return !task.completed;
    }
    if (activeTab === 'completed') {
      return task.completed;
    }

    return true;
  });

  const selectedTask = INITIAL_TASKS.find(t => t.id === selectedTaskId) || filteredTasks[0] || null;

  // Calculate statistics for the currently viewable set of tasks
  const listTasks = INITIAL_TASKS.filter(t => t.listId === selectedListId);
  const totalTasksCount = listTasks.length;
  const completedTasksCount = listTasks.filter(t => t.completed).length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Quick statistics
  const importantTasksCount = INITIAL_TASKS.filter(t => t.priority === 'high' && !t.completed).length;
  const todayTasksCount = INITIAL_TASKS.filter(t => t.dueStatus === 'today' && !t.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-900 bg-slate-900/40 backdrop-blur-xl flex flex-col z-10 shrink-0">
        {/* Brand logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-900/80 gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <FiCheck className="w-5 h-5 text-white stroke-[3]" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            DiscipliniAI
          </span>
        </div>

        {/* User profile */}
        <div className="p-4 border-b border-slate-900/80">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-900/30 border border-slate-800/40">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center font-semibold text-white shadow-md">
              S
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-200 truncate">Sandeep</h4>
              <p className="text-xs text-slate-400 truncate">Workspace Owner</p>
            </div>
            <button className="text-slate-400 hover:text-white transition-colors p-1" title="Settings">
              <FiSettings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Quick Filters */}
          <div className="space-y-1">
            <p className="px-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Focus Mode</p>
            
            <button 
              onClick={() => { setCurrentFilter('all'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                currentFilter === 'all' 
                  ? 'bg-brand-500/10 text-brand-300 font-medium border border-brand-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FiGrid className="w-4 h-4" />
                <span>All Tasks</span>
              </div>
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-mono">
                {INITIAL_TASKS.length}
              </span>
            </button>

            <button 
              onClick={() => { setCurrentFilter('today'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                currentFilter === 'today' 
                  ? 'bg-brand-500/10 text-brand-300 font-medium border border-brand-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FiClock className="w-4 h-4 text-emerald-400" />
                <span>Due Today</span>
              </div>
              {todayTasksCount > 0 && (
                <span className="text-xs bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 px-1.5 py-0.5 rounded-md font-mono font-medium">
                  {todayTasksCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => { setCurrentFilter('important'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                currentFilter === 'important' 
                  ? 'bg-brand-500/10 text-brand-300 font-medium border border-brand-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FiFlag className="w-4 h-4 text-rose-400" />
                <span>Important</span>
              </div>
              {importantTasksCount > 0 && (
                <span className="text-xs bg-rose-500/10 border border-rose-500/25 text-rose-400 px-1.5 py-0.5 rounded-md font-mono font-medium">
                  {importantTasksCount}
                </span>
              )}
            </button>

            <button 
              onClick={() => { setCurrentFilter('completed'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                currentFilter === 'completed' 
                  ? 'bg-brand-500/10 text-brand-300 font-medium border border-brand-500/20' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FiCheckCircle className="w-4 h-4 text-blue-400" />
                <span>Completed</span>
              </div>
              <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md font-mono">
                {INITIAL_TASKS.filter(t => t.completed).length}
              </span>
            </button>
          </div>

          {/* List Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-2 mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Lists</p>
              {/* Plus button disabled or tooltip indicating static branch */}
              <button 
                className="text-slate-500 hover:text-white p-1 hover:bg-slate-800/40 rounded transition-colors group relative"
                title="Create New List (Coming Soon)"
              >
                <FiPlus className="w-4 h-4" />
                <span className="absolute hidden group-hover:block bottom-full right-0 mb-1 w-28 bg-slate-900 text-slate-300 text-[10px] text-center p-1 rounded border border-slate-800 shadow-xl pointer-events-none">
                  New List modal disabled in setup
                </span>
              </button>
            </div>

            {INITIAL_LISTS.map((list) => {
              const isActive = selectedListId === list.id && currentFilter === 'all';
              return (
                <button
                  key={list.id}
                  onClick={() => {
                    setSelectedListId(list.id);
                    setCurrentFilter('all'); // Go back to normal list view
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 group ${
                    isActive 
                      ? 'bg-slate-800/60 text-slate-200 font-medium border border-slate-700/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="text-base select-none shrink-0">{list.icon}</span>
                    <span className="truncate">{list.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-500 group-hover:text-slate-400 font-mono">
                      {list.count}
                    </span>
                    <FiMoreVertical className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-300 shrink-0" />
                  </div>
                </button>
              );
            })}

            {/* Static visually appealing placeholder for Create New List button */}
            <div className="pt-2">
              <button 
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-dashed border-slate-800 text-xs text-slate-500 hover:text-brand-300 hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-300 cursor-not-allowed group"
                disabled
              >
                <FiPlus className="w-3.5 h-3.5" />
                <span>Add Custom List</span>
                <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1 py-0.5 rounded ml-1 uppercase scale-90 group-hover:text-brand-300 group-hover:border-brand-500/20">Setup Only</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Connected
            </span>
            <span className="font-mono">v0.1.0-alpha</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 flex flex-col z-10 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/60 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
          {/* Left search */}
          <div className="relative w-80">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-1.5 bg-slate-900/50 border border-slate-800/80 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/60 focus:bg-slate-900 transition-all duration-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-slate-950 border border-slate-800 text-slate-500 px-1 rounded select-none">
              ⌘K
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-4">
            {/* Notification */}
            <button className="relative p-2 text-slate-400 hover:text-white bg-slate-900/40 border border-slate-800/40 rounded-lg transition-colors">
              <FiBell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brand-500 border border-slate-950" />
            </button>

            {/* Static Theme toggle */}
            <button 
              className="p-2 text-slate-400 hover:text-white bg-slate-900/40 border border-slate-800/40 rounded-lg transition-colors" 
              title="Theme Toggle"
            >
              <FiMoon className="w-4 h-4" />
            </button>

            {/* Help / Docs info */}
            <a 
              href="https://github.com/evil-sandeep/DicipliniAI" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 text-slate-400 hover:text-white bg-slate-900/40 border border-slate-800/40 rounded-lg transition-colors"
              title="View Repository"
            >
              <FiHelpCircle className="w-4 h-4" />
            </a>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* List Title Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl select-none">
                  {currentFilter === 'all' ? activeList.icon : '🎯'}
                </span>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  {currentFilter === 'all' ? activeList.name : `Filter: ${currentFilter.charAt(0).toUpperCase() + currentFilter.slice(1)}`}
                </h1>
                {currentFilter === 'all' && (
                  <span className="text-xs bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-medium">
                    List #{activeList.id}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-400 mt-1">
                {currentFilter === 'all' 
                  ? `Overview of items in ${activeList.name}. Edit or check tasks below.`
                  : `Showing tasks matching focus mode filter: ${currentFilter}.`
                }
              </p>
            </div>

            {/* Statistics Mini Widget */}
            {currentFilter === 'all' && (
              <div className="flex items-center gap-4 bg-slate-900/30 border border-slate-800/50 px-4 py-2.5 rounded-xl self-start md:self-auto min-w-[240px]">
                <div className="flex-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1">
                    <span>List Progress</span>
                    <span className="font-mono text-brand-300">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/20">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-500 to-indigo-400 transition-all duration-500 ease-out" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1.5 flex justify-between">
                    <span>{completedTasksCount} Completed</span>
                    <span>{totalTasksCount - completedTasksCount} Remaining</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0">
                  <FiTrendingUp className="w-5 h-5 text-brand-300" />
                </div>
              </div>
            )}
          </div>

          {/* Quick Task Input Area */}
          <div className="bg-slate-900/20 border border-slate-900/60 rounded-xl p-4 space-y-3 shadow-inner relative group">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded border-2 border-slate-700 flex items-center justify-center text-slate-600 bg-slate-950/50 cursor-not-allowed select-none">
                <FiCheck className="w-3.5 h-3.5 opacity-0" />
              </div>
              <input 
                type="text" 
                placeholder={`Add a new task to ${activeList.name}...`}
                disabled
                className="flex-1 bg-transparent border-none text-slate-300 placeholder-slate-500 focus:outline-none text-sm cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-500 border border-slate-800 px-2 py-0.5 rounded bg-slate-950 uppercase select-none">
                Static UI
              </span>
            </div>
            
            <div className="flex items-center justify-between border-t border-slate-900/80 pt-3">
              <div className="flex items-center gap-2">
                {/* Meta Addons */}
                <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-850 px-2 py-1 rounded-md transition-colors cursor-not-allowed" disabled>
                  <FiCalendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Set Due Date</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-850 px-2 py-1 rounded-md transition-colors cursor-not-allowed" disabled>
                  <FiFlag className="w-3.5 h-3.5 text-slate-500" />
                  <span>Priority</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-900/50 border border-slate-850 px-2 py-1 rounded-md transition-colors cursor-not-allowed" disabled>
                  <FiFolder className="w-3.5 h-3.5 text-slate-500" />
                  <span>Tags</span>
                </button>
              </div>
              
              <button 
                className="flex items-center gap-1 px-3.5 py-1.5 bg-gradient-to-tr from-brand-600 to-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 hover:from-brand-500 hover:to-indigo-400 transition-all cursor-not-allowed"
                disabled
              >
                <FiPlus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Task</span>
              </button>
            </div>
          </div>

          {/* Task Filters & Tabs */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'all' 
                    ? 'bg-slate-900 text-white shadow-md border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Tasks
              </button>
              <button 
                onClick={() => setActiveTab('active')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'active' 
                    ? 'bg-slate-900 text-white shadow-md border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'completed' 
                    ? 'bg-slate-900 text-white shadow-md border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Completed
              </button>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <FiSliders className="w-3.5 h-3.5" />
              <span>Sort: Due Date (default)</span>
            </div>
          </div>

          {/* TASKS LIST */}
          <div className="space-y-2.5">
            {filteredTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-900 rounded-xl bg-slate-900/5">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600 mb-3">
                  <FiCheck className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">All caught up!</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-[260px] text-center">No tasks match the active filters. Enjoy your productive workspace!</p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isSelected = selectedTaskId === task.id;
                return (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`flex items-start justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer group/task ${
                      isSelected
                        ? 'bg-slate-900/60 border-brand-500/40 shadow-md shadow-brand-500/5'
                        : 'bg-slate-900/20 border-slate-900 hover:border-slate-800/60 hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Checkbox (Mocked style, non-interactive) */}
                      <div className="pt-0.5 shrink-0 select-none">
                        <div 
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            task.completed
                              ? 'border-brand-500 bg-brand-500/20 text-brand-300 shadow shadow-brand-500/30'
                              : 'border-slate-700 bg-slate-950/40 text-transparent group-hover/task:border-brand-500/50'
                          }`}
                        >
                          <FiCheck className={`w-3.5 h-3.5 stroke-[3.5] ${task.completed ? 'opacity-100' : 'opacity-0 group-hover/task:opacity-40 text-brand-400'}`} />
                        </div>
                      </div>

                      {/* Title & Description */}
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 
                            className={`text-sm font-medium leading-none ${
                              task.completed 
                                ? 'text-slate-500 line-through decoration-slate-600 decoration-[1.5px]' 
                                : 'text-slate-200'
                            }`}
                          >
                            {task.title}
                          </h3>

                          {/* Priority badge */}
                          {task.priority === 'high' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 uppercase select-none">
                              High
                            </span>
                          )}
                          {task.priority === 'medium' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 uppercase select-none">
                              Medium
                            </span>
                          )}
                          {task.priority === 'low' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 border border-slate-750 text-slate-400 uppercase select-none">
                              Low
                            </span>
                          )}
                        </div>

                        <p className={`text-xs ${task.completed ? 'text-slate-600' : 'text-slate-400'} line-clamp-1`}>
                          {task.description}
                        </p>

                        {/* Tags & Meta Row */}
                        <div className="flex items-center gap-2 flex-wrap pt-1 select-none">
                          {task.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="text-[10px] text-slate-500 bg-slate-950/60 border border-slate-850 px-2 py-0.5 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right column: Due Date & Actions */}
                    <div className="flex items-center gap-4 self-center shrink-0 ml-3">
                      {/* Due date badge */}
                      <span 
                        className={`text-[10px] font-medium px-2 py-1 rounded-md border select-none font-mono ${
                          task.dueStatus === 'overdue'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                            : task.dueStatus === 'today'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 font-semibold'
                              : task.dueStatus === 'completed'
                                ? 'bg-slate-900 border-slate-850 text-slate-500'
                                : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {task.dueDate}
                      </span>

                      {/* Action Menu (Mocked UI) */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover/task:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors" title="Edit details (Static)">
                          <FiEdit className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-slate-400 hover:text-rose-400 p-1 hover:bg-rose-500/10 rounded transition-colors" title="Delete task (Static)">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      {/* DETAIL SIDE PANEL (Shows properties of selected task) */}
      {selectedTask && (
        <aside className="w-80 border-l border-slate-900 bg-slate-950/20 backdrop-blur-xl flex flex-col z-10 shrink-0">
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-900/80">
            <h3 className="font-semibold text-sm text-slate-300 flex items-center gap-1.5">
              <FiInfo className="w-4 h-4 text-brand-400" />
              <span>Task Inspector</span>
            </h3>
            <span className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
              {selectedTask.id.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title / Summary */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Title</span>
              <h2 className="text-base font-semibold text-slate-200 leading-snug">
                {selectedTask.title}
              </h2>
              <div className="w-full h-px bg-slate-900/60 my-2" />
            </div>

            {/* Description box */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                <FiAlignLeft className="w-3 h-3" /> Description
              </span>
              <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/20 border border-slate-900/60 p-3 rounded-lg">
                {selectedTask.description}
              </p>
            </div>

            {/* Metadata Fields list */}
            <div className="space-y-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Properties</span>
              
              <div className="grid grid-cols-3 gap-y-3.5 text-xs">
                <div className="text-slate-500 font-medium">Status</div>
                <div className="col-span-2 flex items-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                    selectedTask.completed
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${selectedTask.completed ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
                    {selectedTask.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>

                <div className="text-slate-500 font-medium">Priority</div>
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                    selectedTask.priority === 'high'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : selectedTask.priority === 'medium'
                        ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400'
                  }`}>
                    <FiFlag className="w-3.5 h-3.5" />
                    {selectedTask.priority}
                  </span>
                </div>

                <div className="text-slate-500 font-medium">Due Date</div>
                <div className="col-span-2 text-slate-300 flex items-center gap-1 flex-wrap">
                  <FiCalendar className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-slate-300">{selectedTask.dueDate}</span>
                </div>

                <div className="text-slate-500 font-medium">List</div>
                <div className="col-span-2 text-slate-300 flex items-center gap-1">
                  <FiFolder className="w-3.5 h-3.5 text-slate-500" />
                  <span>{INITIAL_LISTS.find(l => l.id === selectedTask.listId)?.name || 'Default'}</span>
                </div>
              </div>
            </div>

            {/* Notes box */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Developer Notes</span>
              <div className="bg-slate-900/30 border border-slate-900/65 rounded-lg p-3 space-y-2">
                <p className="text-xs text-slate-400 font-mono leading-relaxed select-text">
                  {selectedTask.notes || 'No notes added to this task.'}
                </p>
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono border-t border-slate-900/60 pt-2">
                  <span className="flex items-center gap-1">
                    <FiPaperclip className="w-3 h-3" /> 0 Attachments
                  </span>
                  <span>Press E to Edit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Side Panel Footer Action */}
          <div className="p-4 border-t border-slate-900/80 bg-slate-950/40 flex items-center gap-2 shrink-0">
            <button 
              className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/80 text-xs font-semibold text-slate-300 rounded-lg transition-all cursor-not-allowed"
              disabled
            >
              <FiEdit className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
            <button 
              className="py-2 px-3 border border-rose-950 hover:bg-rose-500/10 text-xs font-semibold text-rose-400 rounded-lg transition-all cursor-not-allowed"
              disabled
              title="Delete Task"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;
