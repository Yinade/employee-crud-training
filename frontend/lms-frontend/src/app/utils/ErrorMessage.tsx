// components/ErrorMessage.tsx
import { FieldError } from "react-hook-form";
import { ReactNode } from "react";

interface ErrorMessageProps {
  message?: string | FieldError | undefined;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  // Ensure message is a string; extract message if it's a FieldError
  const errorMessage = typeof message === "string" ? message : message?.message;

  if (!errorMessage) return null;

  return <p className="text-red-500 text-sm mt-1">{errorMessage}</p>;
};
