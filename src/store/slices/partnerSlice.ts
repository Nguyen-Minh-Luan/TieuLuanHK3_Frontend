/**
 * partnerSlice.ts
 * Redux slice quản lý đối tác (Partner).
 * Hỗ trợ đầy đủ CRUD + phân trang + filter theo keyword/type.
 * Theo đúng khuôn của categorySlice.ts.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import partnerService, {
  type PartnerDTO,
  type PartnerFetchParams,
} from '../../services/partnerService';

// ─── State ────────────────────────────────────────────────────────────────────

interface PartnerState {
  items: PartnerDTO[];
  totalElements: number;
  totalPages: number;
  params: PartnerFetchParams;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: PartnerState = {
  items: [],
  totalElements: 0,
  totalPages: 1,
  params: { page: 1, size: 10, sortBy: 'name', sortDir: 'asc' },
  status: 'idle',
  submitStatus: 'idle',
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** GET /partners — Lấy danh sách có phân trang & filter */
export const fetchPartners = createAsyncThunk(
  'partner/fetchAll',
  async (params: PartnerFetchParams = {}, { rejectWithValue }) => {
    try {
      return await partnerService.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải danh sách đối tác');
    }
  }
);

/** POST /partners — Tạo đối tác mới */
export const createPartner = createAsyncThunk(
  'partner/create',
  async (data: Omit<PartnerDTO, 'id'>, { rejectWithValue }) => {
    try {
      return await partnerService.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Tạo đối tác thất bại');
    }
  }
);

/** PUT /partners/:id — Cập nhật đối tác */
export const updatePartner = createAsyncThunk(
  'partner/update',
  async (
    { id, data }: { id: number; data: Omit<PartnerDTO, 'id'> },
    { rejectWithValue }
  ) => {
    try {
      return await partnerService.update(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Cập nhật đối tác thất bại');
    }
  }
);

/** DELETE /partners/:id — Xóa đối tác */
export const deletePartnerThunk = createAsyncThunk(
  'partner/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await partnerService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Xóa đối tác thất bại');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {
    /** Cập nhật params → tự động trigger refetch (status về idle) */
    setParams(state, action: PayloadAction<Partial<PartnerFetchParams>>) {
      state.params = { ...state.params, ...action.payload };
      state.status = 'idle';
    },
    resetSubmitStatus(state) {
      state.submitStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchPartners ────────────────────────────────────────────────────────
      .addCase(fetchPartners.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // ── createPartner ────────────────────────────────────────────────────────
      .addCase(createPartner.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(createPartner.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // trigger refetch
      })
      .addCase(createPartner.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── updatePartner ────────────────────────────────────────────────────────
      .addCase(updatePartner.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(updatePartner.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // trigger refetch
      })
      .addCase(updatePartner.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── deletePartnerThunk ───────────────────────────────────────────────────
      .addCase(deletePartnerThunk.fulfilled, (state) => {
        state.status = 'idle'; // trigger refetch
      })
      .addCase(deletePartnerThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setParams, resetSubmitStatus } = partnerSlice.actions;
export default partnerSlice.reducer;
