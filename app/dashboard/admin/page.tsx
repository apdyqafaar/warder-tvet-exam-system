"use server"
import AdminDashboardPage from "@/components/dashboard/admin/admin_main_page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const page = async() => {
   const user= await auth.api.getSession({
      headers:await headers()
     })
      if(!user|| user.user.role !=="admin"){
        redirect("/")
      }


  return (
  <AdminDashboardPage/>
  );
};

export default page;
