trang trend có cái danh sách fl ở bên để ấn nhanh follow
vào đây thì sẽ có cái button follow

```ts
const usersToFollow = await prisma.user.findMany({
  where: {
    NOT: {
      id: user?.id,
    },
    followers: {
      none: {
        followerId: user.id,
      },
    },
  },
  select: getUserDataSelect(user.id),
  take: 5,
});
console.log("aaaaa", usersToFollow);
```

cái user.id là id của manh đang đăng nhập
lấy ra cái user sao cho user có id khác với user.id
và trong cái bảng follower của người đó ko có cái user.id(fl rồi ko hiển thị ra nữa)
=> xong cái hiển thị

hệ thống có 3 người manh,manh2,manh3
đang ở user `manh` và đang follow `manh2`
sẽ ra cái này

```ts
{
id: 'kr6ilbgq7af5pawh',
username: 'manh3',
displayName: 'manh3',
avatarUrl: null,
followers: [],
\_count: { followers: 0 }
}
```

# cái component FollowButton

```ts
"use client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
}
import React from "react";

const FollowButton = ({ userId, initialState }: FollowButtonProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(userId, initialState);
  const { mutate } = useMutation({
    mutationFn: async () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      const queryKey: QueryKey = ["follower-info", userId];

      await queryClient.cancelQueries({ queryKey });

      const previousData = queryClient.getQueryData<FollowerInfo>(queryKey);
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousData?.followers || 0) +
          (previousData?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousData?.isFollowedByUser,
      }));

      return { previousData };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(
        ["follower-info", userId],
        context?.previousData,
      );
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });
  return (
    <Button
      onClick={() => mutate()}
      variant={data.isFollowedByUser ? "secondary" : "default"}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
};

export default FollowButton;

```

sử dụng

```ts
<FollowButton
//cái user này là cái userId của cái người có thể follow chứ ko phải của người đang đăng nhập (đọc code là hiểu do biến trùng nhau nên hơi rồi)
    userId={user.id}
    initialState={{
        followers: user._count.followers,
        isFollowedByUser: user.followers.some(
            ({ followerId }) => followerId === user.id,
        ),
    }}
/>
```

isFoll này để check là dùng để check xem đã fl người này chưa
vì lúc ch f5 lại thì nó đang chưa fl => ấ fl thì nó sẽ tự hiển thị button unfollow
(khi f5 thì nó mất cái đấy rồi)

vào cái `FollowButton`
thì lúc đầu sẽ lấy ra danh sách mà người đang đăng nhập này follow = hàm

```ts
const { data } = useFollowerInfo(userId, initialState);
```

cái hook này viết như sau

```ts
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
```

handle router

```ts
export async function GET(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: logginUser } = await validateRequest();
    if (!logginUser)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        followers: {
          where: {
            followerId: logginUser.id,
          },
          select: {
            followerId: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    });
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    const data: FollowerInfo = {
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.length,
    };
    return Response.json(data);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

userId này là cái userId của người đang đươc yêu cầu fl đến
ví dụ người manh thì trên danh sách whotofollow có người manh2
thì cái userId này là của người manh2
thì cái route kia để

- lấy ra người dùng trong đó cái cái id = với cái userId
- lấy ra cái `followers` có `followerId= logginUser.id`
- với từng người trong `whotofollow` thì sẽ lấy ra cái ` isFollowedByUser: !!user.followers.length,` để check xem đã follow chưa
- trả về cái object có 2 cái key là `followers` và `isFollowedByUser`

trong component `FollowButton` thì khi ấn follow => chạy mutation
thì cái mutationFn sẽ có 2 trường hợp là ch và đã fl
thì sẽ call 1 trong 2 cái route như code => cái này thì ok

tư tưởng cái post(follow)

```ts
export async function POST(
  req: Request,
  { params: { userId } }: { params: { userId: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          //gene từ cái unique bên bảng fl
          followerId: loggedInUser.id,
          followingId: userId,
        },
      },
      create: {
        followerId: loggedInUser.id,
        followingId: userId,
      },
      update: {},
    });
    return new Response();
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
```

gửi lên cái id của cái yêu cầu fl => ok
tương tự cái delete(unfollow)
