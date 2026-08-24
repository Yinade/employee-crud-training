import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../../api/usersApi";
import { getUserByToken } from "../core/_requests";
import { useAuth } from "../core/Auth";

const initialValues = {
  password: "",
  confirmPassword: "",
};

const resetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

export function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | undefined>(undefined);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { saveAuth, setCurrentUser } = useAuth();

  const formik = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      setStatusMessage(null);

      try {
        const response = await resetPassword({
          token,
          password: values.password,
        });

        const { data: auth } = await resetPassword({
          token,
          password: values.password,
        });
        saveAuth(auth);
        const { data: user } = await getUserByToken(auth.api_token);
        setCurrentUser(user);

        setStatusMessage("Password reset successful! Redirecting...");
      } catch (error: any) {
        setIsSuccess(false);
        setStatusMessage("An error occurred. Please try again later.");
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <form
      className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
      noValidate
      id="kt_reset_password_form"
      onSubmit={formik.handleSubmit}
    >
      <div className="text-center mb-10">
        <h1 className="text-gray-900 fw-bolder mb-3">Reset Password</h1>
        <div className="text-gray-500 fw-semibold fs-6">
          Enter your new password below.
        </div>
      </div>

      {statusMessage && (
        <div
          className={`mb-lg-15 alert ${
            isSuccess ? "alert-success" : "alert-danger"
          }`}
        >
          <div className="alert-text font-weight-bold">{statusMessage}</div>
        </div>
      )}

      <div className="fv-row mb-8">
        <label className="form-label fw-bolder text-gray-900 fs-6">
          New Password
        </label>
        <input
          type="password"
          placeholder="Enter new password"
          autoComplete="off"
          {...formik.getFieldProps("password")}
          className={clsx(
            "form-control bg-transparent",
            { "is-invalid": formik.touched.password && formik.errors.password },
            { "is-valid": formik.touched.password && !formik.errors.password }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.password}</span>
            </div>
          </div>
        )}
      </div>

      <div className="fv-row mb-8">
        <label className="form-label fw-bolder text-gray-900 fs-6">
          Confirm Password
        </label>
        <input
          type="password"
          placeholder="Confirm new password"
          autoComplete="off"
          {...formik.getFieldProps("confirmPassword")}
          className={clsx(
            "form-control bg-transparent",
            {
              "is-invalid":
                formik.touched.confirmPassword && formik.errors.confirmPassword,
            },
            {
              "is-valid":
                formik.touched.confirmPassword &&
                !formik.errors.confirmPassword,
            }
          )}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.confirmPassword}</span>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex flex-wrap justify-content-center pb-lg-0">
        <button
          type="submit"
          id="kt_reset_password_submit"
          className="btn btn-primary me-4"
        >
          <span className="indicator-label">Reset Password</span>
          {loading && (
            <span className="indicator-progress">
              Please wait...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
