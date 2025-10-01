// src/store/index.js
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import authenticationReducer from "./reducers/authentication";
import authReducer from "./authSlice"; // ✅ เพิ่มบรรทัดนี้
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // ✅ เปลี่ยนจาก session เป็น storage ปกติ

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "authentication"], // ✅ เพิ่ม "auth" เข้าไปด้วย
};

const persistedReducer = persistReducer(
  persistConfig,
  combineReducers({
    authentication: authenticationReducer, // reducer เดิมของคุณ
    auth: authReducer, // ✅ reducer ใหม่สำหรับระบบ Auth
  })
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"], // ✅ เพิ่ม REHYDRATE
      },
    }),
});

export const persistor = persistStore(store);