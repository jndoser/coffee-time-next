"use client";
import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Space, Upload } from "antd";
import Title from "antd/es/typography/Title";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useRouter } from "next/navigation";

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

const removeFileHandler = async (file: any) => {
  const deleteFilePublicId = file.response.responseData[0].public_id;
  const res = await axios.delete(
    `/api/images/upload/${deleteFilePublicId.replace(
      "nextjs-coffee-images/",
      ""
    )}`
  );
};

const changeFileHandler = ({ file, fileList }: any) => {
  let numberOfUploadedFile = 0;
  fileList.map((file: any) => {
    if (file.status === "done") {
      numberOfUploadedFile = numberOfUploadedFile + 1;
    }
  });
  if (numberOfUploadedFile === fileList.length) {
    const fileUploadResponse = fileList.map((file: any) => ({
      public_id: file.response.responseData[0].public_id,
      url: file.response.responseData[0].url,
    }));
  }
};

const CreateCoffeeShop: React.FC = () => {
  const userId = useSelector((state: RootState) => state.userInfo.id);
  const router = useRouter();

  const onFinish = async (values: any) => {
    // https://github.com/jmarioste/next-multiple-file-upload-tutorial/blob/main/app/api/upload/route.ts
    const images = values.upload.map((file: any) => ({
      name: file.response.responseData[0].display_name,
      publicId: file.response.responseData[0].public_id,
      url: file.response.responseData[0].url,
    }));
    const newCoffeeShop = {
      title: values.title,
      address: values.address,
      bio: values.bio,
      description: values.description,
      images: images,
    };

    const res = await axios.post(
      `/api/coffee-shop?userId=${userId}`,
      newCoffeeShop
    );
    if (res.status === 201) {
      router.push("/success-registration");
    }
  };
  return (
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
          <Upload
            name="logo"
            listType="picture"
            action="/api/images/upload"
            onRemove={removeFileHandler}
            onChange={changeFileHandler}
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
            <Button htmlType="reset">reset</Button>
          </Space>
        </Form.Item>
      </Form>
    </Flex>
  );
};

export default CreateCoffeeShop;
