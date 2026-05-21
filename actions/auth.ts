import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getSession() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    return session;
  } catch (error) {
    console.error("Failed to get session:", error);

    return null;
  }
}

export async function requireSession() {
    const session = await getSession();
    if (!session) {
        redirect("/auth/sign-in");
    }
    return session;
}

export async function signOutAction() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    });
    redirect("/auth/sign-in");
  } catch (error) {
    console.error("Failed to sign out:", error);
  }
}
