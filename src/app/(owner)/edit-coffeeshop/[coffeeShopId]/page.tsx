"use client";
import { Button, Flex, Form, Input, Space, Upload } from "antd";
import Title from "antd/es/typography/Title";
import { UploadOutlined } from "@ant-design/icons";
import React from "react";

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

interface Props {
  params: {
    coffeeShopId: string;
  };
}

function EditCoffeeShopPage({ params: { coffeeShopId } }: Props) {
  console.log('coffee shop id to edit: ', coffeeShopId);
  return (
    <Flex vertical justify="center" align="center" style={{ width: "100%" }}>
      <Title level={3} style={{ marginTop: "20px", marginBottom: "10px" }}>
        Coffee Shop Editer
      </Title>
      <Form
        name="validate_other"
        {...formItemLayout}
        onFinish={() => {}}
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
          <Upload
            name="logo"
            listType="picture"
            action="/api/images/upload"
            onRemove={() => {}}
            onChange={() => {}}
            multiple
          >
            <Button icon={<UploadOutlined />}>Click to upload</Button>
          </Upload>
        </Form.Item>

        <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
          <Space>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button htmlType="reset">Reset</Button>
          </Space>
        </Form.Item>
      </Form>
    </Flex>
  );
}

export default EditCoffeeShopPage;
