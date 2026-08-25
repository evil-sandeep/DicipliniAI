import { useState, useRef, useEffect } from 'react';
import { FiPlus, FiLoader, FiCheck, FiX, FiEdit3 } from 'react-icons/fi';

// ─────────────────────────────────────────────────────────────────────────────
// NewNotePrompt
//
// Shown in the sidebar when the user clicks "New Note".
// Renders a small inline input so the user can type a title before creating.
//
// Props:
//   onConfirm(title: string) — called when the user confirms (Enter or ✓ button)
//   onCancel()               — called when the user cancels (Escape or ✕ button)
//   loading: bool            — disables input while the note is being created
// ─────────────────────────────────────────────────────────────────────────────
export function NewNotePrompt({ onConfirm, onCancel, loading = false }) {
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  // Auto-focus the input when the prompt mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleConfirm = () => {
    const trimmed = title.trim();
    onConfirm(trimmed || 'Untitled Note');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleConfirm();
    if (e.key === 'Escape') onCancel();
  };

  return (
    <div className="mx-2 my-1 px-2 py-2 rounded-xl bg-[#ede9fe] border border-[#c4b5fd]">
      <p className="text-[10px] font-bold text-[#6d28d9] mb-1.5 uppercase tracking-wider">
        New Note Title
      </p>

      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        placeholder="e.g. My Ideas…"
        maxLength={60}
        className="w-full text-xs px-2 py-1.5 rounded-lg border border-[#c4b5fd] bg-white text-[#172554] outline-none focus:border-[#8b5cf6] placeholder-[#c4b5fd] mb-2"
      />

      <div className="flex gap-1.5">
        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-1 text-[10px] font-bold bg-[#8b5cf6] text-white py-1 rounded-lg hover:bg-[#7c3aed] transition-colors disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <FiLoader size={10} className="animate-spin" />
          ) : (
            <FiCheck size={10} />
          )}
          {loading ? 'Creating…' : 'Create'}
        </button>

        {/* Cancel button */}
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-2 flex items-center justify-center text-[#94a3b8] hover:text-[#ef4444] transition-colors cursor-pointer"
          title="Cancel"
        >
          <FiX size={12} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NoteTitleEditor
//
// Shown in the editor panel header for the currently selected note.
// Toggles between display mode (click to edit) and edit mode (input field).
//
// Props:
//   title: string               — current title value
//   onChange(newTitle: string)  — called on every keystroke (parent handles save)
//   saveStatus: string          — 'idle' | 'saving' | 'saved' | 'error'
// ─────────────────────────────────────────────────────────────────────────────
export function NoteTitleEditor({ title, onChange, saveStatus }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const handleBlur = () => setEditing(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === 'Escape') setEditing(false);
  };

  return (
    <div className="flex-1 flex items-center gap-2 min-w-0">
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          maxLength={60}
          className="flex-1 text-base font-bold text-[#172554] bg-transparent outline-none border-b-2 border-[#8b5cf6] truncate"
        />
      ) : (
        <h2
          onClick={() => setEditing(true)}
          title="Click to edit title"
          className="flex-1 text-base font-bold text-[#172554] cursor-pointer hover:text-[#6d28d9] truncate transition-colors select-none"
        >
          {title || 'Untitled Note'}
        </h2>
      )}

      {/* Edit / Done toggle icon */}
      <button
        onClick={() => setEditing((v) => !v)}
        className="text-[#94a3b8] hover:text-[#8b5cf6] transition-colors cursor-pointer shrink-0"
        title={editing ? 'Done editing title' : 'Edit title'}
      >
        {editing ? <FiCheck size={14} /> : <FiEdit3 size={14} />}
      </button>

      {/* Inline save status */}
      <span className="text-[10px] shrink-0">
        {saveStatus === 'saving' && (
          <span className="text-[#8b5cf6]">saving…</span>
        )}
        {saveStatus === 'saved' && (
          <span className="text-[#22c55e]">✓ saved</span>
        )}
        {saveStatus === 'error' && (
          <span className="text-[#ef4444]">error</span>
        )}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NewNoteButton
//
// Reusable "New Note" trigger button shown in the sidebar header.
//
// Props:
//   onClick()       — called when the button is clicked
//   disabled: bool  — disables when prompt is already open
// ─────────────────────────────────────────────────────────────────────────────
export function NewNoteButton({ onClick, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="New Note"
      className="flex items-center gap-1 text-[10px] font-bold bg-[#8b5cf6] text-white px-2 py-1 rounded-lg hover:bg-[#7c3aed] transition-colors disabled:opacity-50 cursor-pointer"
    >
      <FiPlus size={10} />
      New
    </button>
  );
}
