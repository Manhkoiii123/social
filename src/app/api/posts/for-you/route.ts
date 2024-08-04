import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 5;
    const { user } = await validateRequest();
    if (!user) {
      return Response.json(
        {
          error: "Authorization",
        },
        {
          status: 401,
        },
      );
    }
    const posts = await prisma.post.findMany({
      include: getPostDataInclude(user.id),
      orderBy: {
        createdAt: "desc",
      },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      //Cụ thể, nếu bạn đã lấy 5 bản ghi và bản ghi thứ 6 có id là abc, thì cursor sẽ được gán giá trị abc. Khi bạn thực hiện truy vấn với cursor: { id: 'abc' }, Prisma sẽ bắt đầu lấy dữ liệu từ bản ghi có id là abc trở đi.
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null; //đây là bước gán id
    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };
    return Response.json(data);
  } catch (error) {
    console.log(error);
    return Response.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
