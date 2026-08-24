import React from "react";
import { Button, ButtonProps } from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

interface ResetButtonProps extends ButtonProps {
  length?: string;
  width?: string;
  name?: string;
}

const ResetButton: React.FC<ResetButtonProps> = ({
  length,
  width,
  name = "Reset",
  sx,
  ...props
}) => {
  return (
    <Button
      variant="outlined"
      startIcon={<RestartAltIcon />}
      sx={{
        color: "#3A9F6C",
        borderColor: "#3A9F6C",
        fontWeight: 500,
        fontSize: "1rem",
        borderRadius: "6px",
        textTransform: "none",
        width: length,
        height: width,
        "&:hover": {
          backgroundColor: "#E6FCF7",
          borderColor: "#2E7F56",
          color: "#2E7F56",
        },
        ...sx,
      }}
      {...props}
    >
      {name}
    </Button>
  );
};

export default ResetButton;
