import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/user/",
  }),
  tagTypes: ["User"],
  endpoints: (builder) => ({
    getUser: builder.query({
      query: (id: string) => `${id}`,
      providesTags: ["User"],
    }),
    updateUser: builder.mutation({
      query: ({ data, id }) => ({
        url: `${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const { useGetUserQuery, useUpdateUserMutation, useDeleteUserMutation } =
  userApi;
