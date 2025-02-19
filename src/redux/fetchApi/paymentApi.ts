import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const paymentApi = createApi({
  reducerPath: "paymentApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api/payments/" }),
  tagTypes: ["Payment"],
  endpoints: (builder) => ({
    createPayment: builder.mutation({
      query: (data) => ({
        url: "create",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),
    verifyPayment: builder.mutation({
      query: (data) => ({
        url: "verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),
    placeCodOrder: builder.mutation({
      query: (data) => ({
        url: "cod",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),
    verifyCodPayment: builder.mutation({
      query: (data) => ({
        url: "cod/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Payment"],
    }),
  }),
});

export const {
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  usePlaceCodOrderMutation,
  useVerifyCodPaymentMutation,
} = paymentApi;
