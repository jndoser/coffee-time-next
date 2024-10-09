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
} from "@/store/slicers/searchMapSlicer";
import axios from "axios";
import CoffeeShopMarker from "../CoffeeShopMarker/CoffeeShopMarker";

function SearchCoffeeShop() {
  const selectedLocation = useSelector(
    (state: RootState) => state.searchMapState.selectedLocation
  );
  const nearbyCoffeeShops = useSelector(
    (state: RootState) => state.searchMapState.nearbyCoffeeShops
  );
  const dispatch = useDispatch();

  const mapClickHandler = (e: MapMouseEvent) => {
    dispatch(
      setSelectedLocation(
        new google.maps.LatLng(
          parseFloat(e.detail.latLng?.lat.toString() || "0"),
          parseFloat(e.detail.latLng?.lng.toString() || "0")
        )
      )
    );
  };

  useEffect(() => {
    const getNearbyCoffee = async () => {
      const response = await axios.get(
        `/api/coffee-shop/search-nearby?location=${`${selectedLocation
          ?.lat()
          .toString()},${selectedLocation?.lng().toString()}`}&radius=1500`
      );
      dispatch(setNearbyCoffeeShops(response.data));
    };
    getNearbyCoffee();
    console.log("find nearby coffee shop");
  }, [selectedLocation]);

  console.log("near: ", nearbyCoffeeShops);

  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_MAPS_API_KEY as string}>
      <div className="h-screen w-full relative">
        <Map
          center={selectedLocation}
          defaultCenter={{ lat: 10.7769942, lng: 106.6953021 }}
          defaultZoom={16}
          gestureHandling={"greedy"}
          fullscreenControl={false}
          onClick={mapClickHandler}
        >
          <PlaceAutoComplete />
          <Marker position={selectedLocation} />
          {nearbyCoffeeShops.map((coffeeShop) => (
            <CoffeeShopMarker key={coffeeShop.name} coffeeShop={coffeeShop} />
          ))}
        </Map>
      </div>
    </APIProvider>
  );
}

export default SearchCoffeeShop;
