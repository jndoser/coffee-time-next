import { NearbyCoffeeShopType } from "@/store/slicers/searchMapSlicer";
import { InfoWindow, Marker } from "@vis.gl/react-google-maps";
import React, { useState } from "react";

interface CoffeeShopMarkerProps {
  coffeeShop: NearbyCoffeeShopType;
}

function CoffeeShopMarker({ coffeeShop }: CoffeeShopMarkerProps) {
  const [isShowInfoWindow, setIsShowInfoWindow] = useState(false);
  return (
    <>
      <Marker
        position={
          new google.maps.LatLng(
            coffeeShop.location.lat,
            coffeeShop.location.lng
          )
        }
        icon={{
          url: "https://cdn-icons-png.flaticon.com/512/1047/1047462.png",
          scaledSize: new google.maps.Size(30, 30),
        }}
        onClick={(e) => {
          setIsShowInfoWindow(true);
        }}
      />
      {isShowInfoWindow && (
        <InfoWindow
          position={
            new google.maps.LatLng(
              coffeeShop.location.lat,
              coffeeShop.location.lng
            )
          }
          onClose={() => setIsShowInfoWindow(false)}
        >
          {coffeeShop.name}
        </InfoWindow>
      )}
    </>
  );
}

export default CoffeeShopMarker;
