"use client";
import React, { useEffect, useState } from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FileSearchOutlined,
} from "@ant-design/icons";
import { App, Avatar, List, Skeleton, Space } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import axios from "axios";
import SkeletonButton from "antd/es/skeleton/Button";
import { CoffeeShopType } from "../CoffeeList/CoffeeList";
import { useRouter } from "next/navigation";

const IconText = ({
  icon,
  text,
  loading,
  onClick,
}: {
  icon: React.FC;
  text: string;
  loading: boolean;
  onClick: (e: any) => void;
}) => {
  return loading ? (
    <SkeletonButton active shape="round" />
  ) : (
    <Space className="cursor-pointer" onClick={onClick}>
      {React.createElement(icon)}
      {text}
    </Space>
  );
};

const AdminCoffeeList: React.FC = () => {
  const [coffeeShopList, setCoffeeShopList] = useState<CoffeeShopType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const router = useRouter();
  const searchKeywords = useSelector(
    (state: RootState) => state.searchKeywords.searchKeywords
  );
  const isDisplayApprovedList = useSelector(
    (state: RootState) => state.adminState.isDisplayApprovedList
  );

  const getUsers = async (page: number, searchKeywords: string) => {
    setLoading(true);
    const res = await axios.get(
      `/api/coffee-shop?page=${page}&limit=5&searchKeywords=${searchKeywords}&isVerified=${isDisplayApprovedList}&isRejected=false`
    );
    const rawCoffeeShopData = res.data;
    const coffeeShopListData = rawCoffeeShopData.coffeeShops.map(
      (coffeeShop: any) => ({
        id: coffeeShop._id,
        title: coffeeShop.title,
        address: coffeeShop.address,
        ownerAvatar: coffeeShop.owner?.photo,
        bio: coffeeShop.bio,
        previewImage: coffeeShop.images[0].url,
      })
    );
    setCoffeeShopList(coffeeShopListData);
    setTotalCount(rawCoffeeShopData.totalCount);
    setLoading(false);
  };

  useEffect(() => {
    getUsers(1, searchKeywords);
  }, [searchKeywords, isDisplayApprovedList]);

  const approveCoffeeShop = async (coffeeShopId: string) => {
    const res = await axios.patch(`/api/coffee-shop/${coffeeShopId}`, {
      action: "APPROVE",
    });

    if (res.status === 200) {
      message.success("Approve successfully");
      getUsers(1, "");
    }
  };

  const revokeCoffeeShop = async (coffeeShopId: string) => {
    const res = await axios.patch(`/api/coffee-shop/${coffeeShopId}`, {
      action: "REVOKE",
    });

    if (res.status === 200) {
      message.success("Revoke successfully");
      getUsers(1, "");
    }
  };

  const rejectCoffeeShop = async (coffeeShopId: string) => {
    const res = await axios.patch(`/api/coffee-shop/${coffeeShopId}`, {
      action: "REJECT",
    });

    if (res.status === 200) {
      message.success("Reject successfully");
      getUsers(1, "");
    }
  };

  return (
    <List
      itemLayout="horizontal"
      pagination={{
        onChange: async (page) => {
          await getUsers(page, "");
        },
        pageSize: 5,
        total: totalCount,
        style: { textAlign: "center" },
      }}
      dataSource={coffeeShopList}
      renderItem={(coffeeShop) => (
        <List.Item
          className="cursor-pointer"
          key={coffeeShop.id}
          onClick={() => router.push(`/coffee-shop/${coffeeShop.id}`)}
          actions={
            !isDisplayApprovedList
              ? [
                  <IconText
                    icon={CheckCircleOutlined}
                    text="Approve"
                    key="list-vertical-star-o"
                    loading={loading}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      approveCoffeeShop(coffeeShop.id);
                    }}
                  />,
                  <IconText
                    icon={CloseCircleOutlined}
                    text="Reject"
                    key="list-vertical-like-o"
                    loading={loading}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      rejectCoffeeShop(coffeeShop.id);
                    }}
                  />,
                ]
              : [
                  <IconText
                    icon={CloseCircleOutlined}
                    text="Revoke"
                    key="list-vertical-like-o"
                    loading={loading}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      revokeCoffeeShop(coffeeShop.id);
                    }}
                  />,
                  <IconText
                    icon={FileSearchOutlined}
                    text="Manage Feedbacks"
                    key="list-vertical-like-o"
                    loading={loading}
                    onClick={(e: any) => {
                      e.stopPropagation();
                      router.push(
                        `/admin/feedbacks-management/${coffeeShop.id}`
                      );
                    }}
                  />,
                ]
          }
        >
          <Skeleton loading={loading} avatar active>
            <List.Item.Meta
              avatar={<Avatar src={coffeeShop.previewImage} />}
              title={<a>{coffeeShop.title}</a>}
              description={coffeeShop.address}
            />
          </Skeleton>
        </List.Item>
      )}
    />
  );
};

export default AdminCoffeeList;
