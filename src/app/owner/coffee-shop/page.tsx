"use client";
import CoffeeList from "@/components/CoffeeList/CoffeeList";
import OwnerLayout from "@/layouts/owner-layout";
import { RootState } from "@/store/store";
import React from "react";
import { useSelector } from "react-redux";

function CoffeeShopOfOwner() {
  const userId = useSelector((state: RootState) => state.userInfo.id);
  return (
    <OwnerLayout>
      <CoffeeList userId={userId} />
    </OwnerLayout>
  );
}

export default CoffeeShopOfOwner;
