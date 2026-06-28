/**
 * fundSlice.ts
 * Redux slice quản lý danh sách nguồn quỹ.
 * Hỗ trợ đầy đủ CRUD + phân trang + totalBalance.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import fundService, { type FundFetchParams } from '../../services/fundService';
import { mapFundDTOToFund } from '../../features/budget/apiTypes';
import type { FundRequest } from '../../features/budget/apiTypes';
import type { Fund } from '../../features/budget/types';

// ─── State ────────────────────────────────────────────────────────────────────

interface FundState {
  items: Fund[];
  totalElements: number;
  totalPages: number;
  params: FundFetchParams;
  totalBalance: number | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: FundState = {
  items: [],
  totalElements: 0,
  totalPages: 1,
  params: { page: 1, size: 10, sortBy: 'name', sortDir: 'asc' },
  totalBalance: null,
  status: 'idle',
  submitStatus: 'idle',
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** GET /funds — Lấy danh sách quỹ có filter và phân trang */
export const fetchFunds = createAsyncThunk(
  'fund/fetchAll',
  async (params: FundFetchParams = {}, { rejectWithValue }) => {
    try {
      return await fundService.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải danh sách quỹ');
    }
  }
);

/** POST /funds — Tạo quỹ mới */
export const createFund = createAsyncThunk(
  'fund/create',
  async (data: FundRequest, { rejectWithValue }) => {
    try {
      return await fundService.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Tạo quỹ thất bại');
    }
  }
);

/** PATCH /funds/:id — Cập nhật quỹ */
export const updateFund = createAsyncThunk(
  'fund/update',
  async ({ id, data }: { id: number; data: Partial<FundRequest> }, { rejectWithValue }) => {
    try {
      return await fundService.update(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Cập nhật quỹ thất bại');
    }
  }
);

/** DELETE /funds/:id — Xóa quỹ */
export const deleteFund = createAsyncThunk(
  'fund/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await fundService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Xóa quỹ thất bại');
    }
  }
);

/** GET /funds/total-balance — Tổng số dư tất cả quỹ */
export const fetchTotalBalance = createAsyncThunk(
  'fund/totalBalance',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fundService.getTotalBalance();
      return data?.totalBalance ?? 0;
    } catch (err: any) {
      return rejectWithValue('Không thể tải tổng số dư');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const fundSlice = createSlice({
  name: 'fund',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<FundFetchParams>>) {
      state.params = { ...state.params, ...action.payload };
      state.status = 'idle'; // Trigger refetch
    },
    resetSubmitStatus(state) {
      state.submitStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchFunds ──────────────────────────────────────────────────────────
      .addCase(fetchFunds.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchFunds.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.content.map(mapFundDTOToFund);
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchFunds.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // ── createFund ──────────────────────────────────────────────────────────
      .addCase(createFund.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(createFund.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        // Set idle để trigger refetch danh sách
        state.status = 'idle';
      })
      .addCase(createFund.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── updateFund ──────────────────────────────────────────────────────────
      .addCase(updateFund.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(updateFund.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        // Set idle để trigger refetch danh sách
        state.status = 'idle';
      })
      .addCase(updateFund.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── deleteFund ──────────────────────────────────────────────────────────
      .addCase(deleteFund.fulfilled, (state) => {
        // Set idle để trigger refetch danh sách
        state.status = 'idle';
      })
      .addCase(deleteFund.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ── fetchTotalBalance ───────────────────────────────────────────────────
      .addCase(fetchTotalBalance.fulfilled, (state, action) => {
        state.totalBalance = action.payload;
      });
  },
});

export const { setParams, resetSubmitStatus } = fundSlice.actions;
export default fundSlice.reducer;
