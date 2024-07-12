"use client";
import { App, Button, Form, Input, Space, Upload } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import React from "react";

const normFile = (e: any) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e?.fileList;
};

const removeFileHandler = async (file: any) => {
  const deleteFilePublicId = file.response.responseData[0].public_id;
  const res = await axios.delete(
    `/api/images/upload/${deleteFilePublicId.replace(
      "nextjs-coffee-images/",
      ""
    )}`
  );
};

interface CreateMenuFormProps {
  coffeeShopId: string;
  onClose: () => void;
  onRefresh: () => void;
}

function CreateMenuForm({
  coffeeShopId,
  onClose,
  onRefresh,
}: CreateMenuFormProps) {
  const { message } = App.useApp();

  const onFinish = async (values: any) => {
    const images = values.upload.map((file: any) => ({
      name: file.response.responseData[0].display_name,
      publicId: file.response.responseData[0].public_id,
      url: file.response.responseData[0].url,
    }));

    const menu = {
      title: values.title,
      price: values.price,
      image: images[0],
    };

    const res = await axios.post(
      `/api/food-beverage?coffeeShopId=${coffeeShopId}`,
      menu
    );
    if (res.status === 201) {
      message.success("Create Menu Successfully");
      onClose();
      onRefresh();
    }
  };
  return (
    <Form
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 14 }}
      layout="horizontal"
      style={{ maxWidth: 600 }}
      onFinish={onFinish}
      initialValues={{ title: "", price: 0, upload: [] }}
    >
      <Form.Item name="title" label="Title">
        <Input />
      </Form.Item>
      <Form.Item name="price" label="Price">
        <Input />
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
          onRemove={removeFileHandler}
          onChange={() => {}}
        >
          <Button icon={<UploadOutlined />}>Click to upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 14 }}>
        <Space>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
}

export default CreateMenuForm;
