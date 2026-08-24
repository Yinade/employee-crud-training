import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../store";

import { createUnitThunk, updateUnitThunk, loadUnits } from "./unitsSlice";
import { useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { Unit } from "../../models/unit.model";
import { FormModalMedium } from "../../../../reusableComponents/modalComponents";
import { FloatingInput } from "../../../../reusableComponents/inputComponents";
import { notify } from "../../../../reusableComponents/toastHelper";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  unitData?: Unit;
};

interface FormData {
  name: string;
  description: string;
}

const validationSchema = Yup.object<FormData>({
  name: Yup.string()
    .required("Name is required")
    .max(191, "Name must be less than 191 characters"),
  description: Yup.string()
    .required("Description is required")
    .max(191, "Description must be less than 191 characters"),
});

const UnitsFormModal: React.FC<Props> = ({ isOpen, onClose, unitData }) => {
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
      description: "",
    },
  });

  const formValues = watch();
  console.log("Units form values:", formValues);
  console.log("Units form errors:", errors);

  useEffect(() => {
    if (unitData) {
      reset({
        name: unitData.name || "",
        description: unitData.description || "",
      });
    } else {
      reset({ name: "", description: "" });
    }
  }, [unitData, reset]);

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const normalizedData = {
        name: data.name,
        description: data.description,
      };

      if (unitData) {
        await dispatch(
          updateUnitThunk({
            id: unitData.id,
            data: normalizedData,
          })
        ).unwrap();
        notify.success("Unit updated successfully.");
      } else {
        await dispatch(createUnitThunk(normalizedData)).unwrap();
        notify.success("Unit created successfully.");
      }

      await dispatch(loadUnits()).unwrap();
      onClose();
      reset({ name: "", description: "" });
    } catch (error: any) {
      console.error("Error saving unit:", error);
      notify.error(`Error saving unit: ${error?.message || String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormModalMedium
      isOpen={isOpen}
      onClose={() => {
        onClose();
        reset({ name: "", description: "" });
      }}
      title={unitData ? "Update Unit" : "Create Unit"}
      body={
        <>
          <FloatingInput
            label="Name"
            name="name"
            control={control}
            errors={errors}
            type="text"
            placeholder="Enter unit name"
            className="mb-7 mt-3"
          />
          <FloatingInput
            label="Description"
            name="description"
            control={control}
            errors={errors}
            type="text"
            placeholder="Enter unit description"
            className="mb-7"
          />
        </>
      }
      showSaveButton
      isLoading={loading}
      onSave={handleSubmit(onSubmit)}
    />
  );
};

export default UnitsFormModal;