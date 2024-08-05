import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError, UTApi } from "uploadthing/server";
const f = createUploadthing();

export const fileRouter = {
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
} satisfies FileRouter;
export type AppFileRouter = typeof fileRouter;