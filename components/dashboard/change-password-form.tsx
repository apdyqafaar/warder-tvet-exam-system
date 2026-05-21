"use client";

import { KeyRound, Loader2, LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/lib/context/useProvider";
import { useChangePassword } from "@/lib/hooks/use-change-password";

export function ChangePasswordForm() {
  const user = useUser();
  const changePasswordMutation = useChangePassword();
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !currentPassword.trim() || !newPassword.trim()) {
      toast.error("Please fill in your email, old password, and new password");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password must match");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        email,
        currentPassword,
        newPassword,
      });

      toast.success("Your password has been updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to change password",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6 md:p-10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="relative overflow-hidden rounded-3xl border bg-card/95 p-6 shadow-sm md:p-8">
          <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-primary/10 to-transparent" />
          <div className="relative flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Account security
              </div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Change your password
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Confirm your email and current password, then choose a stronger
                new password for your {user.role} account.
              </p>
            </div>

            <div className="rounded-2xl border bg-background/80 p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Signed in as
              </p>
              <p className="mt-2 font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="rounded-3xl border shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-xl">
                <KeyRound className="h-5 w-5 text-primary" />
                Update password
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                We will verify the email on your account together with your old
                password before saving the new one.
              </p>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Enter your account email"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Old password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(event) => setCurrentPassword(event.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Choose a new password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm new password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Re-enter your new password"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full rounded-2xl"
                  disabled={changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving password...
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="mr-2 h-4 w-4" />
                      Change password
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Security tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="rounded-2xl border bg-muted/30 p-4">
                Use at least 8 characters and mix words, numbers, and symbols.
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                Avoid reusing the same password from other systems or email
                accounts.
              </div>
              <div className="rounded-2xl border bg-muted/30 p-4">
                If you share this device, sign out after changing your password.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
