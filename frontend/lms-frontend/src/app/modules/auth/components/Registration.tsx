import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { getUserByToken, register } from "../core/_requests";
import { Link } from "react-router-dom";
import { PasswordMeterComponent } from "../../../../_metronic/assets/ts/components";
import { useAuth } from "../core/Auth";
import Select, { MultiValue } from "react-select";
import { getRoles } from "../../accounts/core/_requests";
import { fetchUserTypes } from "../../../api/usersApi";
import { useSelector, useDispatch } from "react-redux";
import { loadDepartments } from "../../departments/departmentSlice";
import { RootState, AppDispatch } from "../../../store";

// --- Types ---
interface RoleOption {
  value: number;
  label: string;
}

type FormValues = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  changepassword: string;
  roleIds: number[];
  user_type: "INTERNAL" | "CLIENT";
  extraFields: {
    departmentId?: number; // INTERNAL only
    company?: string; // CLIENT only
    tinNo?: string; // CLIENT only
  };
};

// --- Initial Values ---
const initialValues: FormValues = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  changepassword: "",
  roleIds: [],
  user_type: "INTERNAL",
  extraFields: {
    departmentId: undefined,
    company: "",
    tinNo: "",
  },
};

// --- Validation ---
const registrationSchema = Yup.object({
  username: Yup.string().min(3).max(50).required("Username is required"),
  firstName: Yup.string().min(3).max(50).required("First name is required"),
  lastName: Yup.string().min(3).max(50).required("Last name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Minimum 8 characters")
    .required("Password is required"),
  changepassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Password confirmation is required"),
  roleIds: Yup.array()
    .of(Yup.number())
    .min(1, "At least one role is required")
    .required(),
  user_type: Yup.string()
    .oneOf(["INTERNAL", "CLIENT"])
    .required("User type is required"),
  // validate extraFields based on user_type
  extraFields: Yup.object({
    departmentId: Yup.number().nullable(),
    company: Yup.string().nullable(),
    tinNo: Yup.string().nullable(),
  }).when("user_type", {
    is: "INTERNAL",
    then: (schema) =>
      schema.shape({
        departmentId: Yup.number()
          .typeError("Department is required")
          .required("Department is required"),
        company: Yup.string().nullable(),
        tinNo: Yup.string().nullable(),
      }),
    otherwise: (schema) =>
      schema.shape({
        departmentId: Yup.number().nullable(),
        company: Yup.string().required("Company is required"),
        tinNo: Yup.string().required("TIN number is required"),
      }),
  }),
});

export function Registration() {
  const [loading, setLoading] = useState(false);
  const { saveAuth, setCurrentUser } = useAuth();
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [userTypes, setUserTypes] = useState<string[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<
    FormValues["user_type"]
  >(initialValues.user_type);

  const dispatch = useDispatch<AppDispatch>();
  const {
    departments,
    loading: depsLoading,
    error: depsError,
  } = useSelector((state: RootState) => state.departments);

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // Bootstrap deps + roles + user types
  useEffect(() => {
    dispatch(loadDepartments());

    (async () => {
      try {
        const response = await getRoles();
        setRoleOptions(
          response.map((role: any) => ({
            value: role.id,
            label: role.name,
          }))
        );
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    })();

    (async () => {
      try {
        const response = await fetchUserTypes();
        setUserTypes(response);
      } catch (error) {
        console.error("Failed to fetch user types", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch]);

  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: registrationSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setSubmitting(true);
      try {
        const payload: any = {
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          roleIds: values.roleIds,
          user_type: values.user_type,
        };

        if (values.user_type === "INTERNAL") {
          payload.departmentId = values.extraFields.departmentId;
        } else {
          payload.company = values.extraFields.company;
          payload.tinNo = values.extraFields.tinNo;
        }

        const { data: auth } = await register(payload);
        saveAuth(auth);
        const { data: user } = await getUserByToken(auth.api_token);
        setCurrentUser(user);
      } catch (error) {
        console.error(error);
        setStatus("Registration failed. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    PasswordMeterComponent.bootstrap();
    formik.validateForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUserTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newType = event.target.value as FormValues["user_type"];
    setSelectedUserType(newType);
    formik.setFieldValue("user_type", newType);

    const resetExtraFields =
      newType === "INTERNAL"
        ? { departmentId: undefined }
        : { company: "", tinNo: "" };

    // set whole extraFields object + reset touched for its keys
    formik.setFieldValue("extraFields", resetExtraFields, false);

    if (newType === "INTERNAL") {
      formik.setFieldTouched("extraFields.departmentId", false, false);
    } else {
      formik.setFieldTouched("extraFields.company", false, false);
      formik.setFieldTouched("extraFields.tinNo", false, false);
    }

    formik.validateField("extraFields");
  };

  return (
    <form
      className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
      noValidate
      id="kt_login_signup_form"
      onSubmit={formik.handleSubmit}
    >
      {formik.status && (
        <div className="mb-lg-15 alert alert-danger">
          <div className="alert-text font-weight-bold">{formik.status}</div>
        </div>
      )}

      {/* Username */}
      <div className="fv-row mb-3">
        <label className="form-label fw-bolder text-gray-900 fs-6">
          Username
        </label>
        <input
          placeholder="Username"
          type="text"
          autoComplete="off"
          {...formik.getFieldProps("username")}
          className={clsx("form-control bg-transparent", {
            "is-invalid": formik.touched.username && formik.errors.username,
            "is-valid": formik.touched.username && !formik.errors.username,
          })}
        />
        {formik.touched.username && formik.errors.username && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.username}</span>
            </div>
          </div>
        )}
      </div>

      {/* First name */}
      <div className="fv-row mb-3">
        <label className="form-label fw-bolder text-gray-900 fs-6">
          First name
        </label>
        <input
          placeholder="First name"
          type="text"
          autoComplete="off"
          {...formik.getFieldProps("firstName")}
          className={clsx("form-control bg-transparent", {
            "is-invalid": formik.touched.firstName && formik.errors.firstName,
            "is-valid": formik.touched.firstName && !formik.errors.firstName,
          })}
        />
        {formik.touched.firstName && formik.errors.firstName && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.firstName}</span>
            </div>
          </div>
        )}
      </div>

      {/* Last name */}
      <div className="fv-row mb-3">
        <label className="form-label fw-bolder text-gray-900 fs-6">
          Last name
        </label>
        <input
          placeholder="Last name"
          type="text"
          autoComplete="off"
          {...formik.getFieldProps("lastName")}
          className={clsx("form-control bg-transparent", {
            "is-invalid": formik.touched.lastName && formik.errors.lastName,
            "is-valid": formik.touched.lastName && !formik.errors.lastName,
          })}
        />
        {formik.touched.lastName && formik.errors.lastName && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.lastName}</span>
            </div>
          </div>
        )}
      </div>

      {/* begin::Form group Email */}
      <div className="fv-row mb-3">
        <label className="form-label fw-bolder text-gray-900 fs-6">Email</label>
        <input
          placeholder="Email"
          type="email"
          autoComplete="off"
          {...formik.getFieldProps("email")}
          className={clsx(
            "form-control bg-transparent",
            { "is-invalid": formik.touched.email && formik.errors.email },
            {
              "is-valid": formik.touched.email && !formik.errors.email,
            }
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
      {/* end::Form group */}
      {/* Roles */}
      <div className="fv-row mb-3">
        <label className="form-label fw-bolder text-gray-900 fs-6">Roles</label>
        <Select
          isMulti
          options={roleOptions}
          value={roleOptions.filter((o) =>
            formik.values.roleIds.includes(o.value)
          )}
          onChange={(selected: MultiValue<RoleOption>) =>
            formik.setFieldValue(
              "roleIds",
              selected.map((o) => o.value)
            )
          }
          onBlur={() => formik.setFieldTouched("roleIds", true)}
        />
        {formik.touched.roleIds && formik.errors.roleIds && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.roleIds as any}</span>
            </div>
          </div>
        )}
      </div>

      {/* User Type */}
      <div className="fv-row mb-3">
        <label className="form-label fw-bolder text-gray-900 fs-6">
          User Type
        </label>
        <select
          className="form-select"
          name="user_type"
          value={formik.values.user_type}
          onChange={handleUserTypeChange}
          onBlur={formik.handleBlur}
        >
          {userTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        {formik.touched.user_type && formik.errors.user_type && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.user_type}</span>
            </div>
          </div>
        )}
      </div>

      {/* INTERNAL -> Department */}
      {formik.values.user_type === "INTERNAL" && (
        <div className="fv-row mb-3">
          <label className="form-label fw-bolder text-gray-900 fs-6">
            Department
          </label>
          <select
            className="form-select"
            name="extraFields.departmentId"
            value={formik.values.extraFields.departmentId ?? ""}
            onChange={(e) =>
              formik.setFieldValue(
                "extraFields.departmentId",
                Number(e.target.value) || undefined
              )
            }
            onBlur={() =>
              formik.setFieldTouched("extraFields.departmentId", true)
            }
            disabled={depsLoading || !departments.length}
          >
            <option value="" disabled>
              {depsLoading ? "Loading..." : "Select department"}
            </option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          {formik.touched.extraFields?.departmentId &&
            (formik.errors.extraFields as any)?.departmentId && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">
                    {(formik.errors.extraFields as any).departmentId}
                  </span>
                </div>
              </div>
            )}

          {depsError && (
            <div className="text-danger mt-1">
              Failed to load departments: {depsError}
            </div>
          )}
        </div>
      )}

      {/* CLIENT -> Company / TIN */}
      {formik.values.user_type === "CLIENT" && (
        <>
          <div className="fv-row mb-3">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              Company
            </label>
            <input
              type="text"
              name="extraFields.company"
              value={formik.values.extraFields.company || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={clsx("form-control bg-transparent", {
                "is-invalid":
                  formik.touched.extraFields?.company &&
                  formik.errors.extraFields?.company,
                "is-valid":
                  formik.touched.extraFields?.company &&
                  !formik.errors.extraFields?.company,
              })}
            />
            {formik.touched.extraFields?.company &&
              formik.errors.extraFields?.company && (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    <span role="alert">
                      {formik.errors.extraFields.company as any}
                    </span>
                  </div>
                </div>
              )}
          </div>

          <div className="fv-row mb-3">
            <label className="form-label fw-bolder text-gray-900 fs-6">
              TIN Number
            </label>
            <input
              type="text"
              name="extraFields.tinNo"
              value={formik.values.extraFields.tinNo || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={clsx("form-control bg-transparent", {
                "is-invalid":
                  formik.touched.extraFields?.tinNo &&
                  formik.errors.extraFields?.tinNo,
                "is-valid":
                  formik.touched.extraFields?.tinNo &&
                  !formik.errors.extraFields?.tinNo,
              })}
            />
            {formik.touched.extraFields?.tinNo &&
              formik.errors.extraFields?.tinNo && (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    <span role="alert">
                      {formik.errors.extraFields.tinNo as any}
                    </span>
                  </div>
                </div>
              )}
          </div>
        </>
      )}

      {/* Password */}
      <div className="fv-row mb-3" data-kt-password-meter="true">
        <div className="mb-1">
          <label className="form-label fw-bolder text-gray-900 fs-6">
            Password
          </label>
          <div className="position-relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="off"
              {...formik.getFieldProps("password")}
              className={clsx("form-control bg-transparent", {
                "is-invalid": formik.touched.password && formik.errors.password,
                "is-valid": formik.touched.password && !formik.errors.password,
              })}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">{formik.errors.password}</span>
                </div>
              </div>
            )}
          </div>
          <div
            className="d-flex align-items-center mb-3"
            data-kt-password-meter-control="highlight"
          >
            <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
            <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
            <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px me-2"></div>
            <div className="flex-grow-1 bg-secondary bg-active-success rounded h-5px"></div>
          </div>
        </div>
        <div className="text-muted">
          Use 8 or more characters with a mix of letters, numbers & symbols.
        </div>
      </div>

      {/* Confirm Password */}
      <div className="fv-row mb-5">
        <label className="form-label fw-bolder text-gray-900 fs-6">
          Confirm Password
        </label>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password confirmation"
          autoComplete="off"
          {...formik.getFieldProps("changepassword")}
          className={clsx("form-control bg-transparent", {
            "is-invalid":
              formik.touched.changepassword && formik.errors.changepassword,
            "is-valid":
              formik.touched.changepassword && !formik.errors.changepassword,
          })}
        />
        {formik.touched.changepassword && formik.errors.changepassword && (
          <div className="fv-plugins-message-container">
            <div className="fv-help-block">
              <span role="alert">{formik.errors.changepassword}</span>
            </div>
          </div>
        )}
      </div>

      {/* Show Password toggle */}
      <div className="fv-row mb-5">
        <input
          type="checkbox"
          id="showPassword"
          checked={showPassword}
          onChange={() => setShowPassword((v) => !v)}
        />
        <label htmlFor="showPassword" style={{ paddingLeft: 10 }}>
          Show Password
        </label>
      </div>

      {/* Submit / Cancel */}
      <div className="text-center">
        <button
          type="submit"
          id="kt_sign_up_submit"
          className="btn btn-lg btn-primary w-100 mb-5"
          disabled={formik.isSubmitting || !formik.isValid || !formik.dirty}
        >
          {!loading && <span className="indicator-label">Submit</span>}
          {loading && (
            <span className="indicator-progress" style={{ display: "block" }}>
              Please wait...{" "}
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>

        <Link to="/auth/login">
          <button
            type="button"
            id="kt_login_signup_form_cancel_button"
            className="btn btn-lg btn-light-primary w-100 mb-5"
          >
            Cancel
          </button>
        </Link>
      </div>
    </form>
  );
}
