import { Card, Flex, Typography } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import React from "react";
import CoffeePicturesSection from "../CoffeePicturesSection/CoffeePicturesSection";
import MenuCarousel from "../MenuCarousel/MenuCarousel";
import CommentSection from "../CommentSection/CommentSection";

interface CoffeeDetailProps {
  coffeeShopId: string;
}

function CoffeeDetail({ coffeeShopId }: CoffeeDetailProps) {
  console.log("CoffeeDetail ", coffeeShopId);
  return (
    <Flex vertical gap={4}>
      <Title level={3}>SHill luxury Villa Halong/6BRs/Private Pool</Title>
      <CoffeePicturesSection />
      <Card hoverable style={{ marginTop: "20px" }}>
        <Typography>
          <Title level={3}>Coffee shop title</Title>
          <Paragraph>Bio of coffee shop</Paragraph>
          <Title level={3}>Description</Title>
          <Paragraph>
            In the process of internal desktop applications development, many
            different design specs and implementations would be involved, which
            might cause designers and developers difficulties and duplication
            and reduce the efficiency of development.
          </Paragraph>
        </Typography>
      </Card>
      <MenuCarousel />
      <CommentSection />
    </Flex>
  );
}

export default CoffeeDetail;
