import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { json } from "stream/consumers";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/user/",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUser: builder.query({
      query: () => ``,
      providesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ data }) => ({
        url: ``,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: () => ({
        url: ``,
        method: "DELETE",
      }),
    }),
    addAddress: builder.mutation({
      query: (data) => ({
        url: "address",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    updateAddress: builder.mutation({
      query: ({ id, data }) => ({
        url: "address",
        method: "PATCH",
        body: { id, ...data },
      }),
      invalidatesTags: ["User"],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: "address",
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useAddAddressMutation,
} = userApi;
