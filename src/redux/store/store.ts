import { configureStore } from "@reduxjs/toolkit";
import userSlice from "../slices/userSlice";
import cartSlice from "../slices/cartSlice";
import { productApi } from "../fetchApi/productApi";
import { cartApi } from "../fetchApi/cartApi";
import { userApi } from "../fetchApi/userApi";
import { orderApi } from "../fetchApi/orderApi";
import { paymentApi } from "../fetchApi/paymentApi";

const store = configureStore({
  reducer: {
    user: userSlice,
    cart: cartSlice,
    [productApi.reducerPath]: productApi.reducer,
    [cartApi.reducerPath]: cartApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [orderApi.reducerPath]: orderApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat(
      productApi.middleware,
      cartApi.middleware,
      userApi.middleware,
      orderApi.middleware,
      paymentApi.middleware
    );
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
