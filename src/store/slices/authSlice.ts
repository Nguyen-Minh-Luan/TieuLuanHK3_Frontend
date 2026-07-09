// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// --- Helper: giải mã JWT payload (không xác thực chữ ký — chỉ đọc claims) ---
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return {};
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
  }
}

// --- Types ---
interface AuthState {
  id: number | null;
  username: string | null;
  fullName: string | null;
  email: string | null;
  role: number | null;
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
  email: string;
  role: number;
  token: string;
}

// --- Helper: khôi phục role từ localStorage hoặc JWT ---
function restoreRole(): number | null {
  const stored = localStorage.getItem("role");
  if (stored !== null) return Number(stored);
  const token = localStorage.getItem("token");
  if (token) {
    const payload = decodeJwtPayload(token);
    if (typeof payload.role === "number") return payload.role;
  }
  return null;
}

// --- Initial State ---
const initialState: AuthState = {
  id: localStorage.getItem("userId") ? Number(localStorage.getItem("userId")) : null,
  username: localStorage.getItem("username") ?? null,
  fullName: localStorage.getItem("fullName") ?? null,
  email: localStorage.getItem("email") ?? null,
  role: restoreRole(),
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

    // json.data chứa UserResponseDTO { id, username, fullName, email, role, token }
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
      state.email = null;
      state.role = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      localStorage.removeItem("username");
      localStorage.removeItem("fullName");
      localStorage.removeItem("email");
      localStorage.removeItem("role");
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
        state.email = action.payload.email ?? null;
        state.role = action.payload.role ?? null;
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token); // Persist token
        localStorage.setItem("userId", String(action.payload.id));
        localStorage.setItem("username", action.payload.username);
        localStorage.setItem("fullName", action.payload.fullName);
        if (action.payload.email) localStorage.setItem("email", action.payload.email);
        if (action.payload.role !== undefined && action.payload.role !== null) {
          localStorage.setItem("role", String(action.payload.role));
        }
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
