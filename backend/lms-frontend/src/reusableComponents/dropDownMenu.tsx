import React from 'react';
import {
  Menu,
  MenuHandler,
  MenuList,
  Button,
} from "@material-tailwind/react";
 
/**
 * Props for the AnimatedDropdownMenu component.
 * @typedef {object} AnimatedDropdownMenuProps
 * @property {React.ReactNode} buttonContent - The content displayed inside the trigger button (e.g., "Actions").
 * @property {React.ReactNode[]} menuItems - An array of React elements to display inside the dropdown (e.g., <MenuItem>...</MenuItem>).
 */
interface AnimatedDropdownMenuProps {
  buttonContent: React.ReactNode;
  menuItems: React.ReactNode[];
}

export const AnimatedDropdownMenu: React.FC<AnimatedDropdownMenuProps> = ({
  buttonContent,
  menuItems,
}) => {
  return (
    <Menu
      animate={{
        // Define the custom animation for mounting and unmounting
        mount: { y: 0 },
        unmount: { y: 25 },
      }}
    >
      <MenuHandler>
        <Button {...({} as any)}>{buttonContent}</Button>
      </MenuHandler>
      
      <MenuList {...({} as any)}>
        {/* Render all the menu item elements passed via props */}
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            {item}
          </React.Fragment>
        ))}
      </MenuList>
    </Menu>
  );
}