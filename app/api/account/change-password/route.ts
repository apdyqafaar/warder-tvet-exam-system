import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const ALLOWED_ROLES = new Set(["admin", "teacher"]);

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to change password";
};

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !ALLOWED_ROLES.has(session.user.role ?? "")) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const body = await request.json();
    const email = body?.email?.trim()?.toLowerCase();
    const currentPassword = body?.currentPassword?.trim();
    const newPassword = body?.newPassword?.trim();

    if (!email || !currentPassword || !newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, current password, and new password are required",
        },
        { status: 400 },
      );
    }

    if (email !== session.user.email.trim().toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          message: "The provided email does not match your account",
        },
        { status: 400 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Your new password must be different from the old password",
        },
        { status: 400 },
      );
    }

    await auth.api.changePassword({
      headers: await headers(),
      body: {
        currentPassword,
        newPassword,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
      data: null,
    });
  } catch (error) {
    const message = getErrorMessage(error);

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 400 },
    );
  }
}
