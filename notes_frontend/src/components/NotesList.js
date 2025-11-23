import React from "react";

// PUBLIC_INTERFACE
export default function NotesList({
  notes,
  selectedId,
  onSelect,
  onDelete,
  loading,
  error
}) {
  /** Sidebar list of notes with selection and delete action. */
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">Notes</h2>
      </div>
      <div className="sidebar-content" role="list" aria-label="Notes list">
        {loading && <div className="sidebar-state">Loading notes…</div>}
        {error && <div className="sidebar-error">Error: {String(error)}</div>}
        {!loading && !error && notes.length === 0 && (
          <div className="sidebar-state">No notes yet. Create one!</div>
        )}
        {!loading &&
          !error &&
          notes.map((n) => (
            <div
              key={n.id}
              role="listitem"
              className={`note-list-item ${selectedId === n.id ? "active" : ""}`}
              onClick={() => onSelect && onSelect(n.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelect && onSelect(n.id);
                }
              }}
            >
              <div className="note-list-item-title" title={n.title || "Untitled"}>
                {n.title?.trim() || "Untitled"}
              </div>
              <button
                className="icon-btn danger"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete && onDelete(n.id);
                }}
                aria-label={`Delete ${n.title || "Untitled"}`}
                title="Delete note"
              >
                🗑
              </button>
            </div>
          ))}
      </div>
    </aside>
  );
}
