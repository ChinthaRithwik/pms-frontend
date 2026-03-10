import { useQuery } from "@tanstack/react-query";
import { getProjects, getAllSystemProjects, getProjectStats } from "../api/projectApi";

export const useProjects = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["projects", page, size],
    queryFn: () => getProjects(page, size),
  });
};

export const useAllSystemProjects = (page = 0, options = {}) => {
  return useQuery({
    queryKey: ["allSystemProjects", page],
    queryFn: () => getAllSystemProjects(page),
    ...options,
  });
};

export const useProjectStats = () => {
  return useQuery({
    queryKey: ["projectStats"],
    queryFn: () => getProjectStats(),
  });
};
