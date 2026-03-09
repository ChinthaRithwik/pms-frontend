import { useQuery } from "@tanstack/react-query";
import { getProjects } from "../api/projectApi";

export const useProjects = (page = 0) => {
  return useQuery({
    queryKey: ["projects", page],

    queryFn: () => getProjects(page),
  });
};
