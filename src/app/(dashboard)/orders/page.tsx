"use client";

import {
  useGetOrdersQuery,
  useDeleteOrderMutation,
} from "@/redux/fetchApi/orderApi";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";

function Orders() {
  const { data, isLoading, isError } = useGetOrdersQuery({});
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(orderId).unwrap();
        toast.success("Order deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete order");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Alert variant="destructive" className="max-w-md">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to fetch orders. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const orders = data.orders;

  if (!orders || orders.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Orders Found</CardTitle>
            <CardDescription>
              You haven't placed any orders yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/product">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen  py-8">
      <div className="container mx-auto max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Your Orders</CardTitle>
            <CardDescription>
              View and manage all your past orders below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: any) => (
                  <TableRow key={order._id}>
                    <TableCell>
                      <Link
                        href={`/orders/confirmation?id=${order._id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order._id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), "PPP")}
                    </TableCell>
                    <TableCell>{order.paymentMethod}</TableCell>
                    <TableCell className="capitalize">{order.status}</TableCell>
                    <TableCell>₹{order.totalAmount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteOrder(order._id)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Refund Message for Razorpay Orders */}
            {orders.some(
              (order: any) => order.paymentMethod === "razorpay"
            ) && (
              <Alert className="mt-6">
                <AlertTitle>Refund Policy</AlertTitle>
                <AlertDescription>
                  For orders paid via Razorpay, or any online payments refunds
                  will be processed within 4-5 business days. For any issues,
                  please contact our helpline at{" "}
                  <span className="font-semibold">+91-9192-456-7890</span>.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Orders;
