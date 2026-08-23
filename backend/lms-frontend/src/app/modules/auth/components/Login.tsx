import { useState } from "react";
import * as Yup from "yup";
import clsx from "clsx";
import { useFormik } from "formik";
import { getUserByToken, login } from "../core/_requests";
import { useAuth } from "../core/Auth";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
});

const initialValues = {
  email: "",
  password: "",
};

export function Login() {
  const [loading, setLoading] = useState(false);
  const { saveAuth, setCurrentUser } = useAuth();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        const { data: auth } = await login(values.email, values.password);
        saveAuth(auth);
        const { data: user } = await getUserByToken(auth.api_token);
        setCurrentUser(user);
      } catch (error) {
        console.error(error);
        saveAuth(undefined);
        setStatus("The login details are incorrect");
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <div
      className="input-wrapper" // Keep p-10 if it's for padding, remove shadow-sm
      style={
        {
          // background: "#ffffff",
          // borderRadius: "0.8rem",
          // maxWidth: "500px",
          // margin: "0 auto",
          // marginTop: "3rem",
          // boxShadow: "0 .125rem .25rem rgba(0,0,0,.075)", // Add the shadow-sm equivalent here
        }
      }
    >
      <form
        className="form w-100"
        onSubmit={formik.handleSubmit}
        noValidate
        id="kt_login_signin_form"
      >
        {/* begin::Heading */}
        <div className="text-center mb-7">
          <h1
            className="font-mono text-5xl mb-3"
            style={{
              background: "linear-gradient(to right, #2AC19D, #30A8D9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "bold",
            }}
          >
            Login
          </h1>
        </div>

        {formik.status && (
          <div className="mb-6 alert alert-danger">
            <div className="alert-text font-weight-bold">{formik.status}</div>
          </div>
        )}

        {/* begin::Form group */}
        <div className="fv-row mb-8">
          <label
            className="form-label fs-4 fw-bolder"
            style={{ color: "#3A9F6C", fontWeight: "bold" }}
          >
            Email
          </label>
          <input
            placeholder="username@impact-logistic.com"
            {...formik.getFieldProps("email")}
            className={clsx(
              "form-control",
              { "is-invalid": formik.touched.email && formik.errors.email },
              {
                "is-valid": formik.touched.email && !formik.errors.email,
              }
            )}
            type="email"
            name="email"
            autoComplete="off"
            style={{
              fontWeight: 400,
              fontSize: "1.2rem", // Increased font size
              padding: "12px 16px", // Internal spacing
              borderRadius: "6px", // Rounded corners
              border: "1px solid #ECEFF1", // Soft border
              backgroundColor: "#FFFFFF",
              color: "#392521",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)", // Subtle shadow
            }}
          />
          {formik.touched.email && formik.errors.email && (
            <div className="fv-plugins-message-container mt-1">
              <span
                role="alert"
                style={{
                  color: "#D32F2F",
                  backgroundColor: "#fdecea",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.5rem",
                  display: "inline-block",
                }}
              >
                {formik.errors.email}
              </span>
            </div>
          )}
        </div>
        {/* end::Form group */}

        {/* begin::Form group */}
        <div className="fv-row mb-6">
          <label
            className="form-label fs-4 fw-bolder"
            style={{ color: "#3A9F6C" }}
          >
            Password
          </label>
          <input
            placeholder="Password"
            type="password"
            autoComplete="off"
            {...formik.getFieldProps("password")}
            className={clsx(
              "form-control",
              {
                "is-invalid": formik.touched.password && formik.errors.password,
              },
              {
                "is-valid": formik.touched.password && !formik.errors.password,
              }
            )}
           style={{
              fontWeight: 400,
              fontSize: "1.2rem", // Increased font size
              padding: "12px 16px", // Internal spacing
              borderRadius: "6px", // Rounded corners
              border: "1px solid #ECEFF1", // Soft border
              backgroundColor: "#FFFFFF",
              color: "#392521",
              boxShadow: "0 1px 4px rgba(0, 0, 0, 0.08)", // Subtle shadow
            }}
          />
          {formik.touched.password && formik.errors.password && (
            <div className="fv-plugins-message-container mt-1">
              <span
                role="alert"
                style={{
                  color: "#D32F2F",
                  backgroundColor: "#fdecea",
                  padding: "0.25rem 0.5rem",
                  borderRadius: "0.5rem",
                  display: "inline-block",
                }}
              >
                {formik.errors.password}
              </span>
            </div>
          )}
        </div>
        {/* end::Form group */}

        {/* begin::Action */}
        <div className="continue-button d-grid mb-6"
          style={{marginTop: "2.5rem"}}
          >
          <button
            type="submit"
            id="kt_sign_in_submit"
            disabled={formik.isSubmitting || !formik.isValid}
            style={{
              background: "linear-gradient(to right, #2AC19D, #30A8D9)",
              border: "none",
              borderRadius: "0.25rem",
              fontSize: "1.2rem",
              fontWeight: 600,
              padding: "0.75rem",
              color: "#ffffff",
            }}
          >
            {!loading && <span className="indicator-label">Continue</span>}
            {loading && (
              <span className="indicator-progress" style={{ display: "block" }}>
                Please wait...
                <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
              </span>
            )}
          </button>
        </div>
        {/* end::Action */}
      </form>
    </div>
  );
}
