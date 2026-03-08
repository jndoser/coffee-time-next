"use client";
import React, { useState, useRef } from "react";
import { AutoComplete, Input } from "antd";
import { useDispatch } from "react-redux";
import { setSelectedLocation, setSelectedShopName } from "@/store/slicers/searchMapSlicer";
import axios from "axios";

const PlaceAutoComplete: React.FC = () => {
  const [options, setOptions] = useState<{ value: string; label: React.ReactNode; shop: any }[]>([]);
  const dispatch = useDispatch();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (value: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!value.trim()) {
      setOptions([]);
      return;
    }

    // Debounce to prevent spamming your backend
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await axios.get(
          `/api/coffee-shop?limit=10&isVerified=true&searchKeywords=${encodeURIComponent(value)}`
        );

        const shops = response.data.coffeeShops || [];

        const newOptions = shops.map((shop: any) => ({
          value: shop.title,
          label: (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ color: "brown" }}>☕ {shop.title}</strong>
              <span style={{ fontSize: "11px", color: "gray", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {shop.address || "Unknown Address"}
              </span>
            </div>
          ),
          shop, // keep entire shop object to extract lat/lng later
        }));
        setOptions(newOptions);
      } catch (error) {
        console.error("Search error:", error);
      }
    }, 300);
  };

  const onSelect = (_value: string, option: any) => {
    const shop = option?.shop;
    console.log("Selected shop:", shop);

    if (shop?.latitude && shop?.longitude) {
      dispatch(setSelectedLocation({
        lat: parseFloat(shop.latitude.toString()),
        lng: parseFloat(shop.longitude.toString()),
      }));
      dispatch(setSelectedShopName(shop.title));
    } else {
      console.warn("Selected shop has no coordinates:", shop?.title, "lat:", shop?.latitude, "lng:", shop?.longitude);
    }
  };

  return (
    <div style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000 }}>
      <AutoComplete
        popupMatchSelectWidth={350}
        style={{ width: 350 }}
        options={options}
        onSelect={onSelect}
        onSearch={handleSearch}
        size="large"
      >
        <Input.Search
          size="large"
          placeholder="Search for a coffee shop..."
          allowClear
        />
      </AutoComplete>
    </div>
  );
};

export default PlaceAutoComplete;
