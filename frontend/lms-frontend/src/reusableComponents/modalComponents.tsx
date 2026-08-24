import React from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  Theme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SubmitButton, CancelButton } from "./buttonComponent";

/** ---------- One canonical size map for all modals ---------- */
// export type ModalSize = "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl" | number;

export const SIZE_MAP = {
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1200,
  xxl: 1440,
  xxxl: 1600,
} as const;

export type ModalPreset = keyof typeof SIZE_MAP; // "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl"
export type ModalSize = ModalPreset | number;

/** Type guard to narrow ModalSize to ModalPreset */
const isPresetSize = (x: ModalSize): x is ModalPreset => typeof x === "string";

export function getMaxWidth(
  size: ModalSize,
  fallback: ModalPreset = "lg",
): number {
  if (typeof size === "number") return size; // already numeric
  if (isPresetSize(size)) return SIZE_MAP[size]; // safe index with preset
  return SIZE_MAP[fallback]; // (defensive; should not hit)
}

/** ---------- Shared footer actions ---------- */
const FooterActions: React.FC<{
  showSaveButton?: boolean;
  onSave?: () => void;
  isLoading?: boolean;
  saveDisabled?: boolean;
  saveButtonText?: string;
  onClose: () => void;
}> = ({
  showSaveButton,
  onSave,
  isLoading,
  saveDisabled,
  saveButtonText,
  onClose,
}) => (
  <>
    {showSaveButton && (
      <SubmitButton
        name={saveButtonText || "Save"}
        onClick={onSave}
        fontSize="1.05rem"
        hoverFontSize="1.1rem"
        disabled={!!isLoading || !!saveDisabled}
        style={{ padding: "0.5rem 1.5rem", minWidth: "fit-content" }}
      />
    )}
    <CancelButton
      name="Cancel"
      onClick={onClose}
      fontSize="1.05rem"
      hoverFontSize="1.1rem"
      style={{ padding: "0.5rem 1.5rem", minWidth: "fit-content" }}
    />
  </>
);

/** ===========================================================
 *  Medium Modal (old FormModalMedium)
 *  =========================================================== */
export interface FormModalMediumProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: React.ReactNode;
  showSaveButton?: boolean;
  onSave?: () => void;
  isLoading?: boolean;
  saveButtonText?: string;
  saveDisabled?: boolean;
  zIndex?: number;
}
export const FormModalMedium: React.FC<FormModalMediumProps> = ({
  isOpen,
  onClose,
  title,
  body,
  showSaveButton = false,
  onSave,
  isLoading = false,
  saveButtonText,
  saveDisabled = false,
  zIndex = 1301,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose} sx={{ zIndex }}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, calc(-50% + 10px))",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: getMaxWidth("md"),
          maxWidth: getMaxWidth("lg"),
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        {body}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
          }}
        >
          <FooterActions
            showSaveButton={showSaveButton}
            onSave={onSave}
            isLoading={isLoading}
            saveDisabled={saveDisabled}
            saveButtonText={saveButtonText}
            onClose={onClose}
          />
        </Box>
      </Box>
    </Modal>
  );
};

/** ===========================================================
 *  Large Modal (old FormModalLarge)
 *  =========================================================== */
export interface FormModalLargeProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: React.ReactNode;
  showSaveButton?: boolean;
  onSave?: () => void;
  isLoading?: boolean;
  saveButtonText?: string;
  zIndex?: number;
}
export const FormModalLarge: React.FC<FormModalLargeProps> = ({
  isOpen,
  onClose,
  title,
  body,
  showSaveButton = false,
  onSave,
  isLoading = false,
  saveButtonText,
  zIndex = 1301,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose} sx={{ zIndex }}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: getMaxWidth("xl"),
          maxWidth: getMaxWidth("xxl"),
          maxHeight: "90vh",
          overflow: "auto",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {body}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
          }}
        >
          <FooterActions
            showSaveButton={showSaveButton}
            onSave={onSave}
            isLoading={isLoading}
            saveButtonText={saveButtonText}
            onClose={onClose}
          />
        </Box>
      </Box>
    </Modal>
  );
};

/** ===========================================================
 *  Dynamic Modal (old FormModalDynamic)
 *  =========================================================== */
export interface FormModalDynamicProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  body: React.ReactNode;

  // actions
  showSaveButton?: boolean;
  onSave?: () => void;
  isLoading?: boolean;
  saveButtonText?: string;
  saveDisabled?: boolean;
  showCloseIcon?: boolean;

  // dynamic sizing
  size?: ModalSize; // "sm" | "md" | "lg" | "xl" | "xxl" | "xxxl" | number
  widthVW?: number; //  e.g. 90
  maxHeightVH?: number; //  e.g. 90

  // layout
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  zIndex?: number;

  // extra styling hooks
  contentSx?: object;
}
export const FormModalDynamic: React.FC<FormModalDynamicProps> = ({
  isOpen,
  onClose,
  title,
  body,
  showSaveButton = false,
  onSave,
  isLoading = false,
  saveButtonText,
  saveDisabled = false,
  showCloseIcon = true,

  size = "lg",
  widthVW = 90,
  maxHeightVH = 90,

  stickyHeader = false,
  stickyFooter = false,
  zIndex = 1301,

  contentSx,
}) => {
  const maxWidth = getMaxWidth(size, "lg");
  return (
    <Modal open={isOpen} onClose={onClose} sx={{ zIndex }}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 0,
          borderRadius: 2,
          width: `${widthVW}vw`,
          maxWidth,
          maxHeight: `${maxHeightVH}vh`,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          ...contentSx,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            px: 3,
            py: 2.5,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            position: stickyHeader ? "sticky" : "static",
            top: 0,
            zIndex: 1,
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h5" component="h2">
            {title}
          </Typography>
          {showCloseIcon && (
            <IconButton aria-label="close" onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {/* Body */}
        <Box sx={{ px: 3, py: 2, overflowY: "auto" }}>{body}</Box>

        {/* Footer */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: 2,
            position: stickyFooter ? "sticky" : "static",
            bottom: 0,
            bgcolor: "background.paper",
          }}
        >
          <FooterActions
            showSaveButton={showSaveButton}
            onSave={onSave}
            isLoading={isLoading}
            saveDisabled={saveDisabled}
            saveButtonText={saveButtonText}
            onClose={onClose}
          />
        </Box>
      </Box>
    </Modal>
  );
};

export interface FormModalFullscreenProps {
  isOpen: boolean;
  onClose: (event?: any, reason?: "backdropClick" | "escapeKeyDown") => void;

  title: string;
  body: React.ReactNode;

  // actions
  showSaveButton?: boolean;
  onSave?: () => void;
  isLoading?: boolean;
  saveButtonText?: string;
  saveDisabled?: boolean;
  showCloseIcon?: boolean;

  // layout
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  zIndex?: number;
  size?: ModalSize; // used only when edgeToEdge = false
  contentSx?: object;
  disableBackdropClick?: boolean;

  /** NEW: make it truly edge-to-edge (ignores size/maxWidth on desktop) */
  edgeToEdge?: boolean; // default true
}

export const FormModalFullscreen: React.FC<FormModalFullscreenProps> = ({
  isOpen,
  onClose,
  title,
  body,
  showSaveButton = false,
  onSave,
  isLoading = false,
  saveButtonText = "Save",
  saveDisabled = false,
  showCloseIcon = true,
  stickyHeader = true,
  stickyFooter = true,
  zIndex = 1301,
  size = "xxl",
  contentSx,
  disableBackdropClick = false,
  edgeToEdge = true,
}) => {
  const isSmall = useMediaQuery("(max-width:900px)");
  const maxWidth = getMaxWidth(size, "xxl");

  const handleClose = (
    _e?: any,
    reason?: "backdropClick" | "escapeKeyDown",
  ) => {
    if (disableBackdropClick && reason === "backdropClick") return;
    onClose?.(_e, reason);
  };

  return (
    <Modal open={isOpen} onClose={handleClose} sx={{ zIndex }} keepMounted>
      {/* Full viewport overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "center",
          // allow body to scroll only inside the panel
          overflow: "hidden",
        }}
      >
        {/* The panel */}
        <Box
          sx={{
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: edgeToEdge ? 0 : { xs: 0, md: 2 },

            // <- THIS is the key change:
            width: edgeToEdge ? "100vw" : "100vw",
            height: "100dvh", // better on mobile; falls back to 100vh in older browsers
            minHeight: "100vh",

            display: "flex",
            flexDirection: "column",

            // cap width only if NOT edge-to-edge (desktop)
            maxWidth: edgeToEdge
              ? "100vw"
              : { xs: "100vw", md: `${maxWidth}px` },
            margin: edgeToEdge ? 0 : { xs: 0, md: "0 auto" },

            overflow: "hidden",
            ...contentSx,
          }}
        >
          {/* Header */}
          <Box
            sx={{
              px: 3,
              py: 2.25,
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
              position: stickyHeader ? "sticky" : "static",
              top: 0,
              zIndex: 1,
              bgcolor: "background.paper",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant={isSmall ? "h6" : "h5"} component="h2">
              {title}
            </Typography>
            {showCloseIcon && (
              <IconButton aria-label="close" onClick={() => onClose()}>
                <CloseIcon />
              </IconButton>
            )}
          </Box>

          {/* Body */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              px: { xs: 2, md: 3 },
              py: { xs: 2, md: 3 },
            }}
          >
            {body}
          </Box>

          {/* Footer */}
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              py: 2,
              borderTop: (t) => `1px solid ${t.palette.divider}`,
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              position: stickyFooter ? "sticky" : "static",
              bottom: 0,
              bgcolor: "background.paper",
            }}
          >
            <FooterActions
              showSaveButton={showSaveButton}
              onSave={onSave}
              isLoading={isLoading}
              saveDisabled={saveDisabled}
              saveButtonText={saveButtonText}
              onClose={() => onClose()}
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;

  title?: string;
  message: React.ReactNode;

  confirmButtonText?: string;
  cancelButtonText?: string;

  isLoading?: boolean;
  confirmDisabled?: boolean;
  zIndex?: number;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  isLoading = false,
  confirmDisabled = false,
  zIndex = 1302,
}) => {
  return (
    <Modal open={isOpen} onClose={onClose} sx={{ zIndex }}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: 3,
          borderRadius: 2,
          width: "100%",
          maxWidth: getMaxWidth("sm"),
          minWidth: { xs: "90vw", sm: 420 },
          maxHeight: "70vh",
          overflow: "auto",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 3 }}>
          {typeof message === "string" ? (
            <Typography variant="body1">{message}</Typography>
          ) : (
            message
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "1rem",
          }}
        >
          <CancelButton
            name={cancelButtonText}
            onClick={onClose}
            fontSize="1rem"
            hoverFontSize="1.05rem"
            style={{ padding: "0.45rem 1.2rem", minWidth: "fit-content" }}
          />

          <SubmitButton
            name={confirmButtonText}
            onClick={onConfirm}
            fontSize="1rem"
            hoverFontSize="1.05rem"
            disabled={isLoading || confirmDisabled}
            style={{ padding: "0.45rem 1.2rem", minWidth: "fit-content" }}
          />
        </Box>
      </Box>
    </Modal>
  );
};
