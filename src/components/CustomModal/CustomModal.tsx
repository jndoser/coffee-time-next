"use client";
import { Modal } from "antd";
import React, { useState } from "react";

interface CustomModalProps {
  isOpen: boolean;
  onCancel: () => void;
  children: React.ReactNode;
}

function CustomModal({ isOpen, onCancel, children }: CustomModalProps) {
  return (
    <Modal
      title="Add New Task"
      open={isOpen}
      onCancel={onCancel}
      footer={[]}
      centered
      width={900}
      style={{ padding: "30px" }}
      styles={{
        body: {
          padding: "30px",
        },
      }}
    >
      {children}
    </Modal>
  );
}

export default CustomModal;
