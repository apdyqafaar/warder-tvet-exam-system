"use server"

import { SignInCard } from "@/components/auth/sign-in-card"

const page = async() => {
  return (
  <div className="flex min-h-screen items-center justify-center">
    <SignInCard />
    </div>
  )
}

export default page 