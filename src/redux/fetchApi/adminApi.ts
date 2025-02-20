import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { create } from "domain";
import { get } from "http";
import build from "next/dist/build";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/",
    credentials: "include",
  }),
  tagTypes: ["Admin"],
  endpoints: (builder) => ({
    updateAdmin: builder.mutation({
      query: ({ data, id }) => ({
        url: `${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),
    deleteAdmin: builder.mutation({
      query: ({ id }) => ({
        url: `${id}`,
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
      query: (id:string) => `${id}`,
      providesTags: ["Admin"],
    }),
  }),
});
