import { fileRouter } from "@/app/api/uploadthing/core";
import { createRouteHandler } from "uploadthing/server";

export const { GET, POST } = createRouteHandler({
  router: fileRouter,
});
