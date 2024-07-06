"use client";
import CoffeeList from "@/components/CoffeeList/CoffeeList";
import { RootState } from "@/store/store";
import React from "react";
import { useSelector } from "react-redux";

function CoffeeShopOfOwner() {
  const userId = useSelector((state: RootState) => state.userInfo.id);
  return <CoffeeList userId={userId} />;
}

export default CoffeeShopOfOwner;
