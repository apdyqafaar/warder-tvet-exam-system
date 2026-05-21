import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex items-center justify-center gap-10 p-10">
      <Link href="/auth/sign-in"><Button className="bg-primary">Login</Button></Link>
      {/* <Link href="/auth/sign-up"><Button className="bg-primary">Sign Up</Button></Link> */}
      <Link href="/dashboard/admin"><Button className="bg-primary">Dashboard Admin</Button></Link>
      <Link href="/dashboard/teacher"><Button className="bg-primary">Dashboard Teacher</Button></Link>
      <div className="flex flex-col items-center gap-2">
        <Separator/>
        <p className="text-lg font-semibold">Student Exam Page</p>
        <Link href="/exam/onboard-examinees"><Button className="bg-primary">Onboard the examinees</Button></Link>
      </div>
    </div>
  );
}
