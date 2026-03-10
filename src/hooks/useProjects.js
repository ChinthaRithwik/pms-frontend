import { useQuery } from "@tanstack/react-query";
import { getProjects, getAllSystemProjects } from "../api/projectApi";

export const useProjects = (page = 0) => {
  return useQuery({
    queryKey: ["projects", page],
    queryFn: () => getProjects(page),
  });
};

export const useAllSystemProjects = (page = 0) => {
  return useQuery({
    queryKey: ["allSystemProjects", page],
    queryFn: () => getAllSystemProjects(page),
  });
};
