import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface UserInfoState {
  id: string;
  clerkId: string;
  email: string;
  username: string;
  photo: string;
  firstName: string;
  lastName: string;
}

const initialState: UserInfoState = {
  id: "",
  clerkId: "",
  email: "",
  username: "",
  photo: "",
  firstName: "",
  lastName: "",
};

export const userInfoSlicer = createSlice({
  name: "userInfo",
  initialState,
  reducers: {
    setUserInfo: (state, action: PayloadAction<UserInfoState>) => {
      state.id = action.payload.id;
      state.clerkId = action.payload.clerkId;
      state.email = action.payload.email;
      state.username = action.payload.username;
      state.photo = action.payload.photo;
      state.firstName = action.payload.firstName;
      state.lastName = action.payload.lastName;
    },
    resetUserInfo: (state) => {
      state.id = "";
      state.clerkId = "";
      state.email = "";
      state.username = "";
      state.photo = "";
      state.firstName = "";
      state.lastName = "";
    },
  },
});

export const { setUserInfo, resetUserInfo } = userInfoSlicer.actions;
export default userInfoSlicer.reducer;
