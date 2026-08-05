import React from 'react';
import { STATUSES } from '../constants.js';

export default function Filters({ filters, onChange, clients, editors, onExport, exporting }) {
  const update = (key) => (event) => onChange({ ...filters, [key]: event.target.value });
  const hasFilters = filters.status || filters.client || filters.editor;

  return (
    <section className="toolbar" aria-label="Task filters">
      <div className="filters">
        <label>
          <span>Status</span>
          <select value={filters.status} onChange={update('status')}>
            <option value="">All statuses</option>
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <label>
          <span>Client</span>
          <select value={filters.client} onChange={update('client')}>
            <option value="">All clients</option>
            {clients.map((client) => <option key={client}>{client}</option>)}
          </select>
        </label>
        <label>
          <span>Editor</span>
          <select value={filters.editor} onChange={update('editor')}>
            <option value="">All editors</option>
            {editors.map((editor) => <option key={editor}>{editor}</option>)}
          </select>
        </label>
        {hasFilters && (
          <button className="button ghost compact" type="button" onClick={() => onChange({ status: '', client: '', editor: '' })}>
            Clear filters
          </button>
        )}
      </div>
      <button className="button secondary" type="button" onClick={onExport} disabled={exporting}>
        {exporting ? 'Exporting…' : 'Export to CSV'}
      </button>
    </section>
  );
}
