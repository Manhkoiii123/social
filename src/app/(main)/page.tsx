import PostEditor from "@/components/posts/editor/PostEditor";

export default function Home() {
  return (
    <main className="h-[200vh] w-full min-w-0">
      <div className="w-full">
        <PostEditor />
      </div>
    </main>
  );
}
