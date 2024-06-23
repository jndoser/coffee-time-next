"use client";
import React, { useEffect, useState } from "react";
import { List } from "antd";
import CoffeeItem from "../CoffeeItem/CoffeeItem";
import axios from "axios";

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

  useEffect(() => {
    const getCoffeeShopList = async () => {
      const res = await axios.get("/api/coffee-shop");
      const rawCoffeeShopData = res.data;
      const coffeeShopListData = rawCoffeeShopData.map((coffeeShop: any) => ({
        id: coffeeShop._id,
        title: coffeeShop.title,
        address: coffeeShop.address,
        ownerAvatar: coffeeShop.owner.photo,
        bio: coffeeShop.bio,
        previewImage: coffeeShop.images[0],
      }));
      setCoffeeShopList(coffeeShopListData);
    };
    getCoffeeShopList();
  }, []);

  return (
    <List
      itemLayout="vertical"
      size="large"
      pagination={{
        onChange: (page) => {
          console.log(page);
        },
        pageSize: 5,
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
