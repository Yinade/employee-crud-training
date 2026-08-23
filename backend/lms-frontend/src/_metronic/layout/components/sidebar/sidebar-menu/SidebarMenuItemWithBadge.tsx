// SidebarMenuItemWithBadge.tsx

import clsx from "clsx";
import { Link, useLocation } from "react-router-dom";
import { KTIcon } from "../../../../helpers";

type Props = {
  to: string;
  title: React.ReactNode; // ✅ allow JSX (important change)
  icon?: string;
  badgeCount?: number;
};

const SidebarMenuItemWithBadge = ({
  to,
  title,
  icon,
  badgeCount = 0,
}: Props) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <div className="menu-item">
      <Link className={clsx("menu-link", { active: isActive })} to={to}>
        {icon && (
          <span className="menu-icon">
            <KTIcon iconName={icon} className="fs-2" />
          </span>
        )}

        {/* ✅ Title can now include badge inside */}
        <span className="menu-title d-flex align-items-center gap-2">
          {title}
        </span>

        {/* ✅ Right-side badge (for submenus) */}
        {badgeCount > 0 && (
          <span className="menu-badge">
            <span className="badge badge-sm badge-circle badge-danger">
              {badgeCount > 99 ? "99+" : badgeCount}
            </span>
          </span>
        )}
      </Link>
    </div>
  );
};

export { SidebarMenuItemWithBadge };
