import React from "react";
import {
  LikeOutlined,
  MessageOutlined,
  StarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Avatar, List, Skeleton, Space } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SkeletonButton from "antd/es/skeleton/Button";
import SkeletonImage from "antd/es/skeleton/Image";
import axios from "axios";

const IconText = ({
  icon,
  text,
  loading,
  clickHandler,
}: {
  icon: React.FC;
  text: string;
  loading?: boolean;
  clickHandler?: () => void;
}) =>
  loading ? (
    <SkeletonButton active shape="round" />
  ) : (
    <Space onClick={clickHandler}>
      {React.createElement(icon)}
      {text}
    </Space>
  );

interface CoffeeItemProps {
  id: string;
  title: string;
  address: string;
  ownerAvatar: string;
  bio: string;
  previewImage: string;
  loading: boolean;
  isOwner?: boolean;
}

function CoffeeItem(item: CoffeeItemProps) {
  const router = useRouter();
  const likeThisCoffeeShop = async () => {
    await axios.post("/api/coffee-shop/" + item.id + "/likes");
  }
  return (
    <List.Item
      onClick={() => {
        const url = item.isOwner
          ? "/edit-coffeeshop/" + item.id
          : "/coffee-shop/" + item.id;
        router.push(url);
      }}
      key={item.title}
      actions={[
        <IconText
          icon={StarOutlined}
          text="156"
          key="list-vertical-star-o"
          loading={item.loading}
        />,
        <IconText
          icon={LikeOutlined}
          text="156"
          key="list-vertical-like-o"
          loading={item.loading}
          clickHandler={() => likeThisCoffeeShop()} 
        />,
        <IconText
          icon={MessageOutlined}
          text="2"
          key="list-vertical-message"
          loading={item.loading}
        />,
      ]}
      extra={
        item.loading ? (
          <SkeletonImage active />
        ) : (
          <div
            style={{ position: "relative", width: "272px", height: "130px" }}
          >
            <Image
              fill
              alt="preview-coffee-shop-image"
              src={item.previewImage}
              style={{ borderRadius: "16px", objectFit: "cover" }}
            />
          </div>
        )
      }
      style={{
        borderBlockEnd: "none",
        border: "1px solid rgba(5, 5, 5, 0.06)",
        borderRadius: "16px",
        margin: "10px",
        cursor: "pointer",
      }}
    >
      <Skeleton loading={item.loading} avatar active>
        <List.Item.Meta
          avatar={<Avatar src={item.ownerAvatar} />}
          title={item.title}
          description={
            <IconText
              icon={EnvironmentOutlined}
              text={item.address}
              key="list-vertical-like-o"
            />
          }
        />
        {item.bio}
      </Skeleton>
    </List.Item>
  );
}

export default CoffeeItem;
