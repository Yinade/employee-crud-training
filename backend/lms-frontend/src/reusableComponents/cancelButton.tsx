import React from "react";
import { Button, ButtonProps } from "@mui/material";

interface CancelButtonProps extends ButtonProps {
  length?: string;
  width?: string;
  name?: string;
}

const CancelButton: React.FC<CancelButtonProps> = ({
  length,
  width,
  name = "Cancel",
  sx,
  ...props
}) => {
  return (
    <Button
      variant="outlined"
      color="inherit"
      sx={{
        color: "#2E7F56",
        borderColor: "#D0EADF",
        backgroundColor: "#F8FCFC",
        fontWeight: 500,
        fontSize: "1.05rem",
        borderRadius: "6px",
        textTransform: "none",
        width: length,
        height: width,
        "&:hover": {
          backgroundColor: "#D0EADF",
          borderColor: "#3A9F6C",
          color: "#3A9F6C",
        },
        ...sx,
      }}
      {...props}
    >
      {name}
    </Button>
  );
};

export default CancelButton;
