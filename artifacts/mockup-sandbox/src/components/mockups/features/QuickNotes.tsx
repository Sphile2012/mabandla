import { useState } from "react";
import { StickyNote, Plus, Trash2, Clock, Tag, ChevronDown, Bookmark } from "lucide-react";

const initialNotes = [
  { id: 1, text: "Remember: when completing the square, halve the middle term and square it. e.g. x² + 6x → (x+3)² - 9", time: "18:24", tag: "Formula", tagColor: "#7c3aed" },
  { id: 2, text: "The discriminant b²-4ac tells us the nature of roots: positive = 2 real roots, zero = 1 real root, negative = no real roots", time: "12:05", tag: "Key Concept", tagColor: "#2563eb" },
  { id: 3, text: "Practice the 5 examples from 14:30 onwards — they're exam favourites!", time: "14:30", tag: "Exam Tip", tagColor: "#f59e0b" },
];

const tags = ["Formula", "Key Concept", "Exam Tip", "Question", "Revision"];
const tagColors: Record<string, string> = {
  "Formula": "#7c3aed",
  "Key Concept": "#2563eb",
  "Exam Tip": "#f59e0b",
  "Question": "#ef4444",
  "Revision": "#10b981",
};

export function QuickNotes() {
  const [notes, setNotes] = useState(initialNotes);
  const [draft, setDraft] = useState("");
  const [selectedTag, setSelectedTag] = useState("Key Concept");
  const [activeTab, setActiveTab] = useState<"notes" | "bookmarks">("notes");

  const addNote = () => {
    if (!draft.trim()) return;
    setNotes([{ id: Date.now(), text: draft, time: "23:45", tag: selectedTag, tagColor: tagColors[selectedTag] || "#7c3aed" }, ...notes]);
    setDraft("");
  };

  return (
    <div className="min-h-screen" style={{ background: "#080d1a", fontFamily: "'Inter',sans-serif" }}>
      <div className="max-w-lg mx-auto p-5">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.2)" }}>
              <StickyNote className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Lesson Notes</h2>
              <p className="text-xs text-slate-500">Quadratic Equations</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.25)" }}>{notes.length} notes</span>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {(["notes", "bookmarks"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all flex items-center justify-center gap-1.5"
              style={{
                background: activeTab === tab ? "rgba(124,58,237,0.3)" : "transparent",
                color: activeTab === tab ? "#c4b5fd" : "#64748b",
                border: activeTab === tab ? "1px solid rgba(124,58,237,0.4)" : "1px solid transparent",
              }}
            >
              {tab === "notes" ? <StickyNote className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              {tab === "notes" ? "My Notes" : "Bookmarks"}
            </button>
          ))}
        </div>

        {activeTab === "notes" && (
          <>
            {/* Add note */}
            <div className="p-4 rounded-2xl mb-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add a note at this timestamp..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-600 resize-none outline-none leading-relaxed"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                {/* Tag selector */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                  {tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSelectedTag(t)}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all"
                      style={{
                        background: selectedTag === t ? `${tagColors[t]}25` : "rgba(255,255,255,0.04)",
                        color: selectedTag === t ? tagColors[t] : "#64748b",
                        border: `1px solid ${selectedTag === t ? tagColors[t] + "50" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <button
                  onClick={addNote}
                  disabled={!draft.trim()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-30 flex-shrink-0 ml-2"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            </div>

            {/* Notes list */}
            <div className="space-y-3">
              {notes.map((note) => (
                <div key={note.id} className="p-4 rounded-2xl group relative" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-slate-300 leading-relaxed flex-1">{note.text}</p>
                    <button
                      onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all hover:bg-red-500/15 flex-shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2.5">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <Clock className="w-3 h-3 text-slate-600" />
                      <span className="text-xs text-slate-500 font-medium">{note.time}</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${note.tagColor}15`, border: `1px solid ${note.tagColor}30` }}>
                      <Tag className="w-3 h-3" style={{ color: note.tagColor }} />
                      <span className="text-xs font-semibold" style={{ color: note.tagColor }}>{note.tag}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Export */}
            <button className="w-full mt-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#64748b" }}>
              <ChevronDown className="w-4 h-4" />
              Export Notes as PDF
            </button>
          </>
        )}

        {activeTab === "bookmarks" && (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No bookmarks yet</p>
            <p className="text-slate-600 text-xs mt-1">Pause the video and tap the bookmark button to save moments</p>
          </div>
        )}
      </div>
    </div>
  );
}
