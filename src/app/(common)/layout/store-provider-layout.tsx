"use client";
import { store } from "@/store/store";
import React from "react";
import { Provider } from "react-redux";

interface StoreProviderLayoutProps {
  children: React.ReactNode;
}

function StoreProviderLayout({ children }: StoreProviderLayoutProps) {
  return <Provider store={store}>{children}</Provider>;
}

export default StoreProviderLayout;
