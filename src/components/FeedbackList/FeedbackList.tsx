"use client";
import React, { useEffect, useState } from "react";
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { App, Avatar, List, Skeleton, Space } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import SkeletonButton from "antd/es/skeleton/Button";

const IconText = ({
  icon,
  text,
  loading,
  onClick,
}: {
  icon: React.FC;
  text: string;
  loading: boolean;
  onClick: () => void;
}) => {
  return loading ? (
    <SkeletonButton active shape="round" />
  ) : (
    <Space className="cursor-pointer" onClick={onClick}>
      {React.createElement(icon)}
      {text}
    </Space>
  );
};

interface DataType {
  id: string;
  name: {
    title?: string;
    first?: string;
    last?: string;
  };
  email?: string;
  picture: {
    large?: string;
    medium?: string;
    thumbnail?: string;
  };
  description?: string;
}

interface FeedbackListProps {
  coffeeShopId: string;
}

const FeedbackList: React.FC<FeedbackListProps> = ({ coffeeShopId }) => {
  const [feedbacks, setFeedbacks] = useState<DataType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const searchKeywords = useSelector(
    (state: RootState) => state.searchKeywords.searchKeywords
  );
  const isDisplayApprovedList = useSelector(
    (state: RootState) => state.adminState.isDisplayApprovedList
  );

  const getFeedbacks = async (page: number, searchKeywords: string) => {
    setLoading(true);
    const rawFeedbacks = await axios.get(
      `/api/feedback?coffeeShopId=${coffeeShopId}&page=${page}&limit=10&searchKeywords=${searchKeywords}&isHide=${isDisplayApprovedList}`
    );

    const feedbacksInfo = rawFeedbacks.data;
    const feedbackData = feedbacksInfo.feedbacks.map((feedback: any) => ({
      id: feedback._id,
      name: {
        first: feedback.owner.firstName,
        last: feedback.owner.lastName,
      },
      picture: {
        large: feedback.owner.photo,
        medium: feedback.owner.photo,
        thumnail: feedback.owner.photo,
      },
      description: feedback.description,
      email: feedback.owner.email,
    }));
    setFeedbacks(feedbackData);
    setTotalCount(feedbackData.totalCount);
    setLoading(false);
  };

  useEffect(() => {
    getFeedbacks(1, searchKeywords);
  }, [searchKeywords, isDisplayApprovedList]);

  const hideFeedbackHandler = async (feedbackId: string) => {
    const res = await axios.patch(`/api/feedback/${feedbackId}`, {
      action: "HIDE",
    });

    if (res.status === 200) {
      message.success("Hide successfully");
      getFeedbacks(1, "");
    }
  };

  const showFeedbackHandler = async (feedbackId: string) => {
    const res = await axios.patch(`/api/feedback/${feedbackId}`, {
      action: "SHOW",
    });

    if (res.status === 200) {
      message.success("Show successfully");
      getFeedbacks(1, "");
    }
  };

  return (
    <List
      itemLayout="horizontal"
      pagination={{
        onChange: async (page) => {
          await getFeedbacks(page, "");
        },
        pageSize: 5,
        total: totalCount,
        style: { textAlign: "center" },
      }}
      dataSource={feedbacks}
      renderItem={(feedback) => (
        <List.Item
          key={feedback.id}
          actions={
            !isDisplayApprovedList
              ? [
                  <IconText
                    icon={EyeInvisibleOutlined}
                    text="Hide"
                    key="list-vertical-star-o"
                    loading={loading}
                    onClick={() => {
                      hideFeedbackHandler(feedback.id);
                    }}
                  />,
                ]
              : [
                  <IconText
                    icon={EyeOutlined}
                    text="Show"
                    key="list-vertical-like-o"
                    loading={loading}
                    onClick={() => {
                      showFeedbackHandler(feedback.id);
                    }}
                  />,
                ]
          }
        >
          <Skeleton loading={loading} avatar active>
            <List.Item.Meta
              avatar={<Avatar src={feedback.picture.large} />}
              title={
                <a>
                  {feedback.name.first} {feedback.name.last}
                </a>
              }
              description={feedback.description}
            />
          </Skeleton>
        </List.Item>
      )}
    />
  );
};

export default FeedbackList;
