"use client";

import { useGetOrderByIdQuery } from "@/redux/fetchApi/orderApi";
import { useSearchParams } from "next/navigation";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { toast } from "sonner";

function OrderConfrim() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const { data, isLoading, isError } = useGetOrderByIdQuery(id);

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
            Failed to fetch order details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const order = data.order;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Order Confirmation</CardTitle>
            <CardDescription>Order ID: {order._id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="flex space-x-2 flex-col">
              <span className="text-sm font-medium text-gray-500">
                Placed on
              </span>{" "}
              {format(new Date(order.createdAt), "PPP 'at' p")}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Payment Method
                </p>
                <p className="text-lg">{order.paymentMethod}</p>
                <p className="text-sm text-gray-500">
                  Status: {order.paymentStatus}
                </p>
                {order.paymentMethod === "COD" && (
                  <p className="">
                    COD Verified: {order.codVerified ? "Yes" : "No"}
                  </p>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Shipping Status
                </p>
                <p className="text-lg capitalize">{order.status}</p>
                {order.trackingNumber && (
                  <p className="mt-3">Tracking: {order.trackingNumber}</p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <h3 className="text-lg font-semibold">Shipping Address</h3>
              <p className="text-sm">
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} {order.shippingAddress.zipCode},{" "}
                {order.shippingAddress.country}
              </p>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="text-lg font-semibold">Items</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item: any) => (
                    <TableRow key={item._id}>
                      <TableCell>{item.product}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>₹{item.price.toFixed(2)}</TableCell>
                      <TableCell>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Total Amount */}
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">
                  Total Amount
                </p>
                <p className="text-xl font-bold">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="secondary" asChild>
              <Link href="/product">Continue Shopping</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/orders">View All Orders</Link>
            </Button>
            {order.trackingNumber && (
              <Button
                onClick={() =>
                  toast.warning("Track Order Feature is not implemented yet.")
                }
              >
                Track Your Order
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default OrderConfrim;