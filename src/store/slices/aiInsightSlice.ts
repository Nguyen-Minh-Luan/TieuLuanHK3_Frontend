import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { AIInsightResponse } from '../../features/reports/aiInsightTypes';
import { aiInsightService } from '../../services/aiInsightService';

interface AIInsightState {
  data: AIInsightResponse | null;
  loading: boolean;
  error: string | null;
  lastFetched: string | null;
}

const initialState: AIInsightState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchAIInsights = createAsyncThunk(
  'aiInsight/fetchInsights',
  async ({ months, forceRefresh }: { months?: number; forceRefresh?: boolean }, { rejectWithValue }) => {
    try {
      const data = await aiInsightService.getAIInsights(months, forceRefresh);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Có lỗi xảy ra khi tải phân tích AI');
    }
  }
);

const aiInsightSlice = createSlice({
  name: 'aiInsight',
  initialState,
  reducers: {
    clearAIInsights: (state) => {
      state.data = null;
      state.error = null;
      state.lastFetched = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAIInsights.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAIInsights.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.lastFetched = new Date().toISOString();
      })
      .addCase(fetchAIInsights.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAIInsights } = aiInsightSlice.actions;
export default aiInsightSlice.reducer;
