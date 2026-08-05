import React, { useState } from 'react';
import { STATUSES } from '../constants.js';
import TaskCard from './TaskCard.jsx';

function statusSlug(status) {
  return status.toLowerCase().replaceAll(' ', '-');
}

export default function BoardView({ tasks, onEdit, onDelete, onStatusChange }) {
  const [draggingId, setDraggingId] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  function handleDragStart(event, task) {
    event.dataTransfer.setData('text/plain', task._id);
    event.dataTransfer.effectAllowed = 'move';
    setDraggingId(task._id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDropTarget(null);
  }

  function handleDragOver(event, status) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (dropTarget !== status) setDropTarget(status);
  }

  function handleDragLeave(event, status) {
    // Only clear when leaving the column itself (not child nodes)
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setDropTarget((current) => (current === status ? null : current));
    }
  }

  function handleDrop(event, status) {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain');
    const task = tasks.find((item) => item._id === taskId);

    setDraggingId(null);
    setDropTarget(null);

    if (task && task.status !== status && onStatusChange) {
      onStatusChange(task, status);
    }
  }

  return (
    <section className="board" aria-label="Task board">
      {STATUSES.map((status) => {
        const statusTasks = tasks.filter((task) => task.status === status);
        const slug = statusSlug(status);
        const isDropTarget = dropTarget === status;

        return (
          <div
            className={`board-column column-${slug}${isDropTarget ? ' is-drop-target' : ''}`}
            data-status={slug}
            key={status}
            onDragOver={(event) => handleDragOver(event, status)}
            onDragLeave={(event) => handleDragLeave(event, status)}
            onDrop={(event) => handleDrop(event, status)}
          >
            <header className="board-column-header">
              <div className="column-title">
                <span className={`column-dot column-dot-${slug}`} aria-hidden="true" />
                <h2>{status}</h2>
              </div>
              <span className="column-count">{statusTasks.length}</span>
            </header>
            <div className="board-stack">
              {statusTasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  draggable
                  isDragging={draggingId === task._id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))}
              {statusTasks.length === 0 && (
                <p className="empty-column">
                  {isDropTarget ? 'Drop here' : 'No tasks — drag one here'}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
