import { Card, Carousel, Flex, Space } from "antd";
import Meta from "antd/es/card/Meta";
import Title from "antd/es/typography/Title";
import Image from "next/image";
import { DollarOutlined } from "@ant-design/icons";
import React from "react";

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

const ListBeverage = () => {
  return (
    <Flex gap={4} style={{ flexGrow: "1.5" }}>
      {[1, 2, 3, 4, 5].map((data, index) => {
        return (
          <Card
            key={index}
            hoverable
            style={{ width: 240, margin: "10px" }}
            cover={
              <Image
                alt="example"
                src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
                width={200}
                height={200}
              />
            }
          >
            <Meta
              title="Salt Cream Coffee"
              description={
                <IconText
                  icon={DollarOutlined}
                  text="45,000 VND"
                  key="list-vertical-like-o"
                />
              }
            />
          </Card>
        );
      })}
    </Flex>
  );
};

function MenuCarousel() {
  return (
    <div style={{ marginTop: "20px" }}>
      <Title level={3}>Food & Beverage</Title>
      <Carousel effect="fade" style={{ height: "420px" }} autoplay>
        {[1, 2, 3, 4].map((data, index) => {
          return (
            <div key={index}>
              <ListBeverage />
            </div>
          );
        })}
      </Carousel>
    </div>
  );
}

export default MenuCarousel;
