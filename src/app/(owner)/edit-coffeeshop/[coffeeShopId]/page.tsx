"use client";
import {
  App,
  Button,
  Flex,
  Form,
  Input,
  Space,
  Upload,
  UploadFile,
} from "antd";
import Title from "antd/es/typography/Title";
import { UploadOutlined, EditOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { CoffeeShopType } from "@/components/CoffeeDetail/CoffeeDetail";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

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

interface Props {
  params: {
    coffeeShopId: string;
  };
}

function EditCoffeeShopPage({ params: { coffeeShopId } }: Props) {
  const [coffeeShopInfo, setCoffeeShopInfo] = useState<CoffeeShopType>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const router = useRouter();
  const userId = useSelector((state: RootState) => state.userInfo.id);
  const { message } = App.useApp();

  useEffect(() => {
    const getCoffeeShopById = async (coffeeShopId: string) => {
      const res = await axios.get("/api/coffee-shop/" + coffeeShopId);
      const rawCoffeeShopData = res.data;
      const coffeeShopData = {
        id: rawCoffeeShopData._id,
        title: rawCoffeeShopData.title,
        address: rawCoffeeShopData.address,
        bio: rawCoffeeShopData.bio,
        description: rawCoffeeShopData.description,
        images: rawCoffeeShopData.images,
      };
      setCoffeeShopInfo(coffeeShopData);
      const initImages = rawCoffeeShopData.images.map(
        (image: any, index: number) => ({
          uid: `${index}`,
          name: image.name,
          status: "done",
          url: image.url,
          thumbUrl: image.url,
          response: {
            responseData: [
              {
                display_name: image.name,
                public_id: image.publicId,
                url: image.url,
              },
            ],
          },
        })
      );
      setFileList(initImages);
    };
    getCoffeeShopById(coffeeShopId);
  }, []);

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

    const res = await axios.patch(
      `/api/coffee-shop/${coffeeShopId}?userId=${userId}`,
      newCoffeeShop
    );
    if (res.status === 200) {
      message.success("Update Coffee Shop Successfully");
      router.push("/owner/coffee-shop");
    }
  };

  return (
    <Flex vertical justify="center" align="center" style={{ width: "100%" }}>
      <Title level={3} style={{ marginTop: "20px", marginBottom: "10px" }}>
        Coffee Shop Editer
      </Title>
      {coffeeShopInfo && (
        <Form
          name="validate_other"
          {...formItemLayout}
          onFinish={onFinish}
          style={{
            minWidth: "55%",
          }}
          initialValues={{
            title: coffeeShopInfo.title,
            address: coffeeShopInfo.address,
            bio: coffeeShopInfo.bio,
            description: coffeeShopInfo.description,
            upload: [...fileList],
          }}
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true }]}
          >
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
      )}
      <Button
        type="primary"
        shape="round"
        icon={<EditOutlined />}
        size="large"
        style={{ width: "40%" }}
        onClick={() => router.push(`/owner/menu-list/${coffeeShopId}`)}
      >
        Click to edit Foods & Beverages
      </Button>
    </Flex>
  );
}

export default EditCoffeeShopPage;
