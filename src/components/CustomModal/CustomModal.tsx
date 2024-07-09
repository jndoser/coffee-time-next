"use client";
import { Modal } from "antd";
import React, { useState } from "react";

interface CustomModalProps {
  children: React.ReactNode;
}

function CustomModal({ children }: CustomModalProps) {
  return (
    <Modal
      title="Add New Task"
      open={false}
      onCancel={() => {}}
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