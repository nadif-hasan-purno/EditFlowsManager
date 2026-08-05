import React from 'react';

export default function ListView({ tasks, onEdit, onDelete }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Client</th>
            <th>Editor</th>
            <th>Status</th>
            <th>Deadline</th>
            <th>Duration</th>
            <th>Links</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task._id}>
              <td>
                <strong>{task.projectName}</strong>
                {task.description && <span className="table-description">{task.description}</span>}
              </td>
              <td>{task.clientName}</td>
              <td>{task.editorName}</td>
              <td><span className={`status-badge status-${task.status.toLowerCase().replaceAll(' ', '-')}`}>{task.status}</span></td>
              <td>{task.deadlineDays} days</td>
              <td>{task.duration}</td>
              <td>
                <div className="link-row">
                  {task.googleDocLink && <a href={task.googleDocLink} target="_blank" rel="noreferrer">Doc</a>}
                  {task.frameIoLink && <a href={task.frameIoLink} target="_blank" rel="noreferrer">Frame.io</a>}
                  {!task.googleDocLink && !task.frameIoLink && '—'}
                </div>
              </td>
              <td>
                <div className="row-actions">
                  <button className="button ghost compact" type="button" onClick={() => onEdit(task)}>Edit</button>
                  <button className="button danger compact" type="button" onClick={() => onDelete(task)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
