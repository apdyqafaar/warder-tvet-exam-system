import { useMutation } from "@tanstack/react-query";
import {
  type ChangePasswordInput,
  changePassword,
} from "../services/auth/change-password.service";

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordInput) => changePassword(data),
  });
};
