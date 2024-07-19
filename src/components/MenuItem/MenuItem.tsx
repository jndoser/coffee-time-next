"use client";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { App, Card, Space } from "antd";
import Meta from "antd/es/card/Meta";
import Image from "next/image";
import { DollarOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import axios from "axios";
import CustomModal from "../CustomModal/CustomModal";
import EditMenuForm from "../EditMenuForm/EditMenuForm";

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
  const [isShowEditMenuModal, setIsShowEditMenuModal] = useState(false);

  const deleteFoodAndBeverage = async () => {
    const deleterRes = await axios.delete(
      `/api/images/upload/${image.publicId.replace(
        "nextjs-coffee-images/",
        ""
      )}`
    );
    const res = await axios.delete(`/api/food-beverage/${id}`);
    if (deleterRes.status === 200 && res.status === 200) {
      message.success("Delete Menu Successfully");
      onRefresh();
    }
  };

  return (
    <Card
      hoverable
      style={{ width: 240, margin: "10px" }}
      cover={
        <div style={{ position: "relative", width: "240px", height: "200px" }}>
          <Image
            alt={title}
            src={image.url}
            fill
            style={{ objectFit: "cover" }}
          />
        </div>
      }
      actions={[
        <EditOutlined
          key="edit-task"
          onClick={() => setIsShowEditMenuModal(true)}
        />,
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
      {
        <CustomModal
          isOpen={isShowEditMenuModal}
          onCancel={() => setIsShowEditMenuModal(false)}
        >
          <EditMenuForm
            id={id}
            title={title}
            price={price}
            image={image}
            onRefresh={onRefresh}
            onClose={() => setIsShowEditMenuModal(false)}
          />
        </CustomModal>
      }
    </Card>
  );
}

export default MenuItem;
