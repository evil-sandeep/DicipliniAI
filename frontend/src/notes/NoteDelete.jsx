import { useState } from 'react';
import { FiTrash2, FiAlertTriangle, FiX, FiCheck } from 'react-icons/fi';

// ─────────────────────────────────────────────────────────────────────────────
// NoteDeleteButton
//
// Trash icon button used in the sidebar note list (hover) and in the editor
// header. When clicked, it shows an inline confirmation prompt instead of
// deleting immediately — prevents accidental deletions.
//
// Props:
//   noteTitle: string        — shown inside the confirmation so user knows which note
//   onConfirmDelete()        — called when user confirms deletion
//   size?: 'sm' | 'md'      — icon size variant (default 'sm' for sidebar)
// ─────────────────────────────────────────────────────────────────────────────
export function NoteDeleteButton({ noteTitle, onConfirmDelete, size = 'sm' }) {
  const [confirming, setConfirming] = useState(false);

  const iconSize = size === 'md' ? 14 : 11;

  if (confirming) {
    return (
      <DeleteConfirmInline
        noteTitle={noteTitle}
        onConfirm={() => {
          setConfirming(false);
          onConfirmDelete();
        }}
        onCancel={() => setConfirming(false)}
      />
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setConfirming(true);
      }}
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
// DeleteConfirmInline
//
// Small inline confirmation bar. Appears in place of the trash button.
// Used inside NoteDeleteButton — not meant to be used directly.
//
// Props:
//   noteTitle: string   — note name shown in the prompt
//   onConfirm()         — called on "Yes, delete" click
//   onCancel()          — called on "Cancel" click
// ─────────────────────────────────────────────────────────────────────────────
function DeleteConfirmInline({ noteTitle, onConfirm, onCancel }) {
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-x-1 top-1 z-10 bg-white border border-[#fecaca] rounded-xl shadow-lg px-2 py-2 flex flex-col gap-1.5"
    >
      <div className="flex items-start gap-1">
        <FiAlertTriangle size={11} className="text-[#ef4444] mt-0.5 shrink-0" />
        <p className="text-[10px] text-[#334155] leading-tight">
          Delete{' '}
          <span className="font-bold text-[#172554]">
            "{noteTitle || 'Untitled Note'}"
          </span>
          ? This cannot be undone.
        </p>
      </div>
      <div className="flex gap-1">
        {/* Confirm delete */}
        <button
          onClick={onConfirm}
          className="flex-1 flex items-center justify-center gap-0.5 text-[10px] font-bold bg-[#ef4444] text-white py-1 rounded-lg hover:bg-[#dc2626] transition-colors cursor-pointer"
        >
          <FiCheck size={9} /> Yes, delete
        </button>
        {/* Cancel */}
        <button
          onClick={onCancel}
          className="px-2 flex items-center justify-center text-[#64748b] hover:text-[#334155] text-[10px] border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors cursor-pointer"
          title="Cancel"
        >
          <FiX size={11} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NoteDeleteEditorButton
//
// A more prominent "Delete this note" button shown inside the editor panel
// header — always visible when a note is open, not just on hover.
//
// Props:
//   noteTitle: string        — note name for the confirmation text
//   onConfirmDelete()        — called when user confirms deletion
// ─────────────────────────────────────────────────────────────────────────────
export function NoteDeleteEditorButton({ noteTitle, onConfirmDelete }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-1.5 bg-[#fef2f2] border border-[#fecaca] rounded-xl px-3 py-1.5">
        <FiAlertTriangle size={12} className="text-[#ef4444] shrink-0" />
        <span className="text-[10px] text-[#334155]">
          Delete <strong>"{noteTitle || 'Untitled'}"</strong>?
        </span>
        <button
          onClick={() => {
            setConfirming(false);
            onConfirmDelete();
          }}
          className="flex items-center gap-0.5 text-[10px] font-bold text-white bg-[#ef4444] px-2 py-0.5 rounded-lg hover:bg-[#dc2626] transition-colors cursor-pointer"
        >
          <FiCheck size={9} /> Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[#94a3b8] hover:text-[#64748b] cursor-pointer"
        >
          <FiX size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-[11px] font-semibold text-[#ef4444] hover:text-white hover:bg-[#ef4444] border border-[#fecaca] hover:border-[#ef4444] px-3 py-1.5 rounded-xl transition-all cursor-pointer"
      title="Delete this note"
    >
      <FiTrash2 size={12} /> Delete
    </button>
  );
}
