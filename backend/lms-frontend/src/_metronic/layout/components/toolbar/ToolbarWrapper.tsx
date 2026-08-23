import clsx from "clsx";
import { ToolbarType, useLayout } from "../../core";
import { Toolbar } from "./Toolbar";
import { PageTitleWrapper } from "./page-title";

const ToolbarWrapper = () => {
  const { config, classes } = useLayout();
  if (!config.app?.toolbar?.display) {
    return null;
  }
  return (
    <div
      id="kt_app_toolbar"
      className={clsx(
        "app-toolbar",
        classes.toolbar.join(" "),
        config?.app?.toolbar?.class
      )}
    >
      <div
        id="kt_app_toolbar_container"
        className={clsx(
          "app-container",
          classes.toolbarContainer.join(" "),
          config.app?.toolbar?.containerClass,
          config.app?.toolbar?.minimize?.enabled ? "app-toolbar-minimize" : "",
          {
            "container-fluid": config.app?.toolbar?.container === "fluid",
            "container-xxl": config.app?.toolbar?.container === "fixed",
          }
        )}
      >
        {/* {isPageTitleVisible && <PageTitleWrapper />} */}
        <Toolbar />
      </div>
    </div>
  );
};

export { ToolbarWrapper };
