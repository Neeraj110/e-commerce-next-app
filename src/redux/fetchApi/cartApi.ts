import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/",
    credentials: "include",
  }),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => "cart",
      providesTags: ["Cart"],
    }),
    addcart: builder.mutation({
      query: (data) => ({
        url: `cart`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),
    updateCart: builder.mutation({
      query: ({ productId, quantity, id }) => ({
        url: `cart/${id}`,
        method: "PATCH",
        body: { productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),
    deleteCart: builder.mutation({
      query: (id) => ({
        url: `cart/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddcartMutation,
  useUpdateCartMutation,
  useDeleteCartMutation,
} = cartApi;
