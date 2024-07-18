import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AdminState {
  isDisplayApprovedList: boolean;
}

const initialState: AdminState = {
  isDisplayApprovedList: false,
};

export const adminSlice = createSlice({
  name: "adminState",
  initialState,
  reducers: {
    showApprovedList: (state) => {
      state.isDisplayApprovedList = true;
    },
    showPendingApproveList: (state) => {
      state.isDisplayApprovedList = false;
    },
  },
});

export const { showApprovedList, showPendingApproveList } = adminSlice.actions;
export default adminSlice.reducer;
