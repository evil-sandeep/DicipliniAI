import { useState, useEffect, useRef, useCallback } from 'react';
import { FiFileText, FiLoader, FiPlus, FiEdit3 } from 'react-icons/fi';
import { fetchAllNotes, createNote, updateNote, deleteNote, upsertNoteBlock } from './api';
import { NewNotePrompt, NoteTitleEditor, NewNoteButton } from './NoteTitle';
import { NoteDeleteButton, NoteDeleteEditorButton } from './NoteDelete';

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDateLine(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = Math.round((today - new Date(y, m-1, d)) / 86400000);
  const label = date.toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  if (diff === 0) return `Today, ${label}`;
  if (diff === 1) return `Yesterday, ${label}`;
  return label;
}

function formatDateShort(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

function getNoteBlocks(note) {
  if (!note) return [];
  const blocks = note.blocks && note.blocks.length > 0 ? [...note.blocks] : [];
  if (blocks.length === 0 && note.content) {
    blocks.push({ date: note.createdAt ? note.createdAt.slice(0, 10) : todayISO(), text: note.content, createdAt: note.createdAt, editedAt: null });
  }
  return blocks.sort((a, b) => (a.date > b.date ? 1 : -1));
}

export default function MultiNotesSection() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNewPrompt, setShowNewPrompt] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [todayText, setTodayText] = useState('');
  const saveTimerRef = useRef(null);

  useEffect(() => {
    fetchAllNotes()
      .then((fetched) => { setNotes(fetched); if (fetched.length > 0) setSelectedId(fetched[0]._id); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const selectedNote = notes.find((n) => n._id === selectedId) || null;

  useEffect(() => {
    if (!selectedNote) { setTodayText(''); return; }
    const today = todayISO();
    const existing = (selectedNote.blocks || []).find(b => b.date === today);
    setTodayText(existing ? existing.text : '');
  }, [selectedId]); // eslint-disable-line

  const scheduleBlockSave = useCallback((id, text) => {
    setSaveStatus('saving');
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        const today = todayISO();
        await upsertNoteBlock(id, { date: today, text });
        setNotes(prev => prev.map(n => {
          if (n._id !== id) return n;
          const blocks = [...(n.blocks || [])];
          const idx = blocks.findIndex(b => b.date === today);
          if (idx >= 0) blocks[idx] = { ...blocks[idx], text };
          else blocks.push({ date: today, text, createdAt: new Date().toISOString(), editedAt: null });
          return { ...n, blocks };
        }));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch { setSaveStatus('error'); }
    }, 800);
  }, []);

  const handleTodayTextChange = (e) => { setTodayText(e.target.value); scheduleBlockSave(selectedId, e.target.value); };

  const handleTitleChange = (newTitle) => {
    setNotes(prev => prev.map(n => n._id === selectedId ? { ...n, title: newTitle } : n));
    clearTimeout(saveTimerRef.current); setSaveStatus('saving');
    saveTimerRef.current = setTimeout(async () => {
      try { await updateNote(selectedId, { title: newTitle }); setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000); }
      catch { setSaveStatus('error'); }
    }, 800);
  };

  const handleConfirmCreate = async (title) => {
    setCreating(true);
    try { const newNote = await createNote({ title, content: '' }); setNotes(prev => [newNote, ...prev]); setSelectedId(newNote._id); setShowNewPrompt(false); }
    catch (err) { console.error(err); }
    finally { setCreating(false); }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      const remaining = notes.filter(n => n._id !== id);
      setNotes(remaining);
      if (selectedId === id) setSelectedId(remaining.length > 0 ? remaining[0]._id : null);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-[#64748b]"><FiLoader className="animate-spin mr-2" /> Loading...</div>;

  const today = todayISO();
  const blocks = getNoteBlocks(selectedNote);
  const pastBlocks = blocks.filter(b => b.date !== today);

  return (
    <div className="flex h-full gap-0 overflow-hidden">
      <div className="flex flex-col shrink-0 border-r border-[#e2e8f0] bg-[#faf8ff]" style={{ width: 210 }}>
        <div className="px-3 pt-4 pb-2 flex items-center justify-between border-b border-[#e2e8f0]">
          <span className="text-xs font-extrabold tracking-widest text-[#8b5cf6] uppercase">My Notes</span>
          <NewNoteButton onClick={() => setShowNewPrompt(true)} disabled={showNewPrompt} />
        </div>
        {showNewPrompt && <div className="pt-2"><NewNotePrompt onConfirm={handleConfirmCreate} onCancel={() => setShowNewPrompt(false)} loading={creating} /></div>}
        <div className="flex-1 overflow-y-auto py-1">
          {notes.length === 0 && !showNewPrompt ? (
            <p className="text-center text-[#94a3b8] text-xs px-3 pt-8 leading-relaxed">No notes yet.<br />Click <strong>New</strong> to start!</p>
          ) : (
            notes.map((note) => {
              const isActive = note._id === selectedId;
              const nb = getNoteBlocks(note);
              const last = nb[nb.length - 1];
              return (
                <div key={note._id} onClick={() => setSelectedId(note._id)}
                  className={`group relative mx-2 my-0.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-[#ede9fe] border border-[#c4b5fd]' : 'hover:bg-[#f1f5f9]'}`}>
                  <p className={`text-xs font-semibold truncate pr-5 ${isActive ? 'text-[#6d28d9]' : 'text-[#334155]'}`}>{note.title || 'Untitled Note'}</p>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">{last ? formatDateShort(last.createdAt || note.updatedAt) : formatDateShort(note.updatedAt || note.createdAt)}</p>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <NoteDeleteButton noteTitle={note.title} onConfirmDelete={() => handleDeleteNote(note._id)} size="sm" />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {selectedNote ? (
          <>
            <div className="px-6 pt-5 pb-3 border-b border-[#e2e8f0] flex items-center gap-3">
              <FiFileText className="text-[#8b5cf6] shrink-0" size={16} />
              <NoteTitleEditor title={selectedNote.title} onChange={handleTitleChange} saveStatus={saveStatus} />
              <NoteDeleteEditorButton noteTitle={selectedNote.title} onConfirmDelete={() => handleDeleteNote(selectedNote._id)} />
            </div>
            <div className="flex-1 overflow-y-auto px-8 py-5">
              {pastBlocks.map((block) => (
                <div key={block.date} className="mb-7">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold text-[#94a3b8] tracking-wide select-none">{formatDateLine(block.date)}</span>
                    {block.editedAt && (
                      <span title="Edited" className="flex items-center gap-0.5 text-[10px] text-[#f59e0b]">
                        <FiEdit3 size={9} /> edited
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#334155] leading-relaxed whitespace-pre-wrap font-mono select-text">
                    {block.text || <span className="text-[#c4c4c4] italic">Empty</span>}
                  </p>
                </div>
              ))}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-semibold text-[#8b5cf6] tracking-wide select-none">{formatDateLine(today)}</span>
                  {saveStatus === 'saving' && <span className="text-[10px] text-[#94a3b8]">saving…</span>}
                  {saveStatus === 'saved' && <span className="text-[10px] text-[#22c55e]">✓</span>}
                  {saveStatus === 'error' && <span className="text-[10px] text-[#ef4444]">error</span>}
                </div>
                <textarea
                  value={todayText}
                  onChange={handleTodayTextChange}
                  placeholder="Write something…"
                  className="w-full text-sm font-mono leading-relaxed text-[#172554] bg-transparent outline-none resize-none placeholder-[#d1d5db]"
                  style={{ minHeight: 200 }}
                  autoFocus
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <FiFileText size={36} className="text-[#c4b5fd]" />
            <p className="text-[#64748b] text-sm font-medium">No note selected</p>
            <p className="text-[#94a3b8] text-xs">Select a note or create a new one.</p>
            <button onClick={() => setShowNewPrompt(true)} className="mt-2 flex items-center gap-1.5 text-xs font-bold bg-[#8b5cf6] text-white px-4 py-2 rounded-xl hover:bg-[#7c3aed] transition-colors cursor-pointer">
              <FiPlus size={13} /> New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
