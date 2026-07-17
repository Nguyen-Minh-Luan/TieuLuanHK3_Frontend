// src/store/slices/dashboardSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";

// --- Types ---
export interface TransactionDTO {
  id: number;
  parentId?: number | null;
  fundId?: number | null;
  categoryId?: number | null;
  partnerId?: number | null;
  userId?: number | null;
  type: "INCOME" | "EXPENSE";
  status: string;
  amount: number;
  note?: string;
  transactionCode: string;
  transactionDate: string;
  createdAt?: string;
  hasWarning?: boolean;
  reason?: string;
  accompaniedBy?: string;
  originalDocuments?: string;
  debtId?: number | null;
}

export interface CategoryDTO {
  id: number;
  name: string;
  type: string;
  description?: string;
  budgeting?: number;
  tax?: number;
  parentId?: number | null;
}

interface DashboardState {
  totalBalance: number | null;
  transactions: TransactionDTO[];
  categories: CategoryDTO[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

// --- Initial State ---
const initialState: DashboardState = {
  totalBalance: null,
  transactions: [],
  categories: [],
  status: "idle",
  error: null,
};

// --- Helper for Authorized Headers ---
const getAuthHeaders = (getState: () => unknown) => {
  const token = (getState() as RootState).auth.token;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// --- Async Thunk: Lấy tổng số dư quỹ ---
export const fetchTotalBalance = createAsyncThunk(
  "dashboard/fetchTotalBalance",
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const res = await fetch("http://localhost:8080/funds/total-balance", {
        headers,
      });
      const json = await res.json();
      if (!res.ok) {
        return rejectWithValue(json.message || "Không thể lấy tổng số dư");
      }
      // json.data = { totalBalance: 12345 }
      return json.data.totalBalance as number;
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi kết nối");
    }
  }
);

// --- Async Thunk: Lấy danh sách giao dịch (để tính toán động) ---
export const fetchTransactions = createAsyncThunk(
  "dashboard/fetchTransactions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const res = await fetch(
        "http://localhost:8080/transactions?page=1&size=500&sortBy=transaction_date&sortDir=desc",
        { headers }
      );
      const json = await res.json();
      if (!res.ok) {
        return rejectWithValue(json.message || "Không thể lấy danh sách giao dịch");
      }
      // json.data.content chứa mảng TransactionDTO
      return json.data.content as TransactionDTO[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi kết nối");
    }
  }
);

// --- Async Thunk: Lấy danh mục giao dịch để ánh xạ tên danh mục ---
export const fetchCategories = createAsyncThunk(
  "dashboard/fetchCategories",
  async (_, { getState, rejectWithValue }) => {
    try {
      const headers = getAuthHeaders(getState);
      const res = await fetch("http://localhost:8080/categories?page=1&size=100", {
        headers,
      });
      const json = await res.json();
      if (!res.ok) {
        return rejectWithValue(json.message || "Không thể lấy danh mục");
      }
      return json.data.content as CategoryDTO[];
    } catch (err: any) {
      return rejectWithValue(err.message || "Lỗi kết nối");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboard(state) {
      state.totalBalance = null;
      state.transactions = [];
      state.categories = [];
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Total Balance
      .addCase(fetchTotalBalance.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTotalBalance.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.totalBalance = action.payload;
      })
      .addCase(fetchTotalBalance.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch Transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Fetch Categories
      .addCase(fetchCategories.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;
