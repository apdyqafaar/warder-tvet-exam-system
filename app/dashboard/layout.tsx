import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/side-bar-dashboard"
import { getSession } from "@/actions"
import { redirect } from "next/navigation";
import { UserProvider } from "@/lib/context/useProvider";
import { IUser } from "@/lib/types/schema-types";

export default async function Layout({ children }: { children: React.ReactNode }) {

    const session= await getSession();
    if(!session){
        redirect("/auth/sign-in");
    }
    
  return (
    <SidebarProvider className="flex">
        <UserProvider user={session?.user as IUser}>
      <AppSidebar />
      <main className="flex-1 min-h-screen ">
      
          
        <SidebarTrigger />
        <div className="w-full min-h-screen ">{children}</div>
      </main>
        </UserProvider>
    </SidebarProvider>
  )
}