// "use client"

// import { Button } from "@/components/ui/button"
// import {
//   Card,
//   CardAction,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import Link from "next/link"
// import { useState } from "react"
// import { client } from "@/lib/auth-client"
// import { useRouter } from "next/navigation"

// export function SignUpCard() {
//   const [name, setName] = useState("")
//   const [email, setEmail] = useState("")
//   const [password, setPassword] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState("")
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setIsLoading(true)
//     setError("")
    
//     try {
//       const { data, error } = await client.signUp.email({
//         email,
//         password,
//         name,
//       }, {
//         onSuccess: () => {
//           router.push("/auth/sign-in")
//         },
//         onError: (ctx) => {
//           setError(ctx.error.message)
//         }
//       })
//     } catch (err) {
//       setError("Something went wrong")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   return (
//     <Card className="w-full max-w-sm">
//       <CardHeader>
//         <CardTitle>Create an account</CardTitle>
//         <CardDescription>
//           Enter your details below to create your account
//         </CardDescription>
//         <CardAction>
//           <Link href="/auth/sign-in">
//             <Button variant="link">Sign In</Button>
//           </Link>
//         </CardAction>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit}>
//           <div className="flex flex-col gap-6">
//             <div className="grid gap-2">
//               <Label htmlFor="name">Name</Label>
//               <Input
//                 id="name"
//                 type="text"
//                 placeholder="John Doe"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="grid gap-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="m@example.com"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//             </div>
//             <div className="grid gap-2">
//               <div className="flex items-center">
//                 <Label htmlFor="password">Password</Label>
//               </div>
//               <Input 
//                 id="password" 
//                 type="password" 
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required 
//               />
//             </div>
//             {error && <p className="text-sm text-destructive">{error}</p>}
//           </div>
//           <Button type="submit" className="w-full mt-6" disabled={isLoading}>
//             {isLoading ? "Creating account..." : "Sign Up"}
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   )
// }
