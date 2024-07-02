import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface SearchKeywordsState {
  searchKeywords: string;
}

const initialState: SearchKeywordsState = {
  searchKeywords: "",
};

export const searchKeywordsSlice = createSlice({
  name: "searchKeywords",
  initialState,
  reducers: {
    setSearchKeywords: (state, action: PayloadAction<string>) => {
      state.searchKeywords = action.payload;
    },
    resetSearchKeywords: (state) => {
      state.searchKeywords = "";
    },
  },
});

export const { setSearchKeywords } = searchKeywordsSlice.actions;
export default searchKeywordsSlice.reducer;
