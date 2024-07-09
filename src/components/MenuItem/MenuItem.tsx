"use client";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Card, Space } from "antd";
import Meta from "antd/es/card/Meta";
import Image from "next/image";
import { DollarOutlined } from "@ant-design/icons";
import React from "react";

interface MenuItemProps {
  title: string;
  price: number;
  image: string;
}
const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

function MenuItem({ title, price, image }: MenuItemProps) {
  return (
    <Card
      hoverable
      style={{ width: 240, margin: "10px" }}
      cover={<Image alt={title} src={image} width={200} height={200} />}
      actions={[
        <EditOutlined key="edit-task" onClick={() => {}} />,
        <DeleteOutlined key="delete-task" onClick={() => {}} />,
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
