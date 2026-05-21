"use client"
import { useUser } from '@/lib/context/useProvider'
import { redirect } from 'next/navigation'

const page = () => {
   const user=useUser()
    if(user.role === "admin"){
        redirect("/dashboard/admin");
    }else if(user.role === "teacher"){
        redirect("/dashboard/teacher");
    }else{
        redirect("/auth/sign-in")
    }
  return (
    <>
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary">
        <p className="text-center text-lg font-bold">Redirecting to dashboard...</p>
      </div>
    </div>
    </>
  )
}

export default page