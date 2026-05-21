"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
const layout = async({ children }: { children: React.ReactNode }) => {
     const user= await auth.api.getSession({
      headers:await headers()
     })
        if(!user|| user.user.role !=="admin"){
        redirect("/")
      }
  return (
    <>
      <main>
        {children}
      </main>
    </>
  )
}

export default layout