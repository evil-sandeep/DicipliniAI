import { useState, useEffect, useRef, useCallback } from 'react';
import { FiFileText, FiSave, FiLoader } from 'react-icons/fi';
import { fetchNotes, saveNotes } from './api';

const DEFAULT_NOTES = '📌 Quick Notes & Ideas:\n- Focus on consistency over intensity.\n- Small daily wins build big habits.';

/**
 * NotesSection
 *
 * Self-contained notes tab component.
 * - Loads user notes from the backend on mount.
 * - Auto-saves to the backend with a 1-second debounce on every change.
 * - Displays a saving / saved indicator to the user.
 */
export default function NotesSection() {
  const [notesText, setNotesText] = useState('');
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saving' | 'saved' | 'error'
  const saveTimerRef = useRef(null);

  // ── Load notes from backend on mount ─────────────────
  useEffect(() => {
    fetchNotes()
      .then((content) => {
        setNotesText(content || DEFAULT_NOTES);
      })
      .catch(() => {
        // Fallback to default text if fetch fails
        setNotesText(DEFAULT_NOTES);
      });
  }, []);

  // ── Debounced auto-save ───────────────────────────────
  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setNotesText(value);
    setSaveStatus('saving');

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await saveNotes(value);
        setSaveStatus('saved');
        // Reset to idle after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
      }
    }, 1000);
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col h-full gap-4">
      {/* Header */}
      <div className="border-b border-[#cbd5e1] pb-2 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#172554] flex items-center gap-2">
            <FiFileText className="text-[#8b5cf6]" /> Quick Notepad
          </h2>
          <p className="text-xs text-[#64748b]">Write down quick thoughts, reflections and reminders</p>
        </div>

        {/* Save status indicator */}
        <div className="text-xs flex items-center gap-1.5">
          {saveStatus === 'saving' && (
            <span className="text-[#8b5cf6] flex items-center gap-1">
              <FiLoader className="animate-spin" size={12} /> Saving…
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-[#22c55e] flex items-center gap-1">
              <FiSave size={12} /> Saved
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-[#ef4444]">Save failed</span>
          )}
        </div>
      </div>

      {/* Notepad textarea */}
      <textarea
        value={notesText}
        onChange={handleChange}
        placeholder="Type your notes here..."
        className="flex-1 w-full p-4 rounded-2xl border border-[#cbd5e1] text-sm bg-white outline-none focus:border-[#8b5cf6] font-mono leading-relaxed text-[#172554] shadow-sm resize-none"
        style={{ minHeight: 280 }}
      />
    </div>
  );
}
