import { configureStore } from "@reduxjs/toolkit";
import searchKeywordsReducer from "./slicers/searchKeywordsSlicer";
import userInfoReducer from "./slicers/userInfoSlicer";
import adminStateReducer from "./slicers/adminStateSlicer";
import searchMapReducer from "./slicers/searchMapSlicer";

export const store = configureStore({
  reducer: {
    searchKeywords: searchKeywordsReducer,
    userInfo: userInfoReducer,
    adminState: adminStateReducer,
    searchMapState: searchMapReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
