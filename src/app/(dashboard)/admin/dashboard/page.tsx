"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  Clock,
  Calendar,
  Star,
  RefreshCw,
  Plus,
  Search,
  Eye,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Truck,
  TrendingUp,
  Filter,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
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
  useUpdateOrderStatusMutation,
  useUpdateOrderTrackingMutation,
} from "@/redux/fetchApi/adminApi";

export default function AdminDashboardPage() {
  const router = useRouter();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState("overview");

  // Filter States
  const [revenuePeriod, setRevenuePeriod] = useState<"daily" | "weekly" | "monthly">("monthly");
  
  // Users state
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [roleModalUser, setRoleModalUser] = useState<any>(null);
  const [newRole, setNewRole] = useState<"user" | "admin">("user");

  // Orders state
  const [orderPage, setOrderPage] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [statusModalOrder, setStatusModalOrder] = useState<any>(null);
  const [newOrderStatus, setNewOrderStatus] = useState<string>("");
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>("");
  const [trackingModalOrder, setTrackingModalOrder] = useState<any>(null);
  const [trackingNumberInput, setTrackingNumberInput] = useState("");

  // Products state
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [editingStockProduct, setEditingStockProduct] = useState<any>(null);
  const [stockInputVal, setStockInputVal] = useState<number>(0);

  // Reviews state
  const [reviewPage, setReviewPage] = useState(1);

  // RTK Queries
  const { data: dashboardData, isLoading: dashLoading, refetch: refetchDash } = useGetDashboardQuery();
  const { data: revenueData, isLoading: revLoading } = useGetRevenueAnalyticsQuery({ period: revenuePeriod });
  const { data: orderAnalyticsData } = useGetOrderAnalyticsQuery();
  const { data: topProductsData } = useGetTopProductsQuery({ limit: 5 });

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetAdminUsersQuery({
    page: userPage,
    limit: 10,
    search: userSearch,
  });

  const { data: userDetailData, isLoading: userDetailLoading } = useGetUserByIdQuery(selectedUserId || "", {
    skip: !selectedUserId,
  });

  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useGetAdminProductsQuery({
    page: productPage,
    limit: 10,
    search: productSearch,
  });

  const { data: lowStockData } = useGetLowStockProductsQuery({ threshold: 5 });

  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useGetAdminOrdersQuery({
    page: orderPage,
    limit: 10,
    status: orderStatusFilter === "all" ? "" : orderStatusFilter,
    payment_status: paymentStatusFilter === "all" ? "" : paymentStatusFilter,
  });

  const { data: reviewsData, isLoading: reviewsLoading, refetch: refetchReviews } = useGetAdminReviewsQuery({
    page: reviewPage,
    limit: 10,
  });

  // RTK Mutations
  const [updateUserRole, { isLoading: updatingRole }] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: deletingUser }] = useDeleteUserMutation();
  const [updateProductStock, { isLoading: updatingStock }] = useUpdateProductStockMutation();
  const [adminDeleteReview, { isLoading: deletingReview }] = useAdminDeleteReviewMutation();
  const [updateOrderStatus, { isLoading: updatingOrderStatus }] = useUpdateOrderStatusMutation();
  const [updateOrderTracking, { isLoading: updatingTracking }] = useUpdateOrderTrackingMutation();

  // Handlers
  const handleRoleUpdate = async () => {
    if (!roleModalUser) return;
    try {
      const res = await updateUserRole({ id: roleModalUser.id, role: newRole }).unwrap();
      toast.success(res.message || "User role updated successfully");
      setRoleModalUser(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update user role");
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`Are you sure you want to delete user "${user.name}"?`)) return;
    try {
      const res = await deleteUser(user.id).unwrap();
      toast.success(res.message || "User deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete user");
    }
  };

  const handleSaveStock = async () => {
    if (!editingStockProduct) return;
    try {
      const res = await updateProductStock({
        id: editingStockProduct.id,
        stock: stockInputVal,
      }).unwrap();
      toast.success(res.message || "Stock updated successfully");
      setEditingStockProduct(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update stock");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? Product ratings will be automatically recalculated.")) return;
    try {
      const res = await adminDeleteReview(reviewId).unwrap();
      toast.success(res.message || "Review deleted successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete review");
    }
  };

  const handleUpdateStatusSubmit = async () => {
    if (!statusModalOrder) return;
    try {
      const res = await updateOrderStatus({
        id: statusModalOrder.id,
        status: newOrderStatus,
        paymentStatus: newPaymentStatus,
      }).unwrap();
      toast.success(res.message || "Order updated successfully");
      setStatusModalOrder(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update order");
    }
  };

  const handleTrackingSubmit = async () => {
    if (!trackingModalOrder) return;
    try {
      const res = await updateOrderTracking({
        id: trackingModalOrder.id,
        tracking_number: trackingNumberInput,
      }).unwrap();
      toast.success(res.message || "Tracking number updated successfully");
      setTrackingModalOrder(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update tracking number");
    }
  };

  const stats = dashboardData?.dashboard || {
    total_users: 0,
    total_products: 0,
    total_orders: 0,
    total_revenue: 0,
    pending_orders: 0,
    today_orders: 0,
    low_stock_products: 0,
    total_reviews: 0,
  };

  // Utility badge styles
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">Delivered</Badge>;
      case "shipped":
        return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30">Shipped</Badge>;
      case "processing":
        return <Badge className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30">Processing</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">Pending</Badge>;
      case "cancelled":
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <Badge className="bg-emerald-600 text-white font-medium">Paid</Badge>;
      case "pending":
        return <Badge className="bg-amber-500 text-white font-medium">Pending</Badge>;
      case "failed":
        return <Badge className="bg-rose-600 text-white font-medium">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Admin Control Center
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Mongoose Sync
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time ecommerce business performance, users, inventory & orders
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchDash();
              refetchUsers();
              refetchProducts();
              refetchOrders();
              refetchReviews();
              toast.info("Refreshed all admin data");
            }}
            className="flex items-center gap-2 border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            onClick={() => router.push("/admin/product")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* 8 Primary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total Revenue */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Revenue
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <IndianRupee className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">
              ₹{dashLoading ? "..." : stats.total_revenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              Completed payments sum
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Orders
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">
              {dashLoading ? "..." : stats.total_orders}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-blue-500" />
              {stats.today_orders} orders placed today
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Products
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Package className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">
              {dashLoading ? "..." : stats.total_products}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              {stats.low_stock_products} low stock items
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Registered Users
            </CardTitle>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Users className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">
              {dashLoading ? "..." : stats.total_users}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <Star className="h-3.5 w-3.5 text-yellow-500" />
              {stats.total_reviews} reviews submitted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Feature Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 flex gap-2">
          <TabsTrigger value="overview" className="rounded-lg font-medium px-4 py-2 text-sm">
            Overview & Analytics
          </TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg font-medium px-4 py-2 text-sm relative">
            Orders
            {stats.pending_orders > 0 && (
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                {stats.pending_orders}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg font-medium px-4 py-2 text-sm">
            Users Management
          </TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg font-medium px-4 py-2 text-sm relative">
            Inventory & Stock
            {stats.low_stock_products > 0 && (
              <span className="ml-2 px-1.5 py-0.2 rounded-full text-[10px] bg-rose-500 text-white font-bold">
                {stats.low_stock_products}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg font-medium px-4 py-2 text-sm">
            Reviews Moderation
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & ANALYTICS */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Performance Breakdown */}
            <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Revenue Analytics</CardTitle>
                  <CardDescription>Track sales performance over custom time periods</CardDescription>
                </div>
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg gap-1">
                  {(["daily", "weekly", "monthly"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setRevenuePeriod(p)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${
                        revenuePeriod === p
                          ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                {revLoading ? (
                  <div className="py-12 text-center text-slate-400">Loading revenue analytics...</div>
                ) : revenueData?.analytics?.length > 0 ? (
                  <div className="space-y-4">
                    {revenueData.analytics.map((item: any) => {
                      const maxRev = Math.max(...revenueData.analytics.map((a: any) => a.revenue || 1));
                      const percent = Math.round((item.revenue / maxRev) * 100);
                      return (
                        <div key={item.period} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.period}</span>
                            <span className="text-slate-500">
                              {item.order_count} orders | ₹{item.revenue.toLocaleString()} (Paid: ₹{item.paid_revenue.toLocaleString()})
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${percent}%` }}
                              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">No revenue data available for this period.</div>
                )}
              </CardContent>
            </Card>

            {/* Order Status Breakdown */}
            <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Order Status Distribution</CardTitle>
                <CardDescription>Breakdown by current order state</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {orderAnalyticsData?.analytics?.status_breakdown?.map((st: any) => (
                  <div key={st.status} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(st.status)}
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{st.count} orders</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Top Selling Products */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Top Selling Products</CardTitle>
              <CardDescription>Best sellers based on total items sold in orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Total Sold</TableHead>
                    <TableHead className="text-right">Total Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProductsData?.products?.length > 0 ? (
                    topProductsData.products.map((prod: any) => (
                      <TableRow key={prod.id}>
                        <TableCell className="font-medium flex items-center gap-3">
                          {prod.image ? (
                            <img src={prod.image} alt={prod.title} className="w-10 h-10 object-cover rounded-lg border" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                              <Package className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <span className="truncate max-w-xs">{prod.title}</span>
                        </TableCell>
                        <TableCell>₹{prod.price}</TableCell>
                        <TableCell>
                          <Badge variant={prod.stock <= 5 ? "destructive" : "outline"}>
                            {prod.stock} left
                          </Badge>
                        </TableCell>
                        <TableCell className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          {prod.rating_rate} ({prod.rating_count})
                        </TableCell>
                        <TableCell className="font-bold text-blue-600 dark:text-blue-400">{prod.total_sold} units</TableCell>
                        <TableCell className="text-right font-bold">₹{prod.total_revenue?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-slate-400">
                        No product sales recorded yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ORDERS MANAGEMENT */}
        <TabsContent value="orders" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Orders Management</CardTitle>
                <CardDescription>View, update order statuses, and set shipping tracking info</CardDescription>
              </div>

              {/* Status & Payment Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Status:</span>
                  <Select value={orderStatusFilter} onValueChange={(val) => { setOrderStatusFilter(val); setOrderPage(1); }}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Payment:</span>
                  <Select value={paymentStatusFilter} onValueChange={(val) => { setPaymentStatusFilter(val); setOrderPage(1); }}>
                    <SelectTrigger className="w-[140px] h-9">
                      <SelectValue placeholder="All Payments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Payments</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {ordersLoading ? (
                <div className="py-12 text-center text-slate-400">Loading orders...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Tracking #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordersData?.orders?.length > 0 ? (
                        ordersData.orders.map((ord: any) => (
                          <TableRow key={ord.id}>
                            <TableCell className="font-mono text-xs font-semibold truncate max-w-[120px]">
                              {ord.id}
                            </TableCell>
                            <TableCell>
                              <div className="font-medium text-sm">{ord.user_name}</div>
                              <div className="text-xs text-slate-400">{ord.user_email}</div>
                            </TableCell>
                            <TableCell className="font-bold">₹{ord.total_amount}</TableCell>
                            <TableCell>{getStatusBadge(ord.status)}</TableCell>
                            <TableCell>{getPaymentBadge(ord.payment_status)}</TableCell>
                            <TableCell className="font-mono text-xs">
                              {ord.tracking_number ? (
                                <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                                  <Truck className="w-3 h-3 text-blue-500" />
                                  {ord.tracking_number}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">None</span>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {new Date(ord.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setStatusModalOrder(ord);
                                  setNewOrderStatus(ord.status);
                                  setNewPaymentStatus(ord.payment_status);
                                }}
                              >
                                Edit Status
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setTrackingModalOrder(ord);
                                  setTrackingNumberInput(ord.tracking_number || "");
                                }}
                              >
                                Tracking
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6 text-slate-400">
                            No orders matching the criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination controls */}
                  <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                    <div>
                      Page {ordersData?.pagination?.page || 1} of {ordersData?.pagination?.total_pages || 1} ({ordersData?.pagination?.total || 0} total)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={orderPage <= 1}
                        onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={orderPage >= (ordersData?.pagination?.total_pages || 1)}
                        onClick={() => setOrderPage((p) => p + 1)}
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: USER MANAGEMENT */}
        <TabsContent value="users" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">User Accounts</CardTitle>
                <CardDescription>Manage user roles, inspect customer details, and control permissions</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </CardHeader>

            <CardContent>
              {usersLoading ? (
                <div className="py-12 text-center text-slate-400">Loading users...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Registered</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersData?.users?.length > 0 ? (
                        usersData.users.map((usr: any) => (
                          <TableRow key={usr.id}>
                            <TableCell className="font-semibold">{usr.name}</TableCell>
                            <TableCell className="text-slate-500">{usr.email}</TableCell>
                            <TableCell>
                              {usr.role === "admin" ? (
                                <Badge className="bg-purple-600 text-white flex items-center gap-1 w-fit">
                                  <ShieldCheck className="w-3 h-3" /> Admin
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-slate-600 dark:text-slate-400">
                                  Customer
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {new Date(usr.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedUserId(usr.id)}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" /> View
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => {
                                  setRoleModalUser(usr);
                                  setNewRole(usr.role);
                                }}
                              >
                                <Edit3 className="w-3.5 h-3.5 mr-1" /> Role
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(usr)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-slate-400">
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                    <div>
                      Page {usersData?.pagination?.page || 1} of {usersData?.pagination?.total_pages || 1} ({usersData?.pagination?.total || 0} users)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={userPage <= 1}
                        onClick={() => setUserPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={userPage >= (usersData?.pagination?.total_pages || 1)}
                        onClick={() => setUserPage((p) => p + 1)}
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: INVENTORY & STOCK */}
        <TabsContent value="inventory" className="space-y-6">
          {/* Low Stock Warning Alert */}
          {lowStockData?.products?.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm">
                  Attention Required: {lowStockData.products.length} Products Low in Stock!
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                  Products with stock count equal to or below 5 items require restock.
                </p>
              </div>
            </div>
          )}

          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg font-bold">Product Stock & Inventory</CardTitle>
                <CardDescription>Monitor stock counts, total product sales, and update inventory values</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setProductPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </CardHeader>

            <CardContent>
              {productsLoading ? (
                <div className="py-12 text-center text-slate-400">Loading products...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Total Sold</TableHead>
                        <TableHead>Sales Revenue</TableHead>
                        <TableHead className="text-right">Stock Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productsData?.products?.length > 0 ? (
                        productsData.products.map((prod: any) => (
                          <TableRow key={prod.id}>
                            <TableCell className="font-medium flex items-center gap-3">
                              {prod.image ? (
                                <img src={prod.image} alt={prod.title} className="w-9 h-9 object-cover rounded-lg border" />
                              ) : (
                                <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                  <Package className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                              <span className="truncate max-w-xs">{prod.title}</span>
                            </TableCell>
                            <TableCell className="text-xs text-slate-500 capitalize">{prod.category}</TableCell>
                            <TableCell>₹{prod.price}</TableCell>
                            <TableCell>
                              {prod.stock <= 5 ? (
                                <Badge className="bg-rose-500 text-white font-bold">{prod.stock} Low Stock</Badge>
                              ) : prod.stock <= 10 ? (
                                <Badge className="bg-amber-500 text-white font-bold">{prod.stock} Medium</Badge>
                              ) : (
                                <Badge className="bg-emerald-600 text-white">{prod.stock} In Stock</Badge>
                              )}
                            </TableCell>
                            <TableCell className="font-semibold text-blue-600">{prod.total_sold}</TableCell>
                            <TableCell className="font-bold">₹{prod.total_revenue?.toLocaleString()}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingStockProduct(prod);
                                  setStockInputVal(prod.stock);
                                }}
                              >
                                Quick Edit Stock
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-slate-400">
                            No products found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                    <div>
                      Page {productsData?.pagination?.page || 1} of {productsData?.pagination?.total_pages || 1} ({productsData?.pagination?.total || 0} products)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={productPage <= 1}
                        onClick={() => setProductPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={productPage >= (productsData?.pagination?.total_pages || 1)}
                        onClick={() => setProductPage((p) => p + 1)}
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 5: REVIEWS MODERATION */}
        <TabsContent value="reviews" className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Reviews & Ratings Moderation</CardTitle>
              <CardDescription>
                Review customer feedback. Deleting a review automatically updates product average ratings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="py-12 text-center text-slate-400">Loading reviews...</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Comment</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reviewsData?.reviews?.length > 0 ? (
                        reviewsData.reviews.map((rev: any) => (
                          <TableRow key={rev.id}>
                            <TableCell>
                              <div className="font-semibold text-sm">{rev.user_name}</div>
                              <div className="text-xs text-slate-400">{rev.user_email}</div>
                            </TableCell>
                            <TableCell className="font-medium max-w-xs truncate">
                              {rev.product_title}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < rev.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300 dark:text-slate-700"
                                    }`}
                                  />
                                ))}
                                <span className="text-xs font-bold ml-1">{rev.rating}/5</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-slate-600 dark:text-slate-300 max-w-sm truncate">
                              {rev.comment}
                            </TableCell>
                            <TableCell className="text-xs text-slate-500">
                              {new Date(rev.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteReview(rev.id)}
                                disabled={deletingReview}
                              >
                                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 text-slate-400">
                            No product reviews submitted yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
                    <div>
                      Page {reviewsData?.pagination?.page || 1} of {reviewsData?.pagination?.total_pages || 1} ({reviewsData?.pagination?.total || 0} reviews)
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={reviewPage <= 1}
                        onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                      >
                        <ChevronLeft className="w-4 h-4" /> Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={reviewPage >= (reviewsData?.pagination?.total_pages || 1)}
                        onClick={() => setReviewPage((p) => p + 1)}
                      >
                        Next <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG: EDIT ORDER STATUS */}
      <Dialog open={!!statusModalOrder} onOpenChange={(open) => !open && setStatusModalOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Order ID: <span className="font-mono">{statusModalOrder?.id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Order Fulfillment Status</label>
              <Select value={newOrderStatus} onValueChange={setNewOrderStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold">Payment Status</label>
              <Select value={newPaymentStatus} onValueChange={setNewPaymentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusModalOrder(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatusSubmit} disabled={updatingOrderStatus}>
              {updatingOrderStatus ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: EDIT TRACKING NUMBER */}
      <Dialog open={!!trackingModalOrder} onOpenChange={(open) => !open && setTrackingModalOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Shipment Tracking Number</DialogTitle>
            <DialogDescription>
              Enter tracking number for Order <span className="font-mono">{trackingModalOrder?.id}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-2">
            <label className="text-xs font-semibold">Tracking Number</label>
            <Input
              placeholder="e.g. TRK-9876543210"
              value={trackingNumberInput}
              onChange={(e) => setTrackingNumberInput(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingModalOrder(null)}>
              Cancel
            </Button>
            <Button onClick={handleTrackingSubmit} disabled={updatingTracking}>
              {updatingTracking ? "Saving..." : "Save Tracking"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: UPDATE USER ROLE */}
      <Dialog open={!!roleModalUser} onOpenChange={(open) => !open && setRoleModalUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update User Role</DialogTitle>
            <DialogDescription>
              User: <span className="font-semibold">{roleModalUser?.name}</span> ({roleModalUser?.email})
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2">
            <label className="text-xs font-semibold">System Role</label>
            <Select value={newRole} onValueChange={(val: "user" | "admin") => setNewRole(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Customer (User)</SelectItem>
                <SelectItem value="admin">Administrator (Admin)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-[11px] text-slate-500 mt-1">
              Note: System enforces at most ONE administrator account.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleModalUser(null)}>
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate} disabled={updatingRole}>
              {updatingRole ? "Updating..." : "Update Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: QUICK EDIT STOCK */}
      <Dialog open={!!editingStockProduct} onOpenChange={(open) => !open && setEditingStockProduct(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick Edit Inventory Stock</DialogTitle>
            <DialogDescription>
              Product: <span className="font-semibold">{editingStockProduct?.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2">
            <label className="text-xs font-semibold">Stock Quantity</label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStockInputVal((s) => Math.max(0, s - 1))}
              >
                -
              </Button>
              <Input
                type="number"
                min="0"
                value={stockInputVal}
                onChange={(e) => setStockInputVal(Number(e.target.value))}
                className="text-center font-bold text-lg"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStockInputVal((s) => s + 1)}
              >
                +
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingStockProduct(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveStock} disabled={updatingStock}>
              {updatingStock ? "Saving..." : "Save Inventory"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG: VIEW USER DETAILS */}
      <Dialog open={!!selectedUserId} onOpenChange={(open) => !open && setSelectedUserId(null)}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile & Account Insights</DialogTitle>
          </DialogHeader>

          {userDetailLoading ? (
            <div className="py-8 text-center text-slate-400">Loading user details...</div>
          ) : userDetailData?.user ? (
            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-base">{userDetailData.user.name}</h3>
                  <p className="text-xs text-slate-500">{userDetailData.user.email}</p>
                </div>
                <Badge variant={userDetailData.user.role === "admin" ? "default" : "outline"}>
                  {userDetailData.user.role}
                </Badge>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Total Completed Orders</div>
                  <div className="text-xl font-bold">{userDetailData.user.stats?.total_orders || 0}</div>
                </div>
                <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-900">
                  <div className="text-xs text-slate-400 uppercase font-semibold">Total Amount Spent</div>
                  <div className="text-xl font-bold text-emerald-600">₹{userDetailData.user.stats?.total_spent || 0}</div>
                </div>
              </div>

              {/* Shipping Addresses */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Saved Addresses</h4>
                {userDetailData.user.addresses?.length > 0 ? (
                  <div className="space-y-2">
                    {userDetailData.user.addresses.map((addr: any, idx: number) => (
                      <div key={idx} className="p-2.5 rounded border text-xs bg-slate-50 dark:bg-slate-800">
                        {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}, {addr.country}
                        {addr.isDefault && <Badge className="ml-2 text-[10px]" variant="secondary">Default</Badge>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No saved addresses.</p>
                )}
              </div>

              {/* Recent Orders */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Recent Orders</h4>
                {userDetailData.user.recent_orders?.length > 0 ? (
                  <div className="space-y-2">
                    {userDetailData.user.recent_orders.map((ord: any) => (
                      <div key={ord.id} className="p-2 rounded border text-xs flex justify-between items-center">
                        <div>
                          <span className="font-mono font-semibold">{ord.id}</span>
                          <span className="text-slate-400 ml-2">₹{ord.total_amount}</span>
                        </div>
                        {getStatusBadge(ord.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No orders placed yet.</p>
                )}
              </div>

              {/* Recent Reviews */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Recent Reviews</h4>
                {userDetailData.user.recent_reviews?.length > 0 ? (
                  <div className="space-y-2">
                    {userDetailData.user.recent_reviews.map((rev: any) => (
                      <div key={rev.id} className="p-2 rounded border text-xs">
                        <div className="flex justify-between font-semibold">
                          <span>{rev.product_title}</span>
                          <span className="text-amber-500">★ {rev.rating}/5</span>
                        </div>
                        <p className="text-slate-500 italic mt-0.5">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No reviews written.</p>
                )}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-400">User not found.</div>
          )}

          <DialogFooter>
            <Button onClick={() => setSelectedUserId(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
