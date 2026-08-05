import React from 'react';
import { STATUSES } from '../constants.js';
import TaskCard from './TaskCard.jsx';

export default function BoardView({ tasks, onEdit, onDelete }) {
  return (
    <section className="board" aria-label="Task board">
      {STATUSES.map((status) => {
        const statusTasks = tasks.filter((task) => task.status === status);
        return (
          <div className="board-column" key={status}>
            <header>
              <h2>{status}</h2>
              <span>{statusTasks.length}</span>
            </header>
            <div className="board-stack">
              {statusTasks.map((task) => (
                <TaskCard key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} />
              ))}
              {statusTasks.length === 0 && <p className="empty-column">No tasks</p>}
            </div>
          </div>
        );
      })}
    </section>
  );
}
