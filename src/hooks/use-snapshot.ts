import { useQuery } from "@tanstack/react-query";
import { getTournamentPublic } from "@/lib/server/api-public";

export function useSnapshot(id: string, interval = 8000) {
  return useQuery({
    queryKey: ["t", id],
    queryFn: () => getTournamentPublic({ data: { id } }),
    refetchInterval: interval,
  });
}
