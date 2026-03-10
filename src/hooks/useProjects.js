import { useQuery } from "@tanstack/react-query";
import { getProjects, getAllSystemProjects } from "../api/projectApi";

export const useProjects = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["projects", page, size],
    queryFn: () => getProjects(page, size),
  });
};

export const useAllSystemProjects = (page = 0) => {
  return useQuery({
    queryKey: ["allSystemProjects", page],
    queryFn: () => getAllSystemProjects(page),
  });
};
