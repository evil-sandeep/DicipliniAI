import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiFileText,
  FiPlus,
  FiTrash2,
  FiSave,
  FiLoader,
  FiEdit3,
  FiCheck,
} from 'react-icons/fi';
import { fetchAllNotes, createNote, updateNote, deleteNote } from './api';

/**
 * MultiNotesSection
 *
 * Full multiple-notes UI:
 *  - Left sidebar: list of all notes, "New Note" button
 *  - Right panel: selected note's title (editable) + content textarea
 *  - Auto-saves title and content to the backend with a 1-second debounce
 *  - Notes persist in MongoDB per user → available on any device after login
 */
export default function MultiNotesSection() {
  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const [editingTitle, setEditingTitle] = useState(false);

  const saveTimerRef = useRef(null);

  // ── Load all notes from backend on mount ─────────────
  useEffect(() => {
    fetchAllNotes()
      .then((fetched) => {
        setNotes(fetched);
        if (fetched.length > 0) setSelectedId(fetched[0]._id);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Selected note object ─────────────────────────────
  const selectedNote = notes.find((n) => n._id === selectedId) || null;

  // ── Debounced save to backend ────────────────────────
  const scheduleSave = useCallback((id, payload) => {
    setSaveStatus('saving');
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await updateNote(id, payload);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 1000);
  }, []);

  // ── Handle content change ────────────────────────────
  const handleContentChange = (e) => {
    const value = e.target.value;
    setNotes((prev) =>
      prev.map((n) => (n._id === selectedId ? { ...n, content: value } : n))
    );
    scheduleSave(selectedId, { content: value });
  };

  // ── Handle title change ──────────────────────────────
  const handleTitleChange = (e) => {
    const value = e.target.value;
    setNotes((prev) =>
      prev.map((n) => (n._id === selectedId ? { ...n, title: value } : n))
    );
    scheduleSave(selectedId, { title: value });
  };

  // ── Create new note ──────────────────────────────────
  const handleCreateNote = async () => {
    setCreating(true);
    try {
      const newNote = await createNote({ title: 'Untitled Note', content: '' });
      setNotes((prev) => [newNote, ...prev]);
      setSelectedId(newNote._id);
    } catch (err) {
      console.error('Failed to create note:', err);
    } finally {
      setCreating(false);
    }
  };

  // ── Delete a note ────────────────────────────────────
  const handleDeleteNote = async (id) => {
    try {
      await deleteNote(id);
      const remaining = notes.filter((n) => n._id !== id);
      setNotes(remaining);
      if (selectedId === id) {
        setSelectedId(remaining.length > 0 ? remaining[0]._id : null);
      }
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  // ── Format date for sidebar ──────────────────────────
  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
    });
  };

  // ── Render ───────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-[#64748b]">
        <FiLoader className="animate-spin mr-2" /> Loading notes…
      </div>
    );
  }

  return (
    <div className="flex h-full gap-0 overflow-hidden rounded-none">
      {/* ── Left Sidebar: Notes List ─────────────────── */}
      <div
        className="flex flex-col shrink-0 border-r border-[#e2e8f0] bg-[#faf8ff]"
        style={{ width: 210 }}
      >
        {/* Sidebar header */}
        <div className="px-3 pt-4 pb-2 flex items-center justify-between border-b border-[#e2e8f0]">
          <span className="text-xs font-extrabold tracking-widest text-[#8b5cf6] uppercase">
            My Notes
          </span>
          <button
            onClick={handleCreateNote}
            disabled={creating}
            title="New Note"
            className="flex items-center gap-1 text-[10px] font-bold bg-[#8b5cf6] text-white px-2 py-1 rounded-lg hover:bg-[#7c3aed] transition-colors disabled:opacity-50 cursor-pointer"
          >
            {creating ? <FiLoader size={10} className="animate-spin" /> : <FiPlus size={10} />}
            New
          </button>
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto py-1">
          {notes.length === 0 ? (
            <p className="text-center text-[#94a3b8] text-xs px-3 pt-8 leading-relaxed">
              No notes yet.
              <br />
              Click <strong>New</strong> to start!
            </p>
          ) : (
            notes.map((note) => {
              const isActive = note._id === selectedId;
              return (
                <div
                  key={note._id}
                  onClick={() => setSelectedId(note._id)}
                  className={`group relative mx-2 my-0.5 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#ede9fe] border border-[#c4b5fd]'
                      : 'hover:bg-[#f1f5f9]'
                  }`}
                >
                  <p
                    className={`text-xs font-semibold truncate pr-5 ${
                      isActive ? 'text-[#6d28d9]' : 'text-[#334155]'
                    }`}
                  >
                    {note.title || 'Untitled Note'}
                  </p>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">
                    {formatDate(note.updatedAt || note.createdAt)}
                  </p>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note._id);
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-[#ef4444] hover:text-[#dc2626] transition-opacity cursor-pointer"
                    title="Delete note"
                  >
                    <FiTrash2 size={11} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Panel: Note Editor ─────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        {selectedNote ? (
          <>
            {/* Editor header */}
            <div className="px-6 pt-5 pb-3 border-b border-[#e2e8f0] flex items-center justify-between gap-3">
              <div className="flex-1 flex items-center gap-2">
                <FiFileText className="text-[#8b5cf6] shrink-0" size={16} />
                {editingTitle ? (
                  <input
                    autoFocus
                    type="text"
                    value={selectedNote.title}
                    onChange={handleTitleChange}
                    onBlur={() => setEditingTitle(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
                    className="flex-1 text-base font-bold text-[#172554] bg-transparent outline-none border-b border-[#8b5cf6]"
                  />
                ) : (
                  <h2
                    onClick={() => setEditingTitle(true)}
                    title="Click to edit title"
                    className="flex-1 text-base font-bold text-[#172554] cursor-pointer hover:text-[#6d28d9] truncate transition-colors"
                  >
                    {selectedNote.title || 'Untitled Note'}
                  </h2>
                )}
                <button
                  onClick={() => setEditingTitle((v) => !v)}
                  className="text-[#94a3b8] hover:text-[#8b5cf6] transition-colors cursor-pointer"
                  title="Edit title"
                >
                  {editingTitle ? <FiCheck size={14} /> : <FiEdit3 size={14} />}
                </button>
              </div>

              {/* Save status */}
              <div className="text-xs flex items-center gap-1 shrink-0">
                {saveStatus === 'saving' && (
                  <span className="text-[#8b5cf6] flex items-center gap-1">
                    <FiLoader className="animate-spin" size={11} /> Saving…
                  </span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-[#22c55e] flex items-center gap-1">
                    <FiSave size={11} /> Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-[#ef4444]">Save failed</span>
                )}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              value={selectedNote.content}
              onChange={handleContentChange}
              placeholder="Start writing your note here…"
              className="flex-1 w-full px-6 py-4 text-sm font-mono leading-relaxed text-[#172554] bg-white outline-none resize-none placeholder-[#c4c4c4]"
            />
          </>
        ) : (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-full text-center gap-3">
            <FiFileText size={36} className="text-[#c4b5fd]" />
            <p className="text-[#64748b] text-sm font-medium">No note selected</p>
            <p className="text-[#94a3b8] text-xs">
              Select a note from the sidebar or create a new one.
            </p>
            <button
              onClick={handleCreateNote}
              className="mt-2 flex items-center gap-1.5 text-xs font-bold bg-[#8b5cf6] text-white px-4 py-2 rounded-xl hover:bg-[#7c3aed] transition-colors cursor-pointer"
            >
              <FiPlus size={13} /> New Note
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
