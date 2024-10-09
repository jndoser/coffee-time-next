import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface NearbyCoffeeShopType {
  location: {
    lat: number;
    lng: number;
  };
  name: string;
}

export interface SearchMapState {
  selectedLocation: google.maps.LatLng | undefined;
  nearbyCoffeeShops: NearbyCoffeeShopType[];
}

const initialState: SearchMapState = {
  selectedLocation: undefined,
  nearbyCoffeeShops: [],
};

export const searchMapSlice = createSlice({
  name: "searchMapState",
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<google.maps.LatLng>) => {
      state.selectedLocation = action.payload;
    },
    setNearbyCoffeeShops: (
      state,
      action: PayloadAction<NearbyCoffeeShopType[]>
    ) => {
      state.nearbyCoffeeShops = action.payload;
    },
  },
});

export const { setSelectedLocation, setNearbyCoffeeShops } =
  searchMapSlice.actions;
export default searchMapSlice.reducer;
