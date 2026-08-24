import React, { FC } from "react";
import { useIntl } from "react-intl";
import { PageTitle } from "../../../_metronic/layout/core";
import { ToolbarWrapper } from "../../../_metronic/layout/components/toolbar";
import { Content } from "../../../_metronic/layout/components/content";

// ✅ your theme
import { colors } from "../../utils/color";

type StatCardProps = {
  title: string;
  value: string;
  subtitle?: string;
  icon?: string; // emoji for now (fast & clean)
  tone?: "primary" | "soft" | "neutral";
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon = "📦",
  tone = "primary",
}) => {
  const toneStyles =
    tone === "primary"
      ? {
          background: `linear-gradient(135deg, ${colors.buttonBackground}, ${colors.focusBorder})`,
          color: "#fff",
          border: "none",
        }
      : tone === "soft"
      ? {
          background: colors.selectedBackground,
          color: colors.textSecondary,
          border: `1px solid ${colors.toolbarHoverBackground}`,
        }
      : {
          background: "#fff",
          color: colors.textSecondary,
          border: `1px solid ${colors.tableBackground}`,
        };

  return (
    <div
      className="card h-100"
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        ...toneStyles,
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
      }}
    >
      <div className="card-body p-6">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <div
              style={{ fontSize: 13, opacity: tone === "primary" ? 0.9 : 1 }}
            >
              {title}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
              {value}
            </div>
            {subtitle ? (
              <div
                style={{
                  fontSize: 12,
                  opacity: tone === "primary" ? 0.9 : 0.8,
                }}
              >
                {subtitle}
              </div>
            ) : null}
          </div>

          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              display: "grid",
              placeItems: "center",
              background:
                tone === "primary"
                  ? "rgba(255,255,255,0.20)"
                  : colors.toolbarBackground,
              fontSize: 22,
            }}
          >
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

type ActionItem = {
  title: string;
  meta?: string;
  badge?: string;
  badgeTone?: "green" | "amber" | "red" | "gray";
};

const badgeStyle = (tone: ActionItem["badgeTone"]) => {
  const base: React.CSSProperties = {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    display: "inline-block",
    border: "1px solid transparent",
  };

  switch (tone) {
    case "green":
      return {
        ...base,
        color: colors.buttonBackground,
        background: colors.selectedBackground,
        borderColor: colors.toolbarHoverBackground,
      };
    case "amber":
      return {
        ...base,
        color: "#92400E",
        background: "#FEF3C7",
        borderColor: "#FDE68A",
      };
    case "red":
      return {
        ...base,
        color: "#991B1B",
        background: "#FEE2E2",
        borderColor: "#FCA5A5",
      };
    default:
      return {
        ...base,
        color: colors.textPrimary,
        background: colors.tableBackground,
        borderColor: colors.tableBackground,
      };
  }
};

const ActionListCard: React.FC<{
  title: string;
  subtitle?: string;
  items: ActionItem[];
  rightActionLabel?: string;
}> = ({ title, subtitle, items, rightActionLabel = "View all" }) => {
  return (
    <div
      className="card h-100"
      style={{
        borderRadius: "16px",
        border: `1px solid ${colors.tableBackground}`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <div
        className="card-header border-0"
        style={{
          background: colors.toolbarBackground,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <div className="d-flex flex-column">
          <span className="fw-bold" style={{ color: colors.textSecondary }}>
            {title}
          </span>
          {subtitle ? (
            <span className="text-muted" style={{ fontSize: 12 }}>
              {subtitle}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          className="btn btn-sm"
          style={{
            background: colors.toolbarHoverBackground,
            color: colors.textSecondary,
            borderRadius: 10,
            fontWeight: 700,
          }}
          onClick={() => {}}
        >
          {rightActionLabel}
        </button>
      </div>

      <div className="card-body p-6">
        <div className="d-flex flex-column gap-4">
          {items.map((it, idx) => (
            <div
              key={idx}
              className="d-flex align-items-start justify-content-between"
              style={{
                padding: "10px 12px",
                borderRadius: 12,
                background: idx % 2 === 0 ? colors.evenRowBackground : "#fff",
                border: `1px solid ${colors.tableBackground}`,
              }}
            >
              <div>
                <div style={{ fontWeight: 800, color: colors.textSecondary }}>
                  {it.title}
                </div>
                {it.meta ? (
                  <div style={{ fontSize: 12, opacity: 0.75 }}>{it.meta}</div>
                ) : null}
              </div>

              {it.badge ? (
                <div style={badgeStyle(it.badgeTone)}>{it.badge}</div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MiniTableCard: React.FC<{
  title: string;
  subtitle?: string;
  columns: string[];
  rows: Array<Array<string>>;
}> = ({ title, subtitle, columns, rows }) => {
  return (
    <div
      className="card h-100"
      style={{
        borderRadius: "16px",
        border: `1px solid ${colors.tableBackground}`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
      }}
    >
      <div
        className="card-header border-0"
        style={{
          background: colors.toolbarBackground,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
        }}
      >
        <div className="d-flex flex-column">
          <span className="fw-bold" style={{ color: colors.textSecondary }}>
            {title}
          </span>
          {subtitle ? (
            <span className="text-muted" style={{ fontSize: 12 }}>
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>

      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead>
              <tr style={{ background: colors.tableBackground }}>
                {columns.map((c) => (
                  <th
                    key={c}
                    style={{
                      fontSize: 12,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                      color: colors.textPrimary,
                      padding: "14px 16px",
                    }}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr
                  key={idx}
                  style={{
                    background:
                      idx % 2 === 0 ? colors.evenRowBackground : "#fff",
                  }}
                >
                  {r.map((cell, i) => (
                    <td key={i} style={{ padding: "14px 16px" }}>
                      <span
                        style={{ color: colors.textSecondary, fontWeight: 600 }}
                      >
                        {cell}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={columns.length} style={{ padding: 16 }}>
                    <span className="text-muted">No data</span>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: FC = () => {
  // ✅ placeholders that match your domain
  const duePayables: ActionItem[] = [
    {
      title: "OP-000124 — Djibouti Agent Payment",
      meta: "Due: Jan 05 • ETB 78,500",
      badge: "DUE",
      badgeTone: "red",
    },
    {
      title: "OP-000121 — Port Handling",
      meta: "Due: Jan 08 • USD 1,250",
      badge: "SOON",
      badgeTone: "amber",
    },
    {
      title: "OP-000118 — Transport Advance",
      meta: "Due: Jan 12 • ETB 25,000",
      badge: "PLANNED",
      badgeTone: "green",
    },
  ];

  const iprQueue: ActionItem[] = [
    {
      title: "IPR-2025-0019",
      meta: "Requested by: Finance • Bank Transfer • ETB 54,000",
      badge: "APPROVE",
      badgeTone: "amber",
    },
    {
      title: "IPR-2025-0017",
      meta: "Requested by: Ops • Cheque • ETB 18,200",
      badge: "ISSUE",
      badgeTone: "green",
    },
    {
      title: "IPR-2025-0015",
      meta: "Requested by: Admin • Cash • ETB 5,000",
      badge: "REVIEW",
      badgeTone: "gray",
    },
  ];

  const opsNeedingAssignment: ActionItem[] = [
    {
      title: "OP-000129 — Missing Assessor",
      meta: "Client: ABC Trading • Opened: Dec 25",
      badge: "ASSIGN",
      badgeTone: "amber",
    },
    {
      title: "OP-000127 — Missing Djibouti Agent",
      meta: "Owner: DAF Logistics • Opened: Dec 23",
      badge: "ASSIGN",
      badgeTone: "amber",
    },
    {
      title: "OP-000126 — Missing Transitor",
      meta: "Cargo: Container • Opened: Dec 21",
      badge: "ASSIGN",
      badgeTone: "green",
    },
  ];

  return (
    <>
      <ToolbarWrapper />
      <Content>
        {/* ✅ Header strip */}
        <div
          className="mb-6"
          style={{
            background: `linear-gradient(135deg, ${colors.selectedBackground}, ${colors.toolbarBackground})`,
            border: `1px solid ${colors.toolbarHoverBackground}`,
            borderRadius: 18,
            padding: "18px 18px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
          }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: colors.textSecondary,
                }}
              >
                Logistics Management System
              </div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                Your operational snapshot — assignments, finance pipeline, and
                recent activity. Your customized Dashboard is coming soon!
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: "#fff",
                  border: `1px solid ${colors.toolbarHoverBackground}`,
                  color: colors.textSecondary,
                  borderRadius: 10,
                  fontWeight: 800,
                }}
                onClick={() => {}}
              >
                + New Operation
              </button>

              <button
                type="button"
                className="btn btn-sm"
                style={{
                  background: colors.buttonBackground,
                  border: "none",
                  color: "#fff",
                  borderRadius: 10,
                  fontWeight: 800,
                }}
                onClick={() => {}}
              >
                + New IPR
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Row 1: KPI Cards */}
        <div className="row g-5 mb-6">
          <div className="col-12 col-md-6 col-xl-3">
            <StatCard
              title="Active Operations"
              value="24"
              subtitle="In progress / open"
              icon="🚢"
              tone="primary"
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <StatCard
              title="Quotations"
              value="12"
              subtitle="Draft / Sent / Accepted"
              icon="🧾"
              tone="soft"
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <StatCard
              title="Invoices"
              value="8"
              subtitle="New this week"
              icon="💳"
              tone="neutral"
            />
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <StatCard
              title="Payables Due"
              value="5"
              subtitle="Needs attention"
              icon="⏳"
              tone="soft"
            />
          </div>
        </div>

        {/* ✅ Row 2: Action required */}
        <div className="row g-5 mb-6">
          <div className="col-12 col-xl-4">
            <ActionListCard
              title="Operations Needing Assignment"
              subtitle="Assessor / Djibouti agent / Transitor"
              items={opsNeedingAssignment}
              rightActionLabel="Open Operations"
            />
          </div>

          <div className="col-12 col-xl-4">
            <ActionListCard
              title="IPR Queue"
              subtitle="Approval and issuing pipeline"
              items={iprQueue}
              rightActionLabel="Open IPRs"
            />
          </div>

          <div className="col-12 col-xl-4">
            <ActionListCard
              title="Payables Due Soon"
              subtitle="Upcoming payments per operation"
              items={duePayables}
              rightActionLabel="Open Payables"
            />
          </div>
        </div>

        {/* ✅ Row 3: Recent activity tables */}
        <div className="row g-5">
          <div className="col-12 col-xl-6">
            <MiniTableCard
              title="Recent Operations"
              subtitle="Latest opened operations"
              columns={["Operation", "Client", "Status"]}
              rows={[
                ["OP-000129", "ABC Trading", "OPEN"],
                ["OP-000128", "Blue Import", "ASSESSMENT"],
                ["OP-000127", "Tirngo Logistics", "DJIBOUTI"],
                ["OP-000126", "Kurkura Project", "TRANSIT"],
              ]}
            />
          </div>

          <div className="col-12 col-xl-6">
            <MiniTableCard
              title="Recent Invoices"
              subtitle="Latest issued invoices"
              columns={["Invoice", "Client", "Amount"]}
              rows={[
                ["INV-2025-0112", "ABC Trading", "78,500 ETB"],
                ["INV-2025-0111", "Blue Import", "1,250 USD"],
                ["INV-2025-0110", "Tirngo Logistics", "32,000 ETB"],
                ["INV-2025-0109", "Kurkura Project", "540 USD"],
              ]}
            />
          </div>
        </div>
      </Content>
    </>
  );
};

const DashboardWrapper: FC = () => {
  const intl = useIntl();
  return (
    <>
      <PageTitle breadcrumbs={[]}>
        {intl.formatMessage({ id: "MENU.DASHBOARD" })}
      </PageTitle>
      <DashboardPage />
    </>
  );
};

export { DashboardWrapper };
