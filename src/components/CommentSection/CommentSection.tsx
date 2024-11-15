"use client";
import React, { useState } from "react";
import { App, Avatar, Button, Input, List, Skeleton, Space } from "antd";
import Title from "antd/es/typography/Title";
import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";
import { DownOutlined } from "@ant-design/icons";
import { useSubmitCommentMutation } from "./mutation";

interface APIResponse {
  feedbacks: any[];
  nextCursor: string | null;
}

interface CommentSectionProps {
  coffeeShopId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ coffeeShopId }) => {
  const [comment, setComment] = useState("");
  const { message } = App.useApp();

  // Infinite query for fetching feedbacks
  const fetchFeedbacks = async ({
    pageParam = null,
  }: {
    pageParam?: string | null;
  }) => {
    const response = await axios.get<APIResponse>(
      `/api/feedback?coffeeShopId=${coffeeShopId}&isHide=false`,
      { params: { cursor: pageParam } }
    );
    return response.data;
  };

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["comments", coffeeShopId],
      queryFn: fetchFeedbacks,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialPageParam: null as string | null, // Set null as the initial value for cursor
    });

  // Mutation for submitting new feedback
  const submitCommentMutation = useSubmitCommentMutation();

  const sendFeedbackHandler = async () => {
    submitCommentMutation.mutate(
      {
        description: comment,
        numberOfUpvote: 0,
        numberOfDownvote: 0,
        coffeeShopId,
        isHide: false,
      },
      {
        onSuccess: () => {
          console.log("success");
          message.success("Feedback added successfully!");
          setComment(""); // Clear input after successful submission
        },
        onError: (error: any) => {
          console.log("error");
          console.error("Error submitting feedback:", error);
          message.error("Failed to add feedback.");
        },
      }
    );
  };

  return (
    <div className="flex flex-col">
      <Title level={3}>Feedbacks</Title>
      <Space.Compact
        style={{
          width: "60%",
          marginTop: "20px",
          marginBottom: "20px",
          height: "50px",
          gap: "10px",
          alignSelf: "center",
        }}
      >
        <Input
          placeholder="Leave your feedback ..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ borderRadius: "16px" }}
        />
        <Button
          type="primary"
          onClick={sendFeedbackHandler}
          disabled={submitCommentMutation.isPending || comment.length === 0}
          style={{ height: "100%", borderRadius: "16px" }}
        >
          Submit
        </Button>
      </Space.Compact>
      <List
        className="demo-loadmore-list"
        loading={isFetching && !isFetchingNextPage}
        itemLayout="horizontal"
        dataSource={data?.pages.flatMap((page) => page.feedbacks) || []}
        renderItem={(item) => (
          <List.Item
            actions={[
              <a key="list-loadmore-edit">Up vote</a>,
              <a key="list-loadmore-more">Down vote</a>,
            ]}
          >
            <Skeleton avatar title={false} loading={false} active>
              <List.Item.Meta
                avatar={<Avatar src={item.owner.photo} />}
                title={
                  <a href="https://ant.design">
                    {item.owner?.firstName} {item.owner?.lastName}
                  </a>
                }
                description={item.description}
              />
            </Skeleton>
          </List.Item>
        )}
      />
      {hasNextPage && (
        <div
          style={{
            textAlign: "center",
            marginTop: 12,
            height: 32,
            lineHeight: "32px",
          }}
        >
          <Button
            icon={<DownOutlined />}
            onClick={() => fetchNextPage()}
            loading={isFetchingNextPage}
            style={{ borderRadius: "16px" }}
          >
            {isFetchingNextPage ? "Loading..." : "See more"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
