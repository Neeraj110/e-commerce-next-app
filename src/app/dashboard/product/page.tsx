"use client"; // Mark this as a Client Component

import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

function ProductPage() {
  const { data: session } = useSession();
  const router = useRouter();
  console.log(session);
  

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-4">Product Page</h1>
      <p className="text-center mb-6">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet blanditiis
        nulla quidem vitae soluta rem voluptates, laborum totam distinctio
        velit!
      </p>

      {session && (
        <button
          onClick={()=> {
            handleLogout()
            router.push("/auth/login")
          }}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Logout
        </button>
      )}
    </div>
  );
}

export default ProductPage;
