import { submitPost } from "@/components/posts/editor/actions";
import { useToast } from "@/components/ui/use-toast";
import { PostsPage } from "@/lib/types";
import {
  InfiniteData,
  QueryFilters,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

export function useSubmitPostMutation() {
  const { toast } = useToast();
  const queryCleint = useQueryClient();
  const mutation = useMutation({
    mutationFn: submitPost,
    onSuccess: async (newPost) => {
      // là cái trả về của cái submitPost (lấy ra để thêm vào mảng data cho dễ)
      // nếu mà dùng thế này thì khi dùng với loadmore ko tốt cho ux
      // do đang để infinity => call lại hết cả 3 cái cùng 1 lúc do cùng queryKey
      //   queryCleint.invalidateQueries(["post-feed", "for-you"]);
      // cần bên cái lúc actions tạo post trả ra guyên cái bài đó luôn
      const queryFilter: QueryFilters = { queryKey: ["post-feed", "for-you"] };
      // hủy truy vấn cái có key là cái kia đi
      await queryCleint.cancelQueries(queryFilter);
      //gán lại
      queryCleint.setQueriesData<InfiniteData<PostsPage, string | null>>(
        queryFilter,
        (oldData) => {
          const firstPage = oldData?.pages[0];
          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  //chèn cái bài mới vào đầu tiên
                  // xong sau đó giải các cái pages sau ra và cắt cái page đầu đi là ok
                  posts: [newPost, ...firstPage.posts],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        },
      );
      queryCleint.invalidateQueries({
        queryKey: queryFilter.queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
      toast({
        description: "Post create successfully",
      });
    },
    onError: (error) => {
      console.log(error);
      toast({
        variant: "destructive",
        description: "Failed to post.Please try again",
      });
    },
  });
  return mutation;
}
