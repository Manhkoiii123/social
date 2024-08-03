"use client";

import Post from "@/components/posts/Post";
import kyIstance from "@/lib/ky";
import { PostData } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

const ForyouFeed = () => {
  const query = useQuery<PostData[]>({
    queryKey: ["post-feed", "for-you"],
    queryFn: kyIstance.get("/api/posts/for-you").json<PostData[]>,
    // queryFn: async () => {
    //   const res = await fetch("/api/posts/for-you");
    //   if (!res.ok) {
    //     throw Error("Loi");
    //   }
    //   return res.json();
    // },
  });
  if (query.status === "pending") {
    return <Loader2 className="mx-auto animate-spin" />;
  }
  if (query.status === "error") {
    return (
      <p className="text-center text-muted-foreground">
        No one has posted anything yet.
      </p>
    );
  }
  return (
    <div className="space-y-5">
      {query.data.map((post) => {
        return <Post key={post.id} post={post} />;
      })}
    </div>
  );
};

export default ForyouFeed;
