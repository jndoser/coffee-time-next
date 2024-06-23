"use client";
import React from "react";
import { List } from "antd";
import CoffeeItem from "../CoffeeItem/CoffeeItem";

const data = Array.from({ length: 23 }).map((_, i) => ({
  href: "https://ant.design",
  title: `ant design part ${i}`,
  avatar: `https://api.dicebear.com/7.x/miniavs/svg?seed=${i}`,
  description:
    "Ant Design, a design language for background applications, is refined by Ant UED Team.",
  content:
    "We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.",
}));

function CoffeeList() {
  return (
    <List
      itemLayout="vertical"
      size="large"
      pagination={{
        onChange: (page) => {
          console.log(page);
        },
        pageSize: 5,
        style: { textAlign: "center" },
      }}
      dataSource={data}
      renderItem={(item) => (
        <CoffeeItem
          key={item.title}
          href={item.href}
          title={item.title}
          avatar={item.avatar}
          description={item.description}
          content={item.content}
        />
      )}
    />
  );
}

export default CoffeeList;
