"use client";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const HomePage = dynamic(() => import("./homepage/page"), {
  loading: () => <Skeleton className="h-[calc(100vh-144px)] w-full rounded-xl" />,
});
import { useSession } from "next-auth/react";
import { useGetUserQuery } from "@/redux/fetchApi/userApi";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "@/redux/slices/userSlice";
import { useEffect } from "react";

function Page() {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { data, isError } = useGetUserQuery({});

  useEffect(() => {
    if (session && data) {
      dispatch(setUser(data.user));
    }
  }, [data, session]);

  useEffect(() => {
    if (isError) {
      console.log("Error fetching user data");
    }
  }, [isError]);

  return (
    <>
      <HomePage />
    </>
  );
}

export default Page;
