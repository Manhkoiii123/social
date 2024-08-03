# Tạo bài post

tiếp tục viết schema

```ts
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
  createAt DateTime @default(now())
  posts Post[]
  @@map("users")
}
model Session {
 id       String   @id
 userId   String
 expiresAt DateTime
 user User @relation(fields: [userId],references: [id],onDelete: Cascade)
 @@map("sessions")
}
model Post {
  id                  String         @id @default(cuid())
  content             String
  userId              String
  user                User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@map("posts")
}
```

validate schema

```ts
export const createPostSchema = z.object({
  content: requiredString,
  //   mediaIds: z.array(z.string()).max(5, "Cannot have more than 5 attachments"),
});
```

viết action

```ts
"use server";

import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createPostSchema } from "@/lib/validation";

export async function submitPost(input: string) {
  const { user } = await validateRequest();
  if (!user) {
    throw new Error("Unauthorized");
  }
  const { content } = createPostSchema.parse({ content: input });
  await prisma.post.create({
    data: {
      content,
      userId: user.id,
    },
  });
}
```

Trình viết văn bản dùng thư viện tiptap

```ts
"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { submitPost } from "@/components/posts/editor/actions";
import UserAvatar from "@/components/UserAvatar";
import { useSession } from "@/app/(main)/SessionProvider";
import { Button } from "@/components/ui/button";
import "./style.css";
const PostEditor = () => {
  const { user } = useSession();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: `${user.username}, What's happening`,
      }),
    ],
  });
  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  async function onSubmit() {
    await submitPost(input);
    editor?.commands.clearContent();
  }
  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <EditorContent
          editor={editor}
          className="max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          disabled={!input.trim()}
          className="min-w-20"
        >
          Post
        </Button>
      </div>
    </div>
  );
};

export default PostEditor;

```

# Lấy danh sách bài viết dùng trực tiếp prisma luôn

```ts
import PostEditor from "@/components/posts/editor/PostEditor";
import prisma from "@/lib/prisma";

export default async function Home() {
  const posts = await prisma.post.findMany({
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  console.log(posts);
  return (
    <main className="h-[200vh] w-full min-w-0">
      <div className="w-full">
        <PostEditor />
      </div>
    </main>
  );
}

```

định type cho tối ưu (code github)
