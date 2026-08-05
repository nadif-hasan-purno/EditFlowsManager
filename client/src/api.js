const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

async function parseResponse(response) {
  if (response.status === 204) return null;
  const contentType = response.headers.get("content-type") || "";
  const body = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof body === "object" ? body.message : body;
    const details =
      typeof body === "object" && body.details
        ? ` ${body.details.join(" ")}`
        : "";
    throw new Error(`${message || "Request failed."}${details}`);
  }
  return body;
}

async function request(path, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
}

function taskQuery(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.client) params.set("client", filters.client);
  if (filters.editor) params.set("editor", filters.editor);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export const api = {
  listTasks: (filters) => request(`/tasks${taskQuery(filters)}`),
  createTask: (task) =>
    request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  updateTask: (id, task) =>
    request(`/tasks/${id}`, { method: "PATCH", body: JSON.stringify(task) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: "DELETE" }),

  listDefinitions: () => request("/custom-field-definitions"),
  createDefinition: (definition) =>
    request("/custom-field-definitions", {
      method: "POST",
      body: JSON.stringify(definition),
    }),
  updateDefinition: (id, definition) =>
    request(`/custom-field-definitions/${id}`, {
      method: "PATCH",
      body: JSON.stringify(definition),
    }),
  deleteDefinition: (id) =>
    request(`/custom-field-definitions/${id}`, { method: "DELETE" }),

  async downloadCsv(filters) {
    const response = await fetch(
      `${API_URL}/tasks/export.csv${taskQuery(filters)}`,
    );
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || "CSV export failed.");
    }

    const blob = await response.blob();
    const disposition = response.headers.get("content-disposition") || "";
    const match = disposition.match(/filename="?([^";]+)"?/i);
    const fileName = match?.[1] || "tasks.csv";
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  },
};
