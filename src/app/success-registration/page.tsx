"use client";
import React from "react";
import { Button, Result } from "antd";
import { useRouter } from "next/navigation";

const SuccessRegistration: React.FC = () => {
  const router = useRouter();
  return (
    <Result
      status="success"
      title="Successfully Register Your Coffee Shop!"
      subTitle="We love to see your Coffee Shop on our platform, our team will review it soon. Stay turn!"
      extra={[
        <Button type="primary" key="home" onClick={() => router.push("/home")}>
          Go Home
        </Button>,
        <Button key="exporer" onClick={() => router.push("/")}>
          Explore More
        </Button>,
      ]}
    />
  );
};

export default SuccessRegistration;
