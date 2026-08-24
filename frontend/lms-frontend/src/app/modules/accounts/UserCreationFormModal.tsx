// UserCreationFormModal.tsx
import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormModalMedium } from "../../../reusableComponents/modalComponents";
import {
  FormikFloatingInput,
  FormikFloatingSelect,
  FloatingInput, // ✅ use this for password fields (supports dynamic type)
} from "../../../reusableComponents/inputComponents";
import { getRoles } from "../accounts/core/_requests";
import { registerInternalUser } from "../auth/core/_requests";
import { MultiValue } from "react-select";
import { useSelector, useDispatch } from "react-redux";
import { loadDepartments } from "../departments/departmentSlice";
import { RootState, AppDispatch } from "../../store";
import { useForm } from "react-hook-form";

interface UserCreationFormModalProps {
  show: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

interface RoleOption {
  value: number;
  label: string;
}

const initialValues = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  changepassword: "",
  departmentId: undefined as number | undefined,
  roleIds: [] as number[],
};

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string().min(8).required("Password is required"),
  changepassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
  departmentId: Yup.number()
    .typeError("Department is required")
    .required("Department is required"),
  roleIds: Yup.array().min(1, "At least one role is required"),
});

type PasswordForm = {
  password: string;
  changepassword: string;
};

const UserCreationFormModal: React.FC<UserCreationFormModalProps> = ({
  show,
  onClose,
  onUserCreated,
}) => {
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // ✅ NEW: show/hide states (same idea as update modal)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const {
    departments,
    loading: depsLoading,
    error,
  } = useSelector((state: RootState) => {
    console.log("Redux state for departments:", state.departments);
    return state.departments;
  });

  useEffect(() => {
    dispatch(loadDepartments());
  }, [dispatch]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRoles();
        const formatted = response.map((role: any) => ({
          value: role.id,
          label: role.name,
        }));
        setRoleOptions(formatted);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    };

    fetchRoles();
  }, []);

  // ✅ NEW: RHF only for password inputs (keeps everything else untouched)
  const {
    control,
    setValue: setRHFValue,
    reset: resetRHF,
    formState: { errors: rhfErrors },
  } = useForm<PasswordForm>({
    defaultValues: { password: "", changepassword: "" },
    mode: "onBlur",
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus, resetForm }) => {
      setSubmitting(true);
      setLoading(true);
      try {
        const payload = {
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          departmentId: values.departmentId!,
          roleIds: values.roleIds,
        };

        await registerInternalUser(payload, profilePicFile);
        resetForm();
        resetRHF({ password: "", changepassword: "" }); // ✅ keep in sync
        setShowPassword(false);
        setShowConfirmPassword(false);
        onUserCreated();
        onClose();
      } catch (err: any) {
        setStatus(err.message || "Registration failed");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  // ✅ cleanup objectURL (no logic change, just safe)
  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  return (
    <FormModalMedium
      isOpen={show}
      onClose={() => {
        formik.resetForm();
        resetRHF({ password: "", changepassword: "" });
        setProfilePicFile(null);
        setPreviewURL(null);
        setShowPassword(false);
        setShowConfirmPassword(false);
        onClose();
      }}
      title="Register Internal User"
      body={
        <>
          {formik.status && (
            <div className="alert alert-danger">
              <div className="alert-text font-weight-bold">{formik.status}</div>
            </div>
          )}

          <div className="mb-3">
            <label htmlFor="profilePicture" className="form-label">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setProfilePicFile(file);
                  setPreviewURL(URL.createObjectURL(file));
                }
              }}
              className="form-control"
              id="profilePicture"
            />
            {previewURL && (
              <img
                src={previewURL}
                alt="Preview"
                className="mt-2"
                style={{ maxWidth: "150px", borderRadius: "0.5rem" }}
              />
            )}
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <FormikFloatingInput
                label="First Name"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errors={
                  formik.touched.firstName && formik.errors.firstName
                    ? { firstName: formik.errors.firstName }
                    : undefined
                }
              />
            </div>
            <div className="col-md-6">
              <FormikFloatingInput
                label="Last Name"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errors={
                  formik.touched.lastName && formik.errors.lastName
                    ? { lastName: formik.errors.lastName }
                    : undefined
                }
              />
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <FormikFloatingInput
                label="Username"
                name="username"
                value={formik.values.username}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errors={
                  formik.touched.username && formik.errors.username
                    ? { username: formik.errors.username }
                    : undefined
                }
              />
            </div>
            <div className="col-md-6">
              <FormikFloatingInput
                label="Email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errors={
                  formik.touched.email && formik.errors.email
                    ? { email: formik.errors.email }
                    : undefined
                }
                type="email"
              />
            </div>
          </div>

          {/* ✅ Password + Confirm Password (ONLY changed area) */}
          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <FloatingInput<PasswordForm>
                label="Password"
                name="password"
                control={control}
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="mb-2 mt-2"
                errors={rhfErrors}
                onBlur={() => formik.setFieldTouched("password", true)}
                onChange={(e) => {
                  const v = e.target.value;
                  setRHFValue("password", v, { shouldValidate: false });
                  formik.setFieldValue("password", v);
                }}
                controlled
                value={formik.values.password}
              />

              <div className="form-check mt-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showPasswordCreate"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="showPasswordCreate"
                >
                  Show password
                </label>
              </div>

              {formik.touched.password && formik.errors.password && (
                <div className="fv-plugins-message-container">
                  <div className="fv-help-block">
                    <span role="alert">{formik.errors.password as string}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="col-md-6">
              <FloatingInput<PasswordForm>
                label="Confirm Password"
                name="changepassword"
                control={control}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className="mb-2 mt-2"
                errors={rhfErrors}
                onBlur={() => formik.setFieldTouched("changepassword", true)}
                onChange={(e) => {
                  const v = e.target.value;
                  setRHFValue("changepassword", v, { shouldValidate: false });
                  formik.setFieldValue("changepassword", v);
                }}
                controlled
                value={formik.values.changepassword}
              />

              <div className="form-check mt-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showConfirmPasswordCreate"
                  checked={showConfirmPassword}
                  onChange={(e) => setShowConfirmPassword(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="showConfirmPasswordCreate"
                >
                  Show confirm password
                </label>
              </div>

              {formik.touched.changepassword &&
                formik.errors.changepassword && (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      <span role="alert">
                        {formik.errors.changepassword as string}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="col-md-12">
            <label className="form-label">Department</label>
            <select
              className="form-select"
              name="departmentId"
              value={formik.values.departmentId ?? ""}
              onChange={(e) =>
                formik.setFieldValue(
                  "departmentId",
                  Number(e.target.value) || undefined
                )
              }
              onBlur={() => formik.setFieldTouched("departmentId", true)}
              disabled={depsLoading}
            >
              <option value="" disabled>
                Select department
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {formik.touched.departmentId && formik.errors.departmentId && (
              <div className="fv-plugins-message-container">
                <div className="fv-help-block">
                  <span role="alert">
                    {formik.errors.departmentId as string}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-12">
              <FormikFloatingSelect
                label="Roles"
                name="roleIds"
                value={roleOptions.filter((option) =>
                  formik.values.roleIds.includes(option.value)
                )}
                onChange={(selected) => {
                  const selectedIds = (selected as MultiValue<RoleOption>).map(
                    (opt) => opt.value
                  );
                  formik.setFieldValue("roleIds", selectedIds);
                  formik.setFieldTouched("roleIds", true);
                }}
                options={roleOptions}
                isMulti
                errors={
                  formik.touched.roleIds && formik.errors.roleIds
                    ? { roleIds: formik.errors.roleIds }
                    : undefined
                }
              />
            </div>
          </div>
        </>
      }
      showSaveButton
      onSave={formik.handleSubmit}
      isLoading={loading || formik.isSubmitting}
    />
  );
};

export default UserCreationFormModal;
