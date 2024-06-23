import React from "react";
import {
  LikeOutlined,
  MessageOutlined,
  StarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Avatar, List, Space } from "antd";
import Image from "next/image";
import { useRouter } from "next/navigation";

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

interface CoffeeItemProps {
  href: string;
  title: string;
  avatar: string;
  description: string;
  content: string;
}

function CoffeeItem(item: CoffeeItemProps) {
  const router = useRouter();
  return (
    <List.Item
      onClick={() => {router.push("/coffee-shop/" + 1)}}
      key={item.title}
      actions={[
        <IconText icon={StarOutlined} text="156" key="list-vertical-star-o" />,
        <IconText icon={LikeOutlined} text="156" key="list-vertical-like-o" />,
        <IconText
          icon={MessageOutlined}
          text="2"
          key="list-vertical-message"
        />,
      ]}
      extra={
        <Image
          width={272}
          height={100}
          alt="logo"
          src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
          style={{ borderRadius: "16px" }}
        />
      }
      style={{
        borderBlockEnd: "none",
        border: "1px solid rgba(5, 5, 5, 0.06)",
        borderRadius: "16px",
        margin: "10px",
        cursor: "pointer",
      }}
    >
      <List.Item.Meta
        avatar={<Avatar src={item.avatar} />}
        title={<a href={item.href}>{item.title}</a>}
        description={
          <IconText
            icon={EnvironmentOutlined}
            text={item.description}
            key="list-vertical-like-o"
          />
        }
      />
      {item.content}
    </List.Item>
  );
}

export default CoffeeItem;
