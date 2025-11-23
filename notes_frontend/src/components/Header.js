import React from "react";

// PUBLIC_INTERFACE
export default function Header({ onNew, loading }) {
  /** Simple app header with New Note action button. */
  return (
    <header className="header">
      <div className="brand">
        <span className="logo">🗒️</span>
        <h1 className="title">Simple Notes</h1>
      </div>
      <div className="header-actions">
        <button
          className="btn btn-primary"
          onClick={onNew}
          disabled={loading}
          aria-label="Create a new note"
          title="New note"
        >
          + New
        </button>
      </div>
    </header>
  );
}
