import { Card, Carousel, Flex, Typography } from "antd";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import Image from "next/image";
import React from "react";

const contentStyle: React.CSSProperties = {
  height: "160px",
  color: "#fff",
  lineHeight: "160px",
  textAlign: "center",
  background: "#364d79",
};

function CoffeeDetail() {
  return (
    <Flex vertical align="center" justify="center">
      <Carousel effect="fade" style={{ width: "872px", height: "300px" }}>
        <Image
          style={{ objectFit: "contain" }}
          width={872}
          height={300}
          alt="logo"
          src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
        />
        <Image
          style={{ objectFit: "contain" }}
          width={872}
          height={300}
          alt="logo"
          src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
        />

        <Image
          style={{ objectFit: "contain" }}
          width={872}
          height={300}
          alt="logo"
          src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
        />
        <Image
          style={{ objectFit: "contain" }}
          width={872}
          height={300}
          alt="logo"
          src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
        />
      </Carousel>
      <Card hoverable>
        <Typography>
          <Title>Coffee shop title</Title>
          <Paragraph>Bio of coffee shop</Paragraph>
          <Title>Description</Title>
          <Paragraph>
            In the process of internal desktop applications development, many
            different design specs and implementations would be involved, which
            might cause designers and developers difficulties and duplication
            and reduce the efficiency of development.
          </Paragraph>
        </Typography>
      </Card>
    </Flex>
  );
}

export default CoffeeDetail;
