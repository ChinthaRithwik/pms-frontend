import { useQuery } from "@tanstack/react-query";
import { getTasksByProject, getOverdueTasks, searchTasks } from "../api/taskApi";

export const useTasksByProject = (projectId, status = null, page = 0) => {
  return useQuery({
    queryKey: ["tasks", "project", projectId, status, page],

    queryFn: () => getTasksByProject(projectId, status, page),

    enabled: !!projectId,
  });
};

export const useOverdueTasks = (page = 0) => {
  return useQuery({
    queryKey: ["tasks", "overdue", page],
    queryFn: () => getOverdueTasks(page),
  });
};

export const useSearchTasks = (filters = {}, page = 0) => {
  return useQuery({
    queryKey: ["tasks", "search", filters, page],
    queryFn: () => searchTasks(filters, page),
  });
};
