import { FiTrash2 } from 'react-icons/fi';

// ─────────────────────────────────────────────────────────────────────────────
// NoteDeleteButton
//
// Trash icon button used in the sidebar note list (hover). 
// When clicked, it shows a window confirm prompt.
//
// Props:
//   noteTitle: string        — shown inside the confirmation so user knows which note
//   onConfirmDelete()        — called when user confirms deletion
//   size?: 'sm' | 'md'      — icon size variant (default 'sm' for sidebar)
// ─────────────────────────────────────────────────────────────────────────────
export function NoteDeleteButton({ noteTitle, onConfirmDelete, size = 'sm' }) {
  const iconSize = size === 'md' ? 14 : 11;

  const handleClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${noteTitle || 'Untitled Note'}"? This cannot be undone.`)) {
      onConfirmDelete();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`text-[#ef4444] hover:text-[#dc2626] transition-colors cursor-pointer ${
        size === 'md' ? 'p-1 rounded-lg hover:bg-[#fef2f2]' : ''
      }`}
      title="Delete note"
    >
      <FiTrash2 size={iconSize} />
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NoteDeleteEditorButton
//
// A more prominent "Delete this note" button shown inside the editor panel
// header — always visible when a note is open.
//
// Props:
//   noteTitle: string        — note name for the confirmation text
//   onConfirmDelete()        — called when user confirms deletion
// ─────────────────────────────────────────────────────────────────────────────
export function NoteDeleteEditorButton({ noteTitle, onConfirmDelete }) {
  const handleClick = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${noteTitle || 'Untitled'}"? This cannot be undone.`)) {
      onConfirmDelete();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1.5 text-[11px] font-semibold text-[#ef4444] hover:text-white hover:bg-[#ef4444] border border-[#fecaca] hover:border-[#ef4444] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
      title="Delete this note"
    >
      <FiTrash2 size={12} /> Delete
    </button>
  );
}

