import { FC, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../app/modules/auth";

type Props = {
  onOpenChangePassword: () => void;
  onRequestCloseMenu?: () => void;
};

const defaultAvatar =
  "https://ui-avatars.com/api/?name=Impact+User&background=E5E7EB&color=374151";

const HeaderUserMenu: FC<Props> = ({
  onOpenChangePassword,
  onRequestCloseMenu,
}) => {
  const { currentUser, logout } = useAuth();

  // ✅ Decide which image to show (S3 URL or fallback avatar)
  const profileImageSrc = useMemo(() => {
    const url = currentUser?.profilePictureUrl?.trim();
    if (!url) return defaultAvatar;

    // If backend returns full S3 / HTTPS URL (recommended)
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }

    // Fallback for old relative paths (optional – adjust/remove if not needed)
    // const base = import.meta.env.VITE_APP_FILE_ACCESS_fROM_IDENTITY_SERVICE_URL || "";
    // return `${base}${url}`;

    return url;
  }, [currentUser?.profilePictureUrl]);

  return (
    <div
      className="
        menu menu-sub menu-sub-dropdown menu-column menu-rounded
        menu-gray-600 menu-state-bg menu-state-primary fw-bold
        py-4 fs-6 w-275px show
      "
      style={{
        position: "absolute",
        right: 0,
        top: "calc(100% + 0.75rem)",
        zIndex: 100,
      }}
    >
      {/* 🔹 Header block: Profile picture ABOVE the text "Profile" */}
      <div className="menu-item px-3">
        <div className="menu-content d-flex flex-column align-items-center px-3">
          <div className="symbol symbol-50px mb-3">
            <img
              alt="Profile picture"
              src={profileImageSrc}
              style={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                objectFit: "cover",
              }}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultAvatar;
              }}
            />
          </div>

          {/* 🔹 The "Profile" label */}
          <div className="fw-bolder fs-5 mb-1">Profile</div>

          {/* 🔸 Optional: name + email text under "Profile" */}
          {currentUser && (
            <>
              <div className="text-muted fs-7">
                {currentUser.firstName} {currentUser.lastName}
              </div>
              <a
                href="#"
                className="fw-bold text-muted text-hover-primary fs-7"
                onClick={(e) => e.preventDefault()}
              >
                {currentUser.email}
              </a>
            </>
          )}
        </div>
      </div>

      <div className="separator my-2"></div>

      {/* Account Settings */}
      <div className="menu-item px-5 my-1">
        <Link to="#" className="menu-link px-5">
          Account Settings
        </Link>
      </div>

      {/* Change Password */}
      <div className="menu-item px-5 my-1">
        <a
          href="#"
          className="menu-link px-5"
          onClick={(e) => {
            e.preventDefault();
            onRequestCloseMenu?.();
            onOpenChangePassword();
          }}
        >
          Change Password
        </a>
      </div>

      {/* Sign Out */}
      <div className="menu-item px-5">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
          className="menu-link px-5"
        >
          Sign Out
        </a>
      </div>
    </div>
  );
};

export { HeaderUserMenu };