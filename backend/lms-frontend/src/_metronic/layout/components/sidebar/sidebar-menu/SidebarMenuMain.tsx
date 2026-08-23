import { useIntl } from "react-intl";
import { useLocation } from "react-router-dom";
import { SidebarMenuItemWithSub } from "./SidebarMenuItemWithSub";
import { SidebarMenuItem } from "./SidebarMenuItem";

import { useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../../../app/store";
import { SidebarMenuItemWithBadge } from "./SidebarMenuItemWithBadge";

const SidebarMenuMain = () => {
  const intl = useIntl();
  const { pathname } = useLocation();

  const dispatch = useDispatch<AppDispatch>();

  const isEditingOperation = pathname.startsWith("/crafted/update/operations");

  return (
    <>
      {/* DASHBOARD */}
      <SidebarMenuItem
        to="/dashboard"
        icon="element-11"
        title={intl.formatMessage({ id: "MENU.DASHBOARD" })}
        fontIcon="bi-app-indicator"
      />

      {/* OPERATIONS */}
      <div className="menu-item">
        <div className="menu-content pt-8 pb-2">
          <span className="menu-section text-muted text-uppercase fs-8 ls-1">
            Operations
          </span>
        </div>
      </div>

      {/* SYSTEM */}
      <div className="menu-item">
        <div className="menu-content pt-8 pb-2">
          <span className="menu-section text-muted text-uppercase fs-8 ls-1">
            SYSTEM
          </span>
        </div>
      </div>

      <SidebarMenuItemWithSub to="/settings" title="Settings" icon="gear">
        {/* Settings items - ordered alphabetically by title */}

        <SidebarMenuItem to="/units/list" title="Units" icon="flask" />
      </SidebarMenuItemWithSub>

      {/* 🔹 Users (User Group) => single menu */}
    </>
  );
};

export { SidebarMenuMain };
