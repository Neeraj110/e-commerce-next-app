import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/authOption";
import DashboardLayout from "./(dashboard)/layout";
import DashboardPage from "./(dashboard)/page";
import HomePage from "./homepage/page";

//src/app/page.tsx
async function Page() {
  return (
    <>
      <HomePage />
    </>
  );
}

export default Page;
