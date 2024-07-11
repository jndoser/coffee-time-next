import MenuList from "@/components/MenuList/MenuList";
import React from "react";

interface Props {
  params: {
    coffeeShopId: string;
  };
}

function MenuListPage({ params: { coffeeShopId } }: Props) {
  const foodsAndBeverage = [1, 2, 3, 4, 5].map((item) => ({
    title: `title ${item}`,
    price: item,
    image: "hello",
  }));
  return <MenuList menus={foodsAndBeverage} />;
}

export default MenuListPage;
