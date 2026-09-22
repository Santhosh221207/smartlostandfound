import { useQuery } from "@tanstack/react-query";
import { fetchReports } from "@/lib/reports";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: fetchReports,
    staleTime: 15_000,
  });
}
