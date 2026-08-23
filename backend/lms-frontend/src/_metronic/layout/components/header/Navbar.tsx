import React, { useEffect, useRef, useState } from "react";
import clsx from "clsx";

const itemClass = "ms-1 ms-md-4";
const userAvatarClass = "symbol-35px";

const defaultAvatar =
  "https://ui-avatars.com/api/?name=Practice+User&background=E5E7EB&color=374151";

const Navbar = () => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!wrapperRef.current) return;

      if (!wrapperRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="app-navbar ms-auto d-flex align-items-center flex-shrink-0"
    >
      {/* Bell Notification */}
      <div className={clsx("app-navbar-item position-relative", itemClass)}>
        <div
          className="btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary position-relative w-35px h-35px"
          onClick={() => {
            setIsNotificationOpen((prev) => !prev);
          }}
        >
          <i className="bi bi-bell fs-2"></i>
        </div>
      </div>

      {/* Static Practice User Avatar */}
      <div className={clsx("app-navbar-item position-relative", itemClass)}>
        <div className={clsx("symbol", userAvatarClass)}>
          <img
            src={defaultAvatar}
            alt="Practice User"
            style={{
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { Navbar };
