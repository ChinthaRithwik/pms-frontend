import api from "./axiosConfig";

export const createTask = async (projectId, data) => {
  const response = await api.post(`/tasks/project/${projectId}`, data);
  return response.data;
};

export const getTasksByProject = async (projectId, status = null, page = 0) => {
  const params = new URLSearchParams({ page, size: 10 });
  if (status) params.append("status", status);

  const response = await api.get(`/tasks/project/${projectId}?${params}`);
  return response.data;
};

export const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
};

export const getOverdueTasks = async (page = 0) => {
  const response = await api.get(`/tasks/overdue?page=${page}&size=10`);
  return response.data;
};

export const updateTask = async (taskId, data) => {
  const response = await api.patch(`/tasks/${taskId}`, data);
  return response.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}/status`, { status });
  return response.data;
};

export const updateTaskAssignee = async (taskId, assignedUserId) => {
  const response = await api.patch(`/tasks/${taskId}/assign`, {
    assignedUserId,
  });
  return response.data;
};

export const deleteTask = async (taskId) => {
  await api.delete(`/tasks/${taskId}`);
};

export const searchTasks = async (filters = {}, page = 0) => {
  const params = new URLSearchParams({ page, size: 10 });
  if (filters.projectId) params.append("projectId", filters.projectId);
  if (filters.status) params.append("status", filters.status);
  if (filters.assignedUserId) params.append("assignedUserId", filters.assignedUserId);
  if (filters.dueBefore) params.append("dueBefore", filters.dueBefore);

  const response = await api.get(`/tasks/search?${params}`);
  return response.data;
};
