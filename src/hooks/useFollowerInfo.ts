import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export default function useFollowerInfo(
  userId: string,
  initState: FollowerInfo,
) {
  const query = useQuery({
    queryKey: ["follower-info", userId],
    queryFn: async () => {
      return kyInstance
        .get(`/api/users/${userId}/followers`)
        .json<FollowerInfo>();
    },
    initialData: initState,
    staleTime: Infinity,
    enabled: !!userId,
  });
  return query;
}
