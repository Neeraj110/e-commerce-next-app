import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/",
    credentials: "include",
  }),
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: () => "products",
      providesTags: ["Product"],
    }),
    getSingleProduct: builder.query({
      query: (id: string) => `products/${id}`,
      providesTags: ["Product"],
    }),
    getLatestProducts: builder.query({
      query: () => "products/latest",
      providesTags: ["Product"],
    }),
    getCategory: builder.query({
      query: () => `products/category`,
      providesTags: ["Product"],
    }),
    getCategoryProducts: builder.query({
      query: (category: string) => `products/category/${category}`,
      providesTags: ["Product"],
    }),
    getReview: builder.query({
      query: (id: string) => `products/reviews/${id}`,
      providesTags: ["Product"],
    }),
    addnewProduct: builder.mutation({
      query: (formdata) => ({
        url: `products`,
        method: "POST",
        body: formdata,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation({
      query: ({ id }) => ({
        url: `products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation({
      query: ({ formdata, id }) => ({
        url: `products/${id}`,
        method: "PATCH",
        body: formdata,
      }),
      invalidatesTags: ["Product"],
    }),
    addReview: builder.mutation({
      query: ({ formdata, id }) => ({
        url: `products/review/${id}`,
        method: "POST",
        body: formdata,
      }),
      invalidatesTags: ["Product"],
    }),
    deleteReview: builder.mutation({
      query: ({ data, id }) => ({
        url: `products/review/${id}`,
        method: "DELETE",
        body: data,
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetSingleProductQuery,
  useGetLatestProductsQuery,
  useGetCategoryQuery,
  useGetCategoryProductsQuery,
  useGetReviewQuery,
  useAddnewProductMutation,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useAddReviewMutation,
  useDeleteReviewMutation,
} = productApi;
