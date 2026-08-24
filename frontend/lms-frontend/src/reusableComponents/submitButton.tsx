import React from "react";
import { Button, ButtonProps } from "@mui/material";

interface SubmitButtonProps extends ButtonProps {
  length?: string; // actually width
  width?: string;  // actually height
  name?: string;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  length,
  width,
  name = "Submit",
  sx,
  ...props
}) => {
  return (
    <Button
      variant="contained"
      color="primary"
      sx={{
        backgroundColor: "#3A9F6C",
        color: "#fff",
        fontWeight: 600,
        fontSize: "1.1rem",
        borderRadius: "6px",
        textTransform: "none",
        width: length,
        height: width,
        "&:hover": {
          backgroundColor: "#2E7F56",
        },
        ...sx,
      }}
      {...props}
    >
      {name}
    </Button>
  );
};

export default SubmitButton;
