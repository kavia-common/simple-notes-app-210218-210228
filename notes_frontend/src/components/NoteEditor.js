import React, { useEffect, useState } from "react";

// PUBLIC_INTERFACE
export default function NoteEditor({ note, onChange, onSave, saving }) {
  /**
   * Editor for the selected note. Allows editing title and content.
   * - note: {id?, title, content}
   * - onChange: (partial) -> void
   * - onSave: () -> Promise|void
   */
  const [local, setLocal] = useState(note || { title: "", content: "" });

  useEffect(() => {
    setLocal(note || { title: "", content: "" });
  }, [note?.id, note?.title, note?.content]);

  const updateField = (field, value) => {
    const next = { ...local, [field]: value };
    setLocal(next);
    onChange && onChange({ [field]: value });
  };

  const handleSave = () => {
    onSave && onSave();
  };

  if (!note) {
    return (
      <section className="editor empty">
        <div className="placeholder">
          Select a note from the left or create a new one.
        </div>
      </section>
    );
  }

  return (
    <section className="editor">
      <div className="editor-actions">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={saving}
          aria-label="Save note"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
      <input
        className="input title-input"
        placeholder="Title"
        value={local.title || ""}
        onChange={(e) => updateField("title", e.target.value)}
      />
      <textarea
        className="textarea content-input"
        placeholder="Write your note here…"
        value={local.content || ""}
        onChange={(e) => updateField("content", e.target.value)}
      />
    </section>
  );
}
