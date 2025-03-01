"use client";

import { useSearchParams } from "next/navigation";
import React from "react";

function OrderConfrim() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  return <div className="h-screen">OrderConfrim: {id}</div>;
}

export default OrderConfrim;
