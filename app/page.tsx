"use server"

import HomePage from "@/components/home/homePage"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const page = async () => {
  const user=await auth.api.getSession({headers:await headers()})
  return (
    <HomePage isLoggedIn={!!user} />
  )
}

export default page