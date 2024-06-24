"use client";
import { Card, Carousel, Flex, Space } from "antd";
import Meta from "antd/es/card/Meta";
import Title from "antd/es/typography/Title";
import Image from "next/image";
import { DollarOutlined } from "@ant-design/icons";
import React, { useEffect } from "react";
import axios from "axios";

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

interface FoodAndBeverageType {
  id: string;
  title: string;
  price: number;
  image: string;
}

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

interface MenuCarouselProps {
  coffeeShopId: string;
}

function MenuCarousel({ coffeeShopId }: MenuCarouselProps) {
  useEffect(() => {
    const getFoodAndBeverage = async (coffeeShopId: string) => {
      const res = await axios.get(
        "/api/food-beverage?coffeeShopId=" + coffeeShopId
      );
      const rawFoodAndBeverageData = res.data;
      const foodAndBeverageInfo = rawFoodAndBeverageData.map(
        (foodBeverage: any) => ({
          id: foodBeverage._id,
          title: foodBeverage.title,
          price: foodBeverage.price,
          image: foodBeverage.image,
        })
      );
      console.log("foodAndBeverageInfo", foodAndBeverageInfo);
    };
    getFoodAndBeverage(coffeeShopId);
  }, [coffeeShopId]);

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
