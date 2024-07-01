import React from "react";
import { Button, Flex, Image, Modal } from "antd";
import { HolderOutlined } from "@ant-design/icons";
import styles from "./CoffeePicturesModal.module.css";

interface CoffeePicturesModalProps {
  images: string[];
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const formatImageData = (images: string[]) => {
  const numberItems = 7;
  const formattedImageData = [];
  for (let i = 0; i <= images.length; i += numberItems) {
    const subArray = images.slice(i, i + numberItems);
    formattedImageData.push(subArray);
  }
  return formattedImageData;
};

interface CoffeePicturesItemProps {
  images: string[];
}

const CoffeePicturesItem = ({ images }: CoffeePicturesItemProps) => {
  return (
    <Flex gap={2} style={{ marginTop: "10px" }}>
      <Image
        src={images[0]}
        alt="test-1"
        width={"50%"}
        height={388}
        style={{ borderRadius: "16px" }}
        preview={{
          maskClassName: styles.maskStyle,
        }}
      />
      <Flex gap={2} style={{ width: "50%", position: "relative" }} wrap>
        {images.slice(1, 5).map((data, index) => (
          <Image
            key={index}
            src={data}
            alt="test"
            width={300}
            height={192}
            style={{ borderRadius: "16px" }}
            preview={{
              maskClassName: styles.maskStyle,
            }}
          />
        ))}
      </Flex>
    </Flex>
  );
};

const CoffeePicturesModal: React.FC<CoffeePicturesModalProps> = ({
  images,
  isOpen,
  openModal,
  closeModal,
}) => {
  const formattedImages = formatImageData(images);

  return (
    <Modal
      title="Modal 1000px width"
      centered
      open={isOpen}
      onOk={openModal}
      onCancel={closeModal}
      width={1300}
      height={800}
      style={{ top: 20 }}
    >
      {formattedImages.map((images, index) => (
        <CoffeePicturesItem key={index} images={images} />
      ))}
    </Modal>
  );
};

export default CoffeePicturesModal;
