import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/",
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
      query: ({ data, id }) => ({
        url: `cart/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),
    deleteCart: builder.mutation({
      query: ({ productId, id }) => ({
        url: `cart/${id}`,
        method: "DELETE",
        body: { productId },
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
