"use server";

import { auth } from "@/lib/auth";

type PermissionObject = Record<
  string,
  string[]
>;

export async function checkAdminPermission({
  userId,
  permissions,
}: {
  userId: string;
  permissions: PermissionObject;
}) {
  try {
    const data =
      await auth.api.userHasPermission({
        body: {
          userId,
          permissions,
          role:"admin"
        },
      });

    if (data?.error as any) {
      return {
        success: false,
        error: (data?.error as any).message || "An error occurred while checking permissions",
      };
    }

    return {
      success: true,
      hasPermission: data?.success ?? false,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Permission check failed",
    };
  }
}

export async function checkTeacherPermission({
  userId,
  permissions,
}: {
  userId: string;
  permissions: PermissionObject;
}) {
  try {
    const data =
      await auth.api.userHasPermission({
        body: {
          userId,
          permissions,
          role:"teacher"
        },
      });

    if (data?.error as any) {
      return {
        success: false,
        error: (data?.error as any).message || "An error occurred while checking permissions",
      };
    }

    return {
      success: true,
      hasPermission: data?.success ?? false,
    };
  } catch (error) {
    console.error(error);

    return {
      success: false,
      error: "Permission check failed",
    };
  }
}