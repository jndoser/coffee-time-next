import { configureStore } from "@reduxjs/toolkit";
import searchKeywordsReducer from "./slicers/searchKeywordsSlicer";
import userInfoReducer from "./slicers/userInfoSlicer";
import adminStateReducer from "./slicers/adminStateSlicer";

export const store = configureStore({
  reducer: {
    searchKeywords: searchKeywordsReducer,
    userInfo: userInfoReducer,
    adminState: adminStateReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
