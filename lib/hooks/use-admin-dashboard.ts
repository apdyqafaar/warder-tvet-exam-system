import { useQuery } from "@tanstack/react-query";
import { getAdminDashboard } from "../services/admin/dashboard.service";

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => getAdminDashboard(),
  });
};
