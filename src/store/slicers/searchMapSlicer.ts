import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface NearbyCoffeeShopType {
  location: {
    lat: number;
    lng: number;
  };
  name: string;
}

export interface SearchMapState {
  selectedLocation: { lat: number; lng: number } | undefined;
  selectedShopName: string | undefined;
  nearbyCoffeeShops: NearbyCoffeeShopType[];
}

const initialState: SearchMapState = {
  selectedLocation: undefined,
  selectedShopName: undefined,
  nearbyCoffeeShops: [],
};

export const searchMapSlice = createSlice({
  name: "searchMapState",
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.selectedLocation = action.payload;
    },
    setSelectedShopName: (state, action: PayloadAction<string | undefined>) => {
      state.selectedShopName = action.payload;
    },
    setNearbyCoffeeShops: (
      state,
      action: PayloadAction<NearbyCoffeeShopType[]>
    ) => {
      state.nearbyCoffeeShops = action.payload;
    },
  },
});

export const { setSelectedLocation, setSelectedShopName, setNearbyCoffeeShops } =
  searchMapSlice.actions;
export default searchMapSlice.reducer;
