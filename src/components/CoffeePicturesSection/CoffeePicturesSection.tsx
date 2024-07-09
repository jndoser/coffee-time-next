"use client";
import { Button, Flex, Image } from "antd";
import { HolderOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import CoffeePicturesModal from "../CoffeePicturesModal/CoffeePicturesModal";
import styles from "./CoffeePicturesSection.module.css";

export interface ImageType {
  name: string;
  publicId: string;
  url: string;
}

interface CoffeePicturesSectionProps {
  images: ImageType[];
}

function CoffeePicturesSection({ images }: CoffeePicturesSectionProps) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const openModalHandler = () => {
    setIsOpenModal(true);
  };
  const closeModalHandler = () => {
    setIsOpenModal(false);
  };
  return (
    <>
      <Flex gap={2}>
        <Image
          src={images[0]?.url}
          alt="test-1"
          width={"50%"}
          height={388}
          style={{ borderRadius: "16px" }}
          preview={{
            maskClassName: styles.maskStyle,
          }}
        />
        <Flex gap={2} style={{ width: "50%", position: "relative" }} wrap>
          {images.slice(1, 7).map((data, index) => (
            <Image
              key={index}
              src={data.url}
              alt="test"
              width={200}
              height={192}
              style={{ borderRadius: "16px" }}
              preview={{
                maskClassName: styles.maskStyle,
              }}
            />
          ))}
          <Button
            type="primary"
            shape="round"
            icon={<HolderOutlined />}
            size="large"
            style={{ position: "absolute", right: 30, bottom: 10 }}
            onClick={openModalHandler}
          >
            View more
          </Button>
        </Flex>
      </Flex>
      <CoffeePicturesModal
        images={images.map((image: ImageType) => image.url)}
        isOpen={isOpenModal}
        openModal={openModalHandler}
        closeModal={closeModalHandler}
      />
    </>
  );
}

export default CoffeePicturesSection;
