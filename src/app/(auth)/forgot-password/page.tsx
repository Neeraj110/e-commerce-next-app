"use client";
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, KeyRound, Lock, Mail, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await axios.put("/api/auth/reset-password", formData);
      if (data.error) {
        setError(data.error);
        toast.error(data.error);
        return;
      }
      toast.success("Password changed successfully");
      router.push("/login");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error ||
          "An error occurred while resetting the password"
        : "An error occurred while resetting the password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[calc(100vh-9rem)] bg-muted/30 px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-lg border bg-background shadow-sm md:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" />
            EazyCart
          </Link>
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Reset your password</h1>
            <p className="text-sm leading-6 text-primary-foreground/80">
              Choose a new password and return to your account.
            </p>
          </div>
        </section>

        <div className="p-6 sm:p-8 md:p-10">
          <div className="mb-8 space-y-2">
            <Link
              href="/"
              className="mb-6 flex items-center gap-2 text-lg font-semibold text-primary md:hidden"
            >
              <ShoppingBag className="h-5 w-5" />
              EazyCart
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
            <h2 className="text-2xl font-semibold tracking-tight">
              Change password
            </h2>
            <p className="text-sm text-muted-foreground">
              Enter your account email and set a new password.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="h-11 pl-10"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="h-11 pl-10"
                  placeholder="Enter a new password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full"
            >
              <KeyRound className="h-4 w-4" />
              {loading ? "Changing password..." : "Change password"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
