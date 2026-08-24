import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import {
  createDepartmentThunk,
  updateDepartmentThunk,
  loadDepartments,
} from "./departmentSlice";
import { useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Department } from "../../models/department.model";
import { FormModalMedium } from "../../../reusableComponents/modalComponents";
import { FloatingInput } from "../../../reusableComponents/inputComponents";
import { toast } from "react-toastify";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  departmentData?: Department;
};

interface FormData {
  name: string;
}

const validationSchema = Yup.object<FormData>({
  name: Yup.string()
    .required("Name is required")
    .max(255, "Name must be less than 255 characters"),
});

const DepartmentsFormModal: React.FC<Props> = ({
  isOpen,
  onClose,
  departmentData,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(validationSchema) as unknown as Resolver<FormData>,
    defaultValues: {
      name: "",
    },
  });

  // Debug: Log form values and errors
  const formValues = watch();
  console.log("Current form values:", formValues);
  console.log("Form errors:", errors);

  useEffect(() => {
    if (departmentData) {
      console.log("Setting form values for edit:", departmentData);
      reset({
        name: departmentData.name ? departmentData.name : "",
      });
    } else {
      console.log("Resetting form for create");
      reset({ name: "" });
    }
  }, [departmentData, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const normalizedData = {
        name: data.name,
      };
      console.log("Submitting data:", normalizedData);

      if (departmentData) {
        await dispatch(
          updateDepartmentThunk({
            id: departmentData.id,
            data: normalizedData,
          }),
        ).unwrap();
        toast.success("Department updated successfully.");
      } else {
        await dispatch(createDepartmentThunk(normalizedData)).unwrap();
        toast.success("Department created successfully.");
      }

      await dispatch(loadDepartments()).unwrap();
      onClose();
      reset({ name: "" });
    } catch (error: any) {
      console.error("Error saving department:", error);
      toast.error(
        `Error saving department: ${error?.message || "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModalMedium
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset({ name: "" });
      }}
      title={departmentData ? "Update Department" : "Create Department"}
      body={
        <>
          <FloatingInput
            label="Name"
            name="name"
            control={control}
            errors={errors}
            type="text"
            placeholder="Enter department name"
            className="mb-7 mt-3"
          />
        </>
      }
      showSaveButton
      isLoading={loading}
      onSave={handleSubmit(onSubmit)}
    />
  );
};

export default DepartmentsFormModal;
