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
});

export type AppState = ReturnType<typeof appReducer>;

/**
 * Root reducer wrapper: khi action "auth/logout" được dispatch,
 * reset TOÀN BỘ state của mọi slice về initialState (state = undefined),
 * thay vì chỉ reset riêng authSlice như trước đây.
 *
 * Trước đây: dispatch(logout()) chỉ xóa state.auth, còn transaction/category/
 * user/fund/debt/partner/report/reconciliation... vẫn giữ dữ liệu của user cũ
 * trong bộ nhớ (vì logout không làm reload trang, chỉ navigate SPA).
 * Nếu user khác đăng nhập ngay sau đó, họ có thể thấy thoáng dữ liệu cũ
 * cho tới khi từng slice tự fetch lại.
 */
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
