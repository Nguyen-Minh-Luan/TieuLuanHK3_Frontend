/**
 * reconciliationSlice.ts
 * Redux slice quản lý phiên kiểm kê quỹ.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reconciliationService, {
  type ReconciliationFetchParams,
} from '../../services/reconciliationService';
import type {
  ReconciliationResponse,
  ReconciliationRequest,
  ReconciliationUpdateRequest,
} from '../../features/reconciliation/apiTypes';

// ─── State ────────────────────────────────────────────────────────────────────

interface ReconciliationState {
  items: ReconciliationResponse[];
  totalElements: number;
  totalPages: number;
  params: ReconciliationFetchParams;
  selectedItem: ReconciliationResponse | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReconciliationState = {
  items: [],
  totalElements: 0,
  totalPages: 1,
  params: { page: 1, size: 10, sortBy: 'periodEnd', sortDir: 'DESC' },
  selectedItem: null,
  status: 'idle',
  submitStatus: 'idle',
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchReconciliations = createAsyncThunk(
  'reconciliation/fetchAll',
  async (params: ReconciliationFetchParams = {}, { rejectWithValue }) => {
    try {
      return await reconciliationService.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải danh sách kiểm kê');
    }
  }
);

export const fetchReconciliationById = createAsyncThunk(
  'reconciliation/fetchById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await reconciliationService.getById(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không tìm thấy phiên kiểm kê');
    }
  }
);

export const createReconciliation = createAsyncThunk(
  'reconciliation/create',
  async (data: ReconciliationRequest, { rejectWithValue }) => {
    try {
      return await reconciliationService.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tạo phiên kiểm kê');
    }
  }
);

export const updateDraftReconciliation = createAsyncThunk(
  'reconciliation/updateDraft',
  async ({ id, data }: { id: number; data: ReconciliationUpdateRequest }, { rejectWithValue }) => {
    try {
      return await reconciliationService.update(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể cập nhật phiên kiểm kê');
    }
  }
);

export const closeReconciliation = createAsyncThunk(
  'reconciliation/close',
  async (id: number, { rejectWithValue }) => {
    try {
      return await reconciliationService.close(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể chốt kiểm kê');
    }
  }
);

export const reopenReconciliation = createAsyncThunk(
  'reconciliation/reopen',
  async ({ id, reason }: { id: number; reason: string }, { rejectWithValue }) => {
    try {
      return await reconciliationService.reopen(id, reason);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể mở khóa kiểm kê');
    }
  }
);

export const deleteReconciliation = createAsyncThunk(
  'reconciliation/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await reconciliationService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể xóa phiên kiểm kê');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const reconciliationSlice = createSlice({
  name: 'reconciliation',
  initialState,
  reducers: {
    setParams(state, action) {
      state.params = { ...state.params, ...action.payload };
    },
    clearSelected(state) {
      state.selectedItem = null;
    },
    resetSubmitStatus(state) {
      state.submitStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchAll
    builder
      .addCase(fetchReconciliations.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchReconciliations.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload?.content ?? [];
        state.totalElements = action.payload?.totalElements ?? 0;
        state.totalPages = action.payload?.totalPages ?? 1;
      })
      .addCase(fetchReconciliations.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // fetchById
    builder
      .addCase(fetchReconciliationById.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchReconciliationById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedItem = action.payload ?? null;
      })
      .addCase(fetchReconciliationById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });

    // create
    builder
      .addCase(createReconciliation.pending, (state) => { state.submitStatus = 'loading'; })
      .addCase(createReconciliation.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        if (action.payload) {
          state.items = [...action.payload, ...state.items];
        }
      })
      .addCase(createReconciliation.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      });

    // updateDraft
    builder
      .addCase(updateDraftReconciliation.pending, (state) => { state.submitStatus = 'loading'; })
      .addCase(updateDraftReconciliation.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        if (action.payload) {
          state.selectedItem = action.payload;
          state.items = state.items.map(i => i.id === action.payload!.id ? action.payload! : i);
        }
      })
      .addCase(updateDraftReconciliation.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      });

    // close
    builder
      .addCase(closeReconciliation.pending, (state) => { state.submitStatus = 'loading'; })
      .addCase(closeReconciliation.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        if (action.payload) {
          state.selectedItem = action.payload;
          state.items = state.items.map(i => i.id === action.payload!.id ? action.payload! : i);
        }
      })
      .addCase(closeReconciliation.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      });

    // reopen
    builder
      .addCase(reopenReconciliation.pending, (state) => { state.submitStatus = 'loading'; })
      .addCase(reopenReconciliation.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        if (action.payload) {
          state.selectedItem = action.payload;
          state.items = state.items.map(i => i.id === action.payload!.id ? action.payload! : i);
        }
      })
      .addCase(reopenReconciliation.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      });

    // delete
    builder
      .addCase(deleteReconciliation.pending, (state) => { state.submitStatus = 'loading'; })
      .addCase(deleteReconciliation.fulfilled, (state, action) => {
        state.submitStatus = 'succeeded';
        state.items = state.items.filter(i => i.id !== action.payload);
      })
      .addCase(deleteReconciliation.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setParams, clearSelected, resetSubmitStatus } = reconciliationSlice.actions;
export default reconciliationSlice.reducer;
