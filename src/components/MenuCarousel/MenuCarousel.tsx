"use client";
import { Card, Carousel, Flex, Space } from "antd";
import Meta from "antd/es/card/Meta";
import Title from "antd/es/typography/Title";
import Image from "next/image";
import { DollarOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import axios from "axios";

const IconText = ({ icon, text }: { icon: React.FC; text: string }) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
);

export interface FoodAndBeverageType {
  id: string;
  title: string;
  price: number;
  image: {
    name: string;
    publicId: string;
    url: string;
  };
}

interface ListBeverageProps {
  foodAndBeverages: FoodAndBeverageType[];
}

const ListBeverage = ({ foodAndBeverages }: ListBeverageProps) => {
  return (
    <Flex gap={4} style={{ flexGrow: "1.5" }}>
      {foodAndBeverages.map((foodAndBeverage: FoodAndBeverageType) => {
        return (
          <Card
            key={foodAndBeverage.id}
            hoverable
            style={{ width: 240, margin: "10px" }}
            cover={
              <Image
                alt={foodAndBeverage.title}
                src={foodAndBeverage.image.url}
                width={200}
                height={200}
              />
            }
          >
            <Meta
              title={foodAndBeverage.title}
              description={
                <IconText
                  icon={DollarOutlined}
                  text={`${foodAndBeverage.price} VND`}
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

const formatMenuData = (menuData: FoodAndBeverageType[]) => {
  const numberItems = 5;
  const formattedMenuData = [];
  for (let i = 0; i <= menuData.length; i += numberItems) {
    const subArray = menuData.slice(i, i + numberItems);
    formattedMenuData.push(subArray);
  }
  return formattedMenuData;
};

function MenuCarousel({ coffeeShopId }: MenuCarouselProps) {
  const [formattedMenu, setFormattedMenu] = useState<FoodAndBeverageType[][]>(
    []
  );
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
      const formattedData = formatMenuData(foodAndBeverageInfo);
      setFormattedMenu(formattedData);
    };
    getFoodAndBeverage(coffeeShopId);
  }, [coffeeShopId]);

  return (
    <div style={{ marginTop: "20px" }}>
      <Title level={3}>Food & Beverage</Title>
      <Carousel effect="fade" style={{ height: "420px" }} autoplay>
        {formattedMenu.map((data: FoodAndBeverageType[], index) => {
          return (
            <div key={index}>
              <ListBeverage foodAndBeverages={data} />
            </div>
          );
        })}
      </Carousel>
    </div>
  );
}

export default MenuCarousel;
