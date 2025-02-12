import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/lib/authOption";
import DashboardLayout from "./dashboard/layout";
import DashboardPage from "./dashboard/page";

async function Page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <>
      {session && (
        <DashboardLayout>
          <DashboardPage />
        </DashboardLayout>
      )}
    </>
  );
}

export default Page;
