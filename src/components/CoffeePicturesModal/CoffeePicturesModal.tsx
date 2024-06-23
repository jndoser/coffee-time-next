import React from "react";
import { Modal } from "antd";

interface CoffeePicturesModalProps {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const CoffeePicturesModal: React.FC<CoffeePicturesModalProps> = ({
  isOpen,
  openModal,
  closeModal,
}) => {
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
      <p>some contents...</p>
      <p>some contents...</p>
      <p>some contents...</p>
    </Modal>
  );
};

export default CoffeePicturesModal;
