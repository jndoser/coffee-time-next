"use client";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { App, Card, Space } from "antd";
import Meta from "antd/es/card/Meta";
import Image from "next/image";
import { DollarOutlined } from "@ant-design/icons";
import React from "react";
import axios from "axios";

interface MenuItemProps {
  id: string;
  title: string;
  price: number;
  image: {
    name: string;
    publicId: string;
    url: string;
  };
  onRefresh: () => void;
}
const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

function MenuItem({ id, title, price, image, onRefresh }: MenuItemProps) {
  const { message } = App.useApp();

  const deleteFoodAndBeverage = async () => {
    const deleterRes = await axios.delete(
      `/api/images/upload/${image.publicId.replace(
        "nextjs-coffee-images/",
        ""
      )}`
    );
    const res = await axios.delete(`/api/food-beverage/${id}`);
    if (deleterRes.status === 200 && res.status === 200) {
      message.success("Create Menu Successfully");
      onRefresh();
    }
  };
  return (
    <Card
      hoverable
      style={{ width: 240, margin: "10px" }}
      cover={<Image alt={title} src={image.url} width={200} height={200} />}
      actions={[
        <EditOutlined key="edit-task" onClick={() => {}} />,
        <DeleteOutlined key="delete-task" onClick={deleteFoodAndBeverage} />,
      ]}
    >
      <Meta
        title={title}
        description={
          <IconText
            icon={DollarOutlined}
            text={`${price} VND`}
            key="list-vertical-like-o"
          />
        }
      />
    </Card>
  );
}

export default MenuItem;
