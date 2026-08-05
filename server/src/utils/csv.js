const FIXED_HEADERS = [
  ['Task ID', '_id'],
  ['Client Name', 'clientName'],
  ['Editor Name', 'editorName'],
  ['Project Name', 'projectName'],
  ['Google Doc Link', 'googleDocLink'],
  ['Deadline (days)', 'deadlineDays'],
  ['Duration', 'duration'],
  ['Status', 'status'],
  ['Frame.io Link', 'frameIoLink'],
  ['Description', 'description'],
];

function csvCell(value) {
  if (value === null || value === undefined) return '';
  let text;
  if (value instanceof Date) text = value.toISOString();
  else if (typeof value === 'object') text = JSON.stringify(value);
  else text = String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function tasksToCsv(tasks) {
  const fixedNames = new Set(FIXED_HEADERS.map(([header]) => header.toLowerCase()));
  const customHeaders = new Map();

  for (const task of tasks) {
    for (const field of task.customFields || []) {
      const key = field.name.trim().toLowerCase();
      if (!customHeaders.has(key)) {
        const header = fixedNames.has(key) ? `Custom - ${field.name.trim()}` : field.name.trim();
        customHeaders.set(key, header);
      }
    }
  }

  const sortedCustom = [...customHeaders.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], undefined, { sensitivity: 'base' })
  );
  const headers = [...FIXED_HEADERS.map(([header]) => header), ...sortedCustom.map(([, header]) => header)];
  const rows = [headers.map(csvCell).join(',')];

  for (const task of tasks) {
    const customValues = new Map(
      (task.customFields || []).map((field) => [field.name.trim().toLowerCase(), field.value])
    );
    const fixedCells = FIXED_HEADERS.map(([, key]) => csvCell(key === '_id' ? String(task[key]) : task[key]));
    const customCells = sortedCustom.map(([key]) => csvCell(customValues.get(key)));
    rows.push([...fixedCells, ...customCells].join(','));
  }

  return `\uFEFF${rows.join('\r\n')}`;
}
