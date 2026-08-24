import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";

import { FormModalMedium } from "../../../reusableComponents/modalComponents";
import { FloatingInput } from "../../../reusableComponents/inputComponents";
import { toast } from "react-toastify";

import type { AppDispatch, RootState } from "../../store";
import {
  changeMyPasswordThunk,
  clearChangePasswordState,
} from "./changePasswordSlice";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

interface FormData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const validationSchema = Yup.object<FormData>({
  oldPassword: Yup.string().required("Old password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "New password must be at least 8 characters")
    .max(64, "New password is too long"),
  confirmPassword: Yup.string()
    .required("Confirm password is required")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});

const DEFAULTS: FormData = {
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ChangePasswordModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { loading, error, successMessage } = useSelector(
    (s: RootState) => s.changePassword
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!isOpen) return;
    reset(DEFAULTS);
    dispatch(clearChangePasswordState());
  }, [isOpen, reset, dispatch]);

  // Show backend errors (if any)
  useEffect(() => {
    if (!isOpen) return;
    if (!error) return;
    toast.error(
      typeof error === "string" ? error : "Failed to update password",
      {
        toastId: "pwd-failed",
      }
    );
  }, [error, isOpen]);

  // Show success from store (optional)
  useEffect(() => {
    if (!isOpen) return;
    if (!successMessage) return;

    toast.success(successMessage, { toastId: "pwd-updated" });
    reset(DEFAULTS);
    dispatch(clearChangePasswordState());
    onClose();
  }, [successMessage, isOpen, reset, dispatch, onClose]);

  const handleClose = () => {
    reset(DEFAULTS);
    dispatch(clearChangePasswordState());
    onClose();
  };

  const onSubmit = async (data: FormData) => {
    try {
      await dispatch(
        changeMyPasswordThunk({
          oldPassword: data.oldPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        })
      ).unwrap();

      // ✅ success is handled by the successMessage effect above
    } catch (err: any) {
      // ✅ rejected toast is handled by the error effect above,
      // but keep fallback here in case error isn't a string
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        "Failed to update password";
      toast.error(msg, { toastId: "pwd-failed-2" });
    }
  };

  return (
    <FormModalMedium
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Password"
      body={
        <>
          <FloatingInput
            label="Old Password"
            name="oldPassword"
            control={control}
            errors={errors}
            placeholder="Enter old password"
            className="mb-2 mt-3"
            type="password"
          />

          <FloatingInput
            label="New Password"
            name="newPassword"
            control={control}
            errors={errors}
            placeholder="Enter new password"
            className="mb-2"
            type="password"
          />

          <FloatingInput
            label="Confirm New Password"
            name="confirmPassword"
            control={control}
            errors={errors}
            placeholder="Confirm new password"
            className="mb-2"
            type="password"
          />

          <div className="text-muted fs-8">Use at least 8 characters.</div>
        </>
      }
      showSaveButton
      isLoading={loading}
      onSave={handleSubmit(onSubmit)}
    />
  );
};

export default ChangePasswordModal;
