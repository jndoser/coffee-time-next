"use client";
import React, { useEffect, useState } from "react";
import { Avatar, Button, Input, List, Skeleton, Space } from "antd";
import Title from "antd/es/typography/Title";
import axios from "axios";

interface DataType {
  gender?: string;
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
  nat?: string;
  loading: boolean;
}

const count = 3;

const CommentSection: React.FC = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [numberOfLoadButtonClick, setNumberOfLoadButtonClick] = useState(1);
  const [data, setData] = useState<DataType[]>([]);
  const [list, setList] = useState<DataType[]>([]);

  useEffect(() => {
    const getFeedbacks = async () => {
      const rawFeedbacks = await axios.get(
        `/api/feedback?coffeeShopId=66781d3452252c813d848b76&page=${numberOfLoadButtonClick}&limit=${count}`
      );

      const feedbacksInfo = rawFeedbacks.data;
      const feedbackData = feedbacksInfo.map((feedback: any) => ({
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

      setInitLoading(false);
      setData(feedbackData);
      setList(feedbackData);
    };
    getFeedbacks();
  }, []);

  const onLoadMore = async () => {
    setLoading(true);
    setList(
      data.concat(
        [...new Array(count)].map(() => ({
          loading: true,
          name: {},
          picture: {},
        }))
      )
    );

    const rawFeedbacks = await axios.get(
      `/api/feedback?coffeeShopId=66781d3452252c813d848b76&page=${numberOfLoadButtonClick}&limit=${count}`
    );

    const feedbacksInfo = rawFeedbacks.data;
    const feedbackData = feedbacksInfo.map((feedback: any) => ({
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

    const newData = data.concat(feedbackData);
    setData(newData);
    setList(newData);
    setLoading(false);
    setNumberOfLoadButtonClick((prevState) => prevState + 1);
    // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
    // In real scene, you can using public method of react-virtualized:
    // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
    window.dispatchEvent(new Event("resize"));
  };

  const loadMore =
    !initLoading && !loading ? (
      <div
        style={{
          textAlign: "center",
          marginTop: 12,
          height: 32,
          lineHeight: "32px",
        }}
      >
        <Button onClick={onLoadMore}>loading more</Button>
      </div>
    ) : null;

  return (
    <div>
      <Title level={3}>Feedbacks</Title>
      <Space.Compact
        style={{ width: "60%", marginTop: "20px", marginBottom: "20px" }}
      >
        <Input defaultValue="Leave your feedback ..." />
        <Button type="primary">Submit</Button>
      </Space.Compact>
      <List
        className="demo-loadmore-list"
        loading={initLoading}
        itemLayout="horizontal"
        loadMore={loadMore}
        dataSource={list}
        renderItem={(item) => (
          <List.Item
            actions={[
              <a key="list-loadmore-edit">Up vote</a>,
              <a key="list-loadmore-more">Down vote</a>,
            ]}
          >
            <Skeleton avatar title={false} loading={item.loading} active>
              <List.Item.Meta
                avatar={<Avatar src={item.picture.large} />}
                title={<a href="https://ant.design">{item.name?.last}</a>}
                description={item.description}
              />
            </Skeleton>
          </List.Item>
        )}
      />
    </div>
  );
};

export default CommentSection;
