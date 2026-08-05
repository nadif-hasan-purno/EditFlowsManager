import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from './api.js';
import Filters from './components/Filters.jsx';
import BoardView from './components/BoardView.jsx';
import ListView from './components/ListView.jsx';
import TaskForm from './components/TaskForm.jsx';
import DefinitionManager from './components/DefinitionManager.jsx';

const emptyFilters = { status: '', client: '', editor: '' };

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [definitions, setDefinitions] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [knownClients, setKnownClients] = useState(new Set());
  const [knownEditors, setKnownEditors] = useState(new Set());
  const [view, setView] = useState('board');
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDefinitions, setShowDefinitions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const rememberNames = useCallback((items) => {
    setKnownClients((current) => new Set([...current, ...items.map((task) => task.clientName).filter(Boolean)]));
    setKnownEditors((current) => new Set([...current, ...items.map((task) => task.editorName).filter(Boolean)]));
  }, []);

  const loadTasks = useCallback(async (activeFilters, showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const data = await api.listTasks(activeFilters);
      setTasks(data);
      rememberNames(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }, [rememberNames]);

  const loadDefinitions = useCallback(async () => {
    try {
      setDefinitions(await api.listDefinitions());
    } catch (requestError) {
      setError(requestError.message);
    }
  }, []);

  useEffect(() => {
    api.listTasks(emptyFilters).then(rememberNames).catch(() => {});
    loadDefinitions();
  }, [loadDefinitions, rememberNames]);

  useEffect(() => {
    loadTasks(filters);
  }, [filters.status, filters.client, filters.editor, loadTasks]);

  const clients = useMemo(() => [...knownClients].sort((a, b) => a.localeCompare(b)), [knownClients]);
  const editors = useMemo(() => [...knownEditors].sort((a, b) => a.localeCompare(b)), [knownEditors]);

  function openCreate() {
    setEditingTask(null);
    setShowTaskForm(true);
  }

  function openEdit(task) {
    setEditingTask(task);
    setShowTaskForm(true);
  }

  async function saveTask(payload) {
    const saved = editingTask
      ? await api.updateTask(editingTask._id, payload)
      : await api.createTask(payload);
    rememberNames([saved]);
    setShowTaskForm(false);
    setEditingTask(null);
    await loadTasks(filters, false);
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete “${task.projectName}”? This cannot be undone.`)) return;
    try {
      await api.deleteTask(task._id);
      await loadTasks(filters, false);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function changeTaskStatus(task, nextStatus) {
    if (!task || task.status === nextStatus) return;

    const previousStatus = task.status;
    setTasks((current) =>
      current.map((item) =>
        item._id === task._id ? { ...item, status: nextStatus } : item,
      ),
    );
    setError('');

    try {
      await api.updateTaskStatus(task._id, nextStatus);
    } catch (requestError) {
      setTasks((current) =>
        current.map((item) =>
          item._id === task._id ? { ...item, status: previousStatus } : item,
        ),
      );
      setError(requestError.message);
    }
  }

  async function exportCsv() {
    setExporting(true);
    setError('');
    try {
      await api.downloadCsv(filters);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setExporting(false);
    }
  }

  async function createDefinition(payload) {
    const definition = await api.createDefinition(payload);
    setDefinitions((current) => [...current, definition].sort((a, b) => a.name.localeCompare(b.name)));
    return definition;
  }

  async function updateDefinition(id, payload) {
    const updated = await api.updateDefinition(id, payload);
    setDefinitions((current) => current.map((item) => item._id === id ? updated : item).sort((a, b) => a.name.localeCompare(b.name)));
  }

  async function deleteDefinition(definition) {
    if (!window.confirm(`Delete reusable definition “${definition.name}”? Existing task values will remain.`)) return;
    try {
      await api.deleteDefinition(definition._id);
      setDefinitions((current) => current.filter((item) => item._id !== definition._id));
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">CT</div>
          <div><p className="eyebrow">Video agency workspace</p><h1>Cutline Task Tracker</h1></div>
        </div>
        <div className="header-actions">
          <button className="button secondary" type="button" onClick={() => setShowDefinitions(true)}>Custom fields</button>
          <button className="button primary" type="button" onClick={openCreate}>+ New task</button>
        </div>
      </header>

      <main>
        <section className="overview">
          <div><p className="eyebrow">Production overview</p><h2>Keep every edit moving</h2><p>Track assignments, review links, deadlines, and agency-specific metadata in one lean workspace. Drag cards across the board to update status.</p></div>
          <div className="view-toggle" aria-label="Choose view">
            <button className={view === 'board' ? 'active' : ''} type="button" onClick={() => setView('board')}>Board</button>
            <button className={view === 'list' ? 'active' : ''} type="button" onClick={() => setView('list')}>List</button>
          </div>
        </section>

        <Filters filters={filters} onChange={setFilters} clients={clients} editors={editors} onExport={exportCsv} exporting={exporting} />
        {error && <div className="alert error">{error}<button type="button" onClick={() => setError('')}>×</button></div>}

        <div className="results-heading">
          <p><strong>{tasks.length}</strong> task{tasks.length === 1 ? '' : 's'} in this view</p>
          {(filters.status || filters.client || filters.editor) && <span>CSV export will use these filters</span>}
        </div>

        {loading ? (
          <div className="loading-state"><div className="spinner" /><p>Loading tasks…</p></div>
        ) : tasks.length === 0 ? (
          <section className="empty-state"><div>✓</div><h2>No matching tasks</h2><p>Create a task or clear the filters to see more work.</p><button className="button primary" type="button" onClick={openCreate}>Create task</button></section>
        ) : view === 'board' ? (
          <BoardView tasks={tasks} onEdit={openEdit} onDelete={deleteTask} onStatusChange={changeTaskStatus} />
        ) : (
          <ListView tasks={tasks} onEdit={openEdit} onDelete={deleteTask} />
        )}
      </main>

      {showTaskForm && (
        <TaskForm
          key={editingTask?._id || 'new'}
          task={editingTask}
          definitions={definitions}
          onSave={saveTask}
          onCancel={() => { setShowTaskForm(false); setEditingTask(null); }}
          onCreateDefinition={createDefinition}
        />
      )}
      {showDefinitions && (
        <DefinitionManager
          definitions={definitions}
          onCreate={createDefinition}
          onUpdate={updateDefinition}
          onDelete={deleteDefinition}
          onClose={() => setShowDefinitions(false)}
        />
      )}
    </div>
  );
}
