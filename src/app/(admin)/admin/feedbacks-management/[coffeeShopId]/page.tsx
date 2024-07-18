import FeedbackList from "@/components/FeedbackList/FeedbackList";
import React from "react";

interface Props {
  params: {
    coffeeShopId: string;
  };
}

function FeedbackManagementPage({ params: { coffeeShopId } }: Props) {
  return <FeedbackList coffeeShopId={coffeeShopId} />;
}

export default FeedbackManagementPage;
