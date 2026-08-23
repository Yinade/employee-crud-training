// src/reusableComponents/DynamicRowComponent.tsx
import * as React from "react";
import isEqual from "fast-deep-equal";
import {
  useForm,
  useFieldArray,
  useWatch,
  UseFormSetValue,
  UseFormGetValues,
  type FieldValues,
  type FieldErrors,
  type Control,
} from "react-hook-form";
import { KTIcon } from "../_metronic/helpers"; // ← adjust to your project

import type { DynamicRowInput, DynamicRowComponentProps } from "./types";

/** ===== Local types used by the component ===== */
type RowObject = Record<string, any>;
type RowsFormValues = { rows: RowObject[] };

/** ===== Helpers ===== */
const toKey = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_]+/g, "")
    .replace(/\s+([a-z0-9])/g, (_, c) => c.toUpperCase())
    .replace(/\s+/g, "")
    .replace(/^(\d)/, "_$1");

const makeEmptyRowObject = (keys: string[]): RowObject =>
  keys.reduce((acc, k) => {
    if (k === "quantity") acc[k] = 1; // ✅ default 1
    else if (k === "total") acc[k] = 0; // ✅ default 0
    else acc[k] = "";
    return acc;
  }, {} as RowObject);

const coerceRowToKeys = (
  row: RowObject | undefined,
  keys: string[]
): RowObject => {
  const r = row ?? {};
  return keys.reduce((acc, k) => {
    acc[k] = r[k] ?? "";
    return acc;
  }, {} as RowObject);
};

/** ===== Component ===== */
export const DynamicRowComponent: React.FC<DynamicRowComponentProps> = ({
  columnTitles,
  columnKeys,
  inputTypes,
  inputProps = [],
  heightPx,
  initialRows,
  onChange,
  addButtonLabel = "Add Row",
  disabled = false,
  minRows = 0,
  maxRows,
  startWithOneEmptyRow = false,
}) => {
  const numCols = columnTitles.length;

  if (inputTypes.length !== numCols) {
    // eslint-disable-next-line no-console
    console.warn("inputTypes length must equal columnTitles length");
  }
  if (columnKeys && columnKeys.length !== numCols) {
    // eslint-disable-next-line no-console
    console.warn("columnKeys length must equal columnTitles length");
  }

  // Stable keys: either provided or generated from titles
  const keys = React.useMemo(() => {
    if (columnKeys && columnKeys.length === numCols) return columnKeys;
    return columnTitles.map(toKey);
  }, [columnKeys, columnTitles, numCols]);

  // Normalize initial rows and ensure all keys exist
  const defaultRows = React.useMemo(() => {
    const safe = Array.isArray(initialRows) ? initialRows : [];
    if (safe.length === 0 && startWithOneEmptyRow) {
      return [makeEmptyRowObject(keys)];
    }
    return safe.map((r) => coerceRowToKeys(r, keys));
  }, [initialRows, keys, startWithOneEmptyRow]);

  // RHF setup
  const form = useForm<RowsFormValues>({
    defaultValues: { rows: defaultRows },
    mode: "onChange",
  });

  const { control, formState } = form;

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "rows",
  });

  // Watch current rows
  const rowsObj = useWatch({ control, name: "rows" }) as
    | RowObject[]
    | undefined;

  // Keep rows in sync if initialRows truly changed (deep compare)
  React.useEffect(() => {
    const safe = Array.isArray(initialRows) ? initialRows : [];
    const next = safe.map((r) => coerceRowToKeys(r, keys));
    const current = (rowsObj ?? []).map((r) => coerceRowToKeys(r, keys));

    if (!isEqual(next, current)) {
      replace(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRows, keys, replace]);

  // Add row (respect maxRows)
  const addRow = React.useCallback(() => {
    if (disabled) return;
    if (typeof maxRows === "number" && fields.length >= maxRows) return;
    append(makeEmptyRowObject(keys));
  }, [append, disabled, keys, fields.length, maxRows]);

  // Watch and emit object-based rows

  const lastSentRef = React.useRef<RowObject[]>([]);

  React.useEffect(() => {
    if (!onChange || !rowsObj) return;
    const sanitized = rowsObj.map((r) => coerceRowToKeys(r, keys));
    if (!isEqual(sanitized, lastSentRef.current)) {
      lastSentRef.current = sanitized;
      onChange(sanitized);
    }
  }, [rowsObj, keys, onChange]);

  // Normalize per-column props and input types (guard mismatches)
  const normalizedInputProps = React.useMemo(
    () => Array.from({ length: numCols }, (_, i) => inputProps[i] ?? {}),
    [inputProps, numCols]
  );

  const safeInputTypes = React.useMemo(
    () => inputTypes.slice(0, numCols),
    [inputTypes, numCols]
  );

  const canDeleteAnyRow =
    !disabled && fields.length > Math.max(minRows ?? 0, 0);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table
          className="table table-bordered table-sm"
          style={{ minWidth: 720 }}
        >
          <thead>
            <tr>
              {columnTitles.map((t, i) => (
                <th key={i}>{t}</th>
              ))}
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, rowIndex) => (
              <tr key={field.id}>
                {keys.map((key, colIndex) => {
                  const InputComp = safeInputTypes[colIndex] as
                    | DynamicRowInput
                    | undefined;
                  if (!InputComp) {
                    return (
                      <td key={key} style={{ color: "#b91c1c" }}>
                        Missing input
                      </td>
                    );
                  }
                  const extraProps = {
                    ...normalizedInputProps[colIndex],
                    heightPx,
                  };
                  const name = `rows.${rowIndex}.${key}` as const;

                  return (
                    <td key={key}>
                      <InputComp
                        name={name}
                        control={
                          form.control as unknown as Control<FieldValues>
                        }
                        errors={formState.errors as FieldErrors<FieldValues>}
                        {...extraProps}
                      />
                    </td>
                  );
                })}
                <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                  <button
                    type="button"
                    className="btn btn-icon btn-sm btn-light-danger"
                    onClick={() => canDeleteAnyRow && remove(rowIndex)}
                    aria-label={`Delete row ${rowIndex + 1}`}
                    disabled={!canDeleteAnyRow}
                  >
                    <KTIcon iconName="minus-square" className="fs-1 m-0" />
                  </button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td
                  colSpan={numCols + 1}
                  style={{ textAlign: "center", color: "#6b7280" }}
                >
                  No rows yet. Click “{addButtonLabel}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="btn btn-icon btn-sm btn-light"
        onClick={addRow}
        aria-label={addButtonLabel}
        disabled={
          disabled || (typeof maxRows === "number" && fields.length >= maxRows)
        }
        title={disabled ? "Disabled" : addButtonLabel}
      >
        <KTIcon
          iconName="plus-square"
          className="fs-1 text-white rounded-[5px] bg-[#369d7a] m-0"
        />
      </button>
    </div>
  );
};

/** ===== Component ===== */
export const DynamicRowComponentEqualColumn: React.FC<
  DynamicRowComponentProps
> = ({
  columnTitles,
  columnKeys,
  inputTypes,
  inputProps = [],
  heightPx,
  initialRows,
  onChange,
  addButtonLabel = "Add Row",
  disabled = false,
  minRows = 0,
  maxRows,
  startWithOneEmptyRow = false,
}) => {
  const numCols = columnTitles.length;

  if (inputTypes.length !== numCols) {
    // eslint-disable-next-line no-console
    console.warn("inputTypes length must equal columnTitles length");
  }
  if (columnKeys && columnKeys.length !== numCols) {
    // eslint-disable-next-line no-console
    console.warn("columnKeys length must equal columnTitles length");
  }

  // Stable keys: either provided or generated from titles
  const keys = React.useMemo(() => {
    if (columnKeys && columnKeys.length === numCols) return columnKeys;
    return columnTitles.map(toKey);
  }, [columnKeys, columnTitles, numCols]);

  // Normalize initial rows and ensure all keys exist
  const defaultRows = React.useMemo(() => {
    const safe = Array.isArray(initialRows) ? initialRows : [];
    if (safe.length === 0 && startWithOneEmptyRow) {
      return [makeEmptyRowObject(keys)];
    }
    return safe.map((r) => coerceRowToKeys(r, keys));
  }, [initialRows, keys, startWithOneEmptyRow]);

  // RHF setup
  const form = useForm<RowsFormValues>({
    defaultValues: { rows: defaultRows },
    mode: "onChange",
  });

  const { control, formState } = form;

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "rows",
  });

  // Watch current rows
  const rowsObj = useWatch({ control, name: "rows" }) as
    | RowObject[]
    | undefined;

  // Keep rows in sync if initialRows truly changed (deep compare)
  React.useEffect(() => {
    const safe = Array.isArray(initialRows) ? initialRows : [];
    const next = safe.map((r) => coerceRowToKeys(r, keys));
    const current = (rowsObj ?? []).map((r) => coerceRowToKeys(r, keys));

    if (!isEqual(next, current)) {
      replace(next);
    }
  }, [initialRows, keys, replace]);

  // Add row (respect maxRows)
  const addRow = React.useCallback(() => {
    if (disabled) return;
    if (typeof maxRows === "number" && fields.length >= maxRows) return;
    append(makeEmptyRowObject(keys));
  }, [append, disabled, keys, fields.length, maxRows]);

  // Watch and emit object-based rows
  const lastSentRef = React.useRef<RowObject[]>([]);

  React.useEffect(() => {
    if (!onChange || !rowsObj) return;
    const sanitized = rowsObj.map((r) => coerceRowToKeys(r, keys));
    if (!isEqual(sanitized, lastSentRef.current)) {
      lastSentRef.current = sanitized;
      onChange(sanitized);
    }
  }, [rowsObj, keys, onChange]);

  // Normalize per-column props and input types (guard mismatches)
  const normalizedInputProps = React.useMemo(
    () => Array.from({ length: numCols }, (_, i) => inputProps[i] ?? {}),
    [inputProps, numCols]
  );

  const safeInputTypes = React.useMemo(
    () => inputTypes.slice(0, numCols),
    [inputTypes, numCols]
  );

  const canDeleteAnyRow =
    !disabled && fields.length > Math.max(minRows ?? 0, 0);

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table
          className="table table-bordered table-sm"
          style={{ minWidth: 720, tableLayout: "fixed" }}
        >
          <thead>
            <tr>
              {columnTitles.map((t, i) => (
                <th key={i} style={{ width: `calc(100% / ${numCols + 1})` }}>
                  {t}
                </th>
              ))}
              <th style={{ width: `calc(100% / ${numCols + 1})` }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field, rowIndex) => (
              <tr key={field.id}>
                {keys.map((key, colIndex) => {
                  const InputComp = safeInputTypes[colIndex] as
                    | DynamicRowInput
                    | undefined;
                  if (!InputComp) {
                    return (
                      <td
                        key={key}
                        style={{
                          width: `calc(100% / ${numCols + 1})`,
                          color: "#b91c1c",
                        }}
                      >
                        Missing input
                      </td>
                    );
                  }
                  const extraProps = {
                    ...normalizedInputProps[colIndex],
                    heightPx,
                  };
                  const name = `rows.${rowIndex}.${key}` as const;

                  return (
                    <td
                      key={key}
                      style={{ width: `calc(100% / ${numCols + 1})` }}
                    >
                      <InputComp
                        name={name}
                        control={
                          form.control as unknown as Control<FieldValues>
                        }
                        errors={formState.errors as FieldErrors<FieldValues>}
                        setValue={form.setValue} // 👈 pass RHF setter
                        getValues={form.getValues} // 👈 (optional) if you want to read
                        {...extraProps}
                      />
                    </td>
                  );
                })}
                <td
                  style={{
                    width: `calc(100% / ${numCols + 1})`,
                    verticalAlign: "middle",
                    textAlign: "center",
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-icon btn-sm btn-light-danger"
                    onClick={() => canDeleteAnyRow && remove(rowIndex)}
                    aria-label={`Delete row ${rowIndex + 1}`}
                    disabled={!canDeleteAnyRow}
                  >
                    <KTIcon iconName="minus-square" className="fs-1 m-0" />
                  </button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td
                  colSpan={numCols + 1}
                  style={{ textAlign: "center", color: "#6b7280" }}
                >
                  No rows yet. Click “{addButtonLabel}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="btn btn-icon btn-sm btn-light"
        onClick={addRow}
        aria-label={addButtonLabel}
        disabled={
          disabled || (typeof maxRows === "number" && fields.length >= maxRows)
        }
        title={disabled ? "Disabled" : addButtonLabel}
      >
        <KTIcon
          iconName="plus-square"
          className="fs-1 text-white rounded-[5px] bg-[#369d7a] m-0"
        />
      </button>
    </div>
  );
};

type EqualProps = DynamicRowComponentProps & {
  /** If false, the Actions column stays fixed (120px) instead of equal width */
  equalizeActions?: boolean;
  /** Fixed width (px) for the Actions column when equalizeActions=false */
  actionsWidthPx?: number;
};

/** ===== Equal-width columns variant ===== */
export const DynamicRowComponentEqual: React.FC<EqualProps> = ({
  columnTitles,
  columnKeys,
  inputTypes,
  inputProps = [],
  heightPx,
  initialRows,
  onChange,
  addButtonLabel = "Add Row",
  disabled = false,
  minRows = 0,
  maxRows,
  startWithOneEmptyRow = false,
  equalizeActions = true,
  actionsWidthPx = 120,
}) => {
  const numCols = columnTitles.length;

  if (inputTypes.length !== numCols) {
    console.warn("inputTypes length must equal columnTitles length");
  }
  if (columnKeys && columnKeys.length !== numCols) {
    console.warn("columnKeys length must equal columnTitles length");
  }

  // Stable keys
  const keys = React.useMemo(() => {
    if (columnKeys && columnKeys.length === numCols) return columnKeys;
    return columnTitles.map(toKey);
  }, [columnKeys, columnTitles, numCols]);

  // Normalize initial rows
  const defaultRows = React.useMemo(() => {
    const safe = Array.isArray(initialRows) ? initialRows : [];
    if (safe.length === 0 && startWithOneEmptyRow) {
      return [makeEmptyRowObject(keys)];
    }
    return safe.map((r) => coerceRowToKeys(r, keys));
  }, [initialRows, keys, startWithOneEmptyRow]);

  // RHF
  const form = useForm<RowsFormValues>({
    defaultValues: { rows: defaultRows },
    mode: "onChange",
  });

  const { control, formState } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "rows",
  });

  const addRow = React.useCallback(() => {
    if (disabled) return;
    if (typeof maxRows === "number" && fields.length >= maxRows) return;
    append(makeEmptyRowObject(keys));
  }, [append, disabled, keys, fields.length, maxRows]);

  const rowsObj = useWatch({ control, name: "rows" }) as
    | RowObject[]
    | undefined;

  // Re-hydrate when parent bumps seedVersion (e.g. when detail loads)
  React.useEffect(() => {
    const safe = Array.isArray(initialRows) ? initialRows : [];
    if (!safe.length) return; // nothing to hydrate

    const next = safe.map((r) => coerceRowToKeys(r, keys));
    replace(next);

    // intentionally ignore `initialRows` here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, replace]);

  // Emit changes to parent
  const lastSentRef = React.useRef<RowObject[]>([]);

  React.useEffect(() => {
    if (!onChange || !rowsObj) return;
    const sanitized = rowsObj.map((r) => coerceRowToKeys(r, keys));
    if (!isEqual(sanitized, lastSentRef.current)) {
      lastSentRef.current = sanitized;
      onChange(sanitized);
    }
  }, [rowsObj, keys, onChange]);

  // Normalize props/types
  const normalizedInputProps = React.useMemo(
    () => Array.from({ length: numCols }, (_, i) => inputProps[i] ?? {}),
    [inputProps, numCols]
  );
  const safeInputTypes = React.useMemo(
    () => inputTypes.slice(0, numCols),
    [inputTypes, numCols]
  );

  const canDeleteAnyRow =
    !disabled && fields.length > Math.max(minRows ?? 0, 0);

  // Equal widths: data columns share width equally. Actions can be equal or fixed.
  const dataColWidth = `calc((100% - ${
    equalizeActions ? "0px" : actionsWidthPx + "px"
  }) / ${equalizeActions ? numCols + 1 : numCols})`;
  const actionColWidth = equalizeActions ? dataColWidth : `${actionsWidthPx}px`;

  return (
    <div>
      <div style={{ overflowX: "auto" }}>
        <table
          className="table table-bordered table-sm"
          style={{ minWidth: 720, tableLayout: "fixed", width: "100%" }}
        >
          {/* Enforce equal widths via colgroup */}
          <colgroup>
            {Array.from({ length: numCols }).map((_, i) => (
              <col key={`col-${i}`} style={{ width: dataColWidth }} />
            ))}
            <col key="col-actions" style={{ width: actionColWidth }} />
          </colgroup>

          <thead>
            <tr>
              {columnTitles.map((t, i) => (
                <th key={i}>{t}</th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {fields.map((field, rowIndex) => (
              <tr key={field.id}>
                {keys.map((key, colIndex) => {
                  const InputComp = safeInputTypes[colIndex] as
                    | DynamicRowInput
                    | undefined;
                  if (!InputComp) {
                    return (
                      <td key={key} style={{ color: "#b91c1c" }}>
                        Missing input
                      </td>
                    );
                  }

                  const extraProps = {
                    heightPx,
                    ...normalizedInputProps[colIndex],
                  };
                  const name = `rows.${rowIndex}.${key}` as const;

                  return (
                    <td key={key}>
                      <InputComp
                        name={name}
                        control={
                          form.control as unknown as Control<FieldValues>
                        }
                        setValue={form.setValue} // ✅ ADD
                        getValues={form.getValues} // ✅ ADD
                        errors={formState.errors as FieldErrors<FieldValues>}
                        {...extraProps}
                      />
                    </td>
                  );
                })}

                <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                  <button
                    type="button"
                    className="btn btn-icon btn-sm btn-light-danger"
                    onClick={() => canDeleteAnyRow && remove(rowIndex)}
                    aria-label={`Delete row ${rowIndex + 1}`}
                    disabled={!canDeleteAnyRow}
                  >
                    <KTIcon iconName="minus-square" className="fs-1 m-0" />
                  </button>
                </td>
              </tr>
            ))}

            {fields.length === 0 && (
              <tr>
                <td
                  colSpan={numCols + 1}
                  style={{ textAlign: "center", color: "#6b7280" }}
                >
                  No rows yet. Click “{addButtonLabel}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        className="btn btn-icon btn-sm btn-light"
        onClick={addRow}
        aria-label={addButtonLabel}
        disabled={
          disabled || (typeof maxRows === "number" && fields.length >= maxRows)
        }
        title={disabled ? "Disabled" : addButtonLabel}
      >
        <KTIcon
          iconName="plus-square"
          className="fs-1 text-white rounded-[5px] bg-[#369d7a] m-0"
        />
      </button>
    </div>
  );
};
