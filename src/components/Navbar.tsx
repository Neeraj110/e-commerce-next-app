"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Search, User, Menu } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dynamic from "next/dynamic";

const Cart = dynamic(() => import("./Cart"), { ssr: false });

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-indigo-600">
          ShopLogo
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Icons & User Menu */}
        <div className="flex items-center space-x-4">
          {/* Cart */}
          <Cart />

          {/* User Menu */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="rounded-full"
                      width={32}
                      height={32}
                      priority
                    />
                  ) : (
                    <User className="h-7 w-7" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {session.user?.name || session.user?.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button variant="ghost" size="sm" className="flex items-center">
                <User className="h-5 w-5 mr-2" /> Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
