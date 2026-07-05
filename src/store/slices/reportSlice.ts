/**
 * reportSlice.ts
 * Redux slice quản lý danh sách báo cáo tài chính.
 * Theo pattern của fundSlice.ts / transactionSlice.ts.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import reportService from '../../services/reportService';
import type { ReportRequest, ReportResponse, ReportFetchParams } from '../../features/reports/reportTypes';

// ─── State ────────────────────────────────────────────────────────────────────

interface ReportState {
  items: ReportResponse[];
  currentReport: ReportResponse | null;
  totalElements: number;
  totalPages: number;
  params: ReportFetchParams;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReportState = {
  items: [],
  currentReport: null,
  totalElements: 0,
  totalPages: 1,
  params: { page: 1, size: 10, sortBy: 'createdAt', sortDir: 'desc' },
  status: 'idle',
  submitStatus: 'idle',
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchReports = createAsyncThunk(
  'report/fetchAll',
  async (params: ReportFetchParams = {}, { rejectWithValue }) => {
    try {
      return await reportService.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải danh sách báo cáo');
    }
  }
);

export const fetchReportById = createAsyncThunk(
  'report/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await reportService.getById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải báo cáo');
    }
  }
);

export const createReport = createAsyncThunk(
  'report/create',
  async (data: ReportRequest, { rejectWithValue }) => {
    try {
      return await reportService.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Tạo báo cáo thất bại');
    }
  }
);

export const updateReport = createAsyncThunk(
  'report/update',
  async ({ id, data }: { id: number; data: Partial<ReportRequest> }, { rejectWithValue }) => {
    try {
      return await reportService.update(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Cập nhật báo cáo thất bại');
    }
  }
);

export const deleteReport = createAsyncThunk(
  'report/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await reportService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Xóa báo cáo thất bại');
    }
  }
);

export const recalculateReport = createAsyncThunk(
  'report/recalculate',
  async (id: number, { rejectWithValue }) => {
    try {
      return await reportService.recalculate(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Tái tính số liệu thất bại');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<ReportFetchParams>>) {
      state.params = { ...state.params, ...action.payload };
      state.status = 'idle'; // Trigger refetch
    },
    resetSubmitStatus(state) {
      state.submitStatus = 'idle';
      state.error = null;
    },
    clearCurrentReport(state) {
      state.currentReport = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchReports ────────────────────────────────────────────────────────
      .addCase(fetchReports.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // ── fetchReportById ─────────────────────────────────────────────────────
      .addCase(fetchReportById.fulfilled, (state, action) => {
        state.currentReport = action.payload;
      })

      // ── createReport ────────────────────────────────────────────────────────
      .addCase(createReport.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // Trigger refetch
      })
      .addCase(createReport.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── updateReport ────────────────────────────────────────────────────────
      .addCase(updateReport.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(updateReport.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // Trigger refetch
        // Update currentReport if it's the one being edited
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
      })
      .addCase(updateReport.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── deleteReport ────────────────────────────────────────────────────────
      .addCase(deleteReport.fulfilled, (state) => {
        state.status = 'idle'; // Trigger refetch
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ── recalculateReport ───────────────────────────────────────────────────
      .addCase(recalculateReport.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(recalculateReport.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // Trigger refetch
        if (state.currentReport?.id === action.payload.id) {
          state.currentReport = action.payload;
        }
      })
      .addCase(recalculateReport.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setParams, resetSubmitStatus, clearCurrentReport } = reportSlice.actions;
export default reportSlice.reducer;
