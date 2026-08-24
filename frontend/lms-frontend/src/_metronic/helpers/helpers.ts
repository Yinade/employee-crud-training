// src/app/layout/helpers.ts (or wherever ../helpers points to)
import { MenuComponent } from '../../_metronic/assets/ts/components/MenuComponent'
import { ScrollComponent } from '../../_metronic/assets/ts/components/_ScrollComponent'
import { DrawerComponent } from '../../_metronic/assets/ts/components/_DrawerComponent'
// (optional, if you use toggles in header)
// import { ToggleComponent } from "../_metronic/assets/ts/components/ToggleComponent";

export const reInitMenu = () => {
  // Small timeout so React finishes rendering & attributes are set
  window.setTimeout(() => {
    try {
      MenuComponent.reinitialization();
    } catch (e) {
      // console.warn("Menu reinit error", e);
    }

    try {
      ScrollComponent.reinitialization();
    } catch (e) {
      // console.warn("Scroll reinit error", e);
    }

    try {
      DrawerComponent.reinitialization();    // ⬅️ critical for mobile header/user drawer
    } catch (e) {
      // console.warn("Drawer reinit error", e);
    }

    // If you use toggles:
    // try {
    //   ToggleComponent.reinitialization();
    // } catch (e) {}
  }, 0);
};