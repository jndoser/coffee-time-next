"use client";
import { Button, Form, Input, Space } from "antd";
import React from "react";

function CreateMenuForm() {
  const onFinish = async (values: any) => {
    const task = {
      title: values.title,
      description: values.description,
      date: values.date.toString(),
      completed: values.completed,
      important: values.important,
    };

    console.log(task);
  };
  return (
    <Form
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 14 }}
      layout="horizontal"
      style={{ maxWidth: 600 }}
      onFinish={onFinish}
      initialValues={{
        title: "",
        price: 0,
        image: "",
      }}
    >
      <Form.Item name="title" label="Title">
        <Input />
      </Form.Item>
      <Form.Item name="price" label="Price">
        <Input />
      </Form.Item>
      <Form.Item name="image" label="Upload Image">
        <Input />
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
