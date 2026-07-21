import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import documentService, {
  type OriginalDocumentDTO,
  type DocumentFetchParams,
} from '../../services/documentService';

// ─── State ────────────────────────────────────────────────────────────────────

interface DocumentState {
  items: OriginalDocumentDTO[];
  totalElements: number;
  totalPages: number;
  params: DocumentFetchParams;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DocumentState = {
  items: [],
  totalElements: 0,
  totalPages: 1,
  params: { page: 1, size: 10 },
  status: 'idle',
  submitStatus: 'idle',
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDocuments = createAsyncThunk(
  'document/fetchAll',
  async (params: DocumentFetchParams = {}, { rejectWithValue }) => {
    try {
      return await documentService.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải danh sách chứng từ');
    }
  }
);

export const uploadDocumentThunk = createAsyncThunk(
  'document/upload',
  async (
    { file, description, transactionId }: { file: File; description?: string; transactionId?: number },
    { rejectWithValue }
  ) => {
    try {
      return await documentService.upload(file, description, transactionId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Tải lên chứng từ thất bại');
    }
  }
);

export const linkDocumentThunk = createAsyncThunk(
  'document/link',
  async (
    { id, transactionId }: { id: number; transactionId: number },
    { rejectWithValue }
  ) => {
    try {
      return await documentService.linkTransaction(id, transactionId);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Gắn chứng từ thất bại');
    }
  }
);

export const unlinkDocumentThunk = createAsyncThunk(
  'document/unlink',
  async (id: number, { rejectWithValue }) => {
    try {
      return await documentService.unlinkTransaction(id);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Gỡ chứng từ thất bại');
    }
  }
);

export const deleteDocumentThunk = createAsyncThunk(
  'document/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await documentService.remove(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Xóa chứng từ thất bại');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<DocumentFetchParams>>) {
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
      // ── fetchDocuments ────────────────────────────────────────────────────────
      .addCase(fetchDocuments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // ── uploadDocumentThunk ────────────────────────────────────────────────────────
      .addCase(uploadDocumentThunk.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(uploadDocumentThunk.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // trigger refetch
      })
      .addCase(uploadDocumentThunk.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── linkDocumentThunk ────────────────────────────────────────────────────────
      .addCase(linkDocumentThunk.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(linkDocumentThunk.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // trigger refetch
      })
      .addCase(linkDocumentThunk.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── unlinkDocumentThunk ────────────────────────────────────────────────────────
      .addCase(unlinkDocumentThunk.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(unlinkDocumentThunk.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // trigger refetch
      })
      .addCase(unlinkDocumentThunk.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── deleteDocumentThunk ───────────────────────────────────────────────────
      .addCase(deleteDocumentThunk.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteDocumentThunk.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // trigger refetch
      })
      .addCase(deleteDocumentThunk.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { setParams, resetSubmitStatus } = documentSlice.actions;
export default documentSlice.reducer;
