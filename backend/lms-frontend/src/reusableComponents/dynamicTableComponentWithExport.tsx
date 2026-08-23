import React, { useMemo } from "react";
import {
  MaterialReactTable,
  type MRT_ColumnDef,
  MRT_GlobalFilterTextField,
  MRT_ToggleFiltersButton,
  MRT_ShowHideColumnsButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleDensePaddingButton,
  MRT_TableInstance,
  MRT_RowData,
  MRT_Row,
} from "material-react-table";
import { Box, Button } from "@mui/material";
import {
  FileDownload as FileDownloadIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { mkConfig, generateCsv, download } from "export-to-csv";
import { KTIcon } from "../_metronic/helpers";
import { colors } from "../app/utils/color";

interface ActionButton<TData extends MRT_RowData> {
  label: string;
  color: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  onClick: (table: MRT_TableInstance<TData>) => void;
  disabled?: (table: MRT_TableInstance<TData>) => boolean;
  iconName?: string;
}

// ✅ FULL DynamicTableProps interface (with onRowClick added)

interface DynamicTableProps<TData extends MRT_RowData> {
  columns: MRT_ColumnDef<TData>[];
  data: TData[];
  onDataChange?: (newData: TData[]) => void;

  addButtonLabel?: string;
  showActionsColumn?: boolean;
  enableRowSelection?: boolean;
  enableEdit?: boolean;
  enableDelete?: boolean;

  // ✅ per-row permission (disable edit/delete)
  canEditRow?: (row: TData) => boolean;
  canDeleteRow?: (row: TData) => boolean;

  onAdd?: () => void;
  onEdit?: (row: TData) => void;
  onDelete?: (id: number) => Promise<void> | void;
  onDeleteSelected?: (table: MRT_TableInstance<TData>) => Promise<void> | void;

  customActionButtons?: ActionButton<TData>[];

  showGlobalFilter?: boolean;
  showExportAll?: boolean;
  showExportSelected?: boolean;
  showDeleteSelected?: boolean;
  showFiltersButton?: boolean;
  showColumnsButton?: boolean;
  showFullScreenButton?: boolean;
  showDensePaddingButton?: boolean;
  showAddButton?: boolean;
  showTopToolbar?: boolean;
  showTopBarActionButtons?: boolean;

  onExportData?: () => void;
  onExportRows?: (table: MRT_TableInstance<TData>) => void;

  renderDetailPanel?: (row: { row: MRT_Row<TData> }) => React.ReactNode;

  errorMessage?: string | null;
  className?: string;

  enableStickyHeader?: boolean;
  enableStickyFooter?: boolean;
  enableExpanding?: boolean;

  pinRightColumns?: string[];
  pinLeftColumns?: string[];

  // ✅ NEW: row click callback (gives you MRT row with .index and .original)
  onRowClick?: (row: MRT_Row<TData>) => void;
}

const DynamicTableComponent = <TData extends MRT_RowData>({
  columns = [],
  data = [],
  onDataChange,
  addButtonLabel,
  showActionsColumn = true,
  enableRowSelection = true,
  enableEdit = true,
  enableDelete = true,
  canEditRow = () => true,
  canDeleteRow = () => true,

  onAdd,
  onEdit,
  onDelete,
  // enableColumnPinning,
  onDeleteSelected,
  customActionButtons = [],
  showGlobalFilter = true,
  showExportAll = true,
  showExportSelected = true,
  showDeleteSelected = true,
  showFiltersButton = true,
  showColumnsButton = true,
  showFullScreenButton = true,
  showDensePaddingButton = true,
  showAddButton = true,
  showTopToolbar = true,
  showTopBarActionButtons = false,
  onExportData,
  onExportRows,
  renderDetailPanel,
  pinRightColumns = [],
  pinLeftColumns = [],
  enableExpanding = false,
  onRowClick,
}: DynamicTableProps<TData>) => {
  const memoizedColumns = useMemo(() => {
    console.log("Columns:", columns); // Debug columns
    return columns.length ? columns : [];
  }, [columns]);

  const csvConfig = mkConfig({
    fieldSeparator: ",",
    decimalSeparator: ".",
    useKeysAsHeaders: true,
  });

  const handleExportDataDefault = () => {
    const csv = generateCsv(csvConfig)(data);
    download(csvConfig)(csv);
  };

  const handleExportRowsDefault = (table: MRT_TableInstance<TData>) => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    if (selectedRows.length > 0) {
      const csv = generateCsv(csvConfig)(selectedRows);
      download(csvConfig)(csv);
    } else {
      alert("No rows selected for export.");
    }
  };

  const handleDeleteSelectedRows = (table: MRT_TableInstance<TData>) => {
    const selectedRows = table
      .getSelectedRowModel()
      .rows.map((row) => row.original);
    if (selectedRows.length === 0) {
      alert("No rows selected for deletion.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedRows.length} row(s)?`,
      )
    ) {
      const updatedData = data.filter(
        (item) => !selectedRows.some((selected) => selected.id === item.id),
      );
      onDataChange?.(updatedData);
      table.resetRowSelection();
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        height: "auto",
        paddingX: "0.5rem",
        paddingY: "1rem",
        boxSizing: "border-box",
        opacity: 1,
        backgroundColor: colors.tableBackground,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <MaterialReactTable
          columns={memoizedColumns}
          data={data}
          enableColumnFilters
          enableColumnFilterModes
          enableSorting
          enablePagination
          enableGlobalFilter
          enableRowSelection={enableRowSelection}
          enableRowActions={showActionsColumn}
          enableExpanding={!!renderDetailPanel || enableExpanding}
          renderDetailPanel={renderDetailPanel}
          // initialState={{
          //   showGlobalFilter: showGlobalFilter,
          //   showColumnFilters: false,
          //   columnPinning: {
          //     left: [
          //       ...(renderDetailPanel ? ["mrt-row-expand"] : []),
          //       ...(enableRowSelection ? ["mrt-row-select"] : []),
          //     ],
          //     right:
          //       showActionsColumn && (enableEdit || enableDelete)
          //         ? ["mrt-row-actions"]
          //         : [],
          //   },
          // }}
          initialState={{
            showGlobalFilter: showGlobalFilter,
            showColumnFilters: false,
            columnPinning: {
              left: [
                ...(renderDetailPanel ? ["mrt-row-expand"] : []),
                ...(enableRowSelection ? ["mrt-row-select"] : []),
                ...(pinLeftColumns ?? []),
              ],
              right: [
                ...(pinRightColumns ?? []), // ✅ custom pinned cols first
                ...(showActionsColumn && (enableEdit || enableDelete)
                  ? ["mrt-row-actions"]
                  : []),
              ],
            },
          }}
          muiTableProps={{
            sx: {
              width: "100%",
              tableLayout: "auto",
              borderCollapse: "collapse",
              "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(even) .MuiTableCell-root":
                {
                  backgroundColor: colors.evenRowBackground,
                },
              "& .MuiTableBody-root .MuiTableRow-root:nth-of-type(odd) .MuiTableCell-root":
                {
                  backgroundColor: colors.tableBackground,
                },
              "& .MuiTableBody-root .MuiTableRow-root:hover .MuiTableCell-root":
                {
                  backgroundColor: `${colors.rowHoverBackground} !important`,
                },
              "& .MuiTableCell-root[data-pinned='left']": {
                borderRight: "none !important",
                borderLeft: "none !important",
              },
            },
          }}
          muiTableBodyRowProps={({ row }) => ({
            onClick: (e) => {
              const el = e.target as HTMLElement;

              // prevent row-click when clicking buttons/checkbox/inputs/icons
              if (el.closest("button, a, input, label, svg, path")) return;

              onRowClick?.(row);
            },
            sx: {
              cursor: onRowClick ? "pointer" : "default",
            },
          })}
          muiTableContainerProps={{
            sx: {
              maxHeight: "650px",
              overflowY: "auto",
            },
          }}
          muiTableHeadCellProps={({ column }) => ({
            sx: {
              fontFamily:
                '"Noto Sans Ethiopic", "Chinese Quote", -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
              border: "none !important",
              paddingX: 1,
              marginRight: 0,
              marginLeft: 0,
              paddingTop: "4px",
              paddingBottom: "4px",
              verticalAlign: "middle",
              fontSize: 18,
              lineHeight: "1.8",
              fontWeight: "bold",
              textAlign: "left",
              backgroundColor: colors.buttonBackground,
              color: "#fff",
              borderColor: colors.buttonBackground,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "none",
              opacity: 1,
              boxSizing: "border-box",
              "& svg": {
                color: "#ffffff !important",
              },
              ...(column.getIsPinned() === "right"
                ? {
                    backgroundColor: colors.buttonBackground, // header color
                    zIndex: 3,
                  }
                : {}),
              "& .MuiTableSortLabel-icon": {
                color: "#ffffff !important",
              },
              "& .Mui-active .MuiTableSortLabel-icon": {
                color: "#ffffff !important",
                fontWeight: "bold",
              },
              "& .MuiTableSortLabel-root:hover .MuiTableSortLabel-icon": {
                color: `${colors.sortIconHover} !important`,
                fontWeight: "bold",
              },
              "& .MuiButtonBase-root .MuiSvgIcon-root": {
                color: "#ffffff !important",
                opacity: 1,
              },
              // Explicitly remove borders for mrt-row-select and mrt-row-expand
              ...(column.id === "mrt-row-select" ||
              column.id === "mrt-row-expand"
                ? {
                    borderRight: "none !important",
                    borderLeft: "none !important",
                  }
                : {}),
              // Apply 3D shade effect to the rightmost left-pinned column
              ...(column.getIsPinned() === "left" &&
              (column.id === "mrt-row-expand" ||
                (column.id === "mrt-row-select" && !renderDetailPanel))
                ? {
                    boxShadow:
                      "2px 0 2px rgba(0, 0, 0, 0.1), -2px 0 2px rgba(255, 255, 255, 0.5)",
                  }
                : column.getIsPinned() === "right"
                  ? {
                      boxShadow:
                        "-2px 0 2px rgba(0, 0, 0, 0.1), 2px 0 2px rgba(255, 255, 255, 0.5)",
                    }
                  : {}),
            },
          })}
          muiTableBodyCellProps={({ row, column }) => ({
            sx: {
              fontFamily:
                '"Noto Sans Ethiopic", "Chinese Quote", -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
              whiteSpace: "normal",
              wordBreak: "break-word",
              border: "none !important",
              fontWeight: 350,
              lineHeight: 1.6,
              fontSize: 15,
              textAlign: "left",
              paddingX: 1,
              marginRight: 0,
              marginLeft: 0,
              backgroundColor: row.getIsSelected()
                ? `${colors.selectedRowBackground} !important`
                : row.index % 2 === 1
                  ? `${colors.evenRowBackground} !important`
                  : `${colors.tableBackground} !important`,
              boxSizing: "border-box",
              // Explicitly remove borders for mrt-row-select and mrt-row-expand
              ...(column.id === "mrt-row-select" ||
              column.id === "mrt-row-expand"
                ? {
                    borderRight: "none !important",
                    borderLeft: "none !important",
                  }
                : {}),
              ...(column.getIsPinned() === "right"
                ? {
                    zIndex: 2,
                  }
                : {}),

              // Apply 3D shade effect to the rightmost left-pinned column
              ...(column.getIsPinned() === "left" &&
              (column.id === "mrt-row-expand" ||
                (column.id === "mrt-row-select" && !renderDetailPanel))
                ? {
                    boxShadow:
                      "2px 0 2px rgba(0, 0, 0, 0.1), -2px 0 2px rgba(255, 255, 255, 0.5)",
                  }
                : column.getIsPinned() === "right"
                  ? {
                      boxShadow:
                        "-2px 0 2px rgba(0, 0, 0, 0.1), 2px 0 2px rgba(255, 255, 255, 0.5)",
                    }
                  : {}),
            },
          })}
          // renderRowActions={({ row }) =>
          //   showActionsColumn ? (
          //     <Box
          //       sx={{
          //         display: "flex",
          //         gap: "0.5rem",
          //         backgroundColor: "transparent",
          //       }}
          //     >
          //       {enableEdit && (
          //         <button
          //           className="btn btn-icon btn-bg-light btn-active-color-dark btn-color-primary btn-sm me-1"
          //           onClick={() =>
          //             onEdit
          //               ? onEdit(row.original)
          //               : alert(`Edit row: ${JSON.stringify(row.original)}`)
          //           }
          //         >
          //           <KTIcon iconName="pencil" className="fs-3" />
          //         </button>
          //       )}
          //       {enableDelete && (
          //         <button
          //           className="btn btn-icon btn-bg-light btn-active-color-dark btn-color-danger btn-sm"
          //           onClick={async () => {
          //             // const confirmed = window.confirm(
          //             //   "Are you sure you want to delete this client?"
          //             // );
          //             // if (!confirmed) return;

          //             if (onDelete) {
          //               await onDelete(row.original.id);
          //             } else {
          //               const updatedData = data.filter(
          //                 (item) => item.id !== row.original.id
          //               );
          //               onDataChange?.(updatedData);
          //             }
          //           }}
          //           disabled={row.original.id === undefined}
          //         >
          //           <KTIcon iconName="trash" className="fs-3" />
          //         </button>
          //       )}
          //     </Box>
          //   ) : null
          // }
          renderRowActions={({ row }) =>
            showActionsColumn ? (
              <Box
                sx={{
                  display: "flex",
                  gap: "0.5rem",
                  backgroundColor: "transparent",
                }}
              >
                {enableEdit && (
                  <button
                    className="btn btn-icon btn-bg-light btn-active-color-dark btn-color-primary btn-sm me-1"
                    onClick={() =>
                      onEdit
                        ? onEdit(row.original)
                        : alert(`Edit row: ${JSON.stringify(row.original)}`)
                    }
                    // ✅ disable if not allowed
                    disabled={!canEditRow(row.original)}
                    title={
                      !canEditRow(row.original)
                        ? "Only DRAFT can be edited"
                        : "Edit"
                    }
                  >
                    <KTIcon iconName="pencil" className="fs-3" />
                  </button>
                )}

                {enableDelete && (
                  <button
                    className="btn btn-icon btn-bg-light btn-active-color-dark btn-color-danger btn-sm"
                    onClick={async () => {
                      if (!canDeleteRow(row.original)) return; // extra guard
                      if (onDelete) {
                        await onDelete((row.original as any).id);
                      } else {
                        const updatedData = data.filter(
                          (item: any) => item.id !== (row.original as any).id,
                        );
                        onDataChange?.(updatedData);
                      }
                    }}
                    // ✅ disable if not allowed
                    disabled={
                      !canDeleteRow(row.original) ||
                      (row.original as any).id === undefined
                    }
                    title={
                      !canDeleteRow(row.original)
                        ? "Only DRAFT can be deleted"
                        : "Delete"
                    }
                  >
                    <KTIcon iconName="trash" className="fs-3" />
                  </button>
                )}
              </Box>
            ) : null
          }
          renderTopToolbar={
            showTopToolbar
              ? ({ table }: { table: MRT_TableInstance<TData> }) => (
                  <div>
                    {showTopBarActionButtons &&
                      customActionButtons.length > 0 && (
                        <Box
                          sx={(theme) => ({
                            position: "sticky",
                            top: 0,
                            zIndex: 5,
                            backgroundColor: theme.palette.background.default,
                            display: "flex",
                            gap: "0.5rem",
                            p: "8px",
                            alignItems: "flex-end",
                            justifyContent: "flex-end",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          })}
                        >
                          {customActionButtons.map((button, index) => (
                            <Button
                              key={index}
                              color={button.color}
                              disabled={
                                button.disabled
                                  ? button.disabled(table)
                                  : !table.getIsSomeRowsSelected()
                              }
                              onClick={() => button.onClick(table)}
                              variant="contained"
                              startIcon={
                                button.iconName ? (
                                  <KTIcon
                                    iconName={button.iconName}
                                    className="fs-3"
                                  />
                                ) : undefined
                              }
                            >
                              {button.label}
                            </Button>
                          ))}
                        </Box>
                      )}
                    <Box
                      sx={(theme) => ({
                        position: "sticky",
                        top: 0,
                        zIndex: 5,
                        backgroundColor: theme.palette.background.default,
                        display: "flex",
                        gap: "0.5rem",
                        p: "8px",
                        justifyContent: "space-between",
                        borderBottom: `1px solid ${theme.palette.divider}`,
                      })}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          gap: "0.5rem",
                          alignItems: "center",
                        }}
                      >
                        {showGlobalFilter && (
                          <MRT_GlobalFilterTextField
                            table={table}
                            sx={{
                              width: "300px",
                              minWidth: "150px",
                              "& .MuiInputBase-root": {
                                height: "48px",
                                display: "flex",
                                background: colors.toolbarBackground,
                                fontSize: "1.5rem",
                              },
                              "& .MuiInputBase-input": {
                                padding: "4px 8px",
                                "::placeholder": {
                                  color: colors.buttonBackground,
                                  opacity: 1,
                                },
                              },
                              "& .MuiSvgIcon-root": {
                                fontSize: "1.9rem",
                                color: colors.buttonBackground,
                              },
                            }}
                            placeholder="Search..."
                          />
                        )}
                        {showFiltersButton && (
                          <MRT_ToggleFiltersButton
                            table={table}
                            sx={{
                              fontSize: "1.1rem",
                              padding: "6px 12px",
                              height: "48px",
                              borderRadius: "6px",
                              color: colors.buttonBackground,
                              backgroundColor: colors.toolbarBackground,
                              "&:hover": {
                                backgroundColor: colors.toolbarHoverBackground,
                              },
                            }}
                          />
                        )}
                        {showColumnsButton && (
                          <MRT_ShowHideColumnsButton
                            table={table}
                            sx={{
                              fontSize: "1.1rem",
                              padding: "6px 12px",
                              height: "48px",
                              borderRadius: "6px",
                              color: colors.buttonBackground,
                              backgroundColor: colors.toolbarBackground,
                              "&:hover": {
                                backgroundColor: colors.toolbarHoverBackground,
                              },
                            }}
                          />
                        )}
                        {showFullScreenButton && (
                          <MRT_ToggleFullScreenButton
                            table={table}
                            sx={{
                              fontSize: "1.1rem",
                              padding: "6px 12px",
                              height: "48px",
                              borderRadius: "6px",
                              color: colors.buttonBackground,
                              backgroundColor: colors.toolbarBackground,
                              "&:hover": {
                                backgroundColor: colors.toolbarHoverBackground,
                              },
                            }}
                          />
                        )}
                        {showDensePaddingButton && (
                          <MRT_ToggleDensePaddingButton
                            table={table}
                            sx={{
                              fontSize: "1.1rem",
                              padding: "6px 12px",
                              height: "48px",
                              borderRadius: "6px",
                              color: colors.buttonBackground,
                              backgroundColor: colors.toolbarBackground,
                              "&:hover": {
                                backgroundColor: colors.toolbarHoverBackground,
                              },
                            }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: "flex", gap: "0.5rem" }}>
                        {showAddButton && (
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<AddIcon sx={{ fontSize: "4rem" }} />}
                            sx={{
                              color: colors.buttonBackground,
                              borderColor: colors.buttonBackground,
                              "&:hover": {
                                fontFamily:
                                  '"Noto Sans Ethiopic", "Chinese Quote", -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
                                backgroundColor: colors.buttonBackground,
                                color: "#fff",
                                borderColor: colors.buttonBackground,
                                textTransform: "Uppercase",
                                fontWeight: 500,
                                fontSize: "1.4rem",
                              },
                              fontSize: "1.2rem",
                              fontWeight: 500,
                            }}
                            onClick={onAdd || (() => alert("Add new item"))}
                          >
                            {addButtonLabel || "Add New"}
                          </Button>
                        )}
                        {showExportAll && (
                          <Button
                            onClick={onExportData || handleExportDataDefault}
                            startIcon={<FileDownloadIcon />}
                            variant="outlined"
                            sx={{
                              color: colors.buttonBackground,
                              borderColor: colors.buttonBackground,
                              "&:hover": {
                                backgroundColor: colors.buttonBackground,
                                color: "#fff",
                                borderColor: colors.buttonBackground,
                                textTransform: "uppercase",
                                fontSize: "1.2rem",
                                fontWeight: 800,
                              },
                              fontSize: "1.1rem",
                              fontWeight: 500,
                            }}
                          >
                            Exp All Data
                          </Button>
                        )}
                        {showExportSelected && (
                          <Button
                            onClick={() =>
                              onExportRows
                                ? onExportRows(table)
                                : handleExportRowsDefault(table)
                            }
                            startIcon={<FileDownloadIcon />}
                            variant="outlined"
                            disabled={!table.getIsSomeRowsSelected()}
                            sx={{
                              color: colors.buttonBackground,
                              borderColor: colors.buttonBackground,
                              "&:hover": {
                                backgroundColor: colors.buttonBackground,
                                color: "#fff",
                                borderColor: colors.buttonBackground,
                                textTransform: "uppercase",
                                fontSize: "1.3rem",
                                fontWeight: 500,
                              },
                              fontSize: "1.1rem",
                              fontWeight: 500,
                            }}
                          >
                            Exp Selected Rows
                          </Button>
                        )}
                        {showDeleteSelected && (
                          <Button
                            onClick={async () => {
                              if (onDeleteSelected) {
                                await onDeleteSelected(table);
                              } else {
                                handleDeleteSelectedRows(table);
                              }
                            }}
                            startIcon={<DeleteIcon />}
                            variant="outlined"
                            color="error"
                            disabled={!table.getIsSomeRowsSelected()}
                            sx={{
                              color: colors.errorText,
                              borderColor: colors.errorText,
                              "&:hover": {
                                backgroundColor: colors.errorText,
                                color: "#fff",
                                borderColor: colors.errorText,
                                textTransform: "uppercase",
                                fontSize: "1.2rem",
                                fontWeight: 800,
                              },
                              fontSize: "1.1rem",
                              fontWeight: 500,
                            }}
                          >
                            Delete Selected
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </div>
                )
              : undefined
          }
          muiSelectCheckboxProps={{
            sx: {
              borderRadius: "6px",
              padding: "9px",
              color: colors.checkboxDefault,
              "&.Mui-checked": {
                color: colors.buttonBackground,
              },
              "&.MuiCheckbox-indeterminate": {
                color: colors.buttonBackground,
              },
              "& .MuiSvgIcon-root": {
                fontSize: "2.0rem",
              },
            },
          }}
          muiSelectAllCheckboxProps={{
            sx: {
              borderRadius: "6px",
              padding: "9px",
              color: colors.checkboxDefault,
              "&.Mui-checked": {
                color: colors.buttonBackground,
              },
              "&.MuiCheckbox-indeterminate": {
                color: colors.buttonBackground,
              },
              "& .MuiSvgIcon-root": {
                fontSize: "2.0rem",
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default DynamicTableComponent;
