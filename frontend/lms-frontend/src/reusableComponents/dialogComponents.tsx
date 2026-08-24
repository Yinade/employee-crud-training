import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Divider,
  Stack,
  Box,
  Modal,
} from "@mui/material";
import { colors } from "../app/utils/color";
import { CancelButton, CloseIconButton } from "./buttonComponent";

/**
 * Generic, reusable display dialog for read-only/detail views.
 * NOTE: This stays as MUI <Dialog/> (fine for normal usage).
 */

export type MetaRow = { label: React.ReactNode; value?: React.ReactNode };

export interface DisplayDialogProps {
  open: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  meta?: MetaRow[];
  onClose: () => void;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl";
  fullWidth?: boolean;
  showCloseIcon?: boolean;
  actions?: React.ReactNode;
  dividers?: boolean;
  tonalHeader?: boolean;
}

const Row: React.FC<MetaRow> = ({ label, value }) => (
  <Stack direction="row" gap={1} sx={{ opacity: 0.9 }}>
    <Typography variant="body2" fontWeight={600}>
      {label}:
    </Typography>
    <Typography variant="body2">{value ?? "—"}</Typography>
  </Stack>
);

const DefaultActions: React.FC<{ onClose: () => void }> = ({ onClose }) => (
  <DialogActions sx={{ px: 3, py: 1.5 }}>
    <CancelButton name="Close" onClick={onClose} />
  </DialogActions>
);

const DisplayDialog: React.FC<DisplayDialogProps> = ({
  open,
  title,
  description,
  children,
  meta,
  onClose,
  maxWidth = "sm",
  fullWidth = true,
  showCloseIcon = true,
  actions,
  dividers = true,
  tonalHeader = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      PaperProps={{
        sx: { borderRadius: "18px" },
      }}
    >
      {title && (
        <DialogTitle
          sx={(theme) => ({
            position: "relative",
            pr: showCloseIcon ? 6 : 3,
            py: 1.75,
            bgcolor: tonalHeader ? colors.buttonBackground : "#fff",
            color: tonalHeader ? "#FFFFFF" : "#111827",
            borderBottom: tonalHeader
              ? `1px solid ${theme.palette.divider}`
              : "none",
            fontFamily:
              '"Noto Sans Ethiopic", "Chinese Quote", -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
            fontWeight: 700,
          })}
        >
          {title}

          {showCloseIcon && (
            <CloseIconButton
              onClick={onClose}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: tonalHeader ? "#ffffff" : "#6B7280",
                "&:hover": { backgroundColor: "rgba(0,0,0,0.06)" },
              }}
            />
          )}
        </DialogTitle>
      )}

      <DialogContent
        dividers={dividers}
        sx={{
          "&, & *:not(.preserve-font)": {
            fontFamily:
              '"Noto Sans Ethiopic", "Chinese Quote", -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
          },
          "& .MuiTypography-root": {
            fontFamily: "inherit",
            fontWeight: 400,
            fontSize: "1.2rem",
            lineHeight: 1.5,
          },
        }}
      >
        {description && (
          <Typography
            variant="body2"
            sx={{
              mb: 1.5,
              opacity: 0.9,
              fontFamily: "inherit",
              fontWeight: 400,
              fontSize: "1.1rem",
            }}
          >
            {description}
          </Typography>
        )}

        <Box sx={{ fontFamily: "inherit", fontWeight: 600 }}>{children}</Box>

        {meta && meta.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack gap={0.5}>
              {meta.map((m, idx) => (
                <Row key={idx} label={m.label} value={m.value} />
              ))}
            </Stack>
          </>
        )}
      </DialogContent>

      {actions ? actions : <DefaultActions onClose={onClose} />}
    </Dialog>
  );
};

export default DisplayDialog;

// -----------------------------
// ConfirmDialog
// ✅ REPLACED with MUI <Modal/> so it works on top of your FormModalMedium (which is also a Modal)
// -----------------------------

export interface ConfirmDialogProps {
  open: boolean;
  title?: React.ReactNode;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmColor?:
    | "primary"
    | "error"
    | "warning"
    | "success"
    | "info"
    | "secondary";
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl"; // kept for compatibility (not used heavily here)
}

const widthByMaxWidth = (mw: ConfirmDialogProps["maxWidth"]) => {
  // You can tune these if you want.
  switch (mw) {
    case "xs":
      return 420;
    case "sm":
      return 560;
    case "md":
      return 720;
    case "lg":
      return 900;
    case "xl":
      return 1100;
    default:
      return 420;
  }
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title = "Confirm",
  message = "Are you sure?",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
  confirmColor = "error",
  maxWidth = "xs",
}) => {
  const panelWidth = widthByMaxWidth(maxWidth);

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onCancel}
      // ✅ make sure this sits ABOVE FormModalMedium (which defaults 1301)
      sx={{ zIndex: 4000 }}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop + centering */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
          // Let MUI Modal backdrop do its job; we just center content.
        }}
      >
        {/* Panel */}
        <Box
          sx={{
            width: "100%",
            maxWidth: panelWidth,
            bgcolor: "background.paper",
            borderRadius: "18px",
            boxShadow: 24,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            id="confirm-dialog-title"
            sx={{
              position: "relative",
              pr: 6,
              py: 1.75,
              px: 3,
              bgcolor: colors.buttonBackground,
              color: "#FFFFFF",
              fontWeight: 700,
              fontFamily:
                '"Noto Sans Ethiopic", "Chinese Quote", -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
            }}
          >
            <Typography
              component="div"
              sx={{ fontWeight: 700, fontSize: "1.2rem" }}
            >
              {title}
            </Typography>

            <CloseIconButton
              onClick={loading ? undefined : onCancel}
              disabled={loading}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "rgba(255,255,255,0.14)",
                  color: "#ffffff",
                },
              }}
            />
          </Box>

          {/* Body */}
          <Box
            id="confirm-dialog-description"
            sx={{
              px: 3,
              py: 2,
              borderTop: (t) => `1px solid ${t.palette.divider}`,
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
              "&, & *:not(.preserve-font)": {
                fontFamily:
                  '"Noto Sans Ethiopic", "Chinese Quote", -apple-system, BlinkMacSystemFont, Segoe UI, PingFang SC, Hiragino Sans GB, Microsoft YaHei, Helvetica Neue, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol',
              },
              "& .MuiTypography-root": {
                fontFamily: "inherit",
                fontWeight: 400,
                fontSize: "1.2rem",
                lineHeight: 1.5,
              },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontFamily: "inherit",
                fontWeight: 400,
                fontSize: "1.1rem",
              }}
            >
              {message}
            </Typography>
          </Box>

          {/* Actions */}
          <Box
            sx={{
              px: 3,
              py: 1.5,
              display: "flex",
              gap: 1,
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
            <Button
              onClick={onConfirm}
              variant="contained"
              color={confirmColor}
              disabled={loading}
            >
              {loading ? "Working…" : confirmLabel}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

// -----------------------------
// ReasonDialog (unchanged in behavior)
// -----------------------------

export interface ReasonDialogProps {
  open: boolean;
  reason?: { text?: string; by?: string; at?: string | number | Date } | null;
  onClose: () => void;
}

export const ReasonDialog: React.FC<ReasonDialogProps> = ({
  open,
  reason,
  onClose,
}) => (
  <DisplayDialog
    open={open}
    title={"Declined — Reason"}
    description={null}
    onClose={onClose}
    meta={[
      reason?.by
        ? { label: "Declined By", value: reason?.by }
        : { label: "Declined By", value: "—" },
      reason?.at
        ? { label: "Declined At", value: new Date(reason.at).toLocaleString() }
        : { label: "Declined At", value: "—" },
    ]}
  >
    <Typography sx={{ whiteSpace: "pre-wrap" }}>
      {reason?.text || "(no reason provided)"}
    </Typography>
  </DisplayDialog>
);
