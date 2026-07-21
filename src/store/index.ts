// src/store/index.ts
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import dashboardReducer from "./slices/dashboardSlice";
import transactionReducer from "./slices/transactionSlice";
import fundReducer from "./slices/fundSlice";
import categoryReducer from "./slices/categorySlice";
import userReducer from "./slices/userSlice";
import reportReducer from "./slices/reportSlice";
import debtReducer from "./slices/debtSlice";
import partnerReducer from "./slices/partnerSlice";
import reconciliationReducer from "./slices/reconciliationSlice";
import aiInsightReducer from "./slices/aiInsightSlice";
import documentReducer from "./slices/documentSlice";

const appReducer = combineReducers({
  auth: authReducer,
  dashboard: dashboardReducer,
  transaction: transactionReducer,
  fund: fundReducer,
  category: categoryReducer,
  user: userReducer,
  report: reportReducer,
  debt: debtReducer,
  partner: partnerReducer,
  reconciliation: reconciliationReducer,
  aiInsight: aiInsightReducer,
  document: documentReducer,
});

export type AppState = ReturnType<typeof appReducer>;

const rootReducer = (
  state: AppState | undefined,
  action: Parameters<typeof appReducer>[1]
): AppState => {
  if (action.type === "auth/logout") {
    state = undefined;
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
});

// Typed exports
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;