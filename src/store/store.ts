import { configureStore } from "@reduxjs/toolkit";
import searchKeywordsReducer from "./slicers/searchKeywordsSlicer";

export const store = configureStore({
  reducer: {
    searchKeywords: searchKeywordsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
