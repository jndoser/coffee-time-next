"use client";
import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Space, Upload } from "antd";
import Title from "antd/es/typography/Title";

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const normFile = (e: any) => {
  console.log("Upload event:", e);
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const onFinish = (values: any) => {
  console.log("Received values of form: ", values);
  console.log(
    "https://github.com/jmarioste/next-multiple-file-upload-tutorial/blob/main/app/api/upload/route.ts"
  );
};

const CreateCoffeeShop: React.FC = () => (
  <Flex vertical justify="center" align="center" style={{ width: "100%" }}>
    <Title level={3} style={{ marginTop: "20px", marginBottom: "10px" }}>
      Coffee Shop Registration
    </Title>
    <Form
      name="validate_other"
      {...formItemLayout}
      onFinish={onFinish}
      style={{
        minWidth: "55%",
      }}
    >
      <Form.Item name="title" label="Title" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="address" label="Address" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="bio" label="Bio" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true }]}
      >
        <Input.TextArea rows={4} />
      </Form.Item>
      <Form.Item
        name="upload"
        label="Upload"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload name="logo" listType="picture" action="/api/images/upload" >
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button htmlType="reset">reset</Button>
        </Space>
      </Form.Item>
    </Form>
  </Flex>
);

export default CreateCoffeeShop;
