import React, { useMemo, useState } from 'react';
import { CUSTOM_FIELD_TYPES, STATUSES } from '../constants.js';
import CustomFieldInput from './CustomFieldInput.jsx';

const emptyTask = {
  clientName: '',
  editorName: '',
  projectName: '',
  googleDocLink: '',
  deadlineDays: 0,
  duration: 0,
  status: 'Todo',
  frameIoLink: '',
  description: '',
  customFields: [],
};

function prepareInitial(task) {
  if (!task) return emptyTask;
  return {
    ...emptyTask,
    ...task,
    customFields: (task.customFields || []).map((field) => ({
      ...field,
      localId: field._id || crypto.randomUUID(),
    })),
  };
}

export default function TaskForm({ task, definitions, onSave, onCancel, onCreateDefinition }) {
  const [form, setForm] = useState(() => prepareInitial(task));
  const [selectedDefinition, setSelectedDefinition] = useState('');
  const [newField, setNewField] = useState({ name: '', type: 'text', options: '', reusable: false });
  const [saving, setSaving] = useState(false);
  const [fieldBusy, setFieldBusy] = useState(false);
  const [error, setError] = useState('');

  const availableDefinitions = useMemo(() => {
    const usedNames = new Set(form.customFields.map((field) => field.name.toLowerCase()));
    return definitions.filter((definition) => !usedNames.has(definition.name.toLowerCase()));
  }, [definitions, form.customFields]);

  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  function addDefinitionField() {
    const definition = definitions.find((item) => item._id === selectedDefinition);
    if (!definition) return;
    setForm((current) => ({
      ...current,
      customFields: [
        ...current.customFields,
        {
          localId: crypto.randomUUID(),
          definitionId: definition._id,
          name: definition.name,
          type: definition.type,
          options: definition.options || [],
          value: '',
        },
      ],
    }));
    setSelectedDefinition('');
  }

  async function addNewField() {
    setError('');
    const name = newField.name.trim();
    const options = newField.type === 'dropdown'
      ? [...new Set(newField.options.split(',').map((option) => option.trim()).filter(Boolean))]
      : [];

    if (!name) return setError('Enter a name for the custom field.');
    if (form.customFields.some((field) => field.name.toLowerCase() === name.toLowerCase())) {
      return setError('That custom field is already on this task.');
    }
    if (newField.type === 'dropdown' && options.length === 0) {
      return setError('Dropdown fields need at least one comma-separated option.');
    }

    try {
      setFieldBusy(true);
      let definitionId;
      if (newField.reusable) {
        const created = await onCreateDefinition({ name, type: newField.type, options });
        definitionId = created._id;
      }
      setForm((current) => ({
        ...current,
        customFields: [
          ...current.customFields,
          {
            localId: crypto.randomUUID(),
            ...(definitionId ? { definitionId } : {}),
            name,
            type: newField.type,
            options,
            value: '',
          },
        ],
      }));
      setNewField({ name: '', type: 'text', options: '', reusable: false });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setFieldBusy(false);
    }
  }

  function updateCustomField(index, value) {
    setForm((current) => ({
      ...current,
      customFields: current.customFields.map((field, fieldIndex) => fieldIndex === index ? value : field),
    }));
  }

  function removeCustomField(index) {
    setForm((current) => ({
      ...current,
      customFields: current.customFields.filter((_, fieldIndex) => fieldIndex !== index),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await onSave({
        ...form,
        deadlineDays: Number(form.deadlineDays),
        duration: Number(form.duration),
        customFields: form.customFields.map(({ localId, _id, ...field }) => field),
      });
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onCancel()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-form-title">
        <header className="modal-header">
          <div>
            <p className="eyebrow">{task ? 'Update assignment' : 'New assignment'}</p>
            <h2 id="task-form-title">{task ? 'Edit task' : 'Create task'}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onCancel} aria-label="Close">×</button>
        </header>

        <form onSubmit={submit}>
          {error && <div className="alert error">{error}</div>}
          <div className="form-grid">
            <label><span>Client Name *</span><input required value={form.clientName} onChange={update('clientName')} /></label>
            <label><span>Editor Name *</span><input required value={form.editorName} onChange={update('editorName')} /></label>
            <label className="wide"><span>Project Name *</span><input required value={form.projectName} onChange={update('projectName')} /></label>
            <label><span>Status *</span><select value={form.status} onChange={update('status')}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
            <label><span>Deadline (days) *</span><input required min="0" type="number" value={form.deadlineDays} onChange={update('deadlineDays')} /></label>
            <label><span>Duration *</span><input required min="0" step="any" type="number" value={form.duration} onChange={update('duration')} /></label>
            <label className="wide"><span>Google Doc Link</span><input type="url" placeholder="https://docs.google.com/..." value={form.googleDocLink} onChange={update('googleDocLink')} /></label>
            <label className="wide"><span>Frame.io Link</span><input type="url" placeholder="https://frame.io/..." value={form.frameIoLink} onChange={update('frameIoLink')} /></label>
            <label className="wide"><span>Description</span><textarea rows="4" value={form.description} onChange={update('description')} /></label>
          </div>

          <section className="custom-fields-section">
            <div className="section-heading">
              <div><p className="eyebrow">Flexible metadata</p><h3>Custom fields</h3></div>
              <span>{form.customFields.length} added</span>
            </div>

            {form.customFields.map((field, index) => (
              <CustomFieldInput
                key={field.localId || field._id || `${field.name}-${index}`}
                field={field}
                onChange={(value) => updateCustomField(index, value)}
                onRemove={() => removeCustomField(index)}
              />
            ))}

            <div className="field-adder">
              <h4>Add a reusable field</h4>
              <div className="inline-controls">
                <select value={selectedDefinition} onChange={(event) => setSelectedDefinition(event.target.value)}>
                  <option value="">Choose a saved definition</option>
                  {availableDefinitions.map((definition) => (
                    <option value={definition._id} key={definition._id}>{definition.name} ({definition.type})</option>
                  ))}
                </select>
                <button className="button secondary compact" type="button" disabled={!selectedDefinition} onClick={addDefinitionField}>Add</button>
              </div>
              {availableDefinitions.length === 0 && definitions.length > 0 && <p className="muted tiny">All saved definitions are already on this task.</p>}
            </div>

            <div className="field-adder">
              <h4>Define a field on the fly</h4>
              <div className="new-field-grid">
                <label><span>Name</span><input value={newField.name} onChange={(event) => setNewField({ ...newField, name: event.target.value })} /></label>
                <label><span>Type</span><select value={newField.type} onChange={(event) => setNewField({ ...newField, type: event.target.value })}>{CUSTOM_FIELD_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
                {newField.type === 'dropdown' && <label className="wide"><span>Options (comma separated)</span><input value={newField.options} onChange={(event) => setNewField({ ...newField, options: event.target.value })} /></label>}
              </div>
              <div className="inline-controls split">
                <label className="checkbox"><input type="checkbox" checked={newField.reusable} onChange={(event) => setNewField({ ...newField, reusable: event.target.checked })} /><span>Save as reusable definition</span></label>
                <button className="button secondary compact" type="button" onClick={addNewField} disabled={fieldBusy}>{fieldBusy ? 'Adding…' : 'Add field'}</button>
              </div>
            </div>
          </section>

          <footer className="modal-actions">
            <button className="button ghost" type="button" onClick={onCancel}>Cancel</button>
            <button className="button primary" type="submit" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button>
          </footer>
        </form>
      </section>
    </div>
  );
}
