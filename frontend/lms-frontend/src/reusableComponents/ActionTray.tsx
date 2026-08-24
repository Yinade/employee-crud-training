import * as React from "react";
import {
  ButtonGroup,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Stack,
  Divider,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

type Action = {
  key: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color?:
    | "inherit"
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "info"
    | "warning";
  variant?: "text" | "outlined" | "contained";
};

export default function ActionTray({
  actions,
  maxVisible = 3,
  size = "small",
  groupVariant = "outlined",
  dense = true,
  showInternalDividers = true, // ⬅️ new
  showEndDivider = true, // ⬅️ new
}: {
  actions: Action[];
  maxVisible?: number;
  size?: "small" | "medium" | "large";
  groupVariant?: "text" | "outlined" | "contained";
  dense?: boolean;
  showInternalDividers?: boolean;
  showEndDivider?: boolean;
}) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const visible = actions.slice(0, maxVisible);
  const overflow = actions.slice(maxVisible);

  // For text/contained variants, ButtonGroup doesn’t render separators,
  // so we paint our own “vertical dividers” between grouped buttons.
  const internalDividerSx = showInternalDividers
    ? {
        "& .MuiButtonGroup-grouped:not(:last-of-type)": {
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }
    : undefined;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <ButtonGroup
        size={size}
        variant={groupVariant}
        sx={groupVariant === "outlined" ? undefined : internalDividerSx}
      >
        {visible.map((a) => (
          <Button
            key={a.key}
            onClick={a.onClick}
            disabled={a.disabled}
            color={a.color ?? "inherit"}
            // startIcon={a.}
          >
            {a.label}
          </Button>
        ))}
      </ButtonGroup>

      {overflow.length > 0 && (
        <>
          {showEndDivider && (
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          )}

          <Tooltip title="More actions">
            <IconButton
              size={size === "small" ? "small" : "medium"}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={() => setAnchorEl(null)}
            MenuListProps={{ dense }}
          >
            {overflow.map((a) => (
              <MenuItem
                key={a.key}
                onClick={() => {
                  setAnchorEl(null);
                  if (!a.disabled) a.onClick();
                }}
                disabled={a.disabled}
              >
                {a.label}
              </MenuItem>
            ))}
          </Menu>
        </>
      )}
    </Stack>
  );
}
