"use client";

import React, { useState, FormEvent } from "react";
import { useCreateAdminMutation } from "@/redux/fetchApi/adminApi"; // Adjust path as needed
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const AdminRegister = () => {
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [createAdmin, { isLoading, isError }] = useCreateAdminMutation();
  const router = useRouter();

  if (status === "authenticated" && session?.user?.role === "admin") {
    router.push("/admin/dashboard");
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const result = await createAdmin({ name, email, password }).unwrap();
      toast.success(result.message || "Admin created successfully");
      setName("");
      setEmail("");
      setPassword("");
      if (session) {
        router.push("/");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      toast.error(
        err?.data?.message || err?.message || "Failed to create admin"
      );
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
          Admin Registration
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Registering..." : "Register Admin"}
          </Button>
        </form>
        {/* {isError && (
          <p className="mt-2 text-center text-sm text-red-600">
            {isError?.error.toString()}
          </p>
        )} */}
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an admin account?{" "}
          <a
            href="/admin/login"
            className="text-indigo-600 hover:underline dark:text-indigo-400"
          >
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default AdminRegister;
