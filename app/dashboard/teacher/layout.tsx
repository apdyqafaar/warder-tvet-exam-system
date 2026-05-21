"use client"
import { useUser } from "@/lib/context/useProvider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { toast } from "sonner"

const layout = ({ children }: { children: React.ReactNode }) => {
     const user=useUser()
    const router=useRouter()
    useEffect(()=>{
     if(user.role !== "teacher"){
        toast.warning("you are not authorized to access this page",{
            duration:1000
        })
        router.push("/dashboard")
     }
    },[])
  return (
    <>
      <main className="w-full">
        {children}
      </main>
    </>
  )
}

export default layout