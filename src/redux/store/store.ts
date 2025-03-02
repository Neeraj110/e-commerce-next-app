import { configureStore, combineReducers } from "@reduxjs/toolkit";
import userSlice from "../slices/userSlice";
import cartSlice from "../slices/cartSlice";
import { productApi } from "../fetchApi/productApi";
import { cartApi } from "../fetchApi/cartApi";
import { userApi } from "../fetchApi/userApi";
import { orderApi } from "../fetchApi/orderApi";
import { paymentApi } from "../fetchApi/paymentApi";

const SESSION_KEY = "userState";

const appReducer = combineReducers({
  user: userSlice,
  cart: cartSlice,
  [productApi.reducerPath]: productApi.reducer,
  [cartApi.reducerPath]: cartApi.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [orderApi.reducerPath]: orderApi.reducer,
  [paymentApi.reducerPath]: paymentApi.reducer,
});

export const rootReducer = (state: any, action: any) => {
  if (action.type === "RESET_APP") {
    sessionStorage.removeItem(SESSION_KEY);
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      productApi.middleware,
      cartApi.middleware,
      userApi.middleware,
      orderApi.middleware,
      paymentApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const resetApp = () => ({ type: "RESET_APP" });

export default store;
