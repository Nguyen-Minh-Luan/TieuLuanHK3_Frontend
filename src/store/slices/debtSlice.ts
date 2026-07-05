/**
 * debtSlice.ts
 * Redux slice quản lý khoản nợ.
 * Hỗ trợ đầy đủ CRUD + summary + chi tiết kèm payments.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import debtService, { type DebtFetchParams } from '../../services/debtService';
import type { DebtResponse, DebtRequest, DebtSummary } from '../../features/debt/apiTypes';
import type { TransactionResponse } from '../../features/transaction/apiTypes';

// ─── State ────────────────────────────────────────────────────────────────────

/** Cache entry cho payments của 1 khoản nợ */
export interface DebtPaymentsEntry {
  data: TransactionResponse[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error?: string;
}

interface DebtState {
  items: DebtResponse[];
  totalElements: number;
  totalPages: number;
  params: DebtFetchParams;
  selectedDebt: DebtResponse | null;   // chi tiết + payments (từ GET /debts/{id})
  summary: DebtSummary | null;    // từ GET /debts/summary
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  /** Cache payments theo debtId — không đụng selectedDebt, tránh xung đột khi nhiều dòng mở cùng lúc */
  paymentsByDebtId: Record<number, DebtPaymentsEntry>;
}

const initialState: DebtState = {
  items: [],
  totalElements: 0,
  totalPages: 1,
  params: { page: 1, size: 10, sortBy: 'createdAt', sortDir: 'desc' },
  selectedDebt: null,
  summary: null,
  status: 'idle',
  submitStatus: 'idle',
  error: null,
  paymentsByDebtId: {},
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** GET /debts — Lấy danh sách có phân trang & filter */
export const fetchDebts = createAsyncThunk(
  'debt/fetchAll',
  async (params: DebtFetchParams = {}, { rejectWithValue }) => {
    try {
      return await debtService.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải danh sách nợ');
    }
  }
);

/** GET /debts/:id — Chi tiết khoản nợ kèm payments */
export const fetchDebtById = createAsyncThunk(
  'debt/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await debtService.getById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải chi tiết nợ');
    }
  }
);

/** POST /debts — Tạo khoản nợ mới */
export const createDebt = createAsyncThunk(
  'debt/create',
  async (data: DebtRequest, { rejectWithValue }) => {
    try {
      return await debtService.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Tạo khoản nợ thất bại');
    }
  }
);

/** PATCH /debts/:id — Cập nhật khoản nợ (hoặc ghi nhận paidAmount) */
export const updateDebt = createAsyncThunk(
  'debt/update',
  async ({ id, data }: { id: number; data: Partial<DebtRequest> }, { rejectWithValue }) => {
    try {
      return await debtService.update(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Cập nhật khoản nợ thất bại');
    }
  }
);

/** DELETE /debts/:id — Xóa mềm */
export const deleteDebt = createAsyncThunk(
  'debt/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await debtService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Xóa khoản nợ thất bại');
    }
  }
);

/** GET /debts/summary — Tổng nợ phải thu & phải trả */
export const fetchDebtSummary = createAsyncThunk(
  'debt/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await debtService.getSummary();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải tổng hợp nợ');
    }
  }
);

/**
 * GET /debts/:id — Lấy payments cho dropdown của 1 dòng nợ.
 * Tách khỏi fetchDebtById để không ghi đè selectedDebt.
 * Cache: nếu đã 'succeeded', caller nên kiểm tra trước khi dispatch.
 */
export const fetchDebtPayments = createAsyncThunk(
  'debt/fetchPayments',
  async (debtId: number, { rejectWithValue }) => {
    try {
      const debt = await debtService.getById(debtId);
      return { debtId, payments: debt.payments ?? [] };
    } catch (err: any) {
      return rejectWithValue({
        debtId,
        message: err.response?.data?.message ?? 'Không thể tải lịch sử thanh toán',
      });
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const debtSlice = createSlice({
  name: 'debt',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<DebtFetchParams>>) {
      state.params = { ...state.params, ...action.payload };
      state.status = 'idle'; // Trigger refetch
    },
    resetSubmitStatus(state) {
      state.submitStatus = 'idle';
      state.error = null;
    },
    clearSelectedDebt(state) {
      state.selectedDebt = null;
    },
    /**
     * Đặt lại cache payments của 1 khoản nợ về 'idle'.
     * Gọi sau khi tạo/sửa transaction thanh toán hoặc onMarkAsPaid
     * để lần mở dropdown tiếp theo sẽ gọi API lấy dữ liệu mới.
     */
    invalidateDebtPayments(state, action: PayloadAction<number>) {
      const id = action.payload;
      if (state.paymentsByDebtId[id]) {
        state.paymentsByDebtId[id].status = 'idle';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchDebts ──────────────────────────────────────────────────────────
      .addCase(fetchDebts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDebts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDebts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // ── fetchDebtById ───────────────────────────────────────────────────────
      .addCase(fetchDebtById.fulfilled, (state, action) => {
        state.selectedDebt = action.payload;
      })

      // ── createDebt ──────────────────────────────────────────────────────────
      .addCase(createDebt.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(createDebt.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // trigger refetch
      })
      .addCase(createDebt.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── updateDebt ──────────────────────────────────────────────────────────
      .addCase(updateDebt.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(updateDebt.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle';
      })
      .addCase(updateDebt.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── deleteDebt ──────────────────────────────────────────────────────────
      .addCase(deleteDebt.fulfilled, (state) => {
        state.status = 'idle'; // trigger refetch
      })
      .addCase(deleteDebt.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ── fetchDebtSummary ────────────────────────────────────────────────────
      .addCase(fetchDebtSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
      })

      // ── fetchDebtPayments ───────────────────────────────────────────────────
      .addCase(fetchDebtPayments.pending, (state, action) => {
        const id = action.meta.arg;
        state.paymentsByDebtId[id] = {
          data: state.paymentsByDebtId[id]?.data ?? [],
          status: 'loading',
        };
      })
      .addCase(fetchDebtPayments.fulfilled, (state, action) => {
        const { debtId, payments } = action.payload;
        state.paymentsByDebtId[debtId] = { data: payments, status: 'succeeded' };
      })
      .addCase(fetchDebtPayments.rejected, (state, action) => {
        const payload = action.payload as { debtId: number; message: string };
        const id = payload?.debtId ?? action.meta.arg;
        state.paymentsByDebtId[id] = {
          data: state.paymentsByDebtId[id]?.data ?? [],
          status: 'failed',
          error: payload?.message ?? 'Lỗi không xác định',
        };
      });
  },
});

export const { setParams, resetSubmitStatus, clearSelectedDebt, invalidateDebtPayments } = debtSlice.actions;
export default debtSlice.reducer;
