# tạo bài viết có ảnh video

viết schema

```ts
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

// Looking for ways to speed up your queries, or scale easily with your serverless or edge functions?
// Try Prisma Accelerate: https://pris.ly/cli/accelerate-init

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch"]
}

datasource db {
  provider = "postgresql"
  url = env("POSTGRES_PRISMA_URL") // uses connection pooling
  directUrl = env("POSTGRES_URL_NON_POOLING") // uses a direct connection
}
model User {
  id       String   @id
  username String @unique
  displayName String
  email    String?   @unique
  passwordHash String?
  googleId String? @unique
  avatarUrl String?
  bio String?
  sessions Session[]
  following             Follow[]       @relation("Following")
  followers             Follow[]       @relation("Followers")
  posts Post[]
  createAt DateTime @default(now())

  @@map("users")
}
model Session {
 id       String   @id
 userId   String
 expiresAt DateTime

 user User @relation(fields: [userId],references: [id],onDelete: Cascade)

 @@map("sessions")
}

model Follow {
  followerId  String
  follower    User   @relation("Following", fields: [followerId], references: [id], onDelete: Cascade)
  followingId String
  following   User   @relation("Followers", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@map("follows")
}

model Post {
  id                  String         @id @default(cuid())
  content             String
  userId              String
  user                User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  attachment Media[]
  createdAt DateTime @default(now())

  @@map("posts")
}

model Media {
  id String @id @default(cuid())
  postId String?
  post Post? @relation(fields: [postId], references: [id], onDelete: SetNull)
  type MediaType
  url String
  createdAt DateTime @default(now())

  @@map("post_media")
}
enum MediaType {
  IMAGE
  VIDEO
}
```

sang bên file core.ts vì cũng upload lên uploadthing

```ts
import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
const f = createUploadthing();

export const fileRouter = {
  //upload avatar
  avatar: f({
    image: {
      maxFileSize: "512KB",
    },
  })
    .middleware(async () => {
      const user = await validateRequest();
      if (!user) {
        throw new UploadThingError("UnAuthorized");
      }
      return { user };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // xóa avt cũ trên uploadthing
      const oldAvtUrl = metadata.user.user?.avatarUrl;
      if (oldAvtUrl) {
        const key = oldAvtUrl.split(
          `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
        )[1];
        await new UTApi().deleteFiles(key);
      }
      const newAvatarUrl = file.url.replace(
        "/f/",
        `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
      );
      await prisma.user.update({
        where: {
          id: metadata.user.user?.id,
        },
        data: {
          avatarUrl: newAvatarUrl,
        },
      });

      return { avatarUrl: newAvatarUrl };
    }),
  //upload image video cho bài viết
  attachment: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 },
    video: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { user } = await validateRequest();

      if (!user) throw new UploadThingError("Unauthorized");

      return {};
    })
    .onUploadComplete(async ({ file }) => {
      const media = await prisma.media.create({
        data: {
          url: file.url.replace(
            "/f/",
            `/a/${process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID}/`,
          ),
          type: file.type.startsWith("image") ? "IMAGE" : "VIDEO",
        },
      });

      return { mediaId: media.id };
    }),
} satisfies FileRouter;
export type AppFileRouter = typeof fileRouter;
```

update actions cuả posts

```ts
"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: {
  content: string;
  mediaIds: string[];
}) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const { content, mediaIds } = createPostSchema.parse(input);
  const newPost = await prisma.post.create({
    data: {
      content,
      userId: user.id,
      attachment: {
        connect: mediaIds.map((id) => ({ id })),
      },
    },
    include: getPostDataInclude(user.id),
  });
  return newPost;
}
```

viết hook => sử dụng bên PostEditor => custom thêm cái preview => sang type định lại type post lấy ra
sang cái post viết thêm cái xem ảnh ở mỗi bài post
