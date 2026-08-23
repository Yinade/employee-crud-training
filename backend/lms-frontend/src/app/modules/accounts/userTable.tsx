import React, { useMemo, useEffect, useState } from "react";
import DynamicTableComponent from "../../../reusableComponents/dynamicTableComponentWithExport";
import { UserModel, RoleModel } from "../../models/user.model";
import { MRT_ColumnDef, MRT_TableInstance } from "material-react-table";
import { Box, Typography } from "@mui/material";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { useSelector, useDispatch } from "react-redux";
import { loadDepartments } from "../departments/departmentSlice";
import { RootState, AppDispatch } from "../../store";
import { ConfirmDialog } from "../../../reusableComponents/dialogComponents";
import { notify } from "../../../reusableComponents/toastHelper";
import { AnyAaaaRecord } from "dns";

interface UsersTableProps {
  users: UserModel[];
  onEditUser: (user: any) => void;
  onCreateUser: () => void;
  onUpdateUser: (id: number) => void;
  onDeleteUser: (id: number) => void;

  onDeactivateUser: (accountId: number, status: string) => Promise<void> | void;
  onActivateUser: (accountId: number, status: string) => Promise<void> | void;

  errorMessage: string | null;
  className?: string;
}

// ✅ Base URL for legacy relative paths (if any)
const fileBaseUrl = import.meta.env
  .VITE_APP_FILE_ACCESS_fROM_IDENTITY_SERVICE_URL as string | undefined;

const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onEditUser,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onDeactivateUser,
  onActivateUser,
  errorMessage,
  className,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { departments } = useSelector((state: RootState) => state.departments);

  useEffect(() => {
    dispatch(loadDepartments());
  }, [dispatch]);

  const getDepartmentName = (deptIdString?: string) => {
    if (!deptIdString) return undefined;
    const id = Number(deptIdString);
    return departments.find((d: any) => d.id === id)?.name;
  };

  // ----------------- Confirm dialog state (shared) -----------------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTitle, setConfirmTitle] = useState<string>("Confirm");
  const [confirmMessage, setConfirmMessage] = useState<string>("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [pendingIds, setPendingIds] = useState<number[]>([]);
  const [pendingAction, setPendingAction] = useState<
    "activate" | "deactivate" | null
  >(null);
  const [afterAction, setAfterAction] = useState<(() => void) | null>(null);

  const openConfirm = (opts: {
    title: string;
    message: string;
    ids: number[];
    action: "activate" | "deactivate";
    after?: () => void;
  }) => {
    setConfirmTitle(opts.title);
    setConfirmMessage(opts.message);
    setPendingIds(opts.ids);
    setPendingAction(opts.action);
    setAfterAction(() => opts.after ?? null);
    setConfirmOpen(true);
  };

  const closeConfirm = () => {
    if (confirmLoading) return;
    setConfirmOpen(false);
    setPendingIds([]);
    setPendingAction(null);
    setAfterAction(null);
  };

  const handleConfirm = async () => {
    if (!pendingIds.length || !pendingAction) {
      closeConfirm();
      return;
    }

    setConfirmLoading(true);
    try {
      await Promise.all(
        pendingIds.map((id) =>
          pendingAction === "activate"
            ? Promise.resolve(onActivateUser(id, "activate"))
            : Promise.resolve(onDeactivateUser(id, "deactivate")),
        ),
      );

      notify.success(
        pendingIds.length === 1
          ? pendingAction === "activate"
            ? "Account activated successfully."
            : "Account deactivated successfully."
          : pendingAction === "activate"
            ? `Activated ${pendingIds.length} account(s).`
            : `Deactivated ${pendingIds.length} account(s).`,
      );

      afterAction?.();
    } catch (e: any) {
      notify.error(e?.message || "Action failed.");
    } finally {
      setConfirmLoading(false);
      closeConfirm();
    }
  };

  // ----------------- CSV export -----------------
  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const handleExportRows = (table: any) => {
    const rowData = table
      .getSelectedRowModel()
      .rows.map((row: any) => row.original);
    const formattedData = rowData.map((user: UserModel) => ({
      accountId: user.accountId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      accountStatus: user.accountStatus,
      createdDate: new Date(user.createdDate).toLocaleDateString("en-US"),
      userType: user.userType,
      roles: user.roles.map((role: RoleModel) => role.name).join(", "),
      additionalAttributes: (() => {
        const deptName = getDepartmentName(
          user.additionalAttributes?.departmentId,
        );
        const rest = Object.entries(user.additionalAttributes || {})
          .filter(([k]) => k !== "departmentId")
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");
        return [
          user.additionalAttributes?.departmentId
            ? `departmentId: ${user.additionalAttributes.departmentId}${
                deptName ? ` (${deptName})` : ""
              }`
            : null,
          rest || null,
        ]
          .filter(Boolean)
          .join(", ");
      })(),
    }));
    const csv = generateCsv(csvConfig)(formattedData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const formattedData = users.map((user) => ({
      accountId: user.accountId,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      accountStatus: user.accountStatus,
      createdDate: new Date(user.createdDate).toLocaleDateString("en-US"),
      userType: user.userType,
      roles: user.roles.map((role) => role.name).join(", "),
      additionalAttributes: Object.entries(user.additionalAttributes || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join(", "),
    }));
    const csv = generateCsv(csvConfig)(formattedData);
    download(csvConfig)(csv);
  };

  // ----------------- Activate/Deactivate (single + bulk) -----------------

  const confirmSingleToggle = (user: UserModel) => {
    const currentlyActive = user.accountStatus === "ACTIVE";
    const nextAction: "activate" | "deactivate" = currentlyActive
      ? "deactivate"
      : "activate";

    openConfirm({
      title: currentlyActive ? "Confirm Deactivate" : "Confirm Activate",
      message: currentlyActive
        ? `Are you sure you want to deactivate "${user.firstName} ${user.lastName}"?`
        : `Are you sure you want to activate "${user.firstName} ${user.lastName}"?`,
      ids: [user.accountId],
      action: nextAction,
    });
  };

  const handleDeactivateSelected = (table: MRT_TableInstance<UserModel>) => {
    const selected = table.getSelectedRowModel().rows.map((r) => r.original);

    if (!selected.length) {
      notify.info("No rows selected.");
      return;
    }

    const ids = selected.map((u) => u.accountId);

    openConfirm({
      title: "Confirm Deactivate",
      message: `Are you sure you want to deactivate ${selected.length} account(s)?`,
      ids,
      action: "deactivate",
      after: () => table.resetRowSelection(),
    });
  };

  const handleActivateSelected = (table: MRT_TableInstance<UserModel>) => {
    const selected = table.getSelectedRowModel().rows.map((r) => r.original);

    if (!selected.length) {
      notify.info("No rows selected.");
      return;
    }

    const ids = selected.map((u) => u.accountId);

    openConfirm({
      title: "Confirm Activate",
      message: `Are you sure you want to activate ${selected.length} account(s)?`,
      ids,
      action: "activate",
      after: () => table.resetRowSelection(),
    });
  };

  const handleContact = (table: MRT_TableInstance<UserModel>) => {
    table.getSelectedRowModel().rows.forEach((row: any) => {
      alert("Contacting " + row.original.firstName);
    });
  };

  // ----------------- Columns -----------------
  const columns = useMemo<MRT_ColumnDef<UserModel>[]>(
    () => [
      {
        accessorFn: (row) => `${row.accountId}`,
        id: "accountId",
        header: "Id",
        size: 50,
      },
      {
        accessorKey: "firstName",
        enableClickToCopy: true,
        filterVariant: "autocomplete",
        header: "First Name",
        size: 300,
      },
      {
        accessorKey: "lastName",
        enableClickToCopy: true,
        filterVariant: "autocomplete",
        header: "Last Name",
        size: 300,
      },
      {
        accessorKey: "email",
        enableClickToCopy: true,
        filterVariant: "autocomplete",
        header: "Email",
        size: 300,
      },
      {
        accessorKey: "accountStatus",
        header: "Status",
        Cell: ({ row }) => {
          const status = row.original.accountStatus;
          return (
            <Typography
              sx={{
                cursor: "pointer",
                color: status === "ACTIVE" ? "green" : "red",
                textDecoration: "underline",
              }}
              onClick={() => confirmSingleToggle(row.original)}
            >
              {status}
            </Typography>
          );
        },
      },
      {
        accessorFn: (row) => new Date(row.createdDate.split("T")[0]),
        id: "startDate",
        header: "Start Date",
        filterVariant: "date",
        filterFn: "lessThan",
        sortingFn: "datetime",
        Cell: ({ cell }) => cell.getValue<Date>()?.toLocaleDateString("en-US"),
      },
    ],
    [departments],
  );

  return (
    <>
      <DynamicTableComponent
        columns={columns}
        data={users}
        onAdd={onCreateUser}
        onEdit={(row) => onUpdateUser(row.accountId)}
        onDelete={onDeleteUser}
        customActionButtons={[
          {
            label: "Deactivate",
            color: "error",
            onClick: handleDeactivateSelected,
            disabled: (table) => !table.getIsSomeRowsSelected(),
            iconName: "shield-cross",
          },
          {
            label: "Activate",
            color: "success",
            onClick: handleActivateSelected,
            disabled: (table) => !table.getIsSomeRowsSelected(),
            iconName: "shield-tick",
          },
          {
            label: "Contact",
            color: "info",
            onClick: handleContact,
            disabled: (table) => !table.getIsSomeRowsSelected(),
            iconName: "message-text",
          },
        ]}
        onExportData={handleExportData}
        onExportRows={handleExportRows}
        renderDetailPanel={({ row }) => {
          const raw = row.original.profilePictureUrl?.trim();
          let imageUrl: string | null = null;

          if (raw) {
            if (raw.startsWith("http://") || raw.startsWith("https://")) {
              // ✅ New S3-style URL from backend
              imageUrl = raw;
            } else if (fileBaseUrl) {
              // ✅ Legacy relative path from identity-service
              imageUrl = raw.startsWith("/")
                ? `${fileBaseUrl}${raw}`
                : `${fileBaseUrl}/${raw}`;
            } else {
              imageUrl = raw;
            }
          }

          return (
            <Box
              sx={{
                padding: "16px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${row.original.firstName} ${row.original.lastName}'s Profile`}
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "10%",
                    objectFit: "cover",
                    border: "2px solid #ccc",
                  }}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display =
                      "none";
                  }}
                />
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No profile image uploaded.
                </Typography>
              )}

              <Box>
                <Typography variant="h6" gutterBottom>
                  {row.original.firstName}'s Details
                </Typography>
                <Typography>Email: {row.original.email}</Typography>
                <Typography>Job Title: {row.original.userType}</Typography>
                {row.original.additionalAttributes?.departmentId && (
                  <Typography>
                    Department:{" "}
                    {getDepartmentName(
                      row.original.additionalAttributes.departmentId,
                    ) ?? "Unknown"}{" "}
                    (
                    <small>
                      ID: {row.original.additionalAttributes.departmentId}
                    </small>
                    )
                  </Typography>
                )}
              </Box>
            </Box>
          );
        }}
        errorMessage={errorMessage}
        className={className}
        addButtonLabel="New User"
        showActionsColumn={true}
        enableRowSelection={true}
        enableEdit={true}
        enableDelete={true}
        showGlobalFilter={true}
        showExportAll={true}
        showExportSelected={true}
        showDeleteSelected={true}
        showFiltersButton={true}
        showColumnsButton={true}
        showFullScreenButton={true}
        showDensePaddingButton={true}
        showAddButton={true}
        showTopToolbar={true}
        showTopBarActionButtons={true}
        enableStickyHeader={true}
        enableStickyFooter={true}
      />

      <ConfirmDialog
        open={confirmOpen}
        title={confirmTitle}
        message={confirmMessage}
        confirmLabel={pendingAction === "activate" ? "Activate" : "Deactivate"}
        cancelLabel="Cancel"
        confirmColor={pendingAction === "activate" ? "success" : "error"}
        loading={confirmLoading}
        maxWidth="xs"
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </>
  );
};

export default UsersTable;
