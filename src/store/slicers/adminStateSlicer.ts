import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AdminState {
  isDisplayOwner: boolean;
}

const initialState: AdminState = {
  isDisplayOwner: false,
};

export const adminSlice = createSlice({
  name: "adminState",
  initialState,
  reducers: {
    showApprovedList: (state) => {
      state.isDisplayOwner = true;
    },
    showPendingApproveList: (state) => {
      state.isDisplayOwner = false;
    },
  },
});

export const { showApprovedList, showPendingApproveList } = adminSlice.actions;
export default adminSlice.reducer;
