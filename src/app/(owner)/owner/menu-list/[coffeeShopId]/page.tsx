import MenuList from "@/components/MenuList/MenuList";
import React from "react";

interface Props {
  params: {
    coffeeShopId: string;
  };
}

function MenuListPage({ params: { coffeeShopId } }: Props) {
  return <MenuList coffeeShopId={coffeeShopId} />;
}

export default MenuListPage;
