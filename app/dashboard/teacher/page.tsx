"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

const page = () => {
const router=useRouter()
useEffect(() => {
  // Redirect to the department page
    router.push('/dashboard/teacher/departments')
},[])

  return (
    <div>Redirecting to your department page...</div>
  )
}

export default page