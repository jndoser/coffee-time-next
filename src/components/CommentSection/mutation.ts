import { FeedbacksPage } from "@/app/api/feedback/route";
import {
  InfiniteData,
  QueryKey,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

interface FeedbackInputData {
  description: string;
  numberOfUpvote: number;
  numberOfDownvote: number;
  coffeeShopId: string;
  isHide: boolean;
}

export function useSubmitCommentMutation() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (feedbackInputData: FeedbackInputData) => {
      const res = await axios.post("/api/feedback", feedbackInputData);
      return res.data;
    },
    onSuccess: async (newComment: any) => {
      const queryKey: QueryKey = ["comments", newComment.coffeeShop];

      await queryClient.cancelQueries({ queryKey });
      console.log("new comment: ", newComment);

      queryClient.setQueryData<InfiniteData<FeedbacksPage, string | null>>(
        queryKey,
        (oldData: any) => {
          const firstPage = oldData?.pages[0];

          if (firstPage) {
            return {
              pageParams: oldData.pageParams,
              pages: [
                {
                  feedbacks: [newComment, ...firstPage.feedbacks],
                  nextCursor: firstPage.nextCursor,
                },
                ...oldData.pages.slice(1),
              ],
            };
          }
        }
      );

      queryClient.invalidateQueries({
        queryKey,
        predicate(query) {
          return !query.state.data;
        },
      });
    },
    onError(error) {
      console.error(error);
    },
  });

  return mutation;
}
