"use client";
import { Button, Flex, Image } from "antd";
import { HolderOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import CoffeePicturesModal from "../CoffeePicturesModal/CoffeePicturesModal";

function CoffeePicturesSection() {
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
          src="https://a0.muscache.com/im/pictures/miso/Hosting-52539316/original/942e2903-4f17-4753-8f91-09dcc0617e64.jpeg?im_w=960"
          alt="test-1"
          width={"50%"}
          height={388}
          style={{ borderRadius: "16px" }}
        />
        <Flex gap={2} style={{ width: "50%", position: "relative" }} wrap>
          {[1, 2, 3, 4, 5, 6].map((data, index) => (
            <Image
              key={index}
              src="https://a0.muscache.com/im/pictures/miso/Hosting-52539316/original/942e2903-4f17-4753-8f91-09dcc0617e64.jpeg?im_w=960"
              alt="test"
              width={200}
              height={192}
              style={{ borderRadius: "16px" }}
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
        isOpen={isOpenModal}
        openModal={openModalHandler}
        closeModal={closeModalHandler}
      />
    </>
  );
}

export default CoffeePicturesSection;
