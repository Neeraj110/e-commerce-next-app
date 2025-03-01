// "use client";

// import React, { useState, useEffect } from "react";
// import Link from "next/link";
// import { useSession, signOut } from "next-auth/react";
// import { Search, User, Menu, X, ShoppingCart } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Button } from "@/components/ui/button";
// import Image from "next/image";
// import dynamic from "next/dynamic";
// import SearchBox from "./SearchBox";
// import { ThemeToggle } from "@/utils/theme-toggle";

// const Cart = dynamic(() => import("./Cart"), { ssr: false });

// const Navbar = () => {
//   const { data: session } = useSession();
//   const [isMounted, setIsMounted] = useState(false);
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSearchOpen, setIsSearchOpen] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   if (!isMounted) return null;

//   return (
//     <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="flex h-16 items-center justify-between container px-3 md:mx-auto">
//         {/* Mobile Menu Toggle */}
//         <Button
//           variant="ghost"
//           size="icon"
//           className="md:hidden"
//           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//         >
//           {isMobileMenuOpen ? (
//             <X className="h-6 w-6" />
//           ) : (
//             <Menu className="h-6 w-6" />
//           )}
//         </Button>

//         <Link
//           href="/"
//           className="text-2xl md:text-3xl font-bold text-indigo-600"
//         >
//           Eazy<span>Cart</span>
//         </Link>

//         {/* Desktop Search */}
//         <SearchBox isDesktop={true} />

//         <Button
//           variant="ghost"
//           size="icon"
//           className="md:hidden"
//           onClick={() => setIsSearchOpen(!isSearchOpen)}
//         >
//           <Search className="h-6 w-6" />
//         </Button>

//         {/* Icons & User Menu */}
//         <div className="flex items-center justify-between space-x-2 md:space-x-4">
//           {/* Theme Toggle */}
//           <ThemeToggle />

//           {/* Cart */}
//           <Cart />

//           {session ? (
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="ghost" size="icon" className="rounded-full">
//                   {session.user?.image ? (
//                     <Image
//                       src={session.user.image}
//                       alt={session.user.name || "User"}
//                       className="rounded-full"
//                       width={32}
//                       height={32}
//                       priority
//                     />
//                   ) : (
//                     <User className="h-6 w-6" />
//                   )}
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end" className="w-56">
//                 <DropdownMenuLabel>
//                   {session.user?.name || session.user?.email}
//                 </DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem asChild>
//                   <Link href="/profile">Profile</Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem asChild>
//                   <Link href="/orders">Orders</Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuItem asChild>
//                   <Link href="/settings">Settings</Link>
//                 </DropdownMenuItem>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem
//                   className="text-red-600"
//                   onClick={() => signOut({ callbackUrl: "/" })}
//                 >
//                   Sign out
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           ) : (
//             <Link href="/login">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="hidden md:flex items-center"
//               >
//                 <User className="h-5 w-5 mr-2" /> Sign In
//               </Button>
//             </Link>
//           )}
//         </div>
//       </div>

//       {/* Mobile Search */}
//       {isSearchOpen && <SearchBox />}

//       {/* Mobile Menu */}
//       {isMobileMenuOpen && (
//         <div className="md:hidden border-t bg-slate-300 dark:bg-slate-800">
//           <div className="space-y-1 px-4 py-3">
//             {/* Theme Toggle in Mobile Menu */}
//             <div className="py-2 px-3 flex items-center justify-between">
//               <span>Theme</span>
//               <ThemeToggle />
//             </div>

//             {!session && (
//               <Link href="/login">
//                 <Button className="w-full justify-start" variant="ghost">
//                   <User className="h-5 w-5 mr-2" /> Sign In
//                 </Button>
//               </Link>
//             )}
//             {session && (
//               <>
//                 <Link
//                   href="/profile"
//                   className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
//                 >
//                   Profile
//                 </Link>
//                 <Link
//                   href="/orders"
//                   className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
//                 >
//                   Orders
//                 </Link>
//                 <Button
//                   variant="ghost"
//                   className="w-full justify-start text-red-600"
//                   onClick={() => signOut({ callbackUrl: "/" })}
//                 >
//                   Sign out
//                 </Button>
//               </>
//             )}
//           </div>
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navbar;

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { Search, User, Menu, X, ShoppingCart } from "lucide-react";
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
import SearchBox from "./SearchBox";
import { ThemeToggle } from "@/utils/theme-toggle";
import { cn } from "@/lib/utils";

const Cart = dynamic(() => import("./Cart"), { ssr: false });

interface User {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

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
      "md:hidden border-t bg-slate-300 dark:bg-slate-800 transition-all duration-300 ease-in-out",
      isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
    )}
  >
    <div className="space-y-2 px-4 py-3">
      <div className="flex items-center justify-between py-2">
        <span className="text-sm font-medium">Theme</span>
        <ThemeToggle />
      </div>

      {!session ? (
        <Button asChild variant="ghost" className="w-full justify-start">
          <Link href="/login">
            <User className="h-5 w-5 mr-2" /> Sign In
          </Link>
        </Button>
      ) : (
        <>
          <Link
            href="/profile"
            className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            onClick={onClose}
          >
            Profile
          </Link>
          <Link
            href="/orders"
            className="block py-2 px-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
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
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            className="rounded-full"
            width={32}
            height={32}
            priority
          />
        ) : (
          <User className="h-6 w-6" />
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleSearch = useCallback(() => {
    setIsSearchOpen((prev) => !prev);
  }, []);

  if (!isMounted || status === "loading") {
    return null;
  }

  return (
    <nav className="fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-3 md:mx-auto">
        {/* Mobile Menu Toggle */}
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

        {/* Logo */}
        <Link
          href="/"
          className="text-2xl md:text-3xl font-bold text-indigo-600"
        >
          Eazy<span>Cart</span>
        </Link>

        {/* Desktop Search */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <SearchBox isDesktop={true} />
        </div>

        {/* Mobile Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={toggleSearch}
          aria-label="Toggle search"
        >
          <Search className="h-6 w-6" />
        </Button>

        {/* Icons & User Menu */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <ThemeToggle />
          <Cart />
          {session ? (
            <UserMenu session={session} />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="hidden md:flex items-center"
              asChild
            >
              <Link href="/login">
                <User className="h-5 w-5 mr-2" /> Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isSearchOpen && (
        <div className="md:hidden px-3 py-2">
          <SearchBox />
        </div>
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={toggleMobileMenu}
        session={session}
      />
    </nav>
  );
};

export default Navbar;
