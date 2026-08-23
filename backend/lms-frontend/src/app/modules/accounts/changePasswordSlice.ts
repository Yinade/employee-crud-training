import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ChangePasswordRequest } from "../../models/changePassword.model";
import { changeMyPassword } from "../../api/changePasswordApi";

interface ChangePasswordState {
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ChangePasswordState = {
  loading: false,
  error: null,
  successMessage: null,
};

export const changeMyPasswordThunk = createAsyncThunk(
  "account/changeMyPassword",
  async (data: ChangePasswordRequest, { rejectWithValue }) => {
    try {
      const res = await changeMyPassword(data);
      return res.data; // { message }
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.response?.data?.detail ||
          error?.response?.data ||
          "Failed to update password"
      );
    }
  }
);

const changePasswordSlice = createSlice({
  name: "changePassword",
  initialState,
  reducers: {
    clearChangePasswordState: (state) => {
      state.loading = false;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(changeMyPasswordThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(changeMyPasswordThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Password updated";
      })
      .addCase(changeMyPasswordThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearChangePasswordState } = changePasswordSlice.actions;
export default changePasswordSlice.reducer;
