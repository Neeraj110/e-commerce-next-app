"use client";

import { useState, useCallback } from "react";
import {
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteAddressMutation,
  useUpdateAddressMutation,
  useAddAddressMutation,
} from "@/redux/fetchApi/userApi";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Image from "next/image";

// Address schema for validation
const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
});

type AddressFormData = z.infer<typeof addressSchema>;

function Profile() {
  // All hooks declared at the top level
  const { data, isLoading, error } = useGetUserQuery({});
  const [updateUser] = useUpdateUserMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddress }] =
    useUpdateAddressMutation();
  const [addAddress, { isLoading: isAddingAddress }] = useAddAddressMutation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState<string | null>(null);
  const [isAddAddressDialogOpen, setIsAddAddressDialogOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", email: "" });

  const addressForm = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "",
    },
  });

  const user = data?.user || {};

  // Handlers with useCallback
  const handleEditProfileToggle = useCallback(() => {
    if (!isEditingProfile) {
      setUserData({ name: user.name || "", email: user.email || "" });
    }
    setIsEditingProfile((prev) => !prev);
  }, [isEditingProfile, user]);

  const handleUpdateProfile = useCallback(async () => {
    try {
      await updateUser({ data: userData }).unwrap();
      toast.success("Profile updated successfully");
      setIsEditingProfile(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Failed to update user:", error);
    }
  }, [updateUser, userData]);

  const handleDeleteAddress = useCallback(
    async (addressId: string) => {
      if (!confirm("Are you sure you want to delete this address?")) return;
      try {
        await deleteAddress(addressId).unwrap();
        toast.success("Address deleted successfully");
      } catch (error) {
        toast.error("Failed to delete address");
        console.error("Failed to delete address:", error);
      }
    },
    [deleteAddress]
  );

  const handleUpdateAddress = useCallback(
    async (addressId: string, values: AddressFormData) => {
      try {
        await updateAddress({ id: addressId, data: values }).unwrap();
        toast.success("Address updated successfully");
        setIsEditingAddress(null);
        addressForm.reset();
      } catch (error) {
        toast.error("Failed to update address");
        console.error("Failed to update address:", error);
      }
    },
    [updateAddress, addressForm]
  );

  const handleAddAddress = useCallback(
    async (values: AddressFormData) => {
      try {
        await addAddress(values).unwrap();
        toast.success("Address added successfully");
        setIsAddAddressDialogOpen(false);
        addressForm.reset();
      } catch (error) {
        toast.error("Failed to add address");
        console.error("Failed to add address:", error);
      }
    },
    [addAddress, addressForm]
  );

  const openEditAddress = useCallback(
    (address: any) => {
      setIsEditingAddress(address._id);
      addressForm.reset({
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        zipCode: address.zipCode || "",
        country: address.country || "",
      });
    },
    [addressForm]
  );

  // Early returns after all hooks
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error loading profile
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-4">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user.name || "User"}
                    className="rounded-full"
                    width={32}
                    height={32}
                    priority
                  />
                ) : (
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${
                        user?.name || "User"
                      }`}
                    />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>
                    Manage your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditingProfile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Name</Label>
                      <p className="text-lg">{user?.name || "N/A"}</p>
                    </div>
                    <Badge variant="secondary">{user?.role || "User"}</Badge>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-lg">{user?.email || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Account Created</Label>
                    <p>
                      {user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={userData.name}
                      onChange={(e) =>
                        setUserData({ ...userData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={userData.email}
                      onChange={(e) =>
                        setUserData({ ...userData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              {!isEditingProfile ? (
                <Button onClick={handleEditProfileToggle}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={handleUpdateProfile}>Save Changes</Button>
                  <Button variant="outline" onClick={handleEditProfileToggle}>
                    Cancel
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Saved Addresses</CardTitle>
                  <CardDescription>
                    Manage your delivery addresses
                  </CardDescription>
                </div>
                <Dialog
                  open={isAddAddressDialogOpen}
                  onOpenChange={setIsAddAddressDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" /> Add Address
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={addressForm.handleSubmit(handleAddAddress)}
                      className="space-y-4"
                    >
                      {["street", "city", "state", "zipCode", "country"].map(
                        (field) => (
                          <div key={field} className="space-y-2">
                            <Label htmlFor={field}>
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                            </Label>
                            <Input
                              id={field}
                              {...addressForm.register(
                                field as keyof AddressFormData
                              )}
                            />
                            {addressForm.formState.errors[
                              field as keyof AddressFormData
                            ]?.message && (
                              <p className="text-sm text-red-500">
                                {
                                  addressForm.formState.errors[
                                    field as keyof AddressFormData
                                  ]?.message
                                }
                              </p>
                            )}
                          </div>
                        )
                      )}
                      <Button type="submit" disabled={isAddingAddress}>
                        {isAddingAddress ? "Adding..." : "Add Address"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {Array.isArray(user?.addresses) &&
                  user.addresses.length > 0 ? (
                    user.addresses.map((address: any, index: number) => (
                      <div
                        key={address._id || index}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg gap-4"
                      >
                        {isEditingAddress === address._id ? (
                          <form
                            onSubmit={addressForm.handleSubmit((values) =>
                              handleUpdateAddress(address._id, values)
                            )}
                            className="space-y-4 w-full"
                          >
                            {[
                              "street",
                              "city",
                              "state",
                              "zipCode",
                              "country",
                            ].map((field) => (
                              <div key={field} className="space-y-2">
                                <Label htmlFor={field}>
                                  {field.charAt(0).toUpperCase() +
                                    field.slice(1)}
                                </Label>
                                <Input
                                  id={field}
                                  {...addressForm.register(
                                    field as keyof AddressFormData
                                  )}
                                />
                                {addressForm.formState.errors[
                                  field as keyof AddressFormData
                                ]?.message && (
                                  <p className="text-sm text-red-500">
                                    {
                                      addressForm.formState.errors[
                                        field as keyof AddressFormData
                                      ]?.message
                                    }
                                  </p>
                                )}
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <Button
                                type="submit"
                                disabled={isUpdatingAddress}
                              >
                                {isUpdatingAddress ? "Updating..." : "Save"}
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setIsEditingAddress(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <>
                            <div>
                              <p className="font-medium">
                                Address #{index + 1}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {address.street}, {address.city},{" "}
                                {address.state}, {address.zipCode},{" "}
                                {address.country}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditAddress(address)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteAddress(address._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground">
                      No addresses saved yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Profile;
