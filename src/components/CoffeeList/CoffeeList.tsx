"use client";
import React, { useState } from "react";
import { List } from "antd";
import CoffeeItem from "../CoffeeItem/CoffeeItem";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { useQuery, QueryKey } from "@tanstack/react-query";
import axios from "axios";

export interface CoffeeShopType {
  id: string;
  title: string;
  address: string;
  ownerAvatar: string;
  bio: string;
  images: { url: string }[];
}

export interface CoffeeShopWithPreview extends Omit<CoffeeShopType, "images"> {
  previewImage: string;
}

interface CoffeeListProps {
  userId?: string;
}

interface CoffeeShopResponse {
  coffeeShops: CoffeeShopType[];
  totalCount: number;
}

const fetchCoffeeShops = async ({
  queryKey,
}: {
  queryKey: QueryKey;
}): Promise<CoffeeShopResponse> => {
  const [_, page, searchKeywords, userId] = queryKey as [
    string,
    number,
    string,
    string?
  ]; // Type assertion to cast queryKey

  const url = userId
    ? `/api/coffee-shop?userId=${userId}&page=${page}&limit=5&searchKeywords=${searchKeywords}&isVerified=true&isRejected=false`
    : `/api/coffee-shop?page=${page}&limit=5&searchKeywords=${searchKeywords}&isVerified=true&isRejected=false`;

  const res = await axios.get<CoffeeShopResponse>(url);
  return res.data;
};

function CoffeeList({ userId }: CoffeeListProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const searchKeywords = useSelector(
    (state: RootState) => state.searchKeywords.searchKeywords
  );

  const { data, isLoading } = useQuery<CoffeeShopResponse>({
    queryKey: ["coffeeShops", currentPage, searchKeywords, userId],
    queryFn: fetchCoffeeShops,
    staleTime: 3000,
  });

  const coffeeShopList: CoffeeShopWithPreview[] =
    data?.coffeeShops.map((coffeeShop) => ({
      id: coffeeShop.id,
      title: coffeeShop.title,
      address: coffeeShop.address,
      ownerAvatar: coffeeShop.ownerAvatar,
      bio: coffeeShop.bio,
      previewImage: coffeeShop.images[0].url,
    })) || [];

  const totalCount: number = data?.totalCount || 0;

  return (
    <List
      itemLayout="vertical"
      size="large"
      pagination={
        totalCount > 5
          ? {
              current: currentPage,
              onChange: (page) => setCurrentPage(page),
              pageSize: 5,
              total: totalCount,
              style: { textAlign: "center" },
            }
          : undefined
      }
      style={totalCount < 4 ? { height: "100vh" } : {}}
      dataSource={coffeeShopList}
      renderItem={(item: CoffeeShopWithPreview) => (
        <CoffeeItem
          key={item.id}
          id={item.id}
          title={item.title}
          ownerAvatar={item.ownerAvatar}
          address={item.address}
          bio={item.bio}
          previewImage={item.previewImage}
          loading={isLoading}
          isOwner={Boolean(userId)}
        />
      )}
    />
  );
}

export default CoffeeList;
