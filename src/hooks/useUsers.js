import { useQuery } from "@tanstack/react-query";
import { getAllUsers } from "../api/userApi";

export const useUsers = (page = 0, size = 10) => {
  return useQuery({
    queryKey: ["users", page, size],
    queryFn: () => getAllUsers(page, size),
  });
};
