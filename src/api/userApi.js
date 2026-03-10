import api from "./axiosConfig";

export const createUser = async (data) => {
  const response = await api.post("/users", data);
  return response.data;
};

export const getAllUsers = async (page = 0, size = 10) => {
  const response = await api.get(`/users?page=${page}&size=${size}`);
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};

export const getUserTasks = async (userId, page = 0) => {
  const response = await api.get(`/users/${userId}/tasks?page=${page}&size=10`);
  return response.data;
};

export const getUserProjects = async (userId, page = 0) => {
  const response = await api.get(`/users/${userId}/projects?page=${page}&size=10`);
  return response.data;
};
