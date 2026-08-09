"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { Search, User, Menu, X, MessageCircle, Package } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const SearchBox = dynamic(() => import("./SearchBox"), {
  loading: () => <Skeleton className="h-10 w-full max-w-sm rounded-full" />,
});
import { ThemeToggle } from "@/utils/theme-toggle";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const Cart = dynamic(() => import("./Cart"), {
  ssr: false,
  loading: () => <Skeleton className="h-10 w-10 rounded-full" />,
});

const MobileMenu = ({
  isOpen,
  onClose,
  session,
}: {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}) => (
  <div
    className={cn(
      "md:hidden overflow-hidden border-t bg-background transition-all duration-300 ease-in-out",
      isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
    )}
  >
    <div className="space-y-3 px-3 py-3">
      <div className="pb-1">
        <SearchBox onSelect={onClose} />
      </div>

      <Button asChild variant="ghost" className="w-full justify-start">
        <Link href="/product" onClick={onClose}>
          <Package className="h-5 w-5 mr-2" /> Products
        </Link>
      </Button>

      <Button asChild variant="ghost" className="w-full justify-start">
        <Link href="/chatbot" onClick={onClose}>
          <MessageCircle className="h-5 w-5 mr-2" /> AI Assistant
        </Link>
      </Button>

      <div className="flex items-center justify-between rounded-md px-3 py-2">
        <span className="text-sm font-medium text-muted-foreground">Theme</span>
        <ThemeToggle />
      </div>

      {!session ? (
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/login" onClick={onClose}>
            <User className="h-5 w-5 mr-2" /> Sign In
          </Link>
        </Button>
      ) : (
        <>
          <Link
            href="/profile"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={onClose}
          >
            Profile
          </Link>
          <Link
            href="/orders"
            className="block rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            onClick={onClose}
          >
            Orders
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600"
            onClick={() => {
              signOut({ callbackUrl: "/" });
              onClose();
            }}
          >
            Sign out
          </Button>
        </>
      )}
    </div>
  </div>
);

const UserMenu = ({ session }: { session: Session }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="User menu"
      >
        {session.user?.image ? (
          <span className="relative h-8 w-8 overflow-hidden rounded-full border">
            <Image
              src={session.user.image}
              alt={session.user.name || "User"}
              className="object-cover"
              fill
              sizes="32px"
              priority
            />
          </span>
        ) : (
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${session?.user?.name || "User"
                }`}
            />
            <AvatarFallback>
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
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
      <DropdownMenuSeparator />
      <DropdownMenuItem
        className="text-red-600"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

const Navbar = () => {
  const { data: session, status } = useSession();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  if (!isMounted || status === "loading") {
    return (
      <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-3 md:mx-auto">
          <Skeleton className="h-9 w-32 rounded-md" />
          <Skeleton className="hidden h-10 w-full max-w-md rounded-md md:block" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-16 items-center gap-3 px-3 md:mx-auto">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </Button>

        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight text-primary md:text-2xl"
          onClick={closeMobileMenu}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
            EC
          </span>
          <span>EazyCart</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost" size="sm">
            <Link href="/product">Products</Link>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <Link href="/chatbot">
              <MessageCircle className="h-4 w-4" />
              AI Assistant
            </Link>
          </Button>
        </div>

        <div className="mx-4 hidden flex-1 justify-center md:flex">
          <div className="w-full max-w-md">
            <SearchBox />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <Button
            variant={isSearchOpen ? "secondary" : "ghost"}
            size="icon"
            onClick={toggleSearch}
            aria-label="Toggle search"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <div className="ml-auto hidden items-center gap-2 md:flex">
          <ThemeToggle />

          <Cart />
          {session ? (
            <UserMenu session={session} />
          ) : (
            <Button size="sm" asChild>
              <Link href="/login" onClick={closeMobileMenu}>
                <User className="h-4 w-4" /> Sign In
              </Link>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <Cart />
          {session ? (
            <UserMenu session={session} />
          ) : (
            <Button variant="ghost" size="icon" asChild aria-label="Sign in">
              <Link href="/login" onClick={closeMobileMenu}>
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t bg-background/95 p-3 backdrop-blur md:hidden shadow-md">
          <SearchBox autoFocus={true} onSelect={() => setIsSearchOpen(false)} />
        </div>
      )}

      <div ref={mobileMenuRef}>
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={closeMobileMenu}
          session={session}
        />
      </div>
    </nav>
  );
};

export default Navbar;
