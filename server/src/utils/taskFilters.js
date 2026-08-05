import { TASK_STATUSES } from '../models/Task.js';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildTaskFilter(query = {}) {
  const filter = {};

  if (query.status) {
    if (!TASK_STATUSES.includes(query.status)) {
      const error = new Error(`Invalid status. Use one of: ${TASK_STATUSES.join(', ')}`);
      error.status = 400;
      throw error;
    }
    filter.status = query.status;
  }

  if (query.client) {
    filter.clientName = new RegExp(`^${escapeRegex(String(query.client).trim())}$`, 'i');
  }

  if (query.editor) {
    filter.editorName = new RegExp(`^${escapeRegex(String(query.editor).trim())}$`, 'i');
  }

  return filter;
}
