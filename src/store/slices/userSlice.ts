import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import userService, { type UserFetchParams } from '../../services/userService';
import { mapUserDTOToUiUser } from '../../features/admin/userManager/apiTypes';
import type { UserRequest } from '../../features/admin/userManager/apiTypes';
import type { User } from '../../features/admin/userManager/types';

interface UserState {
  items: User[];
  totalElements: number;
  totalPages: number;
  params: UserFetchParams;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  submitStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: UserState = {
  items: [],
  totalElements: 0,
  totalPages: 1,
  params: { page: 1, size: 4, sortBy: 'id', sortDir: 'desc' }, // default 4 matching ITEMS_PER_PAGE
  status: 'idle',
  submitStatus: 'idle',
  error: null,
};

export const fetchUsers = createAsyncThunk(
  'user/fetchAll',
  async (params: UserFetchParams = {}, { rejectWithValue }) => {
    try {
      return await userService.getAll(params);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Không thể tải danh sách người dùng');
    }
  }
);

export const createUser = createAsyncThunk(
  'user/create',
  async (data: UserRequest, { rejectWithValue }) => {
    try {
      return await userService.create(data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Tạo người dùng thất bại');
    }
  }
);

export const updateUserThunk = createAsyncThunk(
  'user/update',
  async ({ id, data }: { id: number; data: Partial<UserRequest> }, { rejectWithValue }) => {
    try {
      return await userService.update(id, data);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Cập nhật người dùng thất bại');
    }
  }
);

export const deleteUserThunk = createAsyncThunk(
  'user/delete',
  async (id: number, { rejectWithValue }) => {
    try {
      await userService.delete(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Xóa người dùng thất bại');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setParams(state, action: PayloadAction<Partial<UserFetchParams>>) {
      state.params = { ...state.params, ...action.payload };
      state.status = 'idle'; // Reset status to trigger fetch
    },
    resetSubmitStatus(state) {
      state.submitStatus = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.content.map(mapUserDTOToUiUser);
        state.totalElements = action.payload.totalElements;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })

      .addCase(createUser.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle';
      })
      .addCase(createUser.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      .addCase(updateUserThunk.pending, (state) => {
        state.submitStatus = 'loading';
        state.error = null;
      })
      .addCase(updateUserThunk.fulfilled, (state) => {
        state.submitStatus = 'succeeded';
        state.status = 'idle';
      })
      .addCase(updateUserThunk.rejected, (state, action) => {
        state.submitStatus = 'failed';
        state.error = action.payload as string;
      })

      .addCase(deleteUserThunk.fulfilled, (state) => {
        state.status = 'idle';
      })
      .addCase(deleteUserThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { setParams, resetSubmitStatus } = userSlice.actions;
export default userSlice.reducer;
