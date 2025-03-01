"use client";

import {
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteAddressMutation,
} from "@/redux/fetchApi/userApi";
import React, { useState } from "react";
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
import { Pencil, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

function Profile() {
  const { data, isLoading } = useGetUserQuery({});
  const [updateUser] = useUpdateUserMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
  });
  const user = data?.user || {};

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const handleEditToggle = () => {
    if (!isEditing) {
      setUserData({
        name: user.name,
        email: user.email,
      });
    }
    setIsEditing(!isEditing);
  };

  const handleUpdate = async () => {
    try {
      await updateUser({ data: userData }).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteAddress(addressId).unwrap();
    } catch (error) {
      console.error("Failed to delete address:", error);
    }
  };

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
                <Avatar className="h-20 w-20">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`}
                  />
                  <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>User Profile</CardTitle>
                  <CardDescription>
                    Manage your personal information
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Name</Label>
                      <p className="text-lg">{user?.name}</p>
                    </div>
                    <Badge variant="secondary">{user?.role}</Badge>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="text-lg">{user?.email}</p>
                  </div>
                  <div>
                    <Label>Account Created</Label>
                    <p>{new Date(user?.createdAt).toLocaleDateString()}</p>
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
              {!isEditing ? (
                <Button onClick={handleEditToggle}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={handleUpdate}>Save Changes</Button>
                  <Button variant="outline" onClick={handleEditToggle}>
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
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>Manage your delivery addresses</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {Array.isArray(user?.addresses) &&
                    user?.addresses.map((address: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">Address #{index + 1}</p>
                          <p className="text-sm text-muted-foreground w-[8rem]">
                            {address.street} {address.city}
                            {address.state}
                            {address.zipCode}
                            {address.country}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteAddress(address?._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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
