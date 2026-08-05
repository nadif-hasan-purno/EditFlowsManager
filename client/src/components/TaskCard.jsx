import React from 'react';

function CustomFieldValue({ field }) {
  if (field.type === 'url' && field.value) {
    return <a href={field.value} target="_blank" rel="noreferrer">Open link</a>;
  }
  return <span>{field.value === '' || field.value === null || field.value === undefined ? '—' : String(field.value)}</span>;
}

function statusSlug(status) {
  return status.toLowerCase().replaceAll(' ', '-');
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  draggable = false,
  isDragging = false,
  onDragStart,
  onDragEnd,
}) {
  const slug = statusSlug(task.status);

  function handleDragStart(event) {
    if (event.target.closest('button, a, .card-actions')) {
      event.preventDefault();
      return;
    }
    onDragStart?.(event, task);
  }

  return (
    <article
      className={`task-card card-accent-${slug}${isDragging ? ' is-dragging' : ''}${draggable ? ' is-draggable' : ''}`}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
    >
      <div className="task-card-topline">
        <span className={`status-badge status-${slug}`}>{task.status}</span>
        <span className="task-id">#{task._id.slice(-6)}</span>
      </div>
      <h3>{task.projectName}</h3>
      <p className="muted">{task.clientName} · {task.editorName}</p>
      <div className="task-metrics">
        <span><strong>{task.deadlineDays}</strong> days left</span>
        <span><strong>{task.duration}</strong> duration</span>
      </div>
      {task.description && <p className="description-preview">{task.description}</p>}
      {(task.googleDocLink || task.frameIoLink) && (
        <div className="link-row">
          {task.googleDocLink && <a href={task.googleDocLink} target="_blank" rel="noreferrer">Google Doc</a>}
          {task.frameIoLink && <a href={task.frameIoLink} target="_blank" rel="noreferrer">Frame.io</a>}
        </div>
      )}
      {task.customFields?.length > 0 && (
        <dl className="custom-summary">
          {task.customFields.slice(0, 3).map((field) => (
            <div key={field._id || field.name}>
              <dt>{field.name}</dt>
              <dd><CustomFieldValue field={field} /></dd>
            </div>
          ))}
          {task.customFields.length > 3 && <p className="muted tiny">+{task.customFields.length - 3} more fields</p>}
        </dl>
      )}
      <div className="card-actions">
        <button className="button ghost compact" type="button" onClick={() => onEdit(task)}>Edit</button>
        <button className="button danger compact" type="button" onClick={() => onDelete(task)}>Delete</button>
      </div>
    </article>
  );
}
