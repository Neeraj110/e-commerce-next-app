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

function OrderConfirm() {
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
      <div className="flex h-screen items-center justify-center px-4">
        <Alert variant="destructive" className="w-full max-w-md">
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
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">
              Order Confirmation
            </CardTitle>
            <CardDescription className="text-sm">
              Order ID: {order._id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col space-y-1">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                Placed on
              </span>
              <span className="text-sm sm:text-base">
                {format(new Date(order.createdAt), "PPP 'at' p")}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div className="space-y-1">
                <p className="font-medium text-gray-500">Payment Method</p>
                <p className="text-base sm:text-lg">{order.paymentMethod}</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  Status: {order.paymentStatus}
                </p>
                {order.paymentMethod === "COD" && (
                  <p className="text-xs sm:text-sm">
                    COD Verified: {order.codVerified ? "Yes" : "No"}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-medium text-gray-500">Shipping Status</p>
                <p className="text-base sm:text-lg capitalize">
                  {order.status}
                </p>
                {order.trackingNumber && (
                  <p className="text-xs sm:text-sm">
                    Tracking: {order.trackingNumber}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold">
                Shipping Address
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed">
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} {order.shippingAddress.zipCode},{" "}
                {order.shippingAddress.country}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold">Items</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">
                        Product
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">Qty</TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Price
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">
                        Total
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item: any) => (
                      <TableRow key={item._id}>
                        <TableCell className="text-xs sm:text-sm">
                          {item.product}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          ₹{item.price.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-end">
              <div className="text-right space-y-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500">
                  Total Amount
                </p>
                <p className="text-lg sm:text-xl font-bold">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-between">
            <Button variant="secondary" asChild className="w-full sm:w-auto">
              <Link href="/product">Continue Shopping</Link>
            </Button>
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/orders">View All Orders</Link>
              </Button>
              {order.trackingNumber && (
                <Button
                  onClick={() =>
                    toast.warning("Track Order Feature is not implemented yet.")
                  }
                  className="w-full sm:w-auto"
                >
                  Track Your Order
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default OrderConfirm;
