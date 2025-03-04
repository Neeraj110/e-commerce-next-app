import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/adminRoute/",
    credentials: "include",
  }),
  tagTypes: ["Admin"],
  endpoints: (builder) => ({
    updateAdmin: builder.mutation({
      query: ({ data }) => ({
        url: ``,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),
    deleteAdmin: builder.mutation({
      query: () => ({
        url: ``,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),
    createAdmin: builder.mutation({
      query: (data) => ({
        url: ``,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),
    getAdmin: builder.query({
      query: () => ``,
      providesTags: ["Admin"],
    }),
  }),
});

export const {
  useCreateAdminMutation,
  useDeleteAdminMutation,
  useUpdateAdminMutation,
  useGetAdminQuery,
} = adminApi;
