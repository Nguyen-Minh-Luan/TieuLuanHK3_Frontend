import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiClient";
import type { ApiResponse, PagedResponse } from "../../features/transaction/apiTypes";

export interface Category {
  id: number;
  name: string;
  type: string; // "INCOME" | "EXPENSE"
  description?: string;
  budgeting?: number;
  tax?: number;
  parentId?: number;
}

interface CategoryState {
  items: Category[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  status: "idle",
  error: null,
};

export const fetchCategories = createAsyncThunk(
  "category/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.get<ApiResponse<PagedResponse<Category>>>("/categories", {
        params: { size: 100 },
      });
      return res.data.data.content;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Không thể tải danh mục");
    }
  }
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default categorySlice.reducer;
