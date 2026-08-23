// UserUpdateFormModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { MultiValue } from "react-select";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";

import { FormModalMedium } from "../../../reusableComponents/modalComponents";
import {
  FormikFloatingInput,
  FormikFloatingSelect,
  FloatingInput, // ✅ USE THIS FOR PASSWORD FIELDS
} from "../../../reusableComponents/inputComponents";

import { getRoles } from "../accounts/core/_requests";
import { loadDepartments } from "../departments/departmentSlice";
import { updateInternalUserThunk } from "./userSlice";

import type { RootState, AppDispatch } from "../../store";
import type { UserModel } from "../../models/user.model";

interface Props {
  show: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  initialUserData: UserModel | undefined;
  accountId: number | null;
}

interface RoleOption {
  value: number;
  label: string;
}

const FILE_BASE_URL = "http://localhost:8080";

const initialValues = {
  username: "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  departmentId: undefined as number | undefined,
  roleIds: [] as number[],
};

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),

  // password optional, BUT if provided -> confirm required & must match
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .notRequired(),
  confirmPassword: Yup.string().when("password", {
    is: (v: string) => v && v.trim().length > 0,
    then: (s) =>
      s
        .required("Confirm password is required")
        .oneOf([Yup.ref("password")], "Passwords must match"),
    otherwise: (s) => s.notRequired(),
  }),

  departmentId: Yup.number()
    .typeError("Department is required")
    .required("Department is required"),

  roleIds: Yup.array().min(1, "At least one role is required"),
});

type PasswordForm = {
  password: string;
  confirmPassword: string;
};

const UserUpdateFormModal: React.FC<Props> = ({
  show,
  onClose,
  onUserUpdated,
  initialUserData,
  accountId,
}) => {
  const dispatch = useDispatch<AppDispatch>();

  const { departments, loading: depsLoading } = useSelector(
    (s: RootState) => s.departments
  );

  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Existing Image URL = SAME as UsersTable logic
  const existingImageUrl = useMemo(() => {
  const url = initialUserData?.profilePictureUrl;
  if (!url) return null;
  return url; // already full S3 or gateway URL
}, [initialUserData?.profilePictureUrl]);

  useEffect(() => {
    dispatch(loadDepartments());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  }, [previewURL]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await getRoles();
        setRoleOptions(res.map((r: any) => ({ value: r.id, label: r.name })));
      } catch (e) {
        console.error("Failed to fetch roles", e);
      }
    };
    fetchRoles();
  }, []);

  /**
   * ✅ Password fields handled with RHF FloatingInput (because it respects type="password")
   * We keep Formik as the "single source of truth" by mirroring RHF -> Formik.
   */
  const {
    control,
    setValue: setRHFValue,
    reset: resetRHF,
    formState: { errors: rhfErrors },
  } = useForm<PasswordForm>({
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
  });

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      if (!accountId) return;

      setSubmitting(true);
      setLoading(true);

      try {
        const payload = {
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          departmentId: values.departmentId!,
          roleIds: values.roleIds,
          ...(values.password.trim()
            ? { password: values.password.trim() }
            : {}),
        };

        await dispatch(
          updateInternalUserThunk({
            accountId,
            payload,
            profilePicture: profilePicFile,
          })
        ).unwrap();

        onUserUpdated();
        closeAndReset();
      } catch (err: any) {
        setStatus(err?.message || "Update failed");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  // apply initialUserData into form
  useEffect(() => {
    if (!initialUserData) return;

    const deptRaw =
      initialUserData.additionalAttributes?.departmentId ??
      initialUserData.additionalAttributes?.departmentID ??
      "";

    const deptId = String(deptRaw).trim() !== "" ? Number(deptRaw) : undefined;

    formik.setValues({
      username: initialUserData.username ?? "",
      firstName: initialUserData.firstName ?? "",
      lastName: initialUserData.lastName ?? "",
      email: initialUserData.email ?? "",
      departmentId: deptId,
      roleIds: initialUserData.roles?.map((r) => r.id) ?? [],
      password: "",
      confirmPassword: "",
    });

    // reset RHF password fields too
    resetRHF({ password: "", confirmPassword: "" });

    setProfilePicFile(null);
    setPreviewURL(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUserData]);

  const closeAndReset = () => {
    formik.resetForm();
    resetRHF({ password: "", confirmPassword: "" });
    setProfilePicFile(null);
    setPreviewURL(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    onClose();
  };

  return (
    <FormModalMedium
      isOpen={show}
      onClose={closeAndReset}
      title="Update Internal User"
      body={
        <>
          {formik.status && (
            <div className="alert alert-danger">
              <div className="alert-text font-weight-bold">{formik.status}</div>
            </div>
          )}

          {/* ✅ Current Picture on top */}
          {existingImageUrl && (
            <div className="mb-3">
              <label className="form-label">Current Picture</label>
              <div className="d-flex align-items-center gap-3">
                <img
                  src={existingImageUrl}
                  alt="Current"
                  style={{
                    width: 80,
                    height: 80,
                    objectFit: "cover",
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
                <div className="text-muted" style={{ fontSize: 13 }}>
                  This is the currently saved profile picture.
                </div>
              </div>
            </div>
          )}

          {/* ✅ Upload picture + preview */}
          <div className="mb-3">
            <label htmlFor="profilePicture" className="form-label">
              Change Profile Picture
            </label>

            <input
              id="profilePicture"
              type="file"
              accept="image/*"
              className="form-control"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setProfilePicFile(file);

                if (file) setPreviewURL(URL.createObjectURL(file));
                else setPreviewURL(null);
              }}
            />

            {previewURL && (
              <div className="mt-2">
                <div className="text-muted" style={{ fontSize: 13 }}>
                  New picture preview:
                </div>
                <img
                  src={previewURL}
                  alt="Preview"
                  className="mt-1"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "cover",
                    borderRadius: "0.75rem",
                    border: "1px solid #e5e7eb",
                  }}
                />
              </div>
            )}
          </div>

          {/* Names */}
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

          {/* Username + Email */}
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
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                errors={
                  formik.touched.email && formik.errors.email
                    ? { email: formik.errors.email }
                    : undefined
                }
              />
            </div>
          </div>

          {/* ✅ Password optional (use FloatingInput from RHF so type works) */}
          <div className="row g-3 mt-1">
            <div className="col-md-6">
              <FloatingInput<PasswordForm>
                label="New Password (optional)"
                name="password"
                control={control}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
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
                  id="showPassword"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="showPassword">
                  Show password
                </label>
              </div>

              {/* ✅ show Formik validation error */}
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
                name="confirmPassword"
                control={control}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="mb-2 mt-2"
                errors={rhfErrors}
                onBlur={() => formik.setFieldTouched("confirmPassword", true)}
                onChange={(e) => {
                  const v = e.target.value;
                  setRHFValue("confirmPassword", v, { shouldValidate: false });
                  formik.setFieldValue("confirmPassword", v);
                }}
                controlled
                value={formik.values.confirmPassword}
              />

              <div className="form-check mt-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="showConfirmPassword"
                  checked={showConfirmPassword}
                  onChange={(e) => setShowConfirmPassword(e.target.checked)}
                />
                <label
                  className="form-check-label"
                  htmlFor="showConfirmPassword"
                >
                  Show confirm password
                </label>
              </div>

              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="fv-plugins-message-container">
                    <div className="fv-help-block">
                      <span role="alert">
                        {formik.errors.confirmPassword as string}
                      </span>
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Department */}
          <div className="col-md-12 mt-2">
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
              {departments.map((d: any) => (
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

          {/* Roles */}
          <div className="row g-3 mt-2">
            <div className="col-md-12">
              <FormikFloatingSelect
                label="Roles"
                name="roleIds"
                value={roleOptions.filter((opt) =>
                  formik.values.roleIds.includes(opt.value)
                )}
                onChange={(selected) => {
                  const ids = (selected as MultiValue<RoleOption>).map(
                    (opt) => opt.value
                  );
                  formik.setFieldValue("roleIds", ids);
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

export default UserUpdateFormModal;
