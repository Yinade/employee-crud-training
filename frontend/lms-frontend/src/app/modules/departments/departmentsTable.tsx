import React, { useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Department } from "../../models/department.model";
import { Typography } from "@mui/material";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { KTIcon } from "../../../_metronic/helpers";
import { RootState, AppDispatch } from "../../store";
import { loadDepartments, deleteDepartmentThunk } from "./departmentSlice";
import DynamicTableComponent from "../../../reusableComponents/dynamicTableComponentWithExport";
import { MRT_ColumnDef, MRT_TableInstance } from "material-react-table";
import { ConfirmDialog } from "../../../reusableComponents/dialogComponents";
import { notify } from "../../../reusableComponents/toastHelper";

interface DepartmentsTableProps {
  className?: string;
  onEdit: (department: Department) => void;
  onAdd: () => void;
  errorMessage?: string | null;
}

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const DepartmentsTable: React.FC<DepartmentsTableProps> = ({
  className,
  onEdit,
  onAdd,
  errorMessage,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { departments, loading, error } = useSelector((state: RootState) => {
    console.log("Redux state for departments:", state.departments);
    return state.departments;
  });

  // ---- Confirm dialog state (single + bulk delete) ----
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [afterDelete, setAfterDelete] = useState<(() => void) | null>(null);

  useEffect(() => {
    dispatch(loadDepartments());
  }, [dispatch]);

  const columns = useMemo<MRT_ColumnDef<Department>[]>(
    () => [
      {
        accessorFn: (row) => `${row.id}`,
        id: "id",
        header: "Id",
        size: 50,
      },
      {
        accessorKey: "name",
        enableClickToCopy: true,
        filterVariant: "autocomplete",
        header: "Name",
        size: 200,
      },
      {
        accessorKey: "createdDate",
        header: "Created Date",
        size: 200,
        Cell: ({ cell }) =>
          cell.getValue()
            ? new Date(cell.getValue<string>()).toLocaleString()
            : "N/A",
      },
      {
        accessorKey: "updatedDate",
        header: "Updated Date",
        size: 200,
        Cell: ({ cell }) =>
          cell.getValue()
            ? new Date(cell.getValue<string>()).toLocaleString()
            : "N/A",
      },
    ],
    []
  );

  const handleExportData = () => {
    const formattedData = departments.map((d) => ({
      id: d.id,
      name: d.name,
      createdDate: d.createdDate
        ? new Date(d.createdDate).toLocaleString()
        : "N/A",
      updatedDate: d.updatedDate
        ? new Date(d.updatedDate).toLocaleString()
        : "N/A",
    }));
    const csv = generateCsv(csvConfig)(formattedData);
    download(csvConfig)(csv);
  };

  const handleExportRows = (table: MRT_TableInstance<Department>) => {
    const selectedRows = table.getSelectedRowModel().rows.map((row) => ({
      id: row.original.id,
      name: row.original.name,
      createdDate: row.original.createdDate
        ? new Date(row.original.createdDate).toLocaleString()
        : "N/A",
      updatedDate: row.original.updatedDate
        ? new Date(row.original.updatedDate).toLocaleString()
        : "N/A",
    }));
    if (selectedRows.length > 0) {
      const csv = generateCsv(csvConfig)(selectedRows);
      download(csvConfig)(csv);
    } else {
      notify.info("No rows selected for export.");
    }
  };

  // ---------- Delete logic (single & bulk) with ConfirmDialog ----------

  // Single delete → open confirm
  const handleDelete = (id: number) => {
    if (id == null) {
      notify.error("Invalid department ID.");
      return;
    }

    const target = departments.find((d) => d.id === id);
    const name = target?.name || "this department";

    setPendingDeleteIds([id]);
    setAfterDelete(() => null);
    setConfirmMessage(
      `Are you sure you want to delete the department "${name}"?`
    );
    setConfirmOpen(true);
  };

  // Bulk delete → open confirm
  const handleDeleteSelectedRows = (
    table: MRT_TableInstance<Department>
  ) => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    if (selectedRows.length === 0) {
      notify.info("No rows selected for deletion.");
      return;
    }

    const names = selectedRows.map((r) => r.name).join(", ");
    const message =
      selectedRows.length === 1
        ? `Are you sure you want to delete the department "${names}"?`
        : `Are you sure you want to delete ${selectedRows.length} departments: "${names}"?`;

    const ids: number[] = [];
    for (const row of selectedRows) {
      if (row.id == null) {
        notify.error(
          "Found a row with invalid ID; cannot delete these departments."
        );
        return;
      }
      ids.push(row.id);
    }

    setPendingDeleteIds(ids);
    setAfterDelete(() => () => {
      table.resetRowSelection();
    });
    setConfirmMessage(message);
    setConfirmOpen(true);
  };

  // ConfirmDialog → perform delete(s)
  const handleConfirmDelete = async () => {
    if (!pendingDeleteIds.length) {
      setConfirmOpen(false);
      return;
    }

    setConfirmLoading(true);
    try {
      await Promise.all(
        pendingDeleteIds.map((id) =>
          dispatch(deleteDepartmentThunk(id)).unwrap()
        )
      );

      if (pendingDeleteIds.length === 1) {
        const id = pendingDeleteIds[0];
        const target = departments.find((d) => d.id === id);
        const name = target?.name || "Department";
        notify.success(`Department "${name}" deleted successfully.`);
      } else {
        const names = pendingDeleteIds
          .map(
            (id) =>
              departments.find((d) => d.id === id)?.name ?? "Unknown department"
          )
          .join(", ");
        notify.success(`Departments "${names}" deleted successfully.`);
      }

      await dispatch(loadDepartments()).unwrap();
      afterDelete?.();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        notify.error(
          pendingDeleteIds.length === 1
            ? "You are not authorized to delete this department."
            : "You are not authorized to delete these departments."
        );
      } else {
        notify.error(
          `Error deleting department(s): ${error?.message || "Unknown error"}`
        );
      }
    } finally {
      setConfirmLoading(false);
      setConfirmOpen(false);
      setPendingDeleteIds([]);
      setAfterDelete(null);
    }
  };

  const handleCancelConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setPendingDeleteIds([]);
    setAfterDelete(null);
  };

  return (
    <>
      <div className={`card ${className}`}>
        <div className="card-header px-12 border-0 pt-6">
          <h3 className="card-title align-items-start flex-column">
            <span className="card-label fw-bold fs-3 mb-1">Departments</span>
            <span className="text-muted mt-1 fw-semibold fs-7">
              Manage departments
            </span>
          </h3>
          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-light-primary"
              onClick={onAdd}
            >
              <KTIcon iconName="plus" className="fs-3" />
              New Department
            </button>
          </div>
        </div>
        <div className="card-body py-3">
          {errorMessage && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}
          {loading && <Typography>Loading departments...</Typography>}
          {error && <Typography color="error">Error: {error}</Typography>}
          <DynamicTableComponent
            columns={columns}
            data={departments}
            addButtonLabel="New Department"
            showActionsColumn={true}
            enableRowSelection={true}
            enableEdit={true}
            enableDelete={true}
            onDataChange={() => {
              dispatch(loadDepartments());
            }}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={handleDelete}
            onDeleteSelected={handleDeleteSelectedRows}
            onExportData={handleExportData}
            onExportRows={handleExportRows}
          />
        </div>
      </div>

      {/* Shared Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Delete"
        message={confirmMessage}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmColor="error"
        loading={confirmLoading}
        maxWidth="xs"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelConfirm}
      />
    </>
  );
};

export { DepartmentsTable };