"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CreditCard, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { clearCart } from "@/redux/slices/cartSlice";
import type { RootState } from "@/redux/store/store";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EmtyCart from "@/components/EmtyCart";
import OrderItem from "@/components/OrderItem";
import {
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  usePlaceCodOrderMutation,
  useVerifyCodPaymentMutation,
} from "@/redux/fetchApi/paymentApi";
import { useUpdateAddressMutation } from "@/redux/fetchApi/userApi";
import { SHIPPING_METHODS, PAYMENT_METHODS } from "@/lib/Constants";
import { useCreateOrderMutation } from "@/redux/fetchApi/orderApi";
import { Address } from "@/types";
import {
  useDeleteCartMutation,
  useRemoveCartMutation,
} from "@/redux/fetchApi/cartApi";

export default function CheckoutPage() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const cart = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  const [createPayment, { isLoading: isCreatePaymentLoading }] =
    useCreatePaymentMutation();

  const [verifyPayment, { isLoading: isVerifyPaymentLoading }] =
    useVerifyPaymentMutation();

  const [placeCodOrder, { isLoading: isPlaceCodOrderLoading }] =
    usePlaceCodOrderMutation();

  const [verifyCodPayment, { isLoading: isVerifyCodPaymentLoading }] =
    useVerifyCodPaymentMutation();

  const [updateAddress, { isLoading: isAddAddressLoading }] =
    useUpdateAddressMutation();

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
  const [email, setEmail] = useState(currentUser?.email || "");
  const [name, setName] = useState(currentUser?.name || "");
  const [error, setError] = useState("");
  const [addressSaved, setAddressSaved] = useState(false);

  // Calculate totals
  const subtotal = cart.totalAmount;
  const shipping =
    SHIPPING_METHODS.find((method) => method.id === shippingMethod)?.price || 0;
  const discount = discountApplied ? subtotal * 0.1 : 0; // 10% discount
  const tax = (subtotal - discount) * 0.08; // 8% tax
  const total = subtotal + shipping + tax - discount;

  useEffect(() => {
    if (currentUser) {
      setEmail(currentUser.email || "");
      setName(currentUser.name || "");

      const defaultAddress = currentUser.addresses?.find(
        (addr) => addr.isDefault
      );
      if (defaultAddress && currentUser.addresses?.length > 0) {
        setUseExistingAddress(true);
        setSelectedAddressId(defaultAddress._id || "");
        handleAddressSelect(defaultAddress._id || "");
      }
    }
  }, [currentUser]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    if (currentUser) {
      const selected = currentUser.addresses.find(
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
        setAddressSaved(true);
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
      if (!currentUser?._id) {
        throw new Error("No authenticated user found");
      }

      if (!useExistingAddress) {
        const newAddress = {
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          zipCode: addressData.zipCode,
          country: addressData.country || "India",
          isDefault: !currentUser.addresses?.length,
        };

        const result = await updateAddress(newAddress).unwrap();

        if (result?.user?.addresses) {
          const addedAddress =
            result.user.addresses[result.user.addresses.length - 1];
          setSelectedAddressId(addedAddress._id);
        }

        setAddressSaved(true);
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

      const orderResult = await createPayment({ amount: total }).unwrap();
      const { order_id, amount } = orderResult;

      const orderItems = cart.items.map((item: any) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const orderData = await createOrder({
        items: orderItems,
        shippingAddress: useExistingAddress
          ? currentUser?.addresses.find(
              (addr: Address) => addr._id === selectedAddressId
            )
          : addressData,
        paymentMethod: "razorpay",
      }).unwrap();

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
        ? currentUser?.addresses.find((addr) => addr._id === selectedAddressId)
        : addressData;

      const result = await placeCodOrder({
        items: orderItems,
        shippingAddress,
      }).unwrap();

      if (result.error) {
        setError(result.error);
        return;
      }

      dispatch(clearCart());
      await removeCart({});
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

    // Process payment based on method
    if (paymentMethod === "razorpay") {
      await handleRazorpayPayment();
    } else if (paymentMethod === "cod") {
      await handleCODOrder();
    }
  };

  if (cart.items.length === 0) {
    return <EmtyCart />;
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link
            href="/products"
            className="flex items-center gap-2 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Shopping
          </Link>
        </div>
      </header>

      <main className="container max-w-6xl py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <Alert variant="destructive" className="">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
                {(currentUser?.addresses?.length ?? 0) > 0 && (
                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="useExistingAddress"
                      checked={useExistingAddress}
                      onCheckedChange={(checked) => {
                        setUseExistingAddress(checked === true);
                        if (checked === false) {
                          setAddressSaved(false);
                        }
                      }}
                    />
                    <label
                      htmlFor="useExistingAddress"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Use saved address
                    </label>
                  </div>
                )}
              </CardHeader>
              <CardContent className="grid gap-4">
                {useExistingAddress &&
                (currentUser?.addresses?.length ?? 0) > 0 ? (
                  <div className="grid gap-2">
                    <Label htmlFor="savedAddress">Select Address</Label>
                    <Select
                      value={selectedAddressId}
                      onValueChange={handleAddressSelect}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an address" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentUser?.addresses.map((address: Address) => (
                          <SelectItem
                            key={address._id}
                            value={address._id || ""}
                          >
                            {address.street}, {address.city}, {address.state},{" "}
                            {address.zipCode}
                            {address.isDefault && " (Default)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={addressData.street}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            street: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={addressData.city}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              city: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={addressData.state}
                          onChange={(e) =>
                            setAddressData({
                              ...addressData,
                              state: e.target.value,
                            })
                          }
                          required
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input
                        id="zip"
                        value={addressData.zipCode}
                        onChange={(e) =>
                          setAddressData({
                            ...addressData,
                            zipCode: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Rest of the checkout form remains the same */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue={shippingMethod}
                  onValueChange={setShippingMethod}
                  className="grid gap-4"
                >
                  {SHIPPING_METHODS.map((method) => (
                    <Label
                      key={method.id}
                      htmlFor={method.id}
                      className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:border-primary"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div>
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {method.description}
                          </div>
                        </div>
                      </div>
                      <div className="font-medium">
                        {method.price === 0 ? "Free" : `₹${method.price}`}
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  defaultValue={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="grid gap-4"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <Label
                      key={method.id}
                      htmlFor={`payment-${method.id}`}
                      className="flex cursor-pointer items-center justify-between rounded-lg border p-4 [&:has(:checked)]:border-primary"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem
                          value={method.id}
                          id={`payment-${method.id}`}
                        />
                        <div className="flex items-center gap-2">
                          <method.icon className="h-4 w-4" />
                          <div className="font-medium">{method.name}</div>
                        </div>
                      </div>
                    </Label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

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

          {/* Order Summary */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <OrderItem cart={cart} />
                <Separator />

                {/* Discount Code */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleApplyDiscount}
                    disabled={discountApplied}
                  >
                    Apply
                  </Button>
                </div>

                {/* Summary */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? "Free" : `₹${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {discountApplied && (
                    <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                      <span>Discount (10%)</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span>Tax (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
