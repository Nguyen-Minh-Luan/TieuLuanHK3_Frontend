/**
 * categorySlice.ts
 * Redux slice quản lý danh mục (Category).
 * Hỗ trợ đầy đủ CRUD + phân trang + tree.
 */

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import categoryService, {
  type CategoryDTO,
  type CategoryFetchParams,
  type CategoryTreeNode,
} from '../../services/categoryService';

// ─── State ────────────────────────────────────────────────────────────────────

interface CategoryState {
  items: CategoryDTO[];             // danh sách phẳng (phân trang)
  treeItems: CategoryTreeNode[];    // cây cha–con (cho dropdown parentId)
  totalElements: number;
  totalPages: number;
  params: CategoryFetchParams;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  treeItems: [],
  totalElements: 0,
  totalPages: 1,
  params: { page: 1, size: 10, sortBy: 'name', sortDir: 'asc' },
  status: 'idle',
  submitStatus: 'idle',
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** GET /categories/tree — Lấy cây danh mục (dùng cho dropdown parentId) */
export const fetchCategoryTree = createAsyncThunk(
  'category/fetchTree',
  async (_, { rejectWithValue }) => {
    try {
      return await categoryService.getTree();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải cây danh mục');
    }
  }
);

/** GET /categories — Lấy danh sách phẳng có phân trang & filter */
export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async (params: CategoryFetchParams = {}, { rejectWithValue }) => {
    try {
      return await categoryService.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải danh mục');
    }
  }
);

/** POST /categories — Tạo danh mục mới */
export const createCategory = createAsyncThunk(
  'category/create',
  async (data: Omit<CategoryDTO, 'id' | 'parentName'>, { rejectWithValue }) => {
    try {
      return await categoryService.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Tạo danh mục thất bại');
    }
  }
);

/** PATCH /categories/:id — Cập nhật danh mục */
export const updateCategory = createAsyncThunk(
  'category/update',
  async (
    { id, data }: { id: number; data: Partial<Omit<CategoryDTO, 'id' | 'parentName'>> },
    { rejectWithValue }
  ) => {
    try {
      return await categoryService.update(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Cập nhật danh mục thất bại');
    }
  }
);

/** DELETE /categories/:id — Xóa mềm */
export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await categoryService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Xóa danh mục thất bại');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<CategoryFetchParams>>) {
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
      // ── fetchCategoryTree ────────────────────────────────────────────────────
      .addCase(fetchCategoryTree.fulfilled, (state, action) => {
        state.treeItems = action.payload;
      })

      // ── fetchCategories ──────────────────────────────────────────────────────
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.content;
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      // ── createCategory ───────────────────────────────────────────────────────
      .addCase(createCategory.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle'; // trigger refetch danh sách
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── updateCategory ───────────────────────────────────────────────────────
      .addCase(updateCategory.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle';
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      // ── deleteCategory ───────────────────────────────────────────────────────
      .addCase(deleteCategory.fulfilled, (state) => {
        state.status = 'idle'; // trigger refetch
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setParams, resetSubmitStatus } = categorySlice.actions;
export default categorySlice.reducer;
