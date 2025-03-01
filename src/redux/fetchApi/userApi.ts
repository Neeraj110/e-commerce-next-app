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
    updateAddress: builder.mutation({
      query: (data) => ({
        url: `address`,
        method: "PATCH",
        body: data,
        headers: new Headers({
          "Content-Type": "application/json",
        }),
      }),
      invalidatesTags: ["User"],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `address`,
        method: "DELETE",
        body: { id },
        headers: new Headers({
          "Content-Type": "application/json",
        }),
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
} = userApi;
