import React, { useMemo, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Unit } from "../../models/unit.model";
import { Box, Typography } from "@mui/material";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { KTIcon } from "../../../../_metronic/helpers";
import { RootState, AppDispatch } from "../../../store";
import { loadUnits, deleteUnitThunk } from "./unitsSlice";
import DynamicTableComponent from "../../../../reusableComponents/dynamicTableComponentWithExport";
import { MRT_ColumnDef, MRT_TableInstance } from "material-react-table";
import { ConfirmDialog } from "../../../../reusableComponents/dialogComponents";
import { notify } from "../../../../reusableComponents/toastHelper";

interface UnitsTableProps {
  className?: string;
  onEdit: (unit: Unit) => void;
  onAdd: () => void;
  errorMessage?: string | null;
}

const csvConfig = mkConfig({
  fieldSeparator: ",",
  decimalSeparator: ".",
  useKeysAsHeaders: true,
});

const UnitsTable: React.FC<UnitsTableProps> = ({
  className,
  onEdit,
  onAdd,
  errorMessage,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { units, loading, error } = useSelector(
    (state: RootState) => state.units,
  );

  // ---------- Confirm dialog shared state ----------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<number[]>([]);
  const [afterDelete, setAfterDelete] = useState<(() => void) | null>(null);

  useEffect(() => {
    dispatch(loadUnits());
  }, [dispatch]);

  const columns = useMemo<MRT_ColumnDef<Unit>[]>(
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
        accessorKey: "description",
        enableClickToCopy: true,
        filterVariant: "autocomplete",
        header: "Description",
        size: 300,
      },
    ],
    [],
  );

  const handleExportData = () => {
    const formattedData = units.map((u) => ({
      id: u.id,
      name: u.name,
      description: u.description,
    }));
    const csv = generateCsv(csvConfig)(formattedData);
    download(csvConfig)(csv);
  };

  const handleExportRows = (table: MRT_TableInstance<Unit>) => {
    const selectedRows = table.getSelectedRowModel().rows.map((row) => ({
      id: row.original.id,
      name: row.original.name,
      description: row.original.description,
    }));
    if (selectedRows.length > 0) {
      const csv = generateCsv(csvConfig)(selectedRows);
      download(csvConfig)(csv);
    } else {
      notify.info("No rows selected for export.");
    }
  };

  // ---------- Delete logic (single & bulk) with linked check ----------

  // Single delete → check link, then open confirm dialog
  const handleDelete = async (id: number) => {
    try {
      setPendingDeleteIds([id]);
      setAfterDelete(() => null);
      setConfirmMessage("Are you sure you want to delete this unit?");
      setConfirmOpen(true);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        notify.error("You are not authorized to delete this unit.");
      } else {
        notify.error(
          `Error checking unit linkage: ${error?.message || String(error)}`,
        );
      }
    }
  };

  // Bulk delete → check links for all selected, then open confirm dialog
  const handleDeleteSelectedRows = async (table: MRT_TableInstance<Unit>) => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);

    if (!selectedRows.length) {
      notify.info("No rows selected for deletion.");
      return;
    }

    try {
      const ids = selectedRows.map((r) => r.id);
      setPendingDeleteIds(ids);
      setAfterDelete(() => () => {
        table.resetRowSelection();
      });
      setConfirmMessage(
        `Are you sure you want to delete ${selectedRows.length} row(s)?`,
      );
      setConfirmOpen(true);
    } catch (error: any) {
      if (error?.response?.status === 403) {
        notify.error("You are not authorized to delete these units.");
      } else {
        notify.error(
          `Error checking units linkage: ${error?.message || String(error)}`,
        );
      }
    }
  };

  // Confirm dialog → perform the actual deletes
  const handleConfirmDelete = async () => {
    if (!pendingDeleteIds.length) {
      setConfirmOpen(false);
      return;
    }

    setConfirmLoading(true);
    try {
      await Promise.all(
        pendingDeleteIds.map((id) => dispatch(deleteUnitThunk(id)).unwrap()),
      );

      notify.success(
        pendingDeleteIds.length === 1
          ? "Unit deleted successfully."
          : `Deleted ${pendingDeleteIds.length} units.`,
      );

      await dispatch(loadUnits()).unwrap();
      afterDelete?.();
    } catch (error: any) {
      if (error?.response?.status === 403) {
        notify.error(
          pendingDeleteIds.length === 1
            ? "You are not authorized to delete this unit."
            : "You are not authorized to delete these units.",
        );
      } else {
        notify.error(
          pendingDeleteIds.length === 1
            ? `Error deleting unit: ${error?.message || String(error)}`
            : `Error deleting units: ${error?.message || String(error)}`,
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
            <span className="card-label fw-bold fs-3 mb-1">Units</span>
            <span className="text-muted mt-1 fw-semibold fs-7">
              Manage units
            </span>
          </h3>
          <div className="card-toolbar">
            <button
              type="button"
              className="btn btn-sm btn-light-primary"
              onClick={onAdd}
            >
              <KTIcon iconName="plus" className="fs-3" />
              New Unit
            </button>
          </div>
        </div>
        <div className="card-body py-3">
          {errorMessage && (
            <Typography color="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
          )}
          {loading && <Typography>Loading units...</Typography>}
          {error && <Typography color="error">Error: {error}</Typography>}
          <DynamicTableComponent
            columns={columns}
            data={units}
            addButtonLabel="New Unit"
            showActionsColumn={true}
            enableRowSelection={true}
            enableEdit={true}
            enableDelete={true}
            onDataChange={() => {
              dispatch(loadUnits());
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

export { UnitsTable };
