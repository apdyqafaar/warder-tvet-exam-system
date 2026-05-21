import { api } from "@/lib/api/client";

export interface ChangePasswordInput {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (data: ChangePasswordInput) => {
  return api.post<null>("account/change-password", data);
};
