import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import type { ApiResponse, PagedResponse } from "../../features/transaction/apiTypes";

export interface Fund {
  id: number;
  name: string;
  type?: string;
  status?: string;
  initialBalance?: number;
  currentBalance?: number;
}

interface FundState {
  items: Fund[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: FundState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchFunds = createAsyncThunk(
  "fund/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get<ApiResponse<PagedResponse<Fund>>>("/funds", {
        params: { size: 100 },
      });
      return res.data.data.content;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Không thể tải danh sách quỹ");
    }
  }
);

const fundSlice = createSlice({
  name: "fund",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFunds.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFunds.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchFunds.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default fundSlice.reducer;
