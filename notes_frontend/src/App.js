import React, { useEffect, useMemo, useState } from "react";
import "./App.css";
import "./index.css";
import Header from "./components/Header";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import { apiBase, createNote, deleteNote, getNotes, updateNote } from "./api";

// PUBLIC_INTERFACE
function App() {
  /**
   * Main application composing a sidebar list and a main editor area.
   * Provides CRUD operations via api.js with proxy fallback.
   */
  const [theme, setTheme] = useState("light");
  const [notes, setNotes] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingError, setLoadingError] = useState(null);

  const [selectedId, setSelectedId] = useState(null);
  const selected = useMemo(
    () => notes.find((n) => n.id === selectedId) || null,
    [notes, selectedId]
  );

  const [draft, setDraft] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  // theme application
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // load notes
  useEffect(() => {
    let ignore = false;
    const controller = new AbortController();
    setLoadingNotes(true);
    setLoadingError(null);
    getNotes(controller.signal)
      .then((data) => {
        if (ignore) return;
        if (Array.isArray(data)) {
          setNotes(data);
          if (data.length > 0 && !selectedId) {
            setSelectedId(data[0].id);
          }
        } else {
          setNotes([]);
        }
      })
      .catch((err) => {
        if (ignore) return;
        // Graceful stub: if backend not ready, show empty list but surface error message.
        setLoadingError(err?.message || "Failed to load notes");
        setNotes([]);
      })
      .finally(() => {
        if (!ignore) setLoadingNotes(false);
      });
    return () => {
      ignore = true;
      controller.abort();
    };
  }, []); // initial load

  useEffect(() => {
    // keep draft synced with selected note
    if (selected) {
      setDraft({ title: selected.title || "", content: selected.content || "" });
    } else {
      setDraft({ title: "", content: "" });
    }
  }, [selected?.id]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleNew = async () => {
    // optimistic empty creation, then server create
    const optimistic = { id: `tmp-${Date.now()}`, title: "Untitled", content: "" };
    setNotes((prev) => [optimistic, ...prev]);
    setSelectedId(optimistic.id);

    try {
      const created = await createNote({ title: optimistic.title, content: optimistic.content });
      setNotes((prev) =>
        prev
          .filter((n) => n.id !== optimistic.id)
          .concat(created)
          .sort((a, b) => String(b.id).localeCompare(String(a.id)))
      );
      setSelectedId(created.id);
    } catch (e) {
      // rollback optimistic
      setNotes((prev) => prev.filter((n) => n.id !== optimistic.id));
      alert(`Failed to create note: ${e?.message || e}`);
    }
  };

  const handleSelect = (id) => {
    setSelectedId(id);
  };

  const handleDelete = async (id) => {
    const toDelete = notes.find((n) => n.id === id);
    if (!toDelete) return;
    const confirmed = window.confirm(`Delete "${toDelete.title || "Untitled"}"?`);
    if (!confirmed) return;

    const prev = notes;
    setNotes((cur) => cur.filter((n) => n.id !== id));
    if (selectedId === id) setSelectedId(null);

    try {
      await deleteNote(id);
    } catch (e) {
      // rollback on failure
      setNotes(prev);
      alert(`Failed to delete note: ${e?.message || e}`);
    }
  };

  const handleDraftChange = (partial) => {
    setDraft((d) => ({ ...d, ...partial }));
  };

  const handleSave = async () => {
    if (!selected) {
      // If no selection, create new
      try {
        setSaving(true);
        const created = await createNote({ title: draft.title, content: draft.content });
        setNotes((prev) => [created, ...prev]);
        setSelectedId(created.id);
      } catch (e) {
        alert(`Failed to save: ${e?.message || e}`);
      } finally {
        setSaving(false);
      }
      return;
    }
    try {
      setSaving(true);
      const updated = await updateNote(selected.id, { title: draft.title, content: draft.content });
      setNotes((prev) => prev.map((n) => (n.id === selected.id ? updated : n)));
    } catch (e) {
      alert(`Failed to save: ${e?.message || e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="App">
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        title="Toggle theme"
      >
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>

      <div className="app-shell">
        <Header onNew={handleNew} loading={saving} />
        <div className="content">
          <NotesList
            notes={notes}
            selectedId={selectedId}
            onSelect={handleSelect}
            onDelete={handleDelete}
            loading={loadingNotes}
            error={loadingError}
          />
          <main className="main">
            <div className="api-hint">
              API: {apiBase || "(proxy via /notes)"} {/* quick hint for debugging */}
            </div>
            <NoteEditor
              note={selected}
              onChange={handleDraftChange}
              onSave={handleSave}
              saving={saving}
            />
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
