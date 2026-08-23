import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../../api/usersApi";

const initialValues = {
  email: "",
};

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .min(3, "Minimum 3 characters required")
    .max(50, "Maximum 50 characters allowed")
    .required("Email is required"),
});

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean | undefined>(undefined);

  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setLoading(true);
      setStatusMessage(null);
      try {
        const payload = {
          email: values.email,
        };

        await requestPasswordReset(payload);
        setIsSuccess(true);
        setStatusMessage(
          "Password reset email sent successfully. Please check your email."
        );
        resetForm();
      } catch (error) {
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
      id="kt_login_password_reset_form"
      onSubmit={formik.handleSubmit}
    >
      <div className="text-center mb-10">
        <h1 className="text-gray-900 fw-bolder mb-3">Forgot Password?</h1>
        <div className="text-gray-500 fw-semibold fs-6">
          Enter your email address to reset your password.
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
        <label className="form-label fw-bolder text-gray-900 fs-6">Email</label>
        <input
          type="email"
          placeholder="Enter your email"
          autoComplete="off"
          {...formik.getFieldProps("email")}
          className={clsx(
            "form-control bg-transparent",
            { "is-invalid": formik.touched.email && formik.errors.email },
            { "is-valid": formik.touched.email && !formik.errors.email }
          )}
        />
        {formik.touched.email && formik.errors.email && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.email}</span>
            </div>
          </div>
        )}
      </div>

      <div className="d-flex flex-wrap justify-content-center pb-lg-0">
        <button
          type="submit"
          id="kt_password_reset_submit"
          className="btn btn-primary me-4"
        >
          <span className="indicator-label">Submit</span>
          {loading && (
            <span className="indicator-progress">
              Please wait...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
        <Link to="/auth/login">
          <button
            type="button"
            id="kt_login_password_reset_form_cancel_button"
            className="btn btn-light"
            disabled={formik.isSubmitting || !formik.isValid}
          >
            Cancel
          </button>
        </Link>
      </div>
    </form>
  );
}
