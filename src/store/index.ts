// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import transactionReducer from "./slices/transactionSlice";
import fundReducer from "./slices/fundSlice";
import categoryReducer from "./slices/categorySlice";
import userReducer from "./slices/userSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    transaction: transactionReducer,
    fund: fundReducer,
    category: categoryReducer,
    user: userReducer,
  },
});

// Typed exports
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
