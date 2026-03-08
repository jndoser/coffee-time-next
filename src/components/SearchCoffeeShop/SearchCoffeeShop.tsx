"use client";
import {
  APIProvider,
  InfoWindow,
  Map,
  MapMouseEvent,
  Marker,
} from "@vis.gl/react-google-maps";
import React, { useEffect } from "react";
import PlaceAutoComplete from "../PlaceAutoComplete/PlaceAutoComplete";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  setNearbyCoffeeShops,
  setSelectedLocation,
  setSelectedShopName,
} from "@/store/slicers/searchMapSlicer";
import axios from "axios";
import dynamic from "next/dynamic";

// Dynamically import the map because react-leaflet requires the 'window' object, which breaks Next.js server-side rendering.
const OSMMapClient = dynamic(() => import("./OSMMap"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="text-xl font-bold text-gray-500">Loading Map...</div>
    </div>
  ),
});

function SearchCoffeeShop() {
  const selectedLocation = useSelector(
    (state: RootState) => state.searchMapState.selectedLocation
  );
  const nearbyCoffeeShops = useSelector(
    (state: RootState) => state.searchMapState.nearbyCoffeeShops
  );
  const selectedShopName = useSelector(
    (state: RootState) => state.searchMapState.selectedShopName
  );
  const dispatch = useDispatch();

  const mapClickHandler = (lat: number, lng: number) => {
    dispatch(setSelectedLocation({ lat, lng }));
    dispatch(setSelectedShopName(undefined)); // Clear shop name on manual click
  };

  useEffect(() => {
    const getNearbyCoffee = async () => {
      if (!selectedLocation) return;
      try {
        const response = await axios.get(
          `/api/coffee-shop/search-nearby?location=${selectedLocation.lat},${selectedLocation.lng}&radius=1500`
        );
        dispatch(setNearbyCoffeeShops(response.data));
      } catch (error) {
        console.error("Failed to fetch nearby coffee shops", error);
        dispatch(setNearbyCoffeeShops([]));
      }
    };
    getNearbyCoffee();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLocation]);

  return (
    <div className="h-[calc(100vh-125px)] w-full relative">
      <PlaceAutoComplete />
      <OSMMapClient
        selectedLocation={selectedLocation}
        selectedShopName={selectedShopName}
        nearbyCoffeeShops={nearbyCoffeeShops}
        onMapClick={mapClickHandler}
      />
    </div>
  );
}

export default SearchCoffeeShop;
