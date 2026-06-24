// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// --- Types ---
interface AuthState {
  id: number | null;
  username: string | null;
  fullName: string | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface LoginResponse {
  id: number;
  username: string;
  fullName: string;
  token: string;
}

// --- Initial State ---
const initialState: AuthState = {
  id: localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : null,
  username: localStorage.getItem("username") ?? null,
  fullName: localStorage.getItem("fullName") ?? null,
  token: localStorage.getItem("token") ?? null, // Persist qua F5
  status: "idle",
  error: null,
};

// --- Async Thunk: Gọi API POST /auth/login ---
export const loginAsync = createAsyncThunk<LoginResponse, LoginPayload>(
  "auth/login",
  async ({ username, password }, { rejectWithValue }) => {
    const response = await fetch("http://localhost:8080/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const json = await response.json();

    if (!response.ok) {
      // Backend trả về message trong ApiResponse
      return rejectWithValue(json.message ?? "Đăng nhập thất bại");
    }

    // json.data chứa UserResponseDTO { username, fullName, token }
    return json.data as LoginResponse;
  }
);

// --- Slice ---
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.id = null;
      state.username = null;
      state.fullName = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("fullName");
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.id = action.payload.id;
        state.username = action.payload.username;
        state.fullName = action.payload.fullName;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token); // Persist token
        localStorage.setItem("userId", String(action.payload.id));
        localStorage.setItem("username", action.payload.username);
        localStorage.setItem("fullName", action.payload.fullName);
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
