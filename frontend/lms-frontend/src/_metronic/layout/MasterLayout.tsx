// MasterLayout.tsx
import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { HeaderWrapper } from "./components/header";
import { ScrollTop } from "./components/scroll-top";
import { FooterWrapper } from "./components/footer";
import { Sidebar } from "./components/sidebar";
import { DrawerMessenger, InviteUsers, UpgradePlan } from "../partials";
import { PageDataProvider } from "./core";
import { reInitMenu } from "../helpers";

// ⬇️ import Metronic TS components
import { MenuComponent } from "../../_metronic/assets/ts/components/MenuComponent";
import { ScrollComponent } from "../../_metronic/assets/ts/components/_ScrollComponent";
import { DrawerComponent } from "../../_metronic/assets/ts/components/_DrawerComponent";

const MasterLayout = () => {
  const location = useLocation();

  // ✅ run once when layout mounts
  // useEffect(() => {
  //   MenuComponent.bootstrap();
  //   ScrollComponent.bootstrap();
  //   DrawerComponent.bootstrap();
  // }, []);

  // ✅ run on every route change
  useEffect(() => {
    reInitMenu();
  }, [location.key]);

  return (
    <PageDataProvider>
      <div className="d-flex flex-column flex-root app-root" id="kt_app_root">
        <div className="app-page flex-column flex-column-fluid" id="kt_app_page">
          <HeaderWrapper />
          <div className="app-wrapper flex-column flex-row-fluid" id="kt_app_wrapper">
            <Sidebar />
            <div className="app-main flex-column flex-row-fluid" id="kt_app_main">
              <div className="d-flex flex-column flex-column-fluid">
                <Outlet />
              </div>
              <FooterWrapper />
            </div>
          </div>
        </div>
      </div>

      <DrawerMessenger />
      <InviteUsers />
      <UpgradePlan />
      <ScrollTop />
    </PageDataProvider>
  );
};

export { MasterLayout };