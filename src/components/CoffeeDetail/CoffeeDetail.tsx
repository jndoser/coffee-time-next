"use client";
import { Card, Flex, Typography } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import React, { useEffect, useState } from "react";
import CoffeePicturesSection, { ImageType } from "../CoffeePicturesSection/CoffeePicturesSection";
import MenuCarousel from "../MenuCarousel/MenuCarousel";
import CommentSection from "../CommentSection/CommentSection";
import axios from "axios";

interface CoffeeDetailProps {
  coffeeShopId: string;
}

interface CoffeeShopType {
  id: string;
  title: string;
  bio: string;
  description: string;
  images: ImageType[];
}

function CoffeeDetail({ coffeeShopId }: CoffeeDetailProps) {
  const [coffeeShopInfo, setCoffeeShopInfo] = useState<CoffeeShopType>();

  useEffect(() => {
    const getCoffeeShopById = async (coffeeShopId: string) => {
      const res = await axios.get("/api/coffee-shop/" + coffeeShopId);
      const rawCoffeeShopData = res.data;
      const coffeeShopData = {
        id: rawCoffeeShopData._id,
        title: rawCoffeeShopData.title,
        bio: rawCoffeeShopData.bio,
        description: rawCoffeeShopData.description,
        images: rawCoffeeShopData.images,
      };
      setCoffeeShopInfo(coffeeShopData);
    };
    getCoffeeShopById(coffeeShopId);
  }, []);

  return (
    <Flex vertical gap={4}>
      <Title level={3}>{coffeeShopInfo?.title}</Title>
      <CoffeePicturesSection images={coffeeShopInfo?.images ?? []} />
      <Card hoverable style={{ marginTop: "20px" }}>
        <Typography>
          <Title level={3}>{coffeeShopInfo?.title}</Title>
          <Paragraph>{coffeeShopInfo?.bio}</Paragraph>
          <Title level={3}>Description</Title>
          <Paragraph>{coffeeShopInfo?.description}</Paragraph>
        </Typography>
      </Card>
      <MenuCarousel coffeeShopId={coffeeShopId} />
      <CommentSection coffeeShopId={coffeeShopId} />
    </Flex>
  );
}

export default CoffeeDetail;
