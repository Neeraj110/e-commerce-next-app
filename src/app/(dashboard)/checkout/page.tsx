"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import dynamic from "next/dynamic";
const EmtyCart = dynamic(() => import("@/components/EmtyCart"));
import { SHIPPING_METHODS, PAYMENT_METHODS } from "@/lib/Constants";
import { Address } from "@/types";
import { clearCart } from "@/redux/slices/cartSlice";
import type { RootState } from "@/redux/store/store";
import {
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  usePlaceCodOrderMutation,
} from "@/redux/fetchApi/paymentApi";
import { useAddAddressMutation } from "@/redux/fetchApi/userApi";
import { useCreateOrderMutation } from "@/redux/fetchApi/orderApi";
import { useRemoveCartMutation } from "@/redux/fetchApi/cartApi";

import { Skeleton } from "@/components/ui/skeleton";

const ContactInformation = dynamic(() => import("@/components/ContactInformation").then((mod) => mod.ContactInformation), {
  loading: () => <Skeleton className="h-40 w-full rounded-xl" />,
});
const ShippingAddress = dynamic(() => import("@/components/ShippingAddress").then((mod) => mod.ShippingAddress), {
  loading: () => <Skeleton className="h-64 w-full rounded-xl" />,
});
const ShippingMethod = dynamic(() => import("@/components/ShippingMethod").then((mod) => mod.ShippingMethod), {
  loading: () => <Skeleton className="h-32 w-full rounded-xl" />,
});
const PaymentMethod = dynamic(() => import("@/components/PaymentMethod").then((mod) => mod.PaymentMethod), {
  loading: () => <Skeleton className="h-32 w-full rounded-xl" />,
});
const OrderSummary = dynamic(() => import("@/components/OrderSummary").then((mod) => mod.OrderSummary), {
  loading: () => <Skeleton className="h-[400px] w-full rounded-xl" />,
});

import { useSession } from "next-auth/react";
import { useGetUserQuery } from "@/redux/fetchApi/userApi";
import { OrderLoadingOverlay } from "@/components/OrderLoadingOverlay";

export default function CheckoutPage() {
  const { data: sessionData, status: sessionStatus } = useSession();
  const { data: userData } = useGetUserQuery(undefined, {
    skip: sessionStatus !== "authenticated",
  });
  const { currentUser } = useSelector((state: RootState) => state.user);
  const activeUser = currentUser || userData?.user;

  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  const [createPayment, { isLoading: isCreatePaymentLoading }] =
    useCreatePaymentMutation();
  const [verifyPayment, { isLoading: isVerifyPaymentLoading }] =
    useVerifyPaymentMutation();
  const [placeCodOrder, { isLoading: isPlaceCodOrderLoading }] =
    usePlaceCodOrderMutation();
  const [addAdress, { isLoading: isAddAddressLoading }] =
    useAddAddressMutation();
  const [createOrder, { isLoading: isCreateOrderLoading }] =
    useCreateOrderMutation();
  const [removeCart, { isLoading: isDeleteCartLoading }] =
    useRemoveCartMutation();

  const [isLoading, setIsLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [shippingMethod, setShippingMethod] = useState(SHIPPING_METHODS[0].id);
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].id);
  const [useExistingAddress, setUseExistingAddress] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  const [addressData, setAddressData] = useState<Omit<Address, "_id">>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  });
  const [email, setEmail] = useState(activeUser?.email || sessionData?.user?.email || "");
  const [name, setName] = useState(activeUser?.name || sessionData?.user?.name || "");
  const [error, setError] = useState("");

  const subtotal = cart.totalAmount;
  const shipping =
    SHIPPING_METHODS.find((method) => method.id === shippingMethod)?.price || 0;
  const discount = discountApplied ? subtotal * 0.1 : 0; // 10% discount
  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal + shipping + tax - discount;

  useEffect(() => {
    if (activeUser) {
      setEmail(activeUser.email || sessionData?.user?.email || "");
      setName(activeUser.name || sessionData?.user?.name || "");

      const defaultAddress = activeUser.addresses?.find(
        (addr: Address) => addr.isDefault
      );
      if (defaultAddress && activeUser.addresses?.length > 0) {
        setUseExistingAddress(true);
        setSelectedAddressId(defaultAddress._id || "");
        handleAddressSelect(defaultAddress._id || "");
      }
    } else if (sessionData?.user) {
      setEmail(sessionData.user.email || "");
      setName(sessionData.user.name || "");
    }
  }, [activeUser, sessionData]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (activeUser) {
      const selected = activeUser.addresses?.find(
        (addr: Address) => addr._id === addressId
      );
      if (selected) {
        setAddressData({
          street: selected.street,
          city: selected.city,
          state: selected.state,
          zipCode: selected.zipCode,
          country: selected.country || "India",
        });
      }
    }
  };

  const handleApplyDiscount = () => {
    if (discountCode.toLowerCase() === "save10") {
      setDiscountApplied(true);
      toast.success("Discount code applied successfully");
    } else {
      toast.error("The discount code is invalid or expired.");
    }
  };

  const saveAddress = async () => {
    try {
      setError("");
      if (!activeUser?._id && sessionStatus !== "authenticated") {
        throw new Error("Please login first to place an order");
      }

      if (!useExistingAddress) {
        const newAddress = {
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          country: addressData.country || "India",
          isDefault: !activeUser?.addresses?.length,
        };

        const result = await addAdress(newAddress).unwrap();

        if (result?.user?.addresses) {
          const addedAddress =
            result.user.addresses[result.user.addresses.length - 1];
          setSelectedAddressId(addedAddress._id);
        }

        toast.success("Address saved successfully");
        return true;
      }

      return true;
    } catch (error: any) {
      setError(error.message || "Failed to save address");
      return false;
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      setIsLoading(true);
      setError("");

      const addressSuccess = await saveAddress();
      if (!addressSuccess) return;

      const orderItems = cart.items.map((item: any) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderData = await createOrder({
        items: orderItems,
        shippingAddress: useExistingAddress
          ? activeUser?.addresses?.find(
              (addr: Address) => addr._id === selectedAddressId
            )
          : addressData,
        paymentMethod: "razorpay",
      }).unwrap();

      const orderResult = await createPayment({ orderId: orderData._id }).unwrap();
      const { order_id, amount } = orderResult;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: "INR",
        name: "EASYCART",
        description: "Payment for your order",
        order_id,
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: orderData._id,
            }).unwrap();

            try {
              await removeCart({}).unwrap();
            } catch {
              // Cart already cleared by backend order creation
            }
            dispatch(clearCart());
            router.push(`/orders/confirmation?id=${orderData._id}`);
          } catch (error: any) {
            setError(error.message || "Payment verification failed");
            setIsLoading(false);
          }
        },
        prefill: {
          name: name,
          email: email,
        },
        theme: {
          color: "#010c1d",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      setError(error.message || "Payment processing failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCODOrder = async () => {
    try {
      setIsLoading(true);
      setError("");

      const addressSuccess = await saveAddress();
      if (!addressSuccess) return;

      const orderItems = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const shippingAddress = useExistingAddress
        ? activeUser?.addresses?.find((addr: Address) => addr._id === selectedAddressId)
        : addressData;

      const result = await placeCodOrder({
        items: orderItems,
        shippingAddress,
      }).unwrap();

      if (result.error) {
        setError(result.error);
        return;
      }

      try {
        await removeCart({}).unwrap();
      } catch {
        // Cart already cleared by backend order creation
      }
      dispatch(clearCart());
      router.push(`/orders/confirmation?id=${result.order._id}`);
    } catch (error: any) {
      setError(error.message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    if (useExistingAddress && !selectedAddressId) {
      setError("Please select a saved address");
      return;
    }

    if (
      !useExistingAddress &&
      (!addressData.street ||
        !addressData.city ||
        !addressData.state ||
        !addressData.zipCode)
    ) {
      setError("Please fill all address fields");
      return;
    }

    if (paymentMethod === "razorpay") {
      await handleRazorpayPayment();
    } else if (paymentMethod === "cod") {
      await handleCODOrder();
    }
  };

  const isProcessingOrder =
    isLoading ||
    isCreatePaymentLoading ||
    isVerifyPaymentLoading ||
    isPlaceCodOrderLoading ||
    isAddAddressLoading ||
    isCreateOrderLoading;

  if (cart.items.length === 0) {
    return <EmtyCart />;
  }

  return (
    <div className="min-h-screen">
      <OrderLoadingOverlay
        isVisible={isProcessingOrder}
        paymentMethod={paymentMethod}
      />
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link
            href="/product"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping
          </Link>
        </div>
      </header>

      <main className="container max-w-6xl py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive" className="">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <ContactInformation email={email} onEmailChange={setEmail} />

            <ShippingAddress
              useExistingAddress={useExistingAddress}
              onUseExistingAddressChange={setUseExistingAddress}
              selectedAddressId={selectedAddressId}
              onAddressSelect={handleAddressSelect}
              addressData={addressData}
              onAddressDataChange={setAddressData}
              currentUser={currentUser}
            />

            <ShippingMethod
              shippingMethod={shippingMethod}
              onShippingMethodChange={setShippingMethod}
              shippingMethods={SHIPPING_METHODS}
            />

            <PaymentMethod
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              paymentMethods={PAYMENT_METHODS}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={
                isLoading ||
                isCreatePaymentLoading ||
                isVerifyPaymentLoading ||
                isPlaceCodOrderLoading ||
                isAddAddressLoading
              }
            >
              {isLoading ||
              isCreatePaymentLoading ||
              isVerifyPaymentLoading ||
              isPlaceCodOrderLoading ||
              isAddAddressLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${total.toFixed(2)}`
              )}
            </Button>
          </form>

          <div className="space-y-8">
            <OrderSummary
              cart={cart}
              discountCode={discountCode}
              onDiscountCodeChange={setDiscountCode}
              onApplyDiscount={handleApplyDiscount}
              discountApplied={discountApplied}
              subtotal={subtotal}
              shipping={shipping}
              discount={discount}
              tax={tax}
              total={total}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
