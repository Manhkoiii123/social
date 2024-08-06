import { createRouteHandler } from "uploadthing/server";
import { fileRouter } from "@/app/api/uploadthing/core";

const handler = createRouteHandler({
  router: fileRouter,
});

export const { GET, POST } = handler;
