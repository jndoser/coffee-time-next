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

const IconText = ({
  icon,
  text,
  loading,
}: {
  icon: React.FC;
  text: string;
  loading?: boolean;
}) =>
  loading ? (
    <SkeletonButton active shape="round" />
  ) : (
    <Space>
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
  return (
    <List.Item
      onClick={() => {
        const url = item.isOwner
          ? "/owner/menu-list"
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
          <Image
            width={272}
            height={100}
            alt="preview-coffee-shop-image"
            src={item.previewImage}
            style={{ borderRadius: "16px" }}
          />
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
