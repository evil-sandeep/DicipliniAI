import { useState } from 'react';
import { FaYoutube, FaWalking } from 'react-icons/fa';
import { FiCode, FiPlusCircle, FiUpload, FiList, FiX, FiCheck, FiEdit2, FiTrash2 } from 'react-icons/fi';

const INITIAL_COLUMNS = [
  { id: 'yt',   name: 'YT',   Icon: FaYoutube, color: '#ff0000' },
  { id: 'dsa',  name: 'DSA',  Icon: FiCode,    color: '#3b82f6' },
  { id: 'walk', name: 'WALK', Icon: FaWalking, color: '#22c55e' },
];

const DAYS = [
  'MONDAY', 'TUESDAY', 'WEDNESDAY',
  'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY',
];

function App() {
  const [columns, setColumns]     = useState(INITIAL_COLUMNS);
  const [checked, setChecked]     = useState({});
  const [showInput, setShowInput] = useState(false);
  const [newName, setNewName]     = useState('');
  const [editingColId, setEditingColId] = useState(null);
  const [editName, setEditName] = useState('');

  // DAY column is fixed; remaining columns share the rest equally
  const DAY_WIDTH  = 72;  // px – fixed, always visible
  const restCols   = columns.length + 1; // list columns + NEW LIST
  const colWidth   = `calc((100% - ${DAY_WIDTH}px) / ${restCols})`;

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
      { id: `list-${Date.now()}`, name, Icon: FiList, color: '#7c3aed' },
    ]);
    closeModal();
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') addList();
    if (e.key === 'Escape') closeModal();
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

  const handleRenameKey = (e) => {
    if (e.key === 'Enter') saveRename();
    if (e.key === 'Escape') cancelRename();
  };

  return (
    <div className="w-full h-full bg-white relative overflow-hidden flex flex-col">

      {/* ── New List Modal ── */}
      {showInput && (
        <div
          className="absolute inset-0 bg-black/40 z-40 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-72 animate-[fadeIn_0.15s_ease]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#323147] tracking-wide">New List</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                <FiX className="text-lg" />
              </button>
            </div>

            <input
              autoFocus
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={handleKey}
              placeholder="e.g. READING, GYM…"
              maxLength={10}
              className="w-full border-2 border-[#e4e3f2] rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#7c3aed] transition-colors placeholder-slate-300"
            />

            <div className="flex gap-2 mt-4">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 text-xs rounded-xl border-2 border-[#e4e3f2] text-slate-500 font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addList}
                disabled={!newName.trim()}
                className="flex-1 py-2.5 text-xs rounded-xl bg-[#7c3aed] text-white font-bold hover:bg-[#6d28d9] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1"
              >
                <FiCheck className="stroke-[3]" /> Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="w-full h-full overflow-hidden">
        <table className="w-full h-full border-collapse text-center table-fixed">
          <colgroup>
            {/* DAY column — fixed narrow width */}
            <col style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }} />
            {/* Dynamic list columns */}
            {columns.map(col => <col key={col.id} style={{ width: colWidth }} />)}
            {/* NEW LIST column */}
            <col style={{ width: colWidth }} />
          </colgroup>

          <thead>
            <tr className="border-b border-[#e4e3f2]">
              {/* DAY header */}
              <th className="bg-[#f2f1fb] py-3 md:py-4 px-1 font-bold text-[#323147] text-[9px] tracking-widest border-r border-[#e4e3f2] select-none" style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}>
                DAY
              </th>

              {/* Dynamic column headers */}
              {columns.map(col => (
                <th
                  key={col.id}
                  className="relative group bg-white py-3 md:py-5 px-1 font-bold text-[#323147] text-[9px] md:text-xs tracking-wider border-r border-[#e4e3f2] select-none"
                >
                  {editingColId === col.id ? (
                    <div className="flex flex-col items-center justify-center w-full px-1">
                      <input 
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        onKeyDown={handleRenameKey}
                        onBlur={saveRename}
                        className="w-full text-center border-b-2 border-[#7c3aed] outline-none text-[9px] md:text-xs uppercase bg-transparent text-[#323147]"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center justify-center gap-0.5 md:gap-1 transition-opacity duration-200 group-hover:opacity-10">
                        <col.Icon style={{ color: col.color }} className="text-sm md:text-base shrink-0" />
                        <span className="truncate max-w-full px-0.5">{col.name}</span>
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute inset-0 flex items-center justify-center gap-1.5 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 backdrop-blur-[1px] z-10">
                        <button 
                          onClick={(e) => { e.stopPropagation(); startRename(col.id, col.name); }}
                          className="p-1.5 md:p-2 bg-[#f2f1fb] text-[#7c3aed] rounded-full hover:bg-[#7c3aed] hover:text-white transition-all scale-90 hover:scale-100 shadow-sm"
                          title="Rename"
                        >
                          <FiEdit2 className="text-[10px] md:text-xs stroke-[2.5]" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteList(col.id); }}
                          className="p-1.5 md:p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all scale-90 hover:scale-100 shadow-sm"
                          title="Delete"
                        >
                          <FiTrash2 className="text-[10px] md:text-xs stroke-[2.5]" />
                        </button>
                      </div>
                    </>
                  )}
                </th>
              ))}

              {/* NEW LIST header — clickable */}
              <th className="bg-[#f2f1fb] py-3 md:py-5 px-1 font-bold text-[#7c3aed] text-[9px] md:text-xs select-none">
                <div
                  onClick={openModal}
                  className="flex flex-col items-center justify-center gap-0.5 md:gap-1 cursor-pointer hover:opacity-60 active:scale-95 transition-all"
                >
                  <FiPlusCircle className="text-[#7c3aed] text-sm md:text-base stroke-[2.5] shrink-0" />
                  <span className="tracking-wider">NEW LIST</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {DAYS.map(day => (
              <tr key={day} className="border-b border-[#e4e3f2] last:border-b-0">
                {/* DAY label — fixed width */}
                <td className="bg-[#f2f1fb] py-2 md:py-3 px-1 font-bold text-[#323147] text-[9px] tracking-widest border-r border-[#e4e3f2] select-none" style={{ width: DAY_WIDTH, minWidth: DAY_WIDTH }}>
                  {day}
                </td>

                {/* Checkboxes for each dynamic column */}
                {columns.map(col => {
                  const key       = `${day}-${col.id}`;
                  const isChecked = !!checked[key];
                  return (
                    <td key={col.id} className="bg-white py-2 md:py-4 px-1 border-r border-[#e4e3f2]">
                      <div className="flex items-center justify-center">
                        <div
                          onClick={() => toggleCheck(day, col.id)}
                          className={`
                            w-4 h-4 md:w-5 md:h-5 border-2 rounded-md cursor-pointer
                            transition-all duration-150 flex items-center justify-center
                            ${isChecked
                              ? 'bg-[#7c3aed] border-[#7c3aed] scale-105'
                              : 'border-[#b0afc5]/70 bg-white hover:border-[#7c3aed]/60'
                            }
                          `}
                        >
                          {isChecked && <FiCheck className="text-white stroke-[3] text-[10px] md:text-xs" />}
                        </div>
                      </div>
                    </td>
                  );
                })}

                {/* Empty NEW LIST cell */}
                <td className="bg-[#f2f1fb] py-2 md:py-4 px-1" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Floating Buttons ── */}
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-20">
        <button
          disabled
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#9da1b4]/90 text-white flex items-center justify-center text-xs md:text-sm font-bold shadow-lg hover:bg-[#868aa0] hover:scale-105 active:scale-95 transition-all cursor-not-allowed"
        >
          Edit
        </button>
      </div>

      <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 z-20">
        <button
          disabled
          className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#9da1b4]/90 text-white flex items-center justify-center shadow-lg hover:bg-[#868aa0] hover:scale-105 active:scale-95 transition-all cursor-not-allowed"
        >
          <FiUpload className="text-lg md:text-xl stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}

export default App;
