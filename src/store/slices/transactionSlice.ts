/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import transactionService from "../../services/transactionService";
import type { FetchParams } from "../../services/transactionService";
import type {
  TransactionResponse,
  TransactionRequest,
  SpendingWarning,
} from "../../features/transaction/apiTypes";

// ─── State ────────────────────────────────────────────────────────────────────

interface TransactionState {
  items: TransactionResponse[];
  totalElements: number;
  totalPages: number;
  params: FetchParams;
  lastWarning: SpendingWarning | null;  // Spending warning after creating a transaction
  status: "idle" | "loading" | "succeeded" | "failed";
  submitStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: TransactionState = {
  items: [],
  totalElements: 0,
  totalPages: 1,
  params: { page: 1, size: 10, sortBy: "transaction_date", sortDir: "desc" },
  lastWarning: null,
  status: "idle",
  submitStatus: "idle",
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** GET /transactions — fetch transactions list with filters and paging */
export const fetchTransactions = createAsyncThunk(
  "transaction/fetchAll",
  async (params: FetchParams, { rejectWithValue }) => {
    try {
      return await transactionService.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Không thể tải giao dịch");
    }
  }
);

/** POST /transactions — create a new transaction */
export const createTransaction = createAsyncThunk(
  "transaction/create",
  async (
    payload: { data: TransactionRequest; files?: File[]; descriptions?: string[] },
    { rejectWithValue }
  ) => {
    try {
      return await transactionService.create(payload.data, payload.files, payload.descriptions);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Tạo giao dịch thất bại");
    }
  }
);

/** PUT /transactions/:id — update transaction */
export const updateTransaction = createAsyncThunk(
  "transaction/update",
  async (
    { id, data }: { id: number; data: TransactionRequest },
    { rejectWithValue }
  ) => {
    try {
      return await transactionService.update(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Cập nhật thất bại");
    }
  }
);

/** DELETE /transactions/:id — cancel/delete transaction */
export const cancelTransaction = createAsyncThunk(
  "transaction/cancel",
  async (id: number, { rejectWithValue }) => {
    try {
      await transactionService.cancel(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? "Hủy giao dịch thất bại");
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<FetchParams>>) {
      state.params = { ...state.params, ...action.payload };
      state.status = "idle"; // Trigger refetch
    },
    clearWarning(state) {
      state.lastWarning = null;
    },
    resetSubmitStatus(state) {
      state.submitStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTransactions
      .addCase(fetchTransactions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // createTransaction
      .addCase(createTransaction.pending, (state) => {
        state.submitStatus = "loading";
        state.error = null;
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.submitStatus = "succeeded";
        // Save the warning (if any) to display toast
        state.lastWarning = action.payload.data?.warning ?? null;
        // Set state to idle to trigger reload and sync with backend
        state.status = "idle";
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.submitStatus = "failed";
        state.error = action.payload as string;
      })

      // updateTransaction
      .addCase(updateTransaction.pending, (state) => {
        state.submitStatus = "loading";
      })
      .addCase(updateTransaction.fulfilled, (state) => {
        state.submitStatus = "succeeded";
        // Set state to idle to trigger refetch for sync
        state.status = "idle";
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.submitStatus = "failed";
        state.error = action.payload as string;
      })

      // cancelTransaction
      .addCase(cancelTransaction.fulfilled, (state) => {
        // Set state to idle to trigger refetch for sync
        state.status = "idle";
      });
  },
});

export const { setParams, clearWarning, resetSubmitStatus } = transactionSlice.actions;
export default transactionSlice.reducer;
