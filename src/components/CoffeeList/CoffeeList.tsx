"use client";
import React, { useEffect, useState } from "react";
import { List } from "antd";
import CoffeeItem from "../CoffeeItem/CoffeeItem";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

interface CoffeeShopType {
  id: string;
  title: string;
  address: string;
  ownerAvatar: string;
  bio: string;
  previewImage: string;
}

function CoffeeList() {
  const [coffeeShopList, setCoffeeShopList] = useState<CoffeeShopType[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const searchKeywords = useSelector(
    (state: RootState) => state.searchKeywords.searchKeywords
  );

  const getCoffeeShopList = async (page: number, searchKeywords: string) => {
    const res = await axios.get(`/api/coffee-shop?page=${page}&limit=5&searchKeywords=${searchKeywords}`);
    const rawCoffeeShopData = res.data;
    const coffeeShopListData = rawCoffeeShopData.coffeeShops.map(
      (coffeeShop: any) => ({
        id: coffeeShop._id,
        title: coffeeShop.title,
        address: coffeeShop.address,
        ownerAvatar: coffeeShop.owner.photo,
        bio: coffeeShop.bio,
        previewImage: coffeeShop.images[0],
      })
    );
    setCoffeeShopList(coffeeShopListData);
    setTotalCount(rawCoffeeShopData.totalCount);
  };

  useEffect(() => {
    getCoffeeShopList(1, searchKeywords);
  }, [searchKeywords]);

  return (
    <List
      itemLayout="vertical"
      size="large"
      pagination={{
        onChange: async (page) => {
          await getCoffeeShopList(page, "");
        },
        pageSize: 5,
        total: totalCount,
        style: { textAlign: "center" },
      }}
      dataSource={coffeeShopList}
      renderItem={(item: CoffeeShopType) => (
        <CoffeeItem
          key={item.id}
          id={item.id}
          title={item.title}
          ownerAvatar={item.ownerAvatar}
          address={item.address}
          bio={item.bio}
          previewImage={item.previewImage}
        />
      )}
    />
  );
}

export default CoffeeList;
