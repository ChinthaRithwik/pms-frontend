import api from "./axiosConfig";

export const getProjects = async (page = 0, size = 10) => {
  const response = await api.get(`/projects?page=${page}&size=${size}`);
  return response.data;
};

export const getAllSystemProjects = async (page = 0) => {
  const response = await api.get(`/projects/all?page=${page}&size=10`);
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`);
  return response.data;
};

export const createProject = async (data) => {
  const response = await api.post("/projects", data);
  return response.data;
};

export const updateProject = async (id, data) => {
  const response = await api.put(`/projects/${id}`, data);
  return response.data;
};

export const updateProjectStatus = async (id, status) => {
  const response = await api.patch(`/projects/${id}/status`, { status });
  return response.data;
};

export const deleteProject = async (id) => {
  await api.delete(`/projects/${id}`);
};

export const getProjectStats = async () => {
  const response = await api.get("/projects/stats");
  return response.data;
};
