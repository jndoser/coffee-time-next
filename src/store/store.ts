import { configureStore } from "@reduxjs/toolkit";
import searchKeywordsReducer from "./slicers/searchKeywordsSlicer";
import userInfoReducer from "./slicers/userInfoSlicer";

export const store = configureStore({
  reducer: {
    searchKeywords: searchKeywordsReducer,
    userInfo: userInfoReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
