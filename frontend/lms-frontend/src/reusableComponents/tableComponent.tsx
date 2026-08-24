// tableComponent.tsx
import React from "react";

export const ColumnHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <th className="bg-gray-200 px-4 py-2 text-base text-left font-semibold text-gray-700 border">
    {children}
  </th>
);