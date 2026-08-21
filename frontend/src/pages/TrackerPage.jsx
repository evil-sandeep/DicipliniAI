import { useState } from 'react';
import { FaYoutube, FaWalking } from 'react-icons/fa';
import { FiCode, FiPlus, FiList, FiX, FiCheck, FiLogOut, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const INITIAL_COLUMNS = [
  { id: 'yt',   name: 'YT',   sub: 'YouTube', Icon: FaYoutube, color: '#ff0000' },
  { id: 'dsa',  name: 'DSA',  sub: 'Practice', Icon: FiCode,    color: '#3b82f6' },
  { id: 'walk', name: 'WALK', sub: '30 min',   Icon: FaWalking, color: '#22c55e' },
];

const DAYS = [
  { name: 'MONDAY', date: 'May 26' },
  { name: 'TUESDAY', date: 'May 27' },
  { name: 'WEDNESDAY', date: 'May 28' },
  { name: 'THURSDAY', date: 'May 29' },
  { name: 'FRIDAY', date: 'May 30' },
  { name: 'SATURDAY', date: 'May 31' },
  { name: 'SUNDAY', date: 'Jun 1' },
];

function TrackerPage() {
  const navigate = useNavigate();
  const [columns, setColumns]     = useState(INITIAL_COLUMNS);
  const [checked, setChecked]     = useState({});
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName]     = useState('');
  const [editingColId, setEditingColId] = useState(null);
  const [editName, setEditName] = useState('');

  const DAY_WIDTH = 100; // px
  const restCols  = columns.length + 1; // list columns + NEW LIST
  const colWidth  = `calc((100% - ${DAY_WIDTH}px) / ${restCols})`;

  const toggleCheck = (day, colId) => {
    const key = `${day}-${colId}`;
    setChecked(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const openModal  = () => { setNewName(''); setShowInput(true); };
  const closeModal = () => setShowInput(false);

  const addList = () => {
    const name = newName.trim().toUpperCase();
    if (!name) return;
    setColumns(prev => [
      ...prev,
      { id: `list-${Date.now()}`, name, sub: 'Custom', Icon: FiList, color: '#7c3aed' },
    ]);
    closeModal();
  };

  const deleteList = (colId) => {
    setColumns(prev => prev.filter(c => c.id !== colId));
    setChecked(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (k.endsWith(`-${colId}`)) delete next[k];
      });
      return next;
    });
  };

  const startRename = (colId, currentName) => {
    setEditingColId(colId);
    setEditName(currentName);
  };

  const saveRename = () => {
    if (!editName.trim()) {
      setEditingColId(null);
      return;
    }
    setColumns(prev => prev.map(c => 
      c.id === editingColId ? { ...c, name: editName.trim().toUpperCase() } : c
    ));
    setEditingColId(null);
    setEditName('');
  };

  const cancelRename = () => {
    setEditingColId(null);
    setEditName('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') addList();
    if (e.key === 'Escape') closeModal();
  };

  const handleRenameKey = (e) => {
    if (e.key === 'Enter') saveRename();
    if (e.key === 'Escape') cancelRename();
  };

  const handleLogout = () => navigate('/');

  return (
    <div className="w-full h-screen bg-[#c1a084] p-3 flex items-center justify-center relative overflow-hidden" style={{ backgroundImage: 'radial-gradient(#b08b6d 1px, transparent 1px)', backgroundSize: '20px 20px' }}>

      {/* ── New List Modal ── */}
      {showInput && (
        <div
          className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-[#fcfbf7] rounded-xl shadow-2xl p-6 w-80 animate-[fadeIn_0.15s_ease]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#323147]">New Habit</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <FiX className="text-xl" />
              </button>
            </div>

            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. READING, GYM…"
              maxLength={12}
              className="w-full border-b-2 border-[#e4e3f2] bg-transparent px-2 py-2 text-lg outline-none focus:border-[#a89af1] transition-colors placeholder-slate-400 font-bold"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2 text-lg rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addList}
                disabled={!newName.trim()}
                className="flex-1 py-2 text-lg rounded-xl bg-[#e6e2f8] text-[#5540a8] font-bold hover:bg-[#d8cff5] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <FiCheck strokeWidth={3} /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Notebook Container ── */}
      <div className="w-full max-w-[1000px] h-[94vh] bg-[#fdfbf6] shadow-[0_10px_40px_rgba(0,0,0,0.3)] rounded-xl flex relative">
        
        {/* Left Spiral Binding Simulation */}
        <div className="w-8 md:w-12 h-full bg-[#fdfbf6] absolute left-0 top-0 border-r border-[#e0ddcf] flex flex-col items-center justify-around py-4 z-10 overflow-hidden shadow-[2px_0_5px_rgba(0,0,0,0.03)] rounded-l-xl">
           {Array.from({ length: 15 }).map((_, i) => (
             <div key={i} className="relative w-full h-full flex items-center justify-center">
                {/* Spiral Ring */}
                <div className="absolute w-8 md:w-10 h-2 md:h-3 bg-gradient-to-b from-gray-300 via-gray-500 to-gray-700 rounded-full left-[-4px] md:left-[-8px] shadow-sm transform -rotate-[15deg]"></div>
                {/* Hole punch */}
                <div className="absolute right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-[#c1a084] rounded-full shadow-inner"></div>
             </div>
           ))}
        </div>

        {/* Notebook Content Area */}
        <div className="flex-1 pl-10 md:pl-14 pr-3 md:pr-8 py-3 flex flex-col relative h-full">
          
          {/* Header Area */}
          <div className="flex justify-between items-start mb-2 w-full relative z-10 shrink-0">
            <div>
              <div className="relative inline-block">
                <span className="absolute inset-0 bg-[#e6e1f9] rounded-lg transform -skew-x-6 scale-y-110 translate-y-1 -z-10 blur-[1px]"></span>
                <h1 className="text-2xl md:text-4xl font-bold text-[#1f2937] tracking-tight relative z-10 pb-1">
                  Weekly Tracker
                </h1>
              </div>
              <p className="text-[#4b5563] text-sm md:text-base mt-1 font-medium">Track your daily habits and build consistency.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={openModal}
                className="hidden md:flex items-center gap-2 bg-[#eae5f8] text-[#6d51c7] px-4 py-1.5 rounded-full font-bold hover:bg-[#dcd4f5] transition-colors border border-[#d3caf0] shadow-sm text-sm"
              >
                <FiPlus strokeWidth={3} /> New List
              </button>
              <button
                onClick={handleLogout}
                title="Logout"
                className="w-8 h-8 rounded-full bg-[#f8f9fa] text-slate-500 flex items-center justify-center shadow-sm border border-[#e5e7eb] hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all"
              >
                <FiLogOut strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="w-full flex-1 overflow-auto">
            <table className="w-full h-full border-collapse text-center table-fixed min-w-[500px]">
              <colgroup>
                {/* DAY column */}
                <col style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }} />
                {/* Dynamic list columns */}
                {columns.map(col => <col key={col.id} style={{ width: colWidth }} />)}
                {/* NEW LIST column */}
                <col style={{ width: colWidth }} />
              </colgroup>

              <thead>
                <tr>
                  {/* DAY header */}
                  <th className="py-2 px-2 font-bold text-[#5c6bc0] text-lg border-b-2 border-red-200 border-r-2 border-r-red-300/80 align-bottom">
                    <div className="inline-block relative">
                       <span className="relative z-10 underline decoration-[#a0aab9] decoration-wavy underline-offset-2">DAY</span>
                    </div>
                  </th>

                  {/* Dynamic column headers */}
                  {columns.map(col => (
                    <th
                      key={col.id}
                      className="relative group py-2 px-2 font-bold text-[#374151] border-b-2 border-red-200 border-r border-[#e5e7eb]/50 h-full"
                    >
                      {editingColId === col.id ? (
                        <div className="flex flex-col items-center justify-center w-full px-2 h-full">
                          <input 
                            autoFocus
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            onKeyDown={handleRenameKey}
                            onBlur={saveRename}
                            className="w-full text-center border-b border-[#6d51c7] outline-none text-lg bg-transparent font-bold text-[#374151]"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-end h-full">
                          <div className="flex flex-col items-center justify-center gap-1 transition-opacity duration-200 group-hover:opacity-20">
                            <div className="flex items-center justify-center gap-1.5 mb-0.5">
                              <col.Icon style={{ color: col.color }} className="text-lg shrink-0" />
                              <span className="text-lg uppercase tracking-wider">{col.name}</span>
                            </div>
                            <span className="text-[13px] font-normal text-slate-500 lowercase leading-none">{col.sub || 'habit'}</span>
                          </div>
                          
                          {/* Hover Actions */}
                          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#fdfbf6]/90 backdrop-blur-[1px] z-10 rounded-t-lg">
                            <button 
                              onClick={(e) => { e.stopPropagation(); startRename(col.id, col.name); }}
                              className="p-1.5 bg-[#eae5f8] text-[#6d51c7] rounded-full hover:bg-[#6d51c7] hover:text-white transition-all scale-90 hover:scale-100 shadow-sm"
                              title="Rename"
                            >
                              <FiEdit2 strokeWidth={2.5} size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteList(col.id); }}
                              className="p-1.5 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all scale-90 hover:scale-100 shadow-sm"
                              title="Delete"
                            >
                              <FiTrash2 strokeWidth={2.5} size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </th>
                  ))}

                  {/* NEW LIST header */}
                  <th className="py-2 px-2 font-bold text-[#6d51c7] border-b-2 border-red-200 align-bottom h-full">
                    <div
                      onClick={openModal}
                      className="flex flex-col items-center justify-end gap-1 cursor-pointer hover:opacity-70 active:scale-95 transition-all h-full"
                    >
                      <div className="flex items-center justify-center gap-1.5 mb-0.5">
                        <FiPlus strokeWidth={2.5} className="text-lg shrink-0 border border-dashed border-[#6d51c7] rounded-full p-0.5" />
                        <span className="text-lg uppercase tracking-wider">NEW LIST</span>
                      </div>
                      <span className="text-[13px] font-normal text-slate-500 lowercase leading-none">Add habit</span>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {DAYS.map(day => (
                  <tr key={day.name} className="border-b border-[#d1d5db]/60 last:border-b-0 hover:bg-[#f3f4f6]/30 transition-colors">
                    {/* DAY label */}
                    <td className="py-2 md:py-3 px-2 text-left border-r-2 border-r-red-300/80 align-middle" style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}>
                      <div className="flex flex-col pl-2 justify-center h-full">
                        <span className="text-lg font-bold text-[#374151] leading-tight">{day.name}</span>
                        <span className="text-[13px] text-slate-400 font-medium">{day.date}</span>
                      </div>
                    </td>

                    {/* Checkboxes for each dynamic column */}
                    {columns.map(col => {
                      const key       = `${day.name}-${col.id}`;
                      const isChecked = !!checked[key];
                      return (
                        <td key={col.id} className="py-2 md:py-3 px-2 border-r border-[#e5e7eb]/50 align-middle">
                          <div className="flex items-center justify-center h-full">
                            <div
                              onClick={() => toggleCheck(day.name, col.id)}
                              className={`
                                w-6 h-6 md:w-7 md:h-7 border-2 rounded-[6px] cursor-pointer
                                transition-all duration-200 flex items-center justify-center
                                ${isChecked
                                  ? 'bg-[#eae5f8] border-[#8a72d1] text-[#6d51c7] scale-110 shadow-sm'
                                  : 'border-[#c2b6e1] bg-transparent hover:border-[#8a72d1]'
                                }
                              `}
                            >
                              {isChecked && <FiCheck strokeWidth={3} className="text-base md:text-lg" />}
                            </div>
                          </div>
                        </td>
                      );
                    })}

                    {/* Empty NEW LIST cell with plus button */}
                    <td className="py-2 md:py-3 px-2 align-middle">
                       <div className="flex items-center justify-center h-full">
                         <div 
                           onClick={openModal}
                           className="w-6 h-6 md:w-7 md:h-7 rounded-[6px] border border-dashed border-[#d1c8ea] text-[#b3a8d6] flex items-center justify-center cursor-pointer hover:border-[#8a72d1] hover:text-[#8a72d1] transition-colors"
                         >
                           <FiPlus strokeWidth={2} />
                         </div>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
}

export default TrackerPage;
