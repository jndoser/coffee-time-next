import React from "react";
import CoffeeDetail from "@/components/CoffeeDetail/CoffeeDetail";

interface Props {
  params: {
    coffeeShopId: string;
  };
}

function page({ params: { coffeeShopId } }: Props) {
  return <CoffeeDetail coffeeShopId={coffeeShopId} />;
}

export default page;
