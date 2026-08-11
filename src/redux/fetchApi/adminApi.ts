import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/",
    credentials: "include",
  }),
  tagTypes: ["Admin", "Users", "Products", "Orders", "Reviews"],
  endpoints: (builder) => ({
    // Dashboard & Analytics
    getDashboard: builder.query<any, void>({
      query: () => "api/admin/dashboard",
      providesTags: ["Admin", "Orders", "Users", "Products"],
    }),

    getRevenueAnalytics: builder.query<any, { period?: string }>({
      query: ({ period = "monthly" } = {}) =>
        `api/admin/analytics/revenue?period=${period}`,
      providesTags: ["Admin", "Orders"],
    }),

    getOrderAnalytics: builder.query<any, void>({
      query: () => "api/admin/analytics/orders",
      providesTags: ["Admin", "Orders"],
    }),

    getTopProducts: builder.query<any, { limit?: number } | void>({
      query: (params) =>
        `api/admin/analytics/top-products?limit=${params?.limit || 10}`,
      providesTags: ["Admin", "Products", "Orders"],
    }),

    // User Management
    getAdminUsers: builder.query<
      any,
      { page?: number; limit?: number; search?: string }
    >({
      query: ({ page = 1, limit = 20, search = "" } = {}) =>
        `api/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`,
      providesTags: ["Users"],
    }),

    getUserById: builder.query<any, string>({
      query: (id) => `api/admin/users/${id}`,
      providesTags: ["Users"],
    }),

    updateUserRole: builder.mutation<
      any,
      { id: string; role: "user" | "admin" }
    >({
      query: ({ id, role }) => ({
        url: `api/admin/users/${id}/role`,
        method: "PUT",
        body: { role },
      }),
      invalidatesTags: ["Users", "Admin"],
    }),

    deleteUser: builder.mutation<any, string>({
      query: (id) => ({
        url: `api/admin/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users", "Admin"],
    }),

    // Product Management
    getAdminProducts: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        search?: string;
        sort?: string;
        order?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 20,
        search = "",
        sort = "created_at",
        order = "desc",
      } = {}) =>
        `api/admin/products?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}&sort=${sort}&order=${order}`,
      providesTags: ["Products"],
    }),

    getLowStockProducts: builder.query<any, { threshold?: number } | void>({
      query: (params) =>
        `api/admin/products/low-stock?threshold=${params?.threshold || 5}`,
      providesTags: ["Products"],
    }),

    updateProductStock: builder.mutation<
      any,
      { id: string; stock: number }
    >({
      query: ({ id, stock }) => ({
        url: `api/admin/products/${id}/stock`,
        method: "PUT",
        body: { stock },
      }),
      invalidatesTags: ["Products", "Admin"],
    }),

    // Review Management
    getAdminReviews: builder.query<
      any,
      { page?: number; limit?: number } | void
    >({
      query: (params) =>
        `api/admin/reviews?page=${params?.page || 1}&limit=${
          params?.limit || 20
        }`,
      providesTags: ["Reviews"],
    }),

    adminDeleteReview: builder.mutation<any, string>({
      query: (id) => ({
        url: `api/admin/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Reviews", "Products", "Admin"],
    }),

    // Order Management
    getAdminOrders: builder.query<
      any,
      {
        page?: number;
        limit?: number;
        status?: string;
        payment_status?: string;
      }
    >({
      query: ({
        page = 1,
        limit = 20,
        status = "",
        payment_status = "",
      } = {}) =>
        `api/admin/orders?page=${page}&limit=${limit}&status=${status}&payment_status=${payment_status}`,
      providesTags: ["Orders"],
    }),

    getAdminOrderById: builder.query<any, string>({
      query: (id) => `api/admin/orders/${id}`,
      providesTags: ["Orders"],
    }),

    updateOrderStatus: builder.mutation<
      any,
      { id: string; status?: string; paymentStatus?: string }
    >({
      query: ({ id, status, paymentStatus }) => ({
        url: `api/admin/orders/${id}`,
        method: "PUT",
        body: { status, paymentStatus },
      }),
      invalidatesTags: ["Orders", "Admin"],
    }),

    updateOrderTracking: builder.mutation<
      any,
      { id: string; tracking_number: string }
    >({
      query: ({ id, tracking_number }) => ({
        url: `api/admin/orders/${id}/tracking`,
        method: "PUT",
        body: { tracking_number },
      }),
      invalidatesTags: ["Orders"],
    }),

    // Legacy Support
    showStats: builder.query({
      query: ({ page, limit }) => ({
        url: "api/adminRoute/stats",
        params: { page, limit },
      }),
      providesTags: ["Admin"],
    }),
    getOrder: builder.query({
      query: (id) => `api/adminRoute/order/${id}`,
      providesTags: ["Admin"],
    }),
    updateAdmin: builder.mutation({
      query: ({ data }) => ({
        url: `api/adminRoute`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),
    deleteAdmin: builder.mutation({
      query: () => ({
        url: `api/adminRoute`,
        method: "DELETE",
      }),
      invalidatesTags: ["Admin"],
    }),
    createAdmin: builder.mutation({
      query: (data) => ({
        url: `api/adminRoute`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Admin"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetRevenueAnalyticsQuery,
  useGetOrderAnalyticsQuery,
  useGetTopProductsQuery,
  useGetAdminUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useGetAdminProductsQuery,
  useGetLowStockProductsQuery,
  useUpdateProductStockMutation,
  useGetAdminReviewsQuery,
  useAdminDeleteReviewMutation,
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useUpdateOrderStatusMutation,
  useUpdateOrderTrackingMutation,
  // Legacy export
  useCreateAdminMutation,
  useDeleteAdminMutation,
  useUpdateAdminMutation,
  useGetOrderQuery,
  useShowStatsQuery,
} = adminApi;
