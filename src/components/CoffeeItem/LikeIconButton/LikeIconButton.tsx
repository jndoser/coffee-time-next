import { App, Space } from "antd";
import SkeletonButton from "antd/es/skeleton/Button";
import React from "react";
import { LikeOutlined, LikeFilled } from "@ant-design/icons";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

interface LikeInfo {
  likes: number;
  isLikedByUser: boolean;
}

interface LikeIconButtonProps {
  coffeeShopId: string;
  initialState: LikeInfo;
}

function LikeIconButton({ coffeeShopId, initialState }: LikeIconButtonProps) {
  const queryClient = useQueryClient();
  const { message } = App.useApp();

  const queryKey: QueryKey = ["like-info", coffeeShopId];

  const { data, isFetching } = useQuery<LikeInfo>({
    queryKey,
    queryFn: async () => {
      const res = await axios.get(`/api/coffee-shop/${coffeeShopId}/likes`);
      return res.data;
    },
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate } = useMutation({
    mutationFn: async () =>
      data.isLikedByUser
        ? await axios.delete(`/api/coffee-shop/${coffeeShopId}/likes`)
        : await axios.post(`/api/coffee-shop/${coffeeShopId}/likes`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes || 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
      }));

      return { previousState };
    },
    onError(error, variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      message.error("Something went wrong. Please try again.");
    },
  });

  return isFetching ? (
    <SkeletonButton active shape="round" />
  ) : (
    <Space
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        mutate();
      }}
    >
      {React.createElement(data.isLikedByUser ? LikeFilled : LikeOutlined)}
      {data.likes}
    </Space>
  );
}

export default LikeIconButton;
